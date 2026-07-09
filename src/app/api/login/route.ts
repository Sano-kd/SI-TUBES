import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "mahasiswa" | "penjual";
  contact: string;
  balance: string;
  avatar: string | null;
  canteenName: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    const [rows] = await db.query<UserRow[]>(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        contact,
        balance,
        avatar,
        canteen_name AS canteenName
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 },
      );
    }

    const user = rows[0];

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        balance: Number(user.balance),
        avatar: user.avatar,
        canteenName: user.canteenName,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
      },
      { status: 500 },
    );
  }
}
