import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";

/* =========================================================
   TYPES
========================================================= */

interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: string;
  rating: string;
  averageRating: string | null;
  totalRating: number;
  image: string;
  description: string;
  available: number;

  sellerId: string;
  canteenName: string | null;

  optionId: number | null;
  optionTitle: string | null;

  optionValue: string | null;
  optionAdditionalPrice: string | null;
}

interface ProductOptionValueInput {
  value: string;
  additionalPrice: number;
}

interface ProductOptionInput {
  title: string;
  options: ProductOptionValueInput[];
}

interface ProductOptionResult {
  id: number;
  title: string;
  options: ProductOptionValueInput[];
}

interface ProductResult {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: number;
  rating: number;
  totalRating: number;
  image: string;
  description: string;
  available: boolean;
  sellerId: string;
  canteenName: string;
  orderOptions: ProductOptionResult[];
}

/* =========================================================
   GET PRODUCTS
========================================================= */

export async function GET() {
  try {
    const [rows] = await db.query<ProductRow[]>(`
      SELECT
        p.id,
        p.name,
        p.category,
        p.price,

COALESCE(cr.averageRating, p.rating) AS averageRating,
COALESCE(cr.totalRating, 0) AS totalRating,

p.image,
        p.description,
        p.available,

        p.seller_id AS sellerId,
        u.canteen_name AS canteenName,

        po.id AS optionId,
        po.title AS optionTitle,

        pov.value AS optionValue,
        pov.additional_price AS optionAdditionalPrice

      FROM products p

      LEFT JOIN users u
        ON u.id = p.seller_id

        LEFT JOIN (
  SELECT
    canteen_id,
    ROUND(AVG(rating), 1) AS averageRating,
    COUNT(*) AS totalRating
  FROM canteen_ratings
  GROUP BY canteen_id
) cr
  ON cr.canteen_id = p.seller_id

      LEFT JOIN product_options po
        ON po.product_id = p.id

      LEFT JOIN product_option_values pov
        ON pov.option_id = po.id

      ORDER BY
        p.id,
        po.id,
        pov.id
    `);

    const productsMap = new Map<string, ProductResult>();

    for (const row of rows) {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          category: row.category,
          price: Number(row.price),
          rating: Number(row.averageRating ?? row.rating),
          totalRating: Number(row.totalRating),
          image: row.image,
          description: row.description,
          available: Boolean(row.available),
          sellerId: row.sellerId,
          canteenName: row.canteenName || "Kantin",
          orderOptions: [],
        });
      }

      const product = productsMap.get(row.id);

      if (!product) {
        continue;
      }

      if (row.optionId !== null && row.optionTitle !== null) {
        let option = product.orderOptions.find(
          (currentOption) => currentOption.id === row.optionId,
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
          option.options.push({
            value: row.optionValue,
            additionalPrice: Number(row.optionAdditionalPrice ?? 0),
          });
        }
      }
    }

    /*
      ID product_options hanya digunakan secara internal untuk
      mengelompokkan hasil JOIN.

      ID tersebut tidak perlu dikirim ke frontend.
    */

    const products = Array.from(productsMap.values()).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      rating: product.rating,
      totalRating: product.totalRating,
      image: product.image,
      description: product.description,
      available: product.available,
      sellerId: product.sellerId,
      canteenName: product.canteenName,

      orderOptions: product.orderOptions.map((option) => ({
        title: option.title,

        options: option.options.map((optionValue) => ({
          value: optionValue.value,
          additionalPrice: optionValue.additionalPrice,
        })),
      })),
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
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data products",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   POST PRODUCT
========================================================= */

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const category = body.category;

    const price = Number(body.price);

    const image = typeof body.image === "string" ? body.image.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const available = Boolean(body.available);

    const sellerId = typeof body.sellerId === "string" ? body.sellerId : "";

    const rawOrderOptions: unknown[] = Array.isArray(body.orderOptions)
      ? body.orderOptions
      : [];

    /* =====================================================
       VALIDASI PRODUCT
    ===================================================== */

    const validCategories = ["Food", "Drink", "Dessert", "Snack"];

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori produk tidak valid",
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga produk tidak valid",
        },
        {
          status: 400,
        },
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "Gambar produk wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller ID wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       NORMALISASI ORDER OPTIONS
    ===================================================== */

    const orderOptions: ProductOptionInput[] = [];

    for (const rawOption of rawOrderOptions) {
      if (typeof rawOption !== "object" || rawOption === null) {
        continue;
      }

      const optionRecord = rawOption as Record<string, unknown>;

      const title =
        typeof optionRecord.title === "string" ? optionRecord.title.trim() : "";

      const rawValues: unknown[] = Array.isArray(optionRecord.options)
        ? optionRecord.options
        : [];

      const values: ProductOptionValueInput[] = [];

      for (const rawValue of rawValues) {
        if (typeof rawValue !== "object" || rawValue === null) {
          continue;
        }

        const valueRecord = rawValue as Record<string, unknown>;

        const value =
          typeof valueRecord.value === "string" ? valueRecord.value.trim() : "";

        const additionalPrice = Number(valueRecord.additionalPrice);

        if (!value) {
          continue;
        }

        values.push({
          value,
          additionalPrice:
            Number.isFinite(additionalPrice) && additionalPrice >= 0
              ? additionalPrice
              : 0,
        });
      }

      /*
        Variasi kosong tidak disimpan.

        Contoh:
        title = ""
        options = []

        akan dilewati.
      */

      if (!title || values.length === 0) {
        continue;
      }

      orderOptions.push({
        title,
        options: values,
      });
    }

    /* =====================================================
       MULAI TRANSACTION
    ===================================================== */

    await connection.beginTransaction();

    const productId = `prod-${crypto.randomUUID()}`;

    /* =====================================================
       INSERT PRODUCT
    ===================================================== */

    const [productResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO products (
          id,
          seller_id,
          name,
          category,
          price,
          rating,
          image,
          description,
          available
        )
        VALUES (?, ?, ?, ?, ?, 5.00, ?, ?, ?)
        `,
      [
        productId,
        sellerId,
        name,
        category,
        price,
        image,
        description,
        available ? 1 : 0,
      ],
    );

    if (productResult.affectedRows === 0) {
      throw new Error("Gagal menambahkan produk");
    }

    /* =====================================================
       INSERT PRODUCT OPTIONS
    ===================================================== */

    for (const option of orderOptions) {
      const [optionResult] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO product_options (
            product_id,
            title
          )
          VALUES (?, ?)
          `,
        [productId, option.title],
      );

      const optionId = optionResult.insertId;

      /* ===================================================
         INSERT PRODUCT OPTION VALUES
      =================================================== */

      for (const optionValue of option.options) {
        await connection.query<ResultSetHeader>(
          `
          INSERT INTO product_option_values (
            option_id,
            value,
            additional_price
          )
          VALUES (?, ?, ?)
          `,
          [optionId, optionValue.value, optionValue.additionalPrice],
        );
      }
    }

    /* =====================================================
       COMMIT
    ===================================================== */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan",
        data: {
          id: productId,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("ROLLBACK PRODUCT ERROR:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menambahkan produk",
      },
      {
        status: 500,
      },
    );
  } finally {
    connection.release();
  }
}
