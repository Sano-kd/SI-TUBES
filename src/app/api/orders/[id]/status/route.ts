import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";

type OrderStatus =
  | "Menunggu"
  | "Diterima"
  | "Diproses"
  | "Siap Diambil"
  | "Selesai"
  | "Ditolak";

interface OrderRow extends RowDataPacket {
  id: string;
  buyerId: string;
  sellerId: string;
  total: string;
  serviceFee: string;
  status: OrderStatus;
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Menunggu: ["Diterima", "Ditolak"],
  Diterima: ["Diproses", "Ditolak"],
  Diproses: ["Siap Diambil"],
  "Siap Diambil": ["Selesai"],
  Selesai: [],
  Ditolak: [],
};

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

    const status = body.status as OrderStatus;
    const rejectionReason = body.rejectionReason?.trim() || null;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status wajib diisi",
        },
        { status: 400 },
      );
    }

    const validStatuses: OrderStatus[] = [
      "Menunggu",
      "Diterima",
      "Diproses",
      "Siap Diambil",
      "Selesai",
      "Ditolak",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status pesanan tidak valid",
        },
        { status: 400 },
      );
    }

    if (status === "Ditolak" && !rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan penolakan wajib diisi",
        },
        { status: 400 },
      );
    }

    await connection.beginTransaction();
    const [orderRows] = await connection.query<OrderRow[]>(
      `
  SELECT
  id,
  buyer_id AS buyerId,
  seller_id AS sellerId,
  total,
  service_fee AS serviceFee,
  status
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

    const currentOrder = orderRows[0];

    if (!allowedTransitions[currentOrder.status].includes(status)) {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: `Status tidak dapat diubah dari ${currentOrder.status} menjadi ${status}`,
        },
        { status: 400 },
      );
    }

    const [result] = await connection.query<ResultSetHeader>(
      `
      UPDATE orders
      SET
        status = ?,
        rejection_reason = ?
      WHERE id = ?
      `,
      [status, status === "Ditolak" ? rejectionReason : null, id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Gagal memperbarui status pesanan");
    }

    if (status === "Ditolak") {
      const refundAmount = Number(currentOrder.total);

      const [refundResult] = await connection.query<ResultSetHeader>(
        `
    UPDATE users
    SET balance = balance + ?
    WHERE id = ?
    `,
        [refundAmount, currentOrder.buyerId],
      );

      if (refundResult.affectedRows === 0) {
        throw new Error("Gagal mengembalikan saldo pengguna");
      }
      const refundTransactionId = `trx-${crypto.randomUUID()}`;

      const [refundTransactionResult] = await connection.query<ResultSetHeader>(
        `
    INSERT INTO wallet_transactions (
      id,
      user_id,
      order_id,
      type,
      amount,
      description
    )
    VALUES (?, ?, ?, 'refund', ?, ?)
    `,
        [
          refundTransactionId,
          currentOrder.buyerId,
          currentOrder.id,
          refundAmount,
          `Pengembalian dana pesanan ${currentOrder.id}`,
        ],
      );

      if (refundTransactionResult.affectedRows === 0) {
        throw new Error("Gagal mencatat transaksi refund");
      }
    }

    if (status === "Selesai") {
      // Cegah saldo penjual masuk dua kali untuk order yang sama.
      const [existingIncomeRows] = await connection.query<RowDataPacket[]>(
        `
    SELECT id
    FROM wallet_transactions
    WHERE order_id = ?
      AND type = 'income'
    LIMIT 1
    FOR UPDATE
    `,
        [currentOrder.id],
      );

      if (existingIncomeRows.length > 0) {
        throw new Error("Pendapatan untuk pesanan ini sudah pernah diproses");
      }

      const sellerIncome =
        Number(currentOrder.total) - Number(currentOrder.serviceFee);

      const [incomeResult] = await connection.query<ResultSetHeader>(
        `
    UPDATE users
    SET balance = balance + ?
    WHERE id = ?
    `,
        [sellerIncome, currentOrder.sellerId],
      );

      if (incomeResult.affectedRows === 0) {
        throw new Error("Gagal menambahkan pendapatan penjual");
      }

      const incomeTransactionId = `trx-${crypto.randomUUID()}`;

      const [incomeTransactionResult] = await connection.query<ResultSetHeader>(
        `
      INSERT INTO wallet_transactions (
        id,
        user_id,
        order_id,
        type,
        amount,
        description
      )
      VALUES (?, ?, ?, 'income', ?, ?)
      `,
        [
          incomeTransactionId,
          currentOrder.sellerId,
          currentOrder.id,
          sellerIncome,
          `Pendapatan pesanan ${currentOrder.id}`,
        ],
      );

      if (incomeTransactionResult.affectedRows === 0) {
        throw new Error("Gagal mencatat transaksi pendapatan penjual");
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Status pesanan berhasil diperbarui",
      data: {
        id,
        status,
        rejectionReason: status === "Ditolak" ? rejectionReason : null,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("UPDATE ORDER STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui status pesanan",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
