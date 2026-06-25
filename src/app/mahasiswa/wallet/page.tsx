'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, History, PlusCircle, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import WalletCard from '@/components/wallet-card';
import TransactionTable from '@/components/transaction-table';
import Dialog from '@/components/ui/dialog';

export default function StudentWalletPage() {
  const currentUser = useStore((state) => state.currentUser);
  const transactions = useStore((state) => state.transactions);
  const topUp = useStore((state) => state.topUp);
  const toast = useToastStore((state) => state.toast);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  if (!currentUser) return null;

  // Filter transactions of current student
  const studentTransactions = transactions.filter(t => t.userId === currentUser.id);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topUpAmount);

    if (isNaN(amount) || amount <= 0) {
      toast('Masukkan nominal top up yang valid!', 'error');
      return;
    }

    if (amount > 1000000) {
      toast('Maksimum top up sekali transaksi adalah Rp1.000.000', 'error');
      return;
    }

    topUp(amount);
    toast(`Top Up ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)} berhasil!`, 'success');
    setTopUpAmount('');
    setDialogOpen(false);
  };

  const handleQuickSelect = (amt: number) => {
    setTopUpAmount(amt.toString());
  };

  const presets = [10000, 20000, 50000, 100000, 200000, 500000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">Dompet e-Kantin</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Wallet Credit Card style (Span 1 on lg) */}
        <div className="lg:col-span-1">
          <WalletCard onTopUpClick={() => setDialogOpen(true)} />
        </div>

        {/* Transaction History (Span 2 on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h4 className="font-extrabold text-sm text-foreground">Riwayat Transaksi</h4>
          </div>

          <TransactionTable transactions={studentTransactions} />
        </div>
      </div>

      {/* Top Up Dialog Modal */}
      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Top Up Saldo e-Kantin">
        <form onSubmit={handleTopUpSubmit} className="space-y-5">
          <div className="text-center bg-muted/40 p-4 rounded-2xl border border-border/60">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Saldo Terkini</span>
            <h5 className="text-xl font-extrabold text-foreground mt-1">
              {formatRupiah(currentUser.balance)}
            </h5>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nominal Top Up (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-muted-foreground">
                Rp
              </span>
              <input
                type="number"
                placeholder="cth. 50000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                min="1000"
                step="1000"
                required
              />
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div>
            <span className="text-xs font-bold text-muted-foreground block mb-2">Pilih Nominal Cepat</span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickSelect(preset)}
                  className="py-2 px-2 border border-border hover:border-primary/50 bg-background hover:bg-primary/5 text-[11px] font-bold rounded-xl text-center transition-all cursor-pointer text-foreground"
                >
                  {formatRupiah(preset).replace(',00', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Konfirmasi Top Up</span>
          </button>
        </form>
      </Dialog>
    </div>
  );
}
