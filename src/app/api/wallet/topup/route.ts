import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  role: "mahasiswa" | "penjual";
  contact: string;
  balance: string;
  avatar: string | null;
  canteenName: string | null;
}

interface TransactionRow extends RowDataPacket {
  id: string;
  userId: string;
  orderId: string | null;
  type: "topup" | "purchase" | "income" | "refund";
  amount: string;
  date: Date;
  description: string;
}

export async function POST(request: NextRequest) {
  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const userId = body.userId;
    const amount = Number(body.amount);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount % 1000 !== 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nominal top up harus valid dan kelipatan Rp1.000",
        },
        { status: 400 },
      );
    }

    if (amount > 1000000) {
      return NextResponse.json(
        {
          success: false,
          message: "Maksimum top up sekali transaksi adalah Rp1.000.000",
        },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    // =========================================================
    // 1. UPDATE SALDO USER
    // =========================================================

    const [updateResult] = await connection.query<ResultSetHeader>(
      `
        UPDATE users
        SET balance = balance + ?
        WHERE id = ?
        `,
      [amount, userId],
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // =========================================================
    // 2. INSERT RIWAYAT TRANSAKSI
    // =========================================================

    const transactionId = `trx-${randomUUID()}`;

    await connection.query<ResultSetHeader>(
      `
      INSERT INTO wallet_transactions
      (
        id,
        user_id,
        order_id,
        type,
        amount,
        transaction_date,
        description
      )
      VALUES (?, ?, NULL, 'topup', ?, NOW(), ?)
      `,
      [
        transactionId,
        userId,
        amount,
        `Top Up saldo sebesar Rp${amount.toLocaleString("id-ID")}`,
      ],
    );

    // =========================================================
    // 3. AMBIL DATA USER TERBARU
    // =========================================================

    const [userRows] = await connection.query<UserRow[]>(
      `
        SELECT
          id,
          name,
          email,
          role,
          contact,
          balance,
          avatar,
          canteen_name AS canteenName
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
      [userId],
    );

    // =========================================================
    // 4. AMBIL TRANSAKSI YANG BARU DIBUAT
    // =========================================================

    const [transactionRows] = await connection.query<TransactionRow[]>(
      `
        SELECT
          id,
          user_id AS userId,
          order_id AS orderId,
          type,
          amount,
          transaction_date AS date,
          description
        FROM wallet_transactions
        WHERE id = ?
        LIMIT 1
        `,
      [transactionId],
    );

    await connection.commit();

    const user = userRows[0];
    const transaction = transactionRows[0];

    return NextResponse.json({
      success: true,

      message: "Top Up berhasil",

      data: {
        user: {
          ...user,
          balance: Number(user.balance),
        },

        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
        },
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("TOP UP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat melakukan Top Up",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
