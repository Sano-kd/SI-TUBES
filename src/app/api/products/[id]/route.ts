import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: string;
  rating: string;
  image: string;
  description: string;
  available: number;
  sellerId: string;

  sellerName: string;
  sellerContact: string;
  canteenName: string | null;

  optionId: number | null;
  optionTitle: string | null;
  optionValue: string | null;
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query<ProductRow[]>(
      `
      SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        p.rating,
        p.image,
        p.description,
        p.available,

        p.seller_id AS sellerId,

        u.name AS sellerName,
        u.contact AS sellerContact,
        u.canteen_name AS canteenName,

        po.id AS optionId,
        po.title AS optionTitle,

        pov.value AS optionValue

      FROM products p

      INNER JOIN users u
        ON u.id = p.seller_id

      LEFT JOIN product_options po
        ON po.product_id = p.id

      LEFT JOIN product_option_values pov
        ON pov.option_id = po.id

      WHERE p.id = ?

      ORDER BY
        po.id,
        pov.id
      `,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    const firstRow = rows[0];

    const product = {
      id: firstRow.id,

      name: firstRow.name,

      category: firstRow.category,

      price: Number(firstRow.price),

      rating: Number(firstRow.rating),

      image: firstRow.image,

      description: firstRow.description,

      available: Boolean(firstRow.available),

      sellerId: firstRow.sellerId,

      seller: {
        id: firstRow.sellerId,
        name: firstRow.sellerName,
        contact: firstRow.sellerContact,
        canteenName: firstRow.canteenName,
      },

      orderOptions: [] as {
        title: string;
        options: string[];
      }[],
    };

    const optionsMap = new Map<
      number,
      {
        title: string;
        options: string[];
      }
    >();

    for (const row of rows) {
      if (row.optionId !== null && row.optionTitle !== null) {
        if (!optionsMap.has(row.optionId)) {
          optionsMap.set(row.optionId, {
            title: row.optionTitle,
            options: [],
          });
        }

        if (row.optionValue !== null) {
          optionsMap.get(row.optionId)!.options.push(row.optionValue);
        }
      }
    }

    product.orderOptions = Array.from(optionsMap.values());

    return NextResponse.json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail produk",
      },
      {
        status: 500,
      },
    );
  }
}
