import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const hasQuantity = body.quantity !== undefined;
    const hasSelectedOptions = body.selectedOptions !== undefined;
    const hasCatatan = body.catatan !== undefined;
    const hasChecked = body.checked !== undefined;

    if (!hasQuantity && !hasSelectedOptions && !hasCatatan && !hasChecked) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang diperbarui",
        },
        { status: 400 },
      );
    }

    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (hasQuantity) {
      const quantity = Number(body.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity tidak valid",
          },
          { status: 400 },
        );
      }

      updateFields.push("quantity = ?");
      updateValues.push(quantity);
    }

    if (hasSelectedOptions) {
      if (
        typeof body.selectedOptions !== "object" ||
        body.selectedOptions === null ||
        Array.isArray(body.selectedOptions)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Pilihan variasi tidak valid",
          },
          { status: 400 },
        );
      }

      updateFields.push("selected_options = ?");
      updateValues.push(JSON.stringify(body.selectedOptions));
    }

    if (hasCatatan) {
      if (typeof body.catatan !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Catatan tidak valid",
          },
          { status: 400 },
        );
      }

      updateFields.push("catatan = ?");
      updateValues.push(body.catatan.trim());
    }

    if (hasChecked) {
      if (typeof body.checked !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "Status checked tidak valid",
          },
          { status: 400 },
        );
      }

      updateFields.push("checked = ?");
      updateValues.push(body.checked ? 1 : 0);
    }
    updateValues.push(id);

    const [result] = await db.query<ResultSetHeader>(
      `
      UPDATE cart_items
      SET ${updateFields.join(", ")}
      WHERE id = ?
      `,
      updateValues,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Item cart tidak ditemukan atau data tidak berubah",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item keranjang berhasil diperbarui",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui item cart",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const [result] = await db.query<ResultSetHeader>(
      `
      DELETE FROM cart_items
      WHERE id = ?
      `,
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Item cart tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item berhasil dihapus dari keranjang",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("DELETE CART ITEM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus item cart",
      },
      { status: 500 },
    );
  }
}
