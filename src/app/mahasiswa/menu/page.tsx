'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, AlertCircle, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/product-card';

// Inner component that handles search params
function MenuContent() {
  const searchParams = useSearchParams();
  const products = useStore((state) => state.products);

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

  // Filter products based on search query and active category
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All Menu' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Category Filter Section */}
      <div className="flex flex-col gap-4">
        {/* Search Input bar */}
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari makanan favorit Anda..."
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

      {/* Grid List */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <h4 className="font-extrabold text-sm text-foreground">Menu tidak ditemukan</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Tidak ada makanan atau minuman yang cocok dengan pencarian Anda. Silahkan coba ketik kata kunci lainnya.
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

// Main page component wrapped in Suspense
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
