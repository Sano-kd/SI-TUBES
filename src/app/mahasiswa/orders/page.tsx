'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Clock, Store, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import OrderTimeline from '@/components/order-timeline';

export default function StudentOrdersPage() {
  const currentUser = useStore((state) => state.currentUser);
  const orders = useStore((state) => state.orders);

  if (!currentUser) return null;

  // Filter orders made by current student
  const studentOrders = orders.filter(o => o.buyerId === currentUser.id);

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">Status & Riwayat Pesanan</h3>
      </div>

      {studentOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border/80 shadow-soft">
          <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h4 className="font-extrabold text-sm text-foreground">Belum ada pesanan</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
            Anda belum melakukan pemesanan makanan. Silahkan pilih menu di halaman Menu Kantin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {studentOrders.map((order) => {
            const isActive = order.status !== 'Selesai';
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-soft space-y-5"
              >
                {/* Header (ID, Canteen, Date, status badge) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                        <span>Kantin Mencintai</span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {order.id} • {formatDate(order.date)}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Summary list */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.productName} <span className="font-bold text-foreground">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-foreground">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-3 border-t border-border/40 text-xs">
                    <span className="font-bold text-muted-foreground">Total Belanja</span>
                    <span className="font-extrabold text-sm text-primary tracking-wide">{formatRupiah(order.total)}</span>
                  </div>
                </div>

                {/* Status Stepper Timeline */}
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground block mb-4">
                    Tracking Status Pembuatan
                  </span>
                  <OrderTimeline status={order.status} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
