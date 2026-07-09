import { NextResponse } from "next/server";
import db from "@/lib/db";

interface ProductRow {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: string;
  rating: string;
  image: string;
  description: string;
  available: number;
  sellerId: string;
  optionId: number | null;
  optionTitle: string | null;
  optionValue: string | null;
}

export async function GET() {
  try {
    const [rows] = await db.query(`
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

        po.id AS optionId,
        po.title AS optionTitle,

        pov.value AS optionValue

      FROM products p

      LEFT JOIN product_options po
        ON po.product_id = p.id

      LEFT JOIN product_option_values pov
        ON pov.option_id = po.id

      ORDER BY
        p.id,
        po.id,
        pov.id
    `);

    const productRows = rows as ProductRow[];

    const productsMap = new Map();

    for (const row of productRows) {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          category: row.category,
          price: Number(row.price),
          rating: Number(row.rating),
          image: row.image,
          description: row.description,
          available: Boolean(row.available),
          sellerId: row.sellerId,
          orderOptions: [],
        });
      }

      const product = productsMap.get(row.id);

      if (row.optionId !== null && row.optionTitle !== null) {
        let option = product.orderOptions.find(
          (item: { id: number }) => item.id === row.optionId,
        );

        if (!option) {
          option = {
            id: row.optionId,
            title: row.optionTitle,
            options: [],
          };

          product.orderOptions.push(option);
        }

        if (row.optionValue !== null) {
          option.options.push(row.optionValue);
        }
      }
    }

    // Hapus id internal option agar bentuk data sama dengan useStore.ts
    const products = Array.from(productsMap.values()).map((product) => ({
      ...product,

      orderOptions: product.orderOptions.map(
        (option: { id: number; title: string; options: string[] }) => ({
          title: option.title,
          options: option.options,
        }),
      ),
    }));

    return NextResponse.json({
      success: true,
      message: "Data products berhasil diambil",
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data products",
      },
      {
        status: 500,
      },
    );
  }
}
