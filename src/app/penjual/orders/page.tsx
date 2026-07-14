"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  User,
  Check,
  ChefHat,
  BellRing,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import Dialog from "@/components/ui/dialog";

interface SellerOrderItem {
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: Record<string, string>;
  catatan: string | null;
}

interface SellerOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string | null;
  total: number;
  serviceFee: number;
  paymentMethod: string;
  status:
    | "Menunggu"
    | "Diterima"
    | "Diproses"
    | "Siap Diambil"
    | "Selesai"
    | "Ditolak";
  date: string;
  rated: boolean;
  rejectionReason: string | null;
  items: SellerOrderItem[];
}
export default function SellerOrdersPage() {
  const currentUser = useStore((state) => state.currentUser);

  const toast = useToastStore((state) => state.toast);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Rejection Dialog states
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  if (!currentUser) return null;

  // Filter orders for this specific canteen seller
  useEffect(() => {
    if (!currentUser) return;

    const fetchSellerOrders = async () => {
      try {
        setOrdersLoading(true);

        const response = await fetch(
          `/api/orders?sellerId=${encodeURIComponent(currentUser.id)}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil pesanan masuk");
        }

        setSellerOrders(result.data);
      } catch (error) {
        console.error("GET SELLER ORDERS ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil pesanan",
          "error",
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchSellerOrders();
  }, [currentUser?.id, toast]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badges colors mapping
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

  const handleUpdateStatus = async (
    orderId: string,
    targetStatus: "Diterima" | "Diproses" | "Siap Diambil" | "Selesai",
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui status pesanan");
      }

      setSellerOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: targetStatus,
                rejectionReason: null,
              }
            : order,
        ),
      );

      let message = "";

      if (targetStatus === "Diterima") {
        message = "Pesanan diterima";
      } else if (targetStatus === "Diproses") {
        message = "Pesanan mulai diproses/dimasak";
      } else if (targetStatus === "Siap Diambil") {
        message = "Pesanan siap diambil";
      } else {
        message = "Pesanan selesai diserahkan";
      }

      toast(`${orderId}: ${message}`, "success");
    } catch (error) {
      console.error("UPDATE ORDER STATUS ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui status pesanan",
        "error",
      );
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reasonInput.trim()) {
      toast("Alasan penolakan wajib diisi!", "error");
      return;
    }

    if (!rejectOrderId) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${rejectOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Ditolak",
          rejectionReason: reasonInput.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menolak pesanan");
      }

      setSellerOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === rejectOrderId
            ? {
                ...order,
                status: "Ditolak",
                rejectionReason: reasonInput.trim(),
              }
            : order,
        ),
      );

      toast(`${rejectOrderId}: Pesanan ditolak.`, "info");

      setRejectOrderId(null);
      setReasonInput("");
    } catch (error) {
      console.error("REJECT ORDER ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menolak pesanan",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">
          Daftar Pesanan Masuk
        </h3>
      </div>

      {ordersLoading ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Memuat pesanan masuk...
          </p>
        </div>
      ) : sellerOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <h4 className="font-extrabold text-sm text-foreground">
            Tidak ada pesanan
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Belum ada pesanan masuk dari mahasiswa untuk hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellerOrders.map((order) => {
            const isMenunggu = order.status === "Menunggu";
            const isDiterima = order.status === "Diterima";
            const isDiproses = order.status === "Diproses";
            const isSiapDiambil = order.status === "Siap Diambil";
            const isSelesai = order.status === "Selesai";
            const isDitolak = order.status === "Ditolak";

            return (
              <motion.div
                key={order.id}
                layout
                className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-soft space-y-4"
              >
                {/* Order Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">
                        {order.buyerName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {order.id} • {formatDate(order.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Metode: {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List detail */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.productId}-${index}`}
                        className="flex flex-col text-xs gap-1 border-b border-border/20 last:border-0 pb-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-semibold">
                            {item.productName}{" "}
                            <span className="font-extrabold text-foreground">
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-foreground shrink-0">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                        {item.selectedOptions &&
                          Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {Object.entries(item.selectedOptions).map(
                                ([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground"
                                  >
                                    {v}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        {item.catatan && (
                          <p className="text-[10px] text-muted-foreground italic">
                            📝 Catatan: {item.catatan}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-extrabold border-t border-border/40 pt-2 text-primary">
                      <span>Total Pendapatan</span>
                      <span>
                        {formatRupiah(order.total - order.serviceFee)}
                      </span>
                    </div>

                    {isDitolak && order.rejectionReason && (
                      <div className="flex items-start gap-2 p-2.5 bg-destructive/5 border border-destructive/20 rounded-xl text-[11px] text-destructive">
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Alasan Penolakan / Pembatalan: {order.rejectionReason}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Interactive action buttons */}
                  <div className="md:col-span-1 flex flex-col gap-2 justify-end items-stretch sm:items-end">
                    {isMenunggu && (
                      <div className="flex flex-col gap-2 w-full">
                        <button
                          onClick={() =>
                            handleUpdateStatus(order.id, "Diterima")
                          }
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Terima Pesanan</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectOrderId(order.id);
                            setReasonInput("");
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-destructive/10 hover:bg-destructive hover:text-white border border-destructive/20 hover:border-destructive text-destructive rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          <Ban className="w-4 h-4 shrink-0" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}

                    {isDiterima && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "Diproses")}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        <ChefHat className="w-4 h-4 shrink-0" />
                        <span>Terima & Masak</span>
                      </button>
                    )}

                    {isDiproses && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, "Siap Diambil")
                        }
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        <BellRing className="w-4 h-4 shrink-0 animate-bounce" />
                        <span>Siap Diambil</span>
                      </button>
                    )}

                    {isSiapDiambil && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "Selesai")}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        <Check className="w-4 h-4 shrink-0 stroke-[3px]" />
                        <span>Serahkan Makanan</span>
                      </button>
                    )}

                    {isSelesai && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs p-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Selesai Diserahkan</span>
                      </div>
                    )}

                    {isDitolak && (
                      <div className="flex items-center gap-1.5 text-destructive font-bold text-xs p-2">
                        <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        <span>Pesanan Ditolak/Batal</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reject Order Reason Dialog */}
      <AnimatePresence>
        {rejectOrderId && (
          <Dialog
            isOpen={!!rejectOrderId}
            onClose={() => setRejectOrderId(null)}
            title="Tolak Pesanan"
          >
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground block">
                  Masukkan alasan penolakan
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Contoh: Stok bahan habis, Kantin segera tutup..."
                  className="w-full p-3 bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground h-20 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectOrderId(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-xl cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl cursor-pointer text-center shadow-md shadow-destructive/10"
                >
                  Kirim Penolakan
                </button>
              </div>
            </form>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
