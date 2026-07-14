"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  Check,
  Store,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";

interface CheckoutItem {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  price: number;
  image: string;
  selectedOptions: Record<string, string>;
  catatan: string | null;
}

interface CheckoutPreview {
  balance: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  cart: CheckoutItem[];
}
export default function CheckoutPage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  const toast = useToastStore((state) => state.toast);
  const [loading, setLoading] = useState(false);
  const [databaseBalance, setDatabaseBalance] = useState<number | null>(null);
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreview | null>(null);

  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchLatestUser = async () => {
      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil saldo terbaru");
        }

        setDatabaseBalance(result.data.balance);
      } catch (error) {
        console.error("GET LATEST USER ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Gagal mengambil saldo terbaru",
          "error",
        );
      }
    };

    fetchLatestUser();
  }, [currentUser?.id, toast]);
  useEffect(() => {
    if (!currentUser) return;

    const fetchCheckoutPreview = async () => {
      try {
        setPreviewLoading(true);

        const response = await fetch(
          `/api/checkout/preview?userId=${encodeURIComponent(currentUser.id)}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data checkout");
        }

        setCheckoutPreview(result.data);
        setDatabaseBalance(result.data.balance);
      } catch (error) {
        console.error("GET CHECKOUT PREVIEW ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data checkout",
          "error",
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchCheckoutPreview();
  }, [currentUser?.id, toast]);
  if (!currentUser) return null;

  const checkedItems = checkoutPreview?.cart ?? [];

  const subtotal = checkoutPreview?.subtotal ?? 0;
  const serviceFee = checkoutPreview?.serviceFee ?? 0;
  const total = checkoutPreview?.total ?? 0;

  const hasSufficientBalance =
    databaseBalance !== null && databaseBalance >= total;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Group checked items by canteen
  const itemsBySeller: { [sellerId: string]: typeof checkedItems } = {};
  checkedItems.forEach((item) => {
    const sId = item.sellerId || "unknown";
    if (!itemsBySeller[sId]) itemsBySeller[sId] = [];
    itemsBySeller[sId].push(item);
  });

  const canteenCount = Object.keys(itemsBySeller).length;

  const handleProcessPayment = async () => {
    if (checkedItems.length === 0) {
      toast("Tidak ada item yang dipilih!", "error");
      return;
    }

    if (!hasSufficientBalance) {
      toast("Saldo tidak mencukupi, silahkan top up", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Pembayaran gagal");
      }
      const latestBalance =
        (databaseBalance ?? currentUser.balance) - result.data.total;

      setCurrentUser({
        ...currentUser,
        balance: latestBalance,
      });

      setDatabaseBalance(latestBalance);
      toast("Pembayaran berhasil!", "success");

      router.push(
        `/mahasiswa/success?id=${result.data.orderId}&total=${result.data.total}`,
      );
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat melakukan pembayaran",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Cart link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Keranjang</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Checkout Items Summary & Payment */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-foreground mb-3">
            Metode Pembayaran
          </h3>

          {/* Payment Option: Saldo e-Kantin */}
          <div
            className={`p-5 rounded-2xl border transition-all select-none
            ${
              hasSufficientBalance
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-destructive/30 bg-destructive/5"
            }
          `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0
                  ${hasSufficientBalance ? "bg-primary text-white" : "bg-destructive text-white"}`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Saldo Dompet e-Kantin
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Metode pembayaran internal cepat & aman
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">
                  Saldo Anda
                </span>
                <span className="font-bold text-sm text-foreground">
                  {databaseBalance === null
                    ? "Memuat..."
                    : formatRupiah(databaseBalance)}
                </span>
              </div>
            </div>

            {!hasSufficientBalance && (
              <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive mt-4 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-normal">
                  <span>
                    Saldo tidak mencukupi untuk membayar tagihan ini. Silahkan
                    lakukan top up terlebih dahulu.
                  </span>
                  <button
                    onClick={() => router.push("/mahasiswa/wallet")}
                    className="block font-bold underline text-primary mt-1 hover:text-primary-hover cursor-pointer"
                  >
                    Top Up Saldo Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Multi-canteen order summary */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground">
                Pesanan dari {canteenCount} Kantin ({checkedItems.length} item)
              </h4>
            </div>

            <div className="space-y-5 max-h-[320px] overflow-y-auto pr-1">
              {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
                const canteenName = sellerItems[0]?.sellerName || "Kantin";
                const sellerTotal = sellerItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                );

                return (
                  <div key={sellerId} className="space-y-2">
                    {/* Canteen header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-extrabold text-foreground">
                          Kantin {canteenName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {formatRupiah(sellerTotal)}
                      </span>
                    </div>

                    {/* Items in this canteen */}
                    <div className="pl-6 space-y-2">
                      {sellerItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 text-xs border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 bg-muted"
                            />
                            <div>
                              <p className="font-bold text-foreground truncate max-w-[160px]">
                                {item.productName}
                              </p>
                              <p className="text-muted-foreground mt-0.5">
                                {item.quantity} x {formatRupiah(item.price)}
                              </p>
                              {item.selectedOptions &&
                                Object.keys(item.selectedOptions).length >
                                  0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(item.selectedOptions).map(
                                      ([k, v]) => (
                                        <span
                                          key={k}
                                          className="text-[10px] px-1.5 py-0.5 bg-primary/5 text-primary rounded-md"
                                        >
                                          {v}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              {item.catatan && (
                                <p className="text-[10px] text-muted-foreground italic mt-1">
                                  📝 {item.catatan}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-foreground shrink-0">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <h3 className="font-extrabold text-base text-foreground mb-3">
            Total Transaksi
          </h3>

          <div className="p-6 bg-card border border-border rounded-2xl shadow-soft space-y-4">
            {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
              const canteenName = sellerItems[0]?.sellerName || "Kantin";
              const sellerTotal = sellerItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              const totalQuantity = sellerItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              return (
                <div
                  key={sellerId}
                  className="pb-2 border-b border-border/40 text-xs space-y-0.5"
                >
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Kantin {canteenName}</span>
                    <span>{formatRupiah(sellerTotal)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {totalQuantity} Menu
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
              <span className="text-muted-foreground">PPN 10%</span>
              <span className="font-bold text-foreground">
                {formatRupiah(serviceFee)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-extrabold pt-2">
              <span>Total Pembayaran</span>
              <span className="text-primary text-base tracking-wide">
                {formatRupiah(total)}
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-[10px] text-muted-foreground border border-border/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Simulasi transaksi terlindungi PIN dompet internal.</span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={
                loading || !hasSufficientBalance || checkedItems.length === 0
              }
              className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer
                ${
                  hasSufficientBalance && checkedItems.length > 0
                    ? "bg-primary hover:bg-primary-hover shadow-primary/20 hover:shadow-lg"
                    : "bg-zinc-300 dark:bg-zinc-800 text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Bayar Sekarang ({formatRupiah(total)})</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
