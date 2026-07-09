import { NextResponse } from "next/server";
import db from "@/lib/db";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "mahasiswa" | "penjual";
  contact: string;
  balance: string;
  avatar: string | null;
  canteenName: string | null;
}

export async function GET() {
  try {
    const [rows] = await db.query(`
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
      ORDER BY created_at ASC
    `);

    const userRows = rows as UserRow[];

    const users = userRows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      balance: Number(user.balance),
      avatar: user.avatar,
      canteenName: user.canteenName,
    }));

    return NextResponse.json({
      success: true,
      message: "Data users berhasil diambil",
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data users",
      },
      {
        status: 500,
      },
    );
  }
}
