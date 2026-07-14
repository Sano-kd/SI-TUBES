import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

interface RevenueRow extends RowDataPacket {
  totalRevenue: string;
}

interface CountRow extends RowDataPacket {
  totalOrders: number;
}

interface CompletedOrderCountRow extends RowDataPacket {
  completedOrdersCount: number;
}

interface ActiveMenuRow extends RowDataPacket {
  activeMenusCount: number;
}

interface CanteenRatingRow extends RowDataPacket {
  averageRating: string;
  totalRating: number;
}

interface RecentOrderRow extends RowDataPacket {
  id: string;
  buyerName: string;
  total: string;
  status: string;
  date: Date;
}

interface SellerOrderRow extends RowDataPacket {
  id: string;
  total: string;
  serviceFee: string;
  status: string;
  date: Date;
}

export async function GET(request: NextRequest) {
  try {
    const sellerId = request.nextUrl.searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "sellerId wajib diisi",
        },
        { status: 400 },
      );
    }

    // Total pendapatan penjual berdasarkan transaksi income
    const [revenueRows] = await db.query<RevenueRow[]>(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS totalRevenue
      FROM wallet_transactions
      WHERE user_id = ?
        AND type = 'income'
      `,
      [sellerId],
    );

    // Total seluruh pesanan yang diterima penjual
    const [orderCountRows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS totalOrders
      FROM orders
      WHERE seller_id = ?
      `,
      [sellerId],
    );

    // Total pesanan yang berhasil diselesaikan penjual
    const [completedOrderCountRows] = await db.query<CompletedOrderCountRow[]>(
      `
    SELECT COUNT(*) AS completedOrdersCount
    FROM orders
    WHERE seller_id = ?
      AND status = 'Selesai'
    `,
      [sellerId],
    );
    // Total menu aktif milik penjual
    const [activeMenuRows] = await db.query<ActiveMenuRow[]>(
      `
      SELECT COUNT(*) AS activeMenusCount
      FROM products
      WHERE seller_id = ?
        AND available = 1
      `,
      [sellerId],
    );

    // Rating kantin berdasarkan seluruh penilaian mahasiswa
    const [canteenRatingRows] = await db.query<CanteenRatingRow[]>(
      `
  SELECT
    COALESCE(ROUND(AVG(rating), 1), 0) AS averageRating,
    COUNT(*) AS totalRating
  FROM canteen_ratings
  WHERE canteen_id = ?
  `,
      [sellerId],
    );

    // Tiga pesanan terbaru
    const [recentOrderRows] = await db.query<RecentOrderRow[]>(
      `
      SELECT
        id,
        buyer_name AS buyerName,
        (total - service_fee) AS total,
        
        status,
        order_date AS date
      FROM orders
      WHERE seller_id = ?
      ORDER BY order_date DESC
      LIMIT 3
      `,
      [sellerId],
    );

    // Semua pesanan penjual untuk kebutuhan grafik dashboard
    const [sellerOrderRows] = await db.query<SellerOrderRow[]>(
      `
  SELECT
    id,
    total,
    service_fee AS serviceFee,
    status,
    order_date AS date
  FROM orders
  WHERE seller_id = ?
  ORDER BY order_date ASC
  `,
      [sellerId],
    );
    return NextResponse.json({
      success: true,
      message: "Data dashboard penjual berhasil diambil",
      data: {
        totalRevenue: Number(revenueRows[0].totalRevenue),
        totalOrders: Number(orderCountRows[0].totalOrders),
        completedOrdersCount: Number(
          completedOrderCountRows[0].completedOrdersCount,
        ),
        activeMenusCount: Number(activeMenuRows[0].activeMenusCount),

        averageRating: Number(canteenRatingRows[0].averageRating),
        totalRating: Number(canteenRatingRows[0].totalRating),

        sellerOrders: sellerOrderRows.map((order) => ({
          id: order.id,
          total: Number(order.total),
          serviceFee: Number(order.serviceFee),
          status: order.status,
          date: order.date,
        })),
        recentOrders: recentOrderRows.map((order) => ({
          id: order.id,
          buyerName: order.buyerName,
          total: Number(order.total),
          status: order.status,
          date: order.date,
        })),
      },
    });
  } catch (error) {
    console.error("GET SELLER DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data dashboard penjual",
      },
      { status: 500 },
    );
  }
}
