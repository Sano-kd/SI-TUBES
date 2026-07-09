import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { RowDataPacket } from "mysql2";

interface ExistingUserRow extends RowDataPacket {
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password, role, contact, canteenName } = body;

    // Validasi field wajib
    if (!name || !email || !password || !role || !contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua data wajib diisi",
        },
        { status: 400 },
      );
    }

    // Validasi role
    if (role !== "mahasiswa" && role !== "penjual") {
      return NextResponse.json(
        {
          success: false,
          message: "Role tidak valid",
        },
        { status: 400 },
      );
    }

    // Penjual wajib memiliki nama kantin
    if (role === "penjual" && !canteenName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kantin wajib diisi untuk penjual",
        },
        { status: 400 },
      );
    }

    // Cek email sudah terdaftar atau belum
    const [existingUsers] = await db.query<ExistingUserRow[]>(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat ID user
    const userId = `usr-${randomUUID()}`;

    // Balance awal
    const initialBalance = 0;

    // Simpan user ke MySQL
    await db.query(
      `
      INSERT INTO users (
        id,
        name,
        email,
        password,
        role,
        contact,
        balance,
        avatar,
        canteen_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        name,
        email.toLowerCase().trim(),
        hashedPassword,
        role,
        contact,
        initialBalance,
        null,
        role === "penjual" ? canteenName : null,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          id: userId,
          name,
          email: email.toLowerCase().trim(),
          role,
          contact,
          balance: initialBalance,
          avatar: null,
          canteenName: role === "penjual" ? canteenName : null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
      },
      { status: 500 },
    );
  }
}
