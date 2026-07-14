import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface CartRow extends RowDataPacket {
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

  canteenName: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID wajib dikirim",
        },
        { status: 400 },
      );
    }

    const [rows] = await db.query<CartRow[]>(
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
        p.price,
        p.rating,
        p.image,
        p.description,
        p.available,
        u.canteen_name AS canteenName

      FROM carts c

      INNER JOIN cart_items ci
        ON ci.cart_id = c.id

      INNER JOIN products p
        ON p.id = ci.product_id
      INNER JOIN users u
        ON u.id = p.seller_id

      WHERE c.user_id = ?

      ORDER BY ci.created_at ASC
      `,
      [userId],
    );

    const cart = await Promise.all(
      rows.map(async (row) => {
        let selectedOptions: Record<string, string> = {};

        if (row.selectedOptions) {
          try {
            selectedOptions = JSON.parse(row.selectedOptions);
          } catch {
            selectedOptions = {};
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
            [row.productId, optionTitle, optionValue],
          );

          if (optionRows.length > 0) {
            additionalPrice += Number(optionRows[0].additionalPrice);
          }
        }

        return {
          id: row.id,

          product: {
            id: row.productId,
            sellerId: row.sellerId,
            name: row.productName,
            category: row.category,

            price: Number(row.price) + additionalPrice,

            rating: Number(row.rating),
            image: row.image,
            description: row.description,
            available: Boolean(row.available),
            canteenName: row.canteenName,
          },

          quantity: row.quantity,
          selectedOptions,
          catatan: row.catatan || "",
          checked: Boolean(row.checked),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Data cart berhasil diambil",
      data: cart,
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data cart",
      },
      { status: 500 },
    );
  }
}
