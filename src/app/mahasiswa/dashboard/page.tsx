"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Flame,
  Sparkles,
  ArrowRight,
  Compass,
  X,
  LayoutGrid,
} from "lucide-react";
import { Product, useStore } from "@/store/useStore";
import ProductCard from "@/components/product-card";

type ProductCategory = "All" | Product["category"];

const categories: ProductCategory[] = [
  "All",
  "Food",
  "Drink",
  "Snack",
  "Dessert",
];

export default function StudentDashboard() {
  const router = useRouter();

  const currentUser = useStore((state) => state.currentUser);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data menu");
        }

        setProducts(result.data);
      } catch (error) {
        console.error("GET STUDENT DASHBOARD PRODUCTS ERROR:", error);
      }
    };

    fetchProducts();
  }, []);

  if (!currentUser) return null;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const isFiltering = normalizedSearch.length > 0 || selectedCategory !== "All";

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch) ||
      (product.canteenName || "").toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const todayMenu = products.slice(0, 4);

  const popularMenu = products
    .filter((product) => product.rating >= 4.8)
    .slice(0, 4);

  const recommendedMenu = products
    .filter(
      (product) =>
        product.category === "Snack" || product.category === "Dessert",
    )
    .slice(0, 4);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-linear-to-r from-orange-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-soft"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12" />

        <div className="relative max-w-xl space-y-4">
          <div>
            <span className="bg-white/10 border border-white/20 text-orange-50 font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
              Campus e-Kantin
            </span>

            <div className="flex items-center gap-4 mt-3">
              {currentUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt="Foto Profil"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-md shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-white bg-primary/20 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Hello, {currentUser.name}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-orange-100/95 font-medium leading-relaxed mt-3">
              Mau makan siang apa hari ini? Cari makanan terlezat di kantin
              kampus sekarang. Langsung ambil tanpa antre.
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-card rounded-2xl p-1.5 shadow-md max-w-md border border-white/10"
          >
            <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />

            <input
              type="text"
              placeholder="Cari menu atau nama kantin..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground focus:outline-hidden px-3"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-lg text-foreground">
            Kategori Menu
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {category === "All" ? "Semua" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Result */}
      {isFiltering ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                Hasil Menu
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                Ditemukan {filteredProducts.length} menu
                {normalizedSearch ? ` untuk "${searchQuery.trim()}"` : ""}
                {selectedCategory !== "All"
                  ? ` pada kategori ${selectedCategory}`
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFilter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-destructive bg-destructive/5 border border-destructive/20 hover:bg-destructive hover:text-white transition-all cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-soft">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />

              <h4 className="font-bold text-foreground">
                Menu tidak ditemukan
              </h4>

              <p className="text-xs text-muted-foreground mt-1">
                Coba gunakan kata pencarian atau kategori lainnya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canteenName={product.canteenName || "Kantin"}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Today Menu */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />

                <h3 className="font-extrabold text-lg text-foreground">
                  Menu Hari Ini
                </h3>
              </div>

              <button
                onClick={() => router.push("/mahasiswa/menu")}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {todayMenu.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canteenName={product.canteenName || "Kantin"}
                />
              ))}
            </div>
          </div>

          {/* Popular Menu */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />

                <h3 className="font-extrabold text-lg text-foreground">
                  Paling Populer 🔥
                </h3>
              </div>

              <button
                onClick={() => router.push("/mahasiswa/menu")}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularMenu.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canteenName={product.canteenName || "Kantin"}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />

                <h3 className="font-extrabold text-lg text-foreground">
                  Rekomendasi Camilan & Dessert
                </h3>
              </div>

              <button
                onClick={() => router.push("/mahasiswa/menu")}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedMenu.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canteenName={product.canteenName || "Kantin"}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
