'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Receipt, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import CartItem from '@/components/cart-item';

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? 2000 : 0; // Rp2.000 campus service fee
  const total = subtotal + serviceFee;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleCheckout = () => {
    router.push('/mahasiswa/checkout');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border shadow-soft"
        >
          <div className="h-16 w-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-sm text-foreground">Keranjang belanja kosong</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Anda belum menambahkan makanan atau minuman. Silahkan pilih menu lezat di daftar kantin.
          </p>
          <button
            onClick={() => router.push('/mahasiswa/menu')}
            className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
          >
            Pilih Menu Makanan
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-extrabold text-base text-foreground mb-4">Daftar Hidangan</h3>
            
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pricing Breakdown Sidebar */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-foreground mb-4">Ringkasan Tagihan</h3>
            
            <div className="p-6 bg-card border border-border rounded-2xl shadow-soft space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                <span className="text-muted-foreground">Subtotal Makanan</span>
                <span className="font-bold text-foreground">{formatRupiah(subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                <span className="text-muted-foreground">Biaya Layanan Kantin</span>
                <span className="font-bold text-foreground">{formatRupiah(serviceFee)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold pt-2">
                <span>Total Pembayaran</span>
                <span className="text-primary text-base tracking-wide">{formatRupiah(total)}</span>
              </div>

              {/* Secure simulation badge */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-[11px] text-muted-foreground border border-border/30">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Simulasi transaksi aman dengan Saldo e-Kantin internal.</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
