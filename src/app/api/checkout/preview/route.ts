import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

interface UserRow extends RowDataPacket {
  id: string;
  balance: string;
}

interface CheckoutItemRow extends RowDataPacket {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string | null;
  quantity: number;
  basePrice: string;
  price: number;
  image: string;
  selectedOptions: string | null;
  catatan: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

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
    // AMBIL DATA USER
    // ============================================================

    const [userRows] = await db.query<UserRow[]>(
      `
      SELECT
        id,
        balance
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // AMBIL ITEM CART YANG DIPILIH
    // ============================================================

    const [cartRows] = await db.query<CheckoutItemRow[]>(
      `
      SELECT
        ci.id,
        ci.product_id AS productId,
        p.name AS productName,
        p.seller_id AS sellerId,
        seller.canteen_name AS sellerName,
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

      INNER JOIN users seller
        ON seller.id = p.seller_id

      WHERE c.user_id = ?
        AND ci.checked = 1

      ORDER BY
        p.seller_id,
        ci.created_at ASC
      `,
      [userId],
    );

    // ============================================================
    // HITUNG HARGA FINAL SETIAP ITEM
    // harga dasar + seluruh harga tambahan variasi
    // ============================================================

    for (const item of cartRows) {
      let selectedOptions: Record<string, string> = {};

      if (item.selectedOptions) {
        try {
          selectedOptions = JSON.parse(item.selectedOptions);
        } catch {
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
        const [optionRows] = await db.query<RowDataPacket[]>(
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
    // HITUNG SUBTOTAL SEMUA PRODUK
    // ============================================================

    const subtotal = cartRows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // ============================================================
    // KELOMPOKKAN SUBTOTAL BERDASARKAN SELLER
    // ============================================================

    const sellerSubtotals = new Map<string, number>();

    for (const item of cartRows) {
      const currentSubtotal = sellerSubtotals.get(item.sellerId) ?? 0;

      sellerSubtotals.set(
        item.sellerId,
        currentSubtotal + item.price * item.quantity,
      );
    }

    // ============================================================
    // HITUNG PPN 10% PER SELLER
    // Harus sama dengan checkout API utama
    // ============================================================

    const serviceFee = Array.from(sellerSubtotals.values()).reduce(
      (totalPpn, sellerSubtotal) => totalPpn + Math.round(sellerSubtotal * 0.1),
      0,
    );

    const total = subtotal + serviceFee;

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Data preview checkout berhasil diambil",

      data: {
        balance: Number(userRows[0].balance),

        subtotal,

        // Nama dipertahankan karena frontend masih memakai serviceFee.
        serviceFee,

        total,

        cart: cartRows.map((item) => {
          let selectedOptions: Record<string, string> = {};

          if (item.selectedOptions) {
            try {
              selectedOptions = JSON.parse(item.selectedOptions);
            } catch {
              selectedOptions = {};
            }
          }

          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            sellerId: item.sellerId,
            sellerName: item.sellerName || "Kantin",
            quantity: item.quantity,

            // Harga final satuan:
            // harga dasar + harga tambahan variasi.
            price: item.price,

            image: item.image,
            selectedOptions,
            catatan: item.catatan,
          };
        }),
      },
    });
  } catch (error) {
    console.error("CHECKOUT PREVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil preview checkout",
      },
      { status: 500 },
    );
  }
}
