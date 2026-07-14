"use client";

import { Star, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/store/useStore";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  canteenName: string;
}
export default function ProductCard({
  product,
  canteenName,
}: ProductCardProps) {
  const router = useRouter();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Badge background color map
  const categoryColors = {
    Food: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    Drink:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    Dessert:
      "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    Snack:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => router.push(`/mahasiswa/menu/${product.id}`)}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-premium hover-scale flex flex-col h-full group cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Category Badge */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${categoryColors[product.category]}`}
        >
          {product.category}
        </span>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />

          <span>{product.rating.toFixed(1)}</span>

          <span className="text-white/70 font-medium">
            ({product.totalRating ?? 0})
          </span>
        </div>

        {/* Out of Stock overlay */}
        {!product.available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold px-3 py-1 rounded-lg">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h4 className="font-bold text-sm tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          <p className="text-[11px] text-primary font-semibold mt-0.5">
            Kantin {canteenName}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 h-8 leading-normal">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
          <span className="font-extrabold text-sm tracking-wide text-foreground">
            {formatRupiah(product.price)}
          </span>

          {product.available ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/mahasiswa/menu/${product.id}`);
              }}
              className="p-2 rounded-xl transition-all flex items-center justify-center shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="p-2 rounded-xl bg-muted text-muted-foreground border border-border shrink-0 cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
