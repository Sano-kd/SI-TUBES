"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Edit3,
  ArrowLeft,
  Store,
  Clock,
  Tag,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: number;
  rating: number;
  totalRating: number;
  image: string;
  description: string;
  available: boolean;
  sellerId: string;

  seller: {
    id: string;
    name: string;
    contact: string;
    canteenName: string | null;
  };

  orderOptions?: {
    title: string;
    options: {
      value: string;
      additionalPrice: number;
    }[];
  }[];
};

export default function DetailMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    edit?: string;
    cartItemId?: string;
  }>;
}) {
  const router = useRouter();

  const { id } = React.use(params);

  const { edit, cartItemId } = React.use(searchParams);

  const isEditMode = edit === "true";

  // ============================================================
  // ZUSTAND MASIH DIGUNAKAN UNTUK CART DAN RATING
  // ============================================================

  const currentUser = useStore((state) => state.currentUser);

  const toast = useToastStore((state) => state.toast);

  // ============================================================
  // PRODUCT DARI MYSQL
  // ============================================================

  const [product, setProduct] = useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [productError, setProductError] = useState("");

  // ============================================================
  // FORM STATE
  // ============================================================

  const [quantity, setQuantity] = useState(1);

  const [selectedOptions, setSelectedOptions] = useState<{
    [title: string]: string;
  }>({});

  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // AMBIL DETAIL PRODUCT DARI MYSQL
  // ============================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setProductError("");

        const response = await fetch(`/api/products/${id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil detail produk");
        }

        setProduct(result.data);
      } catch (error) {
        console.error("FETCH PRODUCT DETAIL ERROR:", error);

        setProductError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil detail produk",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ============================================================
  // SYNC EDIT CART
  // ============================================================

  useEffect(() => {
    if (!isEditMode || !cartItemId || !currentUser) {
      return;
    }

    const fetchCartItem = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${currentUser.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data keranjang");
        }

        const existingItem = result.data.find(
          (item: { id: string }) => item.id === cartItemId,
        );

        if (!existingItem) {
          throw new Error("Item keranjang tidak ditemukan");
        }

        setQuantity(existingItem.quantity);
        setSelectedOptions(existingItem.selectedOptions || {});
        setCatatan(existingItem.catatan || "");
      } catch (error) {
        console.error("FETCH EDIT CART ITEM ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil item keranjang",
          "error",
        );

        router.push("/mahasiswa/cart");
      }
    };

    fetchCartItem();
  }, [isEditMode, cartItemId, currentUser, router, toast]);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ============================================================
  // PRODUCT ERROR / NOT FOUND
  // ============================================================

  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border h-96">
        <h3 className="font-extrabold text-sm text-foreground">
          Menu tidak ditemukan
        </h3>

        <p className="text-xs text-muted-foreground mt-2">{productError}</p>

        <button
          onClick={() => router.push("/mahasiswa/menu")}
          className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  // ============================================================
  // DATA KANTIN
  // ============================================================

  const canteenName = product.seller.canteenName || "Kantin";

  // ============================================================
  // RATING MASIH DARI ZUSTAND
  // ============================================================

  const averageRating = product.rating;

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // ============================================================
  // SELECT OPTION
  // ============================================================

  const handleOptionSelect = (title: string, option: string) => {
    setSelectedOptions((previous) => ({
      ...previous,
      [title]: option,
    }));
  };

  // ============================================================
  // TOTAL PRICE
  // ============================================================

  // ============================================================
  // PRODUCT OPTIONS
  // ============================================================

  const allOptionSections = product.orderOptions || [];
  const additionalPricePerItem = allOptionSections.reduce(
    (total, optionSection) => {
      const selectedValue =
        selectedOptions[optionSection.title] ?? optionSection.options[0]?.value;

      const selectedOption = optionSection.options.find(
        (option) => option.value === selectedValue,
      );

      return total + (selectedOption?.additionalPrice ?? 0);
    },
    0,
  );

  const unitPrice = product.price + additionalPricePerItem;

  const totalPrice = unitPrice * quantity;

  // ============================================================
  // SUBMIT CART
  // ============================================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!product.available) {
      toast("Maaf, menu sedang habis!", "error");
      return;
    }

    const finalOptions = {
      ...selectedOptions,
    };

    allOptionSections.forEach((option) => {
      if (!finalOptions[option.title] && option.options.length > 0) {
        finalOptions[option.title] = option.options[0].value;
      }
    });

    if (isEditMode && cartItemId) {
      try {
        const response = await fetch(`/api/cart/items/${cartItemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
            selectedOptions: finalOptions,
            catatan: catatan.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal memperbarui pesanan");
        }

        toast("Pesanan berhasil diperbarui.", "success");
        router.push("/mahasiswa/cart");
      } catch (error) {
        console.error("UPDATE CART ITEM ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui pesanan",
          "error",
        );
      }

      return;
    }
    if (!currentUser) {
      toast("Silakan login terlebih dahulu.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: currentUser.id,
          productId: product.id,
          quantity,
          selectedOptions: finalOptions,
          catatan: catatan.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menambahkan produk ke keranjang",
        );
      }

      toast(result.message, "success");

      router.push("/mahasiswa/cart");
    } catch (error) {
      console.error("ADD CART ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan produk ke keranjang",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />

        <span>Kembali</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft aspect-square w-full relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            <span
              className={`absolute top-4 left-4 text-xs font-extrabold px-3 py-1 rounded-lg backdrop-blur-md shadow-xs ${
                product.available
                  ? "bg-emerald-500/90 text-white"
                  : "bg-destructive/95 text-white"
              }`}
            >
              {product.available ? "Tersedia / Ready" : "Habis"}
            </span>
          </motion.div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-primary">
              <Store className="w-4 h-4" />

              <span className="text-xs font-extrabold uppercase tracking-wider">
                Kantin {canteenName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-xl font-extrabold text-primary">
                {formatRupiah(product.price)}
              </span>

              <div className="h-4 w-px bg-border/80" />

              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />

                <span>{averageRating.toFixed(1)}</span>
              </div>

              <span className="text-muted-foreground">
                ({product.totalRating} Penilaian)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border/40 rounded-xl">
                <Clock className="w-4 h-4 text-primary shrink-0" />

                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground block leading-none">
                    Estimasi Waktu
                  </span>

                  <span className="text-xs font-bold text-foreground">
                    10-15 Menit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border/40 rounded-xl">
                <Tag className="w-4 h-4 text-primary shrink-0" />

                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground block leading-none">
                    Kategori Menu
                  </span>

                  <span className="text-xs font-bold text-foreground">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-6"
          >
            {allOptionSections.map((optionSection) => (
              <div key={optionSection.title} className="space-y-3">
                <label className="text-xs font-extrabold text-foreground block">
                  {optionSection.title}{" "}
                  <span className="text-destructive">*</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {optionSection.options.map((option) => {
                    const isSelected =
                      selectedOptions[optionSection.title] === option.value ||
                      (!selectedOptions[optionSection.title] &&
                        optionSection.options[0]?.value === option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleOptionSelect(optionSection.title, option.value)
                        }
                        className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{option.value}</span>

                        <div className="flex items-center gap-1 shrink-0">
                          {option.additionalPrice > 0 && (
                            <span className="text-[10px] font-bold">
                              +{formatRupiah(option.additionalPrice)}
                            </span>
                          )}

                          {isSelected && (
                            <Check className="w-3.5 h-3.5 shrink-0 stroke-[3px]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-foreground block">
                Catatan untuk Penjual{" "}
                <span className="text-muted-foreground font-normal">
                  (opsional)
                </span>
              </label>

              <textarea
                placeholder="Contoh: Sambal dipisah, Tidak pakai bawang, Kuah dipisah"
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                maxLength={150}
                className="w-full p-3.5 bg-background border border-border rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground h-20 resize-none"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 ${
                    quantity <= 1
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center text-sm font-extrabold text-foreground select-none">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!product.available || isSubmitting}
                className="flex-grow flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-muted-foreground disabled:cursor-not-allowed text-white rounded-xl text-xs font-extrabold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
              >
                {isEditMode ? (
                  <Edit3 className="w-4 h-4 shrink-0" />
                ) : (
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                )}

                <span>
                  {isEditMode ? "Simpan Perubahan" : "Tambah ke Keranjang"} (
                  {formatRupiah(totalPrice)})
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
