import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const name = body.name?.trim();
    const contact = body.contact?.trim();
    const avatar = body.avatar?.trim() || null;

    if (!name || !contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan nomor kontak wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      `
      UPDATE users
      SET
        name = ?,
        contact = ?,
        avatar = ?
      WHERE id = ?
      `,
      [name, contact, avatar, id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    const [rows] = await db.query<UserRow[]>(
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
      [id],
    );

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: {
        ...rows[0],
        balance: Number(rows[0].balance),
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui profil",
      },
      {
        status: 500,
      },
    );
  }
}
