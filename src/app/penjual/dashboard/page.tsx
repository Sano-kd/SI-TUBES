"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Receipt,
  UtensilsCrossed,
  User,
  Store,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import AnalyticsCard from "@/components/analytics-card";
import Dialog from "@/components/ui/dialog";

interface DashboardOrder {
  id: string;
  buyerName: string;
  total: number;
  status:
    | "Menunggu"
    | "Diterima"
    | "Diproses"
    | "Siap Diambil"
    | "Selesai"
    | "Ditolak";
  date: string;
}

interface SellerOrder {
  id: string;
  total: number;
  serviceFee: number;
  status:
    | "Menunggu"
    | "Diterima"
    | "Diproses"
    | "Siap Diambil"
    | "Selesai"
    | "Ditolak";
  date: string;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  completedOrdersCount: number;
  activeMenusCount: number;
  averageRating: number;
  totalRating: number;
  sellerOrders: SellerOrder[];
  recentOrders: DashboardOrder[];
}

export default function SellerDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);

  const [filterType, setFilterType] = useState<"Hari" | "Minggu" | "Bulan">(
    "Hari",
  );
  const [selectedBar, setSelectedBar] = useState<{
    label: string;
    count: number;
    revenue: number;
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "penjual") {
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);

        const response = await fetch(
          `/api/seller/dashboard?sellerId=${currentUser.id}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil dashboard penjual",
          );
        }

        setDashboardData(result.data);
      } catch (error) {
        console.error("FETCH SELLER DASHBOARD ERROR:", error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) return null;

  const canteenName = currentUser.canteenName || "Mencintai";

  const totalRevenue = dashboardData?.totalRevenue ?? 0;
  const totalOrders = dashboardData?.totalOrders ?? 0;
  const completedOrdersCount = dashboardData?.completedOrdersCount ?? 0;
  const activeMenusCount = dashboardData?.activeMenusCount ?? 0;
  const averageRating = dashboardData?.averageRating ?? 0;
  const totalRating = dashboardData?.totalRating ?? 0;

  const recentOrders = dashboardData?.recentOrders ?? [];
  const sellerOrders = dashboardData?.sellerOrders ?? [];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return (
      new Date(dateStr).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const statusColors = {
    Menunggu:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/10",
    Diterima:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10",
    Diproses:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10",
    "Siap Diambil":
      "bg-primary/10 text-primary dark:bg-primary/20 dark:text-orange-400 border-primary/10",
    Selesai:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
    Ditolak: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const completedOrders = sellerOrders.filter(
    (order) => order.status === "Selesai",
  );

  const now = new Date();

  const dailyData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      label: date.toLocaleDateString("id-ID", {
        weekday: "long",
      }),
      abbr: date.toLocaleDateString("id-ID", {
        weekday: "short",
      }),
      count: 0,
      revenue: 0,
      startDate: date,
    };
  });

  completedOrders.forEach((order) => {
    const orderDate = new Date(order.date);
    orderDate.setHours(0, 0, 0, 0);

    const target = dailyData.find(
      (item) => item.startDate.getTime() === orderDate.getTime(),
    );

    if (target) {
      target.count += 1;
      target.revenue += order.total - order.serviceFee;
    }
  });

  const weeklyData = Array.from({ length: 4 }, (_, index) => {
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(endDate.getDate() - (3 - index) * 7);

    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    return {
      label: `Minggu ${index + 1}`,
      abbr: `W${index + 1}`,
      count: 0,
      revenue: 0,
      startDate,
      endDate,
    };
  });

  completedOrders.forEach((order) => {
    const orderDate = new Date(order.date);

    const target = weeklyData.find(
      (item) => orderDate >= item.startDate && orderDate <= item.endDate,
    );

    if (target) {
      target.count += 1;
      target.revenue += order.total - order.serviceFee;
    }
  });

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);

    return {
      label: date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      abbr: date.toLocaleDateString("id-ID", {
        month: "short",
      }),
      count: 0,
      revenue: 0,
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  });

  completedOrders.forEach((order) => {
    const orderDate = new Date(order.date);

    const target = monthlyData.find(
      (item) =>
        item.year === orderDate.getFullYear() &&
        item.month === orderDate.getMonth(),
    );

    if (target) {
      target.count += 1;
      target.revenue += order.total - order.serviceFee;
    }
  });

  const activeData =
    filterType === "Hari"
      ? dailyData
      : filterType === "Minggu"
        ? weeklyData
        : monthlyData;
  const maxRevenue = Math.max(...activeData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-soft flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider">
              Dashboard Mitra Kantin
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Kantin {canteenName}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Pantau laporan penjualan dan kelola pesanan mahasiswa secara
              real-time.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Pendapatan Total"
          value={formatRupiah(totalRevenue)}
          icon={DollarSign}
          change={{
            value: totalRevenue > 0 ? "+18.4%" : "0%",
            isPositive: totalRevenue > 0,
          }}
          description="vs. minggu lalu"
          color="emerald"
        />
        <AnalyticsCard
          title="Total Orderan"
          value={totalOrders}
          icon={Receipt}
          change={{
            value: totalOrders > 0 ? "+12.5%" : "0%",
            isPositive: totalOrders > 0,
          }}
          description="Pesanan masuk"
          color="primary"
        />

        <AnalyticsCard
          title="Menu Tersedia"
          value={activeMenusCount}
          icon={UtensilsCrossed}
          description="Aktif di katalog"
          color="blue"
        />

        <AnalyticsCard
          title="Rating Kantin"
          value={averageRating.toFixed(1)}
          icon={Star}
          description={
            totalRating > 0 ? `${totalRating} penilaian` : "Belum ada penilaian"
          }
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-soft space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                Grafik Volume Transaksi
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Pilih filter untuk melihat rincian omzet
              </p>
            </div>

            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border/60">
              {(["Hari", "Minggu", "Bulan"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer
                    ${
                      filterType === type
                        ? "bg-background text-primary shadow-xs border border-border/10"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2.5 pt-6 select-none border-b border-border/40 pb-2">
            {activeData.map((val, idx) => {
              const barHeightPct =
                val.revenue > 0 ? (val.revenue / maxRevenue) * 85 + 15 : 5;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  onClick={() => setSelectedBar(val)}
                >
                  <div className="w-full bg-muted/60 hover:bg-muted rounded-lg h-36 relative overflow-hidden transition-all duration-300">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPct}%` }}
                      transition={{ type: "spring", delay: idx * 0.03 }}
                      className="absolute bottom-0 left-0 right-0 bg-primary group-hover:bg-primary-hover transition-colors rounded-b-lg rounded-t-xs"
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-semibold group-hover:text-primary transition-colors truncate max-w-full">
                    {val.abbr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3 mb-3">
              Pesanan Terbaru
            </h3>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Belum ada pesanan terbaru
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start justify-between text-xs gap-2"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {order.buyerName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">
                        {formatRupiah(order.total)}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md border mt-1 ${statusColors[order.status] || ""}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/penjual/orders")}
            className="w-full text-center py-2.5 bg-muted hover:bg-muted/80 border border-border text-xs font-bold rounded-xl text-foreground mt-4 cursor-pointer"
          >
            Lihat Semua Pesanan
          </button>
        </div>
      </div>

      {selectedBar && (
        <Dialog
          isOpen={!!selectedBar}
          onClose={() => setSelectedBar(null)}
          title={`Detail Penjualan - ${selectedBar.label}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-muted/40 border border-border/40 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2.5">
                <span className="text-muted-foreground">Periode</span>
                <span className="font-bold text-foreground">
                  {selectedBar.label}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2.5">
                <span className="text-muted-foreground">
                  Total Pesanan Selesai
                </span>
                <span className="font-bold text-foreground">
                  {selectedBar.count} Pesanan
                </span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-muted-foreground">Total Pendapatan</span>
                <span className="font-extrabold text-sm text-primary">
                  {formatRupiah(selectedBar.revenue)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBar(null)}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold cursor-pointer transition-all text-center"
            >
              Tutup Rincian
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
