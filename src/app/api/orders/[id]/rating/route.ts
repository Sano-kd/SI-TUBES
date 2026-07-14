import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";
import db from "@/lib/db";

interface OrderRow extends RowDataPacket {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  status: string;
  rated: number;
}

interface RatingRow extends RowDataPacket {
  averageRating: string | null;
}

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

    const rating = Number(body.rating);

    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating harus berupa angka 1 sampai 5",
        },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    // ============================================================
    // AMBIL DAN KUNCI ORDER
    // ============================================================

    const [orderRows] = await connection.query<OrderRow[]>(
      `
      SELECT
        id,
        buyer_id AS buyerId,
        buyer_name AS buyerName,
        seller_id AS sellerId,
        status,
        rated

      FROM orders

      WHERE id = ?

      LIMIT 1

      FOR UPDATE
      `,
      [id],
    );

    if (orderRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Pesanan tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const order = orderRows[0];

    // ============================================================
    // VALIDASI STATUS ORDER
    // ============================================================

    if (order.status !== "Selesai") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Hanya pesanan selesai yang dapat diberi rating",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // CEGAH RATING GANDA
    // ============================================================

    if (Boolean(order.rated)) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Pesanan ini sudah pernah diberi rating",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // SIMPAN RATING KANTIN
    // ============================================================

    const ratingId = `rating-${randomUUID()}`;

    const [ratingResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO canteen_ratings (
          id,
          canteen_id,
          student_id,
          student_name,
          rating,
          comment,
          order_id
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        ratingId,
        order.sellerId,
        order.buyerId,
        order.buyerName,
        rating,
        comment,
        order.id,
      ],
    );

    if (ratingResult.affectedRows === 0) {
      throw new Error("Gagal menyimpan rating kantin");
    }

    // ============================================================
    // TANDAI ORDER SUDAH DIBERI RATING
    // ============================================================

    const [orderResult] = await connection.query<ResultSetHeader>(
      `
        UPDATE orders

        SET rated = 1

        WHERE id = ?
          AND rated = 0
        `,
      [order.id],
    );

    if (orderResult.affectedRows === 0) {
      throw new Error("Gagal memperbarui status rating pesanan");
    }

    // ============================================================
    // HITUNG RATA-RATA RATING KANTIN
    // ============================================================

    const [ratingRows] = await connection.query<RatingRow[]>(
      `
        SELECT
          AVG(rating) AS averageRating

        FROM canteen_ratings

        WHERE canteen_id = ?
        `,
      [order.sellerId],
    );

    await connection.commit();

    return NextResponse.json({
      success: true,

      message: "Rating berhasil disimpan",

      data: {
        ratingId,

        orderId: order.id,

        sellerId: order.sellerId,

        rating,

        comment,

        averageRating: Number(ratingRows[0]?.averageRating ?? 0),

        rated: true,
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("RATING ROLLBACK ERROR:", rollbackError);
    }

    console.error("UPDATE ORDER RATING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan rating",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
