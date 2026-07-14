"use client";

import { Plus, Minus, Trash2, Edit3, Check } from "lucide-react";
import { motion } from "framer-motion";
import { CartItem as CartItemType } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "next/navigation";

interface CartItemProps {
  item: CartItemType;
  canteenName: string;
  onQuantityUpdated: (itemId: string, newQuantity: number) => void;
  onItemDeleted: (itemId: string) => void;
  onCheckedChanged: (itemId: string) => void;
}

export default function CartItem({
  item,
  canteenName,
  onQuantityUpdated,
  onItemDeleted,
  onCheckedChanged,
}: CartItemProps) {
  const router = useRouter();

  const toast = useToastStore((state) => state.toast);

  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  // Find canteen name
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/cart/items/${item.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui quantity");
      }

      toast(result.message, "success");

      onQuantityUpdated(item.id, newQuantity);
    } catch (error) {
      console.error("UPDATE QUANTITY ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui quantity",
        "error",
      );
    }
  };
  const handleRemove = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cart/items/${item.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus item");
      }

      toast(result.message, "success");
      onItemDeleted(item.id);
    } catch (error) {
      console.error("DELETE CART ITEM ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus item",
        "error",
      );
    }
  };

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -30 }}
      className={`p-4 bg-card border rounded-2xl shadow-soft transition-colors ${
        item.checked ? "border-primary/30" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onCheckedChanged(item.id)}
          className={`mt-1 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
            ${
              item.checked
                ? "bg-primary border-primary text-white"
                : "border-border bg-background hover:border-primary/50"
            }`}
        >
          {item.checked && <Check className="w-3 h-3 stroke-[3px]" />}
        </button>

        {/* Product image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 rounded-xl object-cover border border-border bg-muted shrink-0"
        />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h5 className="font-bold text-sm tracking-tight text-foreground truncate">
                {product.name}
              </h5>
              <p className="text-[11px] text-primary font-semibold mt-0.5">
                {canteenName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRupiah(product.price)} / item
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  router.push(
                    `/mahasiswa/menu/${product.id}?edit=true&cartItemId=${item.id}`,
                  )
                }
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                title="Edit pesanan"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRemove}
                className="p-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive hover:text-white text-destructive transition-all cursor-pointer"
                title="Hapus dari keranjang"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Selected Options */}
          {item.selectedOptions &&
            Object.keys(item.selectedOptions).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(item.selectedOptions).map(([key, val]) => (
                  <span
                    key={key}
                    className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-md font-semibold"
                  >
                    {val}
                  </span>
                ))}
              </div>
            )}

          {/* Catatan */}
          {item.catatan && (
            <p className="text-[10px] text-muted-foreground mt-1.5 bg-muted/40 px-2 py-1 rounded-lg italic">
              📝 {item.catatan}
            </p>
          )}

          {/* Quantity & subtotal */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden p-0.5">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className={`p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0
                  ${quantity <= 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-sm font-extrabold text-foreground">
              {formatRupiah(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
