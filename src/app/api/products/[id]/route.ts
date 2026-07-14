import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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
  optionAdditionalPrice: string | null;
}

interface OptionValueInput {
  value: string;
  additionalPrice: number;
}

interface OrderOptionInput {
  title: string;
  options: OptionValueInput[];
}

/* =========================================================
   GET PRODUCT DETAIL
========================================================= */

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

        pov.value AS optionValue,
        pov.additional_price AS optionAdditionalPrice

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

    const optionsMap = new Map<
      number,
      {
        title: string;
        options: OptionValueInput[];
      }
    >();

    for (const row of rows) {
      if (row.optionId === null || row.optionTitle === null) {
        continue;
      }

      if (!optionsMap.has(row.optionId)) {
        optionsMap.set(row.optionId, {
          title: row.optionTitle,
          options: [],
        });
      }

      if (row.optionValue !== null) {
        optionsMap.get(row.optionId)!.options.push({
          value: row.optionValue,
          additionalPrice: Number(row.optionAdditionalPrice ?? 0),
        });
      }
    }

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

      orderOptions: Array.from(optionsMap.values()),
    };

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
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail produk",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   PATCH PRODUCT
========================================================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const connection = await db.getConnection();

  try {
    const { id } = await context.params;
    const body = await request.json();

    await connection.beginTransaction();

    const [existingRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

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

    /* =====================================================
       TOGGLE AVAILABLE SAJA
    ===================================================== */

    if (typeof body.available === "boolean" && Object.keys(body).length === 1) {
      const [result] = await connection.query<ResultSetHeader>(
        `
        UPDATE products
        SET available = ?
        WHERE id = ?
        `,
        [body.available ? 1 : 0, id],
      );

      if (result.affectedRows === 0) {
        throw new Error("Gagal memperbarui ketersediaan produk");
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Ketersediaan produk berhasil diperbarui",
        data: {
          id,
          available: body.available,
        },
      });
    }

    /* =====================================================
       DATA PRODUCT
    ===================================================== */

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const category = body.category;

    const price = Number(body.price);

    const image = typeof body.image === "string" ? body.image.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const available = Boolean(body.available);

    const rawOrderOptions: unknown[] = Array.isArray(body.orderOptions)
      ? body.orderOptions
      : [];

    const validCategories = ["Food", "Drink", "Dessert", "Snack"];

    /* =====================================================
       VALIDASI PRODUCT
    ===================================================== */

    if (!name) {
      await connection.rollback();

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
      await connection.rollback();

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
      await connection.rollback();

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
      await connection.rollback();

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

    /* =====================================================
       NORMALISASI ORDER OPTIONS
    ===================================================== */

    const orderOptions: OrderOptionInput[] = [];

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

      const values: OptionValueInput[] = [];

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

      if (!title || values.length === 0) {
        continue;
      }

      orderOptions.push({
        title,
        options: values,
      });
    }

    /* =====================================================
       UPDATE PRODUCT
    ===================================================== */

    const [updateResult] = await connection.query<ResultSetHeader>(
      `
        UPDATE products
        SET
          name = ?,
          category = ?,
          price = ?,
          image = ?,
          description = ?,
          available = ?
        WHERE id = ?
        `,
      [name, category, price, image, description, available ? 1 : 0, id],
    );

    if (updateResult.affectedRows === 0) {
      throw new Error("Gagal memperbarui produk");
    }

    /* =====================================================
       HAPUS VARIASI LAMA
    ===================================================== */

    await connection.query<ResultSetHeader>(
      `
      DELETE pov
      FROM product_option_values pov

      INNER JOIN product_options po
        ON po.id = pov.option_id

      WHERE po.product_id = ?
      `,
      [id],
    );

    await connection.query<ResultSetHeader>(
      `
      DELETE FROM product_options
      WHERE product_id = ?
      `,
      [id],
    );

    /* =====================================================
       INSERT VARIASI TERBARU
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
        [id, option.title],
      );

      const optionId = optionResult.insertId;

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

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("ROLLBACK UPDATE PRODUCT ERROR:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui produk",
      },
      {
        status: 500,
      },
    );
  } finally {
    connection.release();
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const connection = await db.getConnection();

  try {
    const { id } = await context.params;

    await connection.beginTransaction();

    const [productRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id],
    );

    if (productRows.length === 0) {
      await connection.rollback();

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

    /* =====================================================
       HAPUS OPTION VALUES
    ===================================================== */

    await connection.query<ResultSetHeader>(
      `
      DELETE pov
      FROM product_option_values pov

      INNER JOIN product_options po
        ON po.id = pov.option_id

      WHERE po.product_id = ?
      `,
      [id],
    );

    /* =====================================================
       HAPUS PRODUCT OPTIONS
    ===================================================== */

    await connection.query<ResultSetHeader>(
      `
      DELETE FROM product_options
      WHERE product_id = ?
      `,
      [id],
    );

    /* =====================================================
       HAPUS PRODUCT
    ===================================================== */

    const [deleteResult] = await connection.query<ResultSetHeader>(
      `
        DELETE FROM products
        WHERE id = ?
        `,
      [id],
    );

    if (deleteResult.affectedRows === 0) {
      throw new Error("Gagal menghapus produk");
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("ROLLBACK DELETE PRODUCT ERROR:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus produk",
      },
      {
        status: 500,
      },
    );
  } finally {
    connection.release();
  }
}
