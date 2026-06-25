'use client';

import { useState, useEffect } from 'react';
import { Star, Plus, Minus, Check, ShoppingBag, Edit3, X, Store } from 'lucide-react';
import { Product, useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import { motion } from 'framer-motion';

interface DetailMenuModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  initialQuantity?: number;
  initialSelectedOptions?: { [title: string]: string };
  initialCatatan?: string;
  onSave?: (
    quantity: number,
    options: {
      selectedOptions?: { [title: string]: string };
      catatan?: string;
    }
  ) => void;
}

export default function DetailMenuModal({
  product,
  isOpen,
  onClose,
  isEditMode = false,
  initialQuantity = 1,
  initialSelectedOptions = {},
  initialCatatan = '',
  onSave
}: DetailMenuModalProps) {
  const users = useStore((state) => state.users);
  const addToCartWithOptions = useStore((state) => state.addToCartWithOptions);
  const toast = useToastStore((state) => state.toast);

  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedOptions, setSelectedOptions] = useState<{ [title: string]: string }>(initialSelectedOptions);
  const [catatan, setCatatan] = useState(initialCatatan);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setSelectedOptions(initialSelectedOptions);
      setCatatan(initialCatatan);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // Find canteen
  const canteen = users.find((u) => u.id === product.sellerId);
  const canteenName = canteen?.canteenName || 'Kantin';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleOptionSelect = (title: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [title]: option }));
  };

  const totalPrice = product.price * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.available) {
      toast('Maaf, menu sedang habis!', 'error');
      return;
    }

    // Validate all required options are selected
    const missingOption = (product.orderOptions || []).find(opt => !selectedOptions[opt.title]);
    if (missingOption) {
      // Auto-select first option if not selected
      const autoSelected = { ...selectedOptions };
      (product.orderOptions || []).forEach(opt => {
        if (!autoSelected[opt.title] && opt.options.length > 0) {
          autoSelected[opt.title] = opt.options[0];
        }
      });
      setSelectedOptions(autoSelected);
    }

    const finalOptions = { ...selectedOptions };
    (product.orderOptions || []).forEach(opt => {
      if (!finalOptions[opt.title] && opt.options.length > 0) {
        finalOptions[opt.title] = opt.options[0];
      }
    });

    const options = {
      selectedOptions: Object.keys(finalOptions).length > 0 ? finalOptions : undefined,
      catatan: catatan || undefined
    };

    if (isEditMode && onSave) {
      onSave(quantity, options);
    } else {
      addToCartWithOptions(product, quantity, options);
      toast(`${product.name} ditambahkan ke keranjang!`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[92vh]"
      >
        {/* Header Image */}
        <div className="relative h-52 w-full bg-muted shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-950/60 hover:bg-zinc-950/80 text-white rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Store className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider">
                Kantin {canteenName}
              </span>
            </div>
            <h4 className="font-extrabold text-lg text-white leading-tight">{product.name}</h4>
          </div>
        </div>

        {/* Customization Body Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description & Base Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-primary">{formatRupiah(product.price)}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.available ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                  {product.available ? 'Tersedia' : 'Habis'}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Dynamic Order Options */}
          {(product.orderOptions || []).map((optSection) => (
            <div key={optSection.title} className="space-y-2.5">
              <label className="text-xs font-bold text-foreground block">
                {optSection.title} <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {optSection.options.map((opt) => {
                  const isSel = selectedOptions[optSection.title] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionSelect(optSection.title, opt)}
                      className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer flex items-center justify-between gap-1
                        ${isSel
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <span>{opt}</span>
                      {isSel && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes Option */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-foreground block">
              Catatan untuk Penjual <span className="text-muted-foreground font-normal">(opsional)</span>
            </label>
            <textarea
              placeholder="Contoh: Tidak pedas, tanpa bawang, sambalnya dipisah..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={150}
              className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground h-16 resize-none"
            />
          </div>
        </form>

        {/* Footer Pricing & Checkout */}
        <div className="p-5 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between gap-4">
          {/* Purchase quantity */}
          <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden p-0.5">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0
                ${quantity <= 1 ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 animate-none"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!product.available}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
          >
            {isEditMode ? <Edit3 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            <span>
              {isEditMode ? 'Simpan Perubahan' : 'Tambah ke Keranjang'} ({formatRupiah(totalPrice)})
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
