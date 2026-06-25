'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Flame, Sparkles, Utensils, ArrowRight, Compass } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/product-card';

export default function StudentDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const products = useStore((state) => state.products);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  // Filter products for different categories
  const todayMenu = products.slice(0, 4); // First 4 items
  const popularMenu = products.filter(p => p.rating >= 4.8).slice(0, 4); // High rating
  const recommendedMenu = products.filter(p => p.category === 'Snack' || p.category === 'Dessert').slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/mahasiswa/menu?search=${encodeURIComponent(searchQuery)}`);
    }
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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Hello, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-orange-100/90 mt-2 font-medium leading-relaxed">
              Mau makan siang apa hari ini? Cari makanan terlezat di kantin kampus sekarang, langsung ambil tanpa antre!
            </p>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-card rounded-2xl p-1.5 shadow-md max-w-md border border-white/10">
            <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Cari nasi goreng, matcha latte, croissant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground focus:outline-hidden px-3"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>
      </motion.div>

      {/* Today Menu Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg text-foreground">Menu Hari Ini</h3>
          </div>
          <button
            onClick={() => router.push('/mahasiswa/menu')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {todayMenu.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Popular Food Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg text-foreground">Paling Populer 🔥</h3>
          </div>
          <button
            onClick={() => router.push('/mahasiswa/menu')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularMenu.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg text-foreground">Rekomendasi Camilan & Dessert</h3>
          </div>
          <button
            onClick={() => router.push('/mahasiswa/menu')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendedMenu.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
