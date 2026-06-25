'use client';

import { motion } from 'framer-motion';
import { 
  Receipt, 
  User, 
  ArrowRight, 
  Check, 
  ChefHat, 
  BellRing, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

export default function SellerOrdersPage() {
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const toast = useToastStore((state) => state.toast);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badges colors mapping
  const statusColors = {
    Diterima: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10',
    Diproses: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10',
    'Siap Diambil': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-orange-400 border-primary/10',
    Selesai: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10',
  };

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    let nextStatus: 'Diterima' | 'Diproses' | 'Siap Diambil' | 'Selesai';
    let message = '';

    if (currentStatus === 'Diterima') {
      nextStatus = 'Diproses';
      message = 'Pesanan mulai diproses/dimasak';
    } else if (currentStatus === 'Diproses') {
      nextStatus = 'Siap Diambil';
      message = 'Pesanan siap diambil oleh mahasiswa!';
    } else if (currentStatus === 'Siap Diambil') {
      nextStatus = 'Selesai';
      message = 'Pesanan selesai diserahkan';
    } else {
      return;
    }

    updateOrderStatus(orderId, nextStatus);
    toast(`${orderId}: ${message}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">Daftar Pesanan Masuk</h3>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <h4 className="font-extrabold text-sm text-foreground">Tidak ada pesanan</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Belum ada pesanan masuk dari mahasiswa untuk hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-soft space-y-4"
            >
              {/* Order Meta details */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">{order.buyerName}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      ID: {order.id} • {formatDate(order.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Metode: {order.paymentMethod}
                  </span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List detail */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-xs gap-3">
                      <span className="text-muted-foreground truncate">
                        {item.productName} <span className="font-extrabold text-foreground">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-foreground shrink-0">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-extrabold border-t border-border/40 pt-2 text-primary">
                    <span>Total Pendapatan</span>
                    <span>{formatRupiah(order.total)}</span>
                  </div>
                </div>

                {/* Status Interactive action buttons */}
                <div className="md:col-span-1 flex justify-end">
                  {order.status === 'Diterima' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <ChefHat className="w-4 h-4 shrink-0" />
                      <span>Terima & Masak</span>
                    </button>
                  )}

                  {order.status === 'Diproses' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <BellRing className="w-4 h-4 shrink-0 animate-bounce" />
                      <span>Siap Diambil</span>
                    </button>
                  )}

                  {order.status === 'Siap Diambil' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4 shrink-0 stroke-[3px]" />
                      <span>Serahkan Makanan</span>
                    </button>
                  )}

                  {order.status === 'Selesai' && (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs p-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Selesai Diserahkan</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
