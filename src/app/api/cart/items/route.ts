import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";

interface CartRow extends RowDataPacket {
  id: number;
}

interface CartItemRow extends RowDataPacket {
  id: string;
  quantity: number;
  selectedOptions: string | null;
  catatan: string | null;
  checked: number;

  productId: string;
  sellerId: string;
  productName: string;
  category: string;
  price: string;
  rating: string;
  image: string;
  description: string;
  available: number;
}

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const userId = body.userId;
    const productId = body.productId;
    const quantity = Number(body.quantity);
    const selectedOptions = body.selectedOptions ?? {};
    const catatan = body.catatan?.trim() || "";

    if (!userId || !productId) {
      return NextResponse.json(
        {
          success: false,
          message: "User dan produk wajib dikirim",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah produk tidak valid",
        },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    // Pastikan produk ada dan masih tersedia.

    const [productRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id
        FROM products
        WHERE id = ?
          AND available = 1
        LIMIT 1
        `,
      [productId],
    );

    if (productRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan atau tidak tersedia",
        },
        { status: 404 },
      );
    }

    const selectedOptionEntries = Object.entries(selectedOptions);

    let additionalPrice = 0;

    for (const [optionTitle, optionValue] of selectedOptionEntries) {
      if (typeof optionValue !== "string") {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "Pilihan variasi produk tidak valid",
          },
          { status: 400 },
        );
      }

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
        [productId, optionTitle, optionValue],
      );

      if (optionRows.length === 0) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: `Pilihan ${optionTitle} tidak valid`,
          },
          { status: 400 },
        );
      }

      additionalPrice += Number(optionRows[0].additionalPrice);
    }
    // Cari cart milik user.

    const [cartRows] = await connection.query<CartRow[]>(
      `
        SELECT id
        FROM carts
        WHERE user_id = ?
        LIMIT 1
        `,
      [userId],
    );

    let cartId: number;

    // Kalau belum punya cart, buat cart baru.

    if (cartRows.length === 0) {
      const [cartResult] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO carts (user_id)
          VALUES (?)
          `,
        [userId],
      );

      cartId = cartResult.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    const selectedOptionsJson = JSON.stringify(selectedOptions);

    /*
      Cek apakah produk dengan opsi dan catatan yang sama
      sudah ada di keranjang.

      Jika sama:
      quantity ditambahkan.

      Jika berbeda opsi/catatan:
      dibuat sebagai cart item baru.
    */

    const [existingRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id
        FROM cart_items
        WHERE cart_id = ?
          AND product_id = ?
          AND COALESCE(selected_options, '{}') = ?
          AND COALESCE(catatan, '') = ?
        LIMIT 1
        `,
      [cartId, productId, selectedOptionsJson, catatan],
    );

    let cartItemId: string;

    if (existingRows.length > 0) {
      cartItemId = existingRows[0].id;

      await connection.query<ResultSetHeader>(
        `
        UPDATE cart_items
        SET
          quantity = quantity + ?,
          checked = 1
        WHERE id = ?
        `,
        [quantity, cartItemId],
      );
    } else {
      cartItemId = `cart-${randomUUID()}`;

      await connection.query<ResultSetHeader>(
        `
        INSERT INTO cart_items
        (
          id,
          cart_id,
          product_id,
          quantity,
          selected_options,
          catatan,
          checked
        )
        VALUES (?, ?, ?, ?, ?, ?, 1)
        `,
        [cartItemId, cartId, productId, quantity, selectedOptionsJson, catatan],
      );
    }

    // Ambil item terbaru dalam format frontend.

    const [itemRows] = await connection.query<CartItemRow[]>(
      `
        SELECT
          ci.id,
          ci.quantity,
          ci.selected_options AS selectedOptions,
          ci.catatan,
          ci.checked,

          p.id AS productId,
          p.seller_id AS sellerId,
          p.name AS productName,
          p.category,
          (p.price + ?) AS price,
          p.rating,
          p.image,
          p.description,
          p.available

        FROM cart_items ci

        INNER JOIN products p
          ON p.id = ci.product_id

        WHERE ci.id = ?

        LIMIT 1
        `,
      [additionalPrice, cartItemId],
    );

    await connection.commit();

    const row = itemRows[0];

    let parsedSelectedOptions = {};

    if (row.selectedOptions) {
      try {
        parsedSelectedOptions = JSON.parse(row.selectedOptions);
      } catch {
        parsedSelectedOptions = {};
      }
    }

    return NextResponse.json({
      success: true,

      message:
        existingRows.length > 0
          ? "Jumlah produk di keranjang berhasil ditambahkan"
          : "Produk berhasil ditambahkan ke keranjang",

      data: {
        id: row.id,

        product: {
          id: row.productId,
          sellerId: row.sellerId,
          name: row.productName,
          category: row.category,
          price: Number(row.price),
          rating: Number(row.rating),
          image: row.image,
          description: row.description,
          available: Boolean(row.available),
        },

        quantity: row.quantity,

        selectedOptions: parsedSelectedOptions,

        catatan: row.catatan || "",

        checked: Boolean(row.checked),
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("ADD CART ITEM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menambahkan produk ke keranjang",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
