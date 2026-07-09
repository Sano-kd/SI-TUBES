import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface TransactionRow extends RowDataPacket {
  id: string;
  userId: string;
  orderId: string | null;
  type: "topup" | "purchase" | "income" | "refund";
  amount: string;
  date: Date;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID wajib dikirim",
        },
        { status: 400 },
      );
    }

    const [rows] = await db.query<TransactionRow[]>(
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
      WHERE user_id = ?
      ORDER BY transaction_date DESC, created_at DESC
      `,
      [userId],
    );

    const transactions = rows.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    }));

    return NextResponse.json({
      success: true,
      message: "Riwayat transaksi berhasil diambil",
      data: transactions,
    });
  } catch (error) {
    console.error("GET WALLET TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil riwayat transaksi",
      },
      { status: 500 },
    );
  }
}
