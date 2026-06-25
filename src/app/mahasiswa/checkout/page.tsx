'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const currentUser = useStore((state) => state.currentUser);
  const checkout = useStore((state) => state.checkout);
  const toast = useToastStore((state) => state.toast);
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? 2000 : 0;
  const total = subtotal + serviceFee;

  const hasSufficientBalance = currentUser.balance >= total;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) {
      toast('Keranjang belanja Anda kosong!', 'error');
      return;
    }

    if (!hasSufficientBalance) {
      toast('Saldo tidak mencukupi, silahkan top up', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = checkout();
      setLoading(false);

      if (res.success && res.orderId) {
        toast('Pembayaran berhasil!', 'success');
        router.push(`/mahasiswa/success?id=${res.orderId}&total=${total}`);
      } else {
        toast(res.message, 'error');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Cart link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Keranjang</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Checkout Forms (Item list summary & Payment options) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-foreground mb-3">Metode Pembayaran</h3>
          
          {/* Payment Option: Saldo e-Kantin */}
          <div className={`p-5 rounded-2xl border transition-all select-none
            ${hasSufficientBalance 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-destructive/30 bg-destructive/5'
            }
          `}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shrink-0
                  ${hasSufficientBalance ? 'bg-primary text-white' : 'bg-destructive text-white'}
                `}>
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Saldo Dompet e-Kantin</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Metode pembayaran internal cepat & aman</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Saldo Anda</span>
                <span className="font-bold text-sm text-foreground">{formatRupiah(currentUser.balance)}</span>
              </div>
            </div>

            {/* If balance is not enough */}
            {!hasSufficientBalance && (
              <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive mt-4 font-semibold">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <div className="leading-normal">
                  <span>Saldo tidak mencukupi untuk membayar tagihan ini. Silahkan lakukan top up terlebih dahulu.</span>
                  <button 
                    onClick={() => router.push('/mahasiswa/wallet')}
                    className="block font-bold underline text-primary mt-1 hover:text-primary-hover cursor-pointer"
                  >
                    Top Up Saldo Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Items Summary list */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-2.5 mb-2">
              Item yang Dipesan ({cart.length})
            </h4>

            <div className="divide-y divide-border/60 max-h-[250px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 bg-muted"
                    />
                    <div>
                      <p className="font-bold text-foreground truncate max-w-[150px] sm:max-w-xs">{item.product.name}</p>
                      <p className="text-muted-foreground mt-0.5">{item.quantity} x {formatRupiah(item.product.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">{formatRupiah(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-foreground mb-3">Total Transaksi</h3>

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

            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-[10px] text-muted-foreground border border-border/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Simulasi transaksi terlindungi PIN dompet internal.</span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={loading || !hasSufficientBalance}
              className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer
                ${hasSufficientBalance 
                  ? 'bg-primary hover:bg-primary-hover shadow-primary/20 hover:shadow-lg' 
                  : 'bg-zinc-300 dark:bg-zinc-800 text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Bayar Sekarang ({formatRupiah(total)})</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
