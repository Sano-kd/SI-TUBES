"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Store,
  CheckSquare,
  Square,
} from "lucide-react";
import { CartItem as CartItemType, useStore } from "@/store/useStore";
import CartItem from "@/components/cart-item";

export default function CartPage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);

  const [databaseCart, setDatabaseCart] = useState<CartItemType[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchCart = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${currentUser.id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data cart");
        }

        setDatabaseCart(result.data);
      } catch (error) {
        console.error("GET CART ERROR:", error);
      }
    };

    fetchCart();
  }, [currentUser]);

  const checkedItems = databaseCart.filter((item) => item.checked);

  const allChecked =
    databaseCart.length > 0 && databaseCart.every((item) => item.checked);

  const subtotal = checkedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const ppn = subtotal > 0 ? subtotal * 0.1 : 0;

  const total = subtotal + ppn;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Group cart items by canteen
  const itemsBySeller: { [sellerId: string]: typeof databaseCart } = {};

  databaseCart.forEach((item) => {
    const sId = item.product.sellerId || "unknown";

    if (!itemsBySeller[sId]) {
      itemsBySeller[sId] = [];
    }

    itemsBySeller[sId].push(item);
  });

  const handleCheckout = () => {
    if (checkedItems.length === 0) return;
    router.push("/mahasiswa/checkout");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {databaseCart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border shadow-soft"
        >
          <div className="h-16 w-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-sm text-foreground">
            Keranjang belanja kosong
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Anda belum menambahkan makanan atau minuman. Silahkan pilih menu
            lezat di daftar kantin.
          </p>
          <button
            onClick={() => router.push("/mahasiswa/menu")}
            className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
          >
            Pilih Menu Makanan
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-foreground">
                Daftar Hidangan ({databaseCart.length} item)
              </h3>
              <button
                onClick={async () => {
                  const newChecked = !allChecked;

                  try {
                    const responses = await Promise.all(
                      databaseCart.map((cartItem) =>
                        fetch(`/api/cart/items/${cartItem.id}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            checked: newChecked,
                          }),
                        }),
                      ),
                    );

                    const results = await Promise.all(
                      responses.map((response) => response.json()),
                    );

                    const hasError = responses.some(
                      (response, index) =>
                        !response.ok || !results[index].success,
                    );

                    if (hasError) {
                      throw new Error(
                        "Gagal memperbarui sebagian status pilihan",
                      );
                    }

                    setDatabaseCart((previousCart) =>
                      previousCart.map((cartItem) => ({
                        ...cartItem,
                        checked: newChecked,
                      })),
                    );
                  } catch (error) {
                    console.error("UPDATE ALL CHECKED ERROR:", error);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {allChecked ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{allChecked ? "Batal Pilih Semua" : "Pilih Semua"}</span>
              </button>
            </div>

            {/* Items grouped by canteen */}
            {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => {
              const canteenName =
                sellerItems[0]?.product.canteenName || "Kantin";
              return (
                <div key={sellerId} className="space-y-2">
                  {/* Canteen header */}
                  <div className="flex items-center gap-2 px-1">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="text-xs font-extrabold text-foreground">
                      Kantin {canteenName}
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {sellerItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        canteenName={
                          item.product.canteenName
                            ? `Kantin ${item.product.canteenName}`
                            : "Kantin"
                        }
                        onQuantityUpdated={async () => {
                          if (!currentUser) return;

                          const response = await fetch(
                            `/api/cart?userId=${currentUser.id}`,
                            {
                              cache: "no-store",
                            },
                          );

                          const result = await response.json();

                          if (response.ok && result.success) {
                            setDatabaseCart(result.data);
                          }
                        }}
                        onItemDeleted={(itemId) => {
                          setDatabaseCart((previousCart) =>
                            previousCart.filter(
                              (cartItem) => cartItem.id !== itemId,
                            ),
                          );
                        }}
                        onCheckedChanged={async (itemId) => {
                          const item = databaseCart.find(
                            (cartItem) => cartItem.id === itemId,
                          );

                          if (!item) return;

                          const newChecked = !item.checked;

                          try {
                            const response = await fetch(
                              `/api/cart/items/${itemId}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  checked: newChecked,
                                }),
                              },
                            );

                            const result = await response.json();

                            if (!response.ok || !result.success) {
                              throw new Error(
                                result.message ||
                                  "Gagal memperbarui status pilihan",
                              );
                            }

                            setDatabaseCart((previousCart) =>
                              previousCart.map((cartItem) =>
                                cartItem.id === itemId
                                  ? {
                                      ...cartItem,
                                      checked: newChecked,
                                    }
                                  : cartItem,
                              ),
                            );
                          } catch (error) {
                            console.error("UPDATE CHECKED ERROR:", error);
                          }
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-4">
            <h3 className="font-extrabold text-base text-foreground">
              Ringkasan Tagihan
            </h3>

            <div className="p-6 bg-card border border-border rounded-2xl shadow-soft space-y-4">
              {/* Checked items summary */}
              <div className="text-xs text-muted-foreground pb-3 border-b border-border/60">
                <span>
                  {checkedItems.length} dari {databaseCart.length} item dipilih
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                <span className="text-muted-foreground">Subtotal Makanan</span>
                <span className="font-bold text-foreground">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                <span className="text-muted-foreground">PPN 10%</span>

                <span className="font-bold text-foreground">
                  {formatRupiah(ppn)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold pt-2">
                <span>Total Pembayaran</span>
                <span className="text-primary text-base tracking-wide">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Secure simulation badge */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-[11px] text-muted-foreground border border-border/30">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Simulasi transaksi aman dengan Saldo e-Kantin internal.
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>

              {checkedItems.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Pilih minimal 1 item untuk checkout
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
