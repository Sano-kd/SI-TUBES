"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, AlertCircle, Store } from "lucide-react";
import ProductCard from "@/components/product-card";
import { motion } from "framer-motion";
import { Product } from "@/store/useStore";

type User = {
  id: string;
  name: string;
  email: string;
  role: "mahasiswa" | "penjual";
  contact: string;
  balance: number;
  avatar: string | null;
  canteenName: string | null;
};

function MenuContent() {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(
    null,
  );

  const [activeCategory, setActiveCategory] = useState<
    "All Menu" | "Food" | "Drink" | "Dessert" | "Snack"
  >("All Menu");

  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================
  // AMBIL USERS DAN PRODUCTS DARI MYSQL
  // ============================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setDataError("");

        const [usersResponse, productsResponse] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/products"),
        ]);

        if (!usersResponse.ok) {
          throw new Error("Gagal mengambil data users");
        }

        if (!productsResponse.ok) {
          throw new Error("Gagal mengambil data products");
        }

        const usersResult = await usersResponse.json();
        const productsResult = await productsResponse.json();

        if (!usersResult.success) {
          throw new Error(usersResult.message || "Gagal mengambil data users");
        }

        if (!productsResult.success) {
          throw new Error(
            productsResult.message || "Gagal mengambil data products",
          );
        }

        setUsers(usersResult.data);
        setProducts(productsResult.data);
      } catch (error) {
        console.error("FETCH MENU DATA ERROR:", error);

        setDataError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // SEARCH PARAMETER
  // ============================================================

  useEffect(() => {
    const searchVal = searchParams.get("search");

    if (searchVal) {
      setSearchQuery(searchVal);
    }
  }, [searchParams]);

  const categories: ("All Menu" | "Food" | "Drink" | "Dessert" | "Snack")[] = [
    "All Menu",
    "Food",
    "Drink",
    "Dessert",
    "Snack",
  ];

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "All Menu":
        return "🍱";
      case "Food":
        return "🍔";
      case "Drink":
        return "🥤";
      case "Dessert":
        return "🍰";
      case "Snack":
        return "🍟";
      default:
        return "🍔";
    }
  };

  // ============================================================
  // DATA KANTIN
  // ============================================================

  const canteens = users.filter((user) => user.role === "penjual");

  const selectedCanteen = canteens.find(
    (canteen) => canteen.id === selectedCanteenId,
  );

  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const canteenProducts = selectedCanteenId
    ? products.filter((product) => product.sellerId === selectedCanteenId)
    : [];

  const filteredProducts = canteenProducts.filter((product) => {
    const matchesCategory =
      activeCategory === "All Menu" || product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
  // ERROR
  // ============================================================

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
        <AlertCircle className="w-12 h-12 text-destructive mb-3" />

        <h4 className="font-extrabold text-sm text-foreground">
          Gagal mengambil data
        </h4>

        <p className="text-xs text-muted-foreground mt-1">{dataError}</p>
      </div>
    );
  }

  // ============================================================
  // FLOW 1: DAFTAR KANTIN
  // ============================================================

  if (!selectedCanteenId) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />

            <h3 className="font-extrabold text-xl text-foreground">
              Daftar Kantin Kampus
            </h3>
          </div>

          <p className="text-xs text-muted-foreground">
            Pilih kantin mitra kami untuk mulai menjelajahi menu hidangan lezat
            dan melakukan pemesanan.
          </p>
        </div>

        {canteens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />

            <h4 className="font-extrabold text-sm text-foreground">
              Kantin tidak ditemukan
            </h4>

            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
              Saat ini belum ada kantin yang terdaftar dalam sistem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {canteens.map((canteen) => (
              <motion.div
                key={canteen.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedCanteenId(canteen.id)}
                className="bg-card border border-border rounded-3xl p-5 shadow-soft hover:shadow-premium transition-all flex gap-4 items-center cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    canteen.avatar ||
                    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60"
                  }
                  alt={canteen.canteenName || canteen.name}
                  className="w-16 h-16 rounded-2xl object-cover bg-muted border border-border shrink-0"
                />

                <div className="flex-grow min-w-0">
                  <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    Kantin {canteen.canteenName || "Mitra"}
                  </h4>

                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    Pemilik: {canteen.name}
                  </p>

                  <p className="text-[10px] text-muted-foreground mt-1.5 font-mono truncate">
                    Hubungi: {canteen.contact}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Buka
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // FLOW 2: MENU KANTIN
  // ============================================================

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCanteenId(null);
              setSearchQuery("");
              setActiveCategory("All Menu");
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border shrink-0"
          >
            <span>&larr; Kantin</span>
          </button>

          <div>
            <h3 className="font-extrabold text-lg text-foreground">
              Kantin {selectedCanteen?.canteenName}
            </h3>

            <p className="text-[10px] text-muted-foreground mt-0.5">
              Menyediakan aneka menu berkualitas, bersih & nikmat.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />

            <input
              type="text"
              placeholder={`Cari menu di Kantin ${selectedCanteen?.canteenName}...`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-xs"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All Menu");
            }}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {categories.map((category) => {
            const isSelected = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{getCategoryEmoji(category)}</span>
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />

          <h4 className="font-extrabold text-sm text-foreground">
            Menu tidak ditemukan
          </h4>

          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Tidak ada makanan atau minuman yang cocok dengan filter kriteria
            Anda. Silakan coba cari hidangan lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canteenName={selectedCanteen?.canteenName || "Kantin"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
