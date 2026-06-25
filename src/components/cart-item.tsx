'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CartItem as CartItemType, useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const toast = useToastStore((state) => state.toast);

  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
    toast(`${product.name} dihapus dari keranjang`, 'info');
  };

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -30 }}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-soft"
    >
      <div className="flex items-center gap-3">
        {/* Product image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 rounded-xl object-cover border border-border bg-muted shrink-0"
        />

        {/* Details */}
        <div>
          <h5 className="font-bold text-sm tracking-tight text-foreground truncate max-w-[120px] sm:max-w-xs">
            {product.name}
          </h5>
          <p className="text-xs text-muted-foreground mt-0.5">{formatRupiah(product.price)}</p>
          
          <span className="inline-block sm:hidden text-xs font-bold text-primary mt-1">
            Subtotal: {formatRupiah(subtotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quantity control */}
        <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden p-0.5">
          <button
            onClick={() => updateQuantity(product.id, 'dec')}
            disabled={quantity <= 1}
            className={`p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0
              ${quantity <= 1 ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <span className="w-8 text-center text-xs font-bold text-foreground">
            {quantity}
          </span>
          
          <button
            onClick={() => updateQuantity(product.id, 'inc')}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtotal & trash (Desktop) */}
        <div className="hidden sm:flex flex-col items-end min-w-[80px]">
          <span className="text-xs font-extrabold text-foreground">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Delete */}
        <button
          onClick={handleRemove}
          className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
