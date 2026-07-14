import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

interface OrderRow extends RowDataPacket {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string | null;
  total: string;
  serviceFee: string;
  paymentMethod: string;
  status: string;
  date: string;
  rated: number;
  rejectionReason: string | null;
}

interface OrderItemRow extends RowDataPacket {
  orderId: string;
  productId: string | null;
  productName: string;
  price: string;
  quantity: number;
  image: string;
  selectedOptions: string | null;
  catatan: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const sellerId = searchParams.get("sellerId");

    if (!userId && !sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID atau Seller ID wajib diisi",
        },
        { status: 400 },
      );
    }

    const filterColumn = userId ? "o.buyer_id" : "o.seller_id";
    const filterValue = userId ?? sellerId;
    const [orderRows] = await db.query<OrderRow[]>(
      `
      SELECT
        o.id,
        o.buyer_id AS buyerId,
        o.buyer_name AS buyerName,
        o.seller_id AS sellerId,
        u.canteen_name AS sellerName,
        o.total,
        o.service_fee AS serviceFee,
        o.payment_method AS paymentMethod,
        o.status,
        o.order_date AS date,
        o.rated,
        o.rejection_reason AS rejectionReason
      FROM orders o
      LEFT JOIN users u
        ON u.id = o.seller_id
      WHERE ${filterColumn} = ?
ORDER BY o.order_date DESC
`,
      [filterValue],
    );

    if (orderRows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Belum ada pesanan",
        data: [],
      });
    }

    const orderIds = orderRows.map((order) => order.id);

    const placeholders = orderIds.map(() => "?").join(", ");

    const [itemRows] = await db.query<OrderItemRow[]>(
      `
      SELECT
        order_id AS orderId,
        product_id AS productId,
        product_name AS productName,
        price,
        quantity,
        image,
        selected_options AS selectedOptions,
        catatan
      FROM order_items
      WHERE order_id IN (${placeholders})
      ORDER BY id ASC
      `,
      orderIds,
    );

    const orders = orderRows.map((order) => ({
      id: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      total: Number(order.total),
      serviceFee: Number(order.serviceFee),
      paymentMethod: order.paymentMethod,
      status: order.status,
      date: order.date,
      rated: Boolean(order.rated),
      rejectionReason: order.rejectionReason,

      items: itemRows
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image,

          selectedOptions: item.selectedOptions
            ? JSON.parse(item.selectedOptions)
            : {},

          catatan: item.catatan,
        })),
    }));

    return NextResponse.json({
      success: true,
      message: "Data pesanan berhasil diambil",
      data: orders,
    });
  } catch (error) {
    console.error("GET STUDENT ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil pesanan",
      },
      { status: 500 },
    );
  }
}
