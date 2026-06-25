'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, AlertCircle, Store } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/product-card';
import { motion } from 'framer-motion';

function MenuContent() {
  const searchParams = useSearchParams();
  const products = useStore((state) => state.products);
  const users = useStore((state) => state.users);

  // List of canteens (sellers)
  const canteens = users.filter((u) => u.role === 'penjual');

  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All Menu' | 'Food' | 'Drink' | 'Dessert' | 'Snack'>('All Menu');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync search query from URL parameter if it exists
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal) {
      setSearchQuery(searchVal);
    }
  }, [searchParams]);

  // Categories list
  const categories: ('All Menu' | 'Food' | 'Drink' | 'Dessert' | 'Snack')[] = [
    'All Menu',
    'Food',
    'Drink',
    'Dessert',
    'Snack',
  ];

  // Category Icon Map (Helper)
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'All Menu': return '🍱';
      case 'Food': return '🍔';
      case 'Drink': return '🥤';
      case 'Dessert': return '🍰';
      case 'Snack': return '🍟';
      default: return '🍔';
    }
  };

  // Find selected canteen info
  const selectedCanteen = canteens.find((c) => c.id === selectedCanteenId);

  // Filter products for the chosen canteen
  const canteenProducts = selectedCanteenId
    ? products.filter((product) => product.sellerId === selectedCanteenId)
    : [];

  // Filter products based on search query and active category
  const filteredProducts = canteenProducts.filter((product) => {
    const matchesCategory = activeCategory === 'All Menu' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Flow Step 1: Daftar Kantin
  if (!selectedCanteenId) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-xl text-foreground">Daftar Kantin Kampus</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Pilih kantin mitra kami untuk mulai menjelajahi menu hidangan lezat dan melakukan pemesanan.
          </p>
        </div>

        {canteens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <h4 className="font-extrabold text-sm text-foreground">Kantin tidak ditemukan</h4>
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
                  src={canteen.avatar || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60'}
                  alt={canteen.canteenName || canteen.name}
                  className="w-16 h-16 rounded-2xl object-cover bg-muted border border-border shrink-0"
                />
                
                <div className="flex-grow min-w-0">
                  <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    Kantin {canteen.canteenName || 'Mitra'}
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

  // Flow Step 2: Halaman Toko (Lihat semua menu toko)
  return (
    <div className="space-y-6 pb-12">
      {/* Shop Header banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCanteenId(null);
              setSearchQuery('');
              setActiveCategory('All Menu');
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border shrink-0"
          >
            <span>&larr; Kantin</span>
          </button>
          
          <div>
            <h3 className="font-extrabold text-lg text-foreground">Kantin {selectedCanteen?.canteenName}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Menyediakan aneka menu berkualitas, bersih & nikmat.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="flex flex-col gap-4">
        {/* Search Input bar */}
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Cari menu di Kantin ${selectedCanteen?.canteenName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-xs"
            />
          </div>
          
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All Menu'); }}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {categories.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer
                  ${isSelected
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <span>{getCategoryEmoji(category)}</span>
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List of Products */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <h4 className="font-extrabold text-sm text-foreground">Menu tidak ditemukan</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Tidak ada makanan atau minuman yang cocok dengan filter kriteria Anda. Silakan coba cari hidangan lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentMenuPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
