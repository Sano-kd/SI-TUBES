'use client';

import { PlusCircle, Wallet, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface WalletCardProps {
  onTopUpClick: () => void;
}

export default function WalletCard({ onTopUpClick }: WalletCardProps) {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white shadow-premium p-6 sm:p-8">
      {/* Decorative background vectors */}
      <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-12 translate-y-12" />
      <div className="absolute left-1/3 top-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none -translate-y-6" />

      {/* Card Contents */}
      <div className="relative flex flex-col justify-between h-full min-h-[160px]">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-orange-100 uppercase tracking-widest font-bold">Dompet e-Kantin</span>
              <h4 className="text-sm font-semibold leading-none mt-1">{currentUser.name}</h4>
            </div>
          </div>

          <span className="text-xs bg-white/10 border border-white/25 rounded-full px-3 py-1 font-mono uppercase text-orange-50 font-semibold tracking-wider">
            Active Wallet
          </span>
        </div>

        {/* Balance Display */}
        <div className="my-6">
          <span className="text-xs text-orange-100/80 block mb-1">Total Saldo Tersedia</span>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-wide drop-shadow-xs">
            {formatRupiah(currentUser.balance)}
          </h3>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <p className="text-[11px] text-orange-100/70 font-mono tracking-widest">
            CARD NO: E-KNTN-****-{currentUser.id.replace('usr-', '').substring(0, 4)}
          </p>

          <button
            onClick={onTopUpClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary rounded-xl text-xs font-bold shadow-md hover:bg-orange-50 transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Top Up Saldo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
