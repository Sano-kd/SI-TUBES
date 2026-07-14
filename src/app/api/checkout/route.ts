import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  balance: string;
}

interface CartRow extends RowDataPacket {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  quantity: number;
  basePrice: string;
  price: number;
  image: string;
  selectedOptions: string | null;
  catatan: string | null;
}

interface SellerGroup {
  sellerId: string;
  items: CartRow[];
  subtotal: number;
}

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID wajib diisi",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // MULAI TRANSACTION
    // ============================================================

    await connection.beginTransaction();

    // ============================================================
    // AMBIL DAN KUNCI USER PEMBELI
    // ============================================================

    const [userRows] = await connection.query<UserRow[]>(
      `
      SELECT
        id,
        name,
        balance
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [userId],
    );

    if (userRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const user = userRows[0];

    // ============================================================
    // AMBIL CART YANG DIPILIH DAN KUNCI BARIS CART
    // ============================================================

    const [cartRows] = await connection.query<CartRow[]>(
      `
      SELECT
        ci.id,
        ci.product_id AS productId,
        p.name AS productName,
        p.seller_id AS sellerId,
        ci.quantity,
        p.price AS basePrice,
        p.image,
        ci.selected_options AS selectedOptions,
        ci.catatan
      FROM cart_items ci

      INNER JOIN carts c
        ON c.id = ci.cart_id

      INNER JOIN products p
        ON p.id = ci.product_id

      WHERE c.user_id = ?
        AND ci.checked = 1

      ORDER BY
        p.seller_id,
        ci.created_at ASC

      FOR UPDATE
      `,
      [userId],
    );

    if (cartRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada item yang dipilih untuk checkout",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // HITUNG HARGA FINAL ITEM DARI DATABASE
    // ============================================================

    for (const item of cartRows) {
      let selectedOptions: Record<string, string> = {};

      if (item.selectedOptions) {
        try {
          selectedOptions = JSON.parse(item.selectedOptions);
        } catch {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              message: `Pilihan variasi produk ${item.productName} tidak valid`,
            },
            { status: 400 },
          );
        }
      }

      let additionalPrice = 0;

      for (const [optionTitle, optionValue] of Object.entries(
        selectedOptions,
      )) {
        const [optionRows] = await connection.query<RowDataPacket[]>(
          `
      SELECT
        pov.additional_price AS additionalPrice

      FROM product_options po

      INNER JOIN product_option_values pov
        ON pov.option_id = po.id

      WHERE po.product_id = ?
        AND po.title = ?
        AND pov.value = ?

      LIMIT 1
      `,
          [item.productId, optionTitle, optionValue],
        );

        if (optionRows.length === 0) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              message: `Pilihan ${optionTitle} pada produk ${item.productName} tidak valid`,
            },
            { status: 400 },
          );
        }

        additionalPrice += Number(optionRows[0].additionalPrice);
      }

      item.price = Number(item.basePrice) + additionalPrice;
    }
    // ============================================================
    // KELOMPOKKAN ITEM BERDASARKAN SELLER
    // ============================================================

    const sellerGroupsMap = new Map<string, SellerGroup>();

    for (const item of cartRows) {
      if (!sellerGroupsMap.has(item.sellerId)) {
        sellerGroupsMap.set(item.sellerId, {
          sellerId: item.sellerId,
          items: [],
          subtotal: 0,
        });
      }

      const sellerGroup = sellerGroupsMap.get(item.sellerId)!;

      sellerGroup.items.push(item);

      sellerGroup.subtotal += Number(item.price) * item.quantity;
    }

    const sellerGroups = Array.from(sellerGroupsMap.values());

    // ============================================================
    // HITUNG TOTAL CHECKOUT
    // ============================================================

    const subtotal = sellerGroups.reduce(
      (sum, sellerGroup) => sum + sellerGroup.subtotal,
      0,
    );

    const serviceFee = sellerGroups.reduce(
      (sum, sellerGroup) => sum + Math.round(sellerGroup.subtotal * 0.1),
      0,
    );

    const total = subtotal + serviceFee;

    const balanceBefore = Number(user.balance);

    if (balanceBefore < total) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Saldo tidak mencukupi",
          data: {
            balance: balanceBefore,
            total,
            shortage: total - balanceBefore,
          },
        },
        { status: 400 },
      );
    }

    // ============================================================
    // POTONG SALDO PEMBELI
    // ============================================================

    const [buyerBalanceResult] = await connection.query<ResultSetHeader>(
      `
        UPDATE users
        SET balance = balance - ?
        WHERE id = ?
          AND balance >= ?
        `,
      [total, user.id, total],
    );

    if (buyerBalanceResult.affectedRows === 0) {
      throw new Error("Gagal memotong saldo pembeli");
    }

    // ============================================================
    // BUAT ORDER PER SELLER
    // ============================================================

    const createdOrders: {
      orderId: string;
      sellerId: string;
      subtotal: number;
    }[] = [];

    for (const sellerGroup of sellerGroups) {
      const orderId = `ord-${crypto.randomUUID()}`;

      // PPN 10% dihitung berdasarkan subtotal produk setiap kantin.
      const orderServiceFee = Math.round(sellerGroup.subtotal * 0.1);

      const orderTotal = sellerGroup.subtotal + orderServiceFee;

      // ==========================================================
      // BUAT ORDER
      // ==========================================================

      const [orderResult] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO orders (
            id,
            buyer_id,
            buyer_name,
            seller_id,
            total,
            service_fee,
            payment_method,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, 'Saldo', 'Menunggu')
          `,
        [
          orderId,
          user.id,
          user.name,
          sellerGroup.sellerId,
          orderTotal,
          orderServiceFee,
        ],
      );

      if (orderResult.affectedRows === 0) {
        throw new Error(
          `Gagal membuat order untuk seller ${sellerGroup.sellerId}`,
        );
      }

      // ==========================================================
      // BUAT ORDER ITEMS
      // ==========================================================

      for (const item of sellerGroup.items) {
        const [orderItemResult] = await connection.query<ResultSetHeader>(
          `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              price,
              quantity,
              image,
              selected_options,
              catatan
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
          [
            orderId,
            item.productId,
            item.productName,
            Number(item.price),
            item.quantity,
            item.image,
            item.selectedOptions,
            item.catatan,
          ],
        );

        if (orderItemResult.affectedRows === 0) {
          throw new Error(`Gagal membuat order item ${item.productId}`);
        }
      }

      const purchaseTransactionId = `trx-${crypto.randomUUID()}`;

      const buyerPurchaseAmount = sellerGroup.subtotal + orderServiceFee;

      const [purchaseTransactionResult] =
        await connection.query<ResultSetHeader>(
          `
          INSERT INTO wallet_transactions (
            id,
            user_id,
            order_id,
            type,
            amount,
            description
          )
          VALUES (?, ?, ?, 'purchase', ?, ?)
          `,
          [
            purchaseTransactionId,
            user.id,
            orderId,
            buyerPurchaseAmount,
            `Pembayaran pesanan ${orderId}`,
          ],
        );

      if (purchaseTransactionResult.affectedRows === 0) {
        throw new Error(
          `Gagal mencatat transaksi pembeli untuk order ${orderId}`,
        );
      }

      createdOrders.push({
        orderId,
        sellerId: sellerGroup.sellerId,
        subtotal: sellerGroup.subtotal,
      });
    }

    // ============================================================
    // HAPUS HANYA CART ITEM YANG DIBELI
    // ============================================================

    const purchasedItemIds = cartRows.map((item) => item.id);

    const placeholders = purchasedItemIds.map(() => "?").join(", ");

    const [deleteCartResult] = await connection.query<ResultSetHeader>(
      `
        DELETE FROM cart_items
        WHERE id IN (${placeholders})
        `,
      purchasedItemIds,
    );

    if (deleteCartResult.affectedRows !== purchasedItemIds.length) {
      throw new Error("Gagal menghapus seluruh item yang telah dibeli");
    }

    // ============================================================
    // COMMIT
    // ============================================================

    await connection.commit();

    const balanceAfter = balanceBefore - total;

    return NextResponse.json({
      success: true,
      message: "Checkout berhasil",
      data: {
        // Dipertahankan agar success page lama tetap bekerja.
        orderId: createdOrders[0].orderId,

        orderIds: createdOrders.map((order) => order.orderId),

        orders: createdOrders,

        userId: user.id,

        balanceBefore,
        balanceAfter,

        subtotal,
        serviceFee,
        total,

        cart: cartRows.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("CHECKOUT ROLLBACK ERROR:", rollbackError);
    }

    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat proses checkout",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
