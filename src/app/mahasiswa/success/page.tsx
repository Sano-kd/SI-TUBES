'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Receipt, ArrowRight } from 'lucide-react';
import React, { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('id') || 'TX-10005';
  const totalPaid = Number(searchParams.get('total')) || 27000;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-premium p-6 sm:p-8 text-center space-y-6"
      >
        {/* Animated Green Checkmark Ring */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
        </div>

        {/* Text Header */}
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Pembayaran Berhasil!</h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
            Pesanan Anda telah diteruskan ke Kantin Mencintai. Silahkan pantau status pembuatan makanan Anda.
          </p>
        </div>

        {/* Receipt Block details */}
        <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 text-xs space-y-3 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-border/60">
            <span className="text-muted-foreground">Nomor Transaksi</span>
            <span className="font-mono font-bold text-foreground">{transactionId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border/60">
            <span className="text-muted-foreground">Metode Pembayaran</span>
            <span className="font-bold text-foreground">Saldo e-Kantin</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border/60">
            <span className="text-muted-foreground">Waktu Transaksi</span>
            <span className="font-medium text-foreground">{formatDate()}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground font-bold">Total Pembayaran</span>
            <span className="text-primary font-extrabold text-sm tracking-wide">{formatRupiah(totalPaid)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => router.push('/mahasiswa/menu')}
            className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl border border-border/80 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesan Lagi</span>
          </button>

          <button
            onClick={() => router.push('/mahasiswa/orders')}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Lihat Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
