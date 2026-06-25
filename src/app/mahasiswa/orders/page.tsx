'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Store, Star, AlertCircle, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import OrderTimeline from '@/components/order-timeline';
import RatingModal from '@/components/rating-modal';

export default function StudentOrdersPage() {
  const currentUser = useStore((state) => state.currentUser);
  const orders = useStore((state) => state.orders);
  const users = useStore((state) => state.users);

  const [ratingOrder, setRatingOrder] = useState<{ orderId: string; canteenId: string; canteenName: string } | null>(null);

  // Filter orders made by current student
  const studentOrders = currentUser ? orders.filter(o => o.buyerId === currentUser.id) : [];

  // Automatically open rating modal for completed but unrated orders
  useEffect(() => {
    if (!currentUser) return;
    const unratedCompletedOrder = studentOrders.find(o => o.status === 'Selesai' && !o.rated);
    if (unratedCompletedOrder) {
      const seller = users.find(u => u.id === unratedCompletedOrder.sellerId);
      const canteenName = seller?.canteenName || 'Kantin';
      setRatingOrder({
        orderId: unratedCompletedOrder.id,
        canteenId: unratedCompletedOrder.sellerId || '',
        canteenName
      });
    }
  // eslint-disable-hooks/exhaustive-deps
  }, [orders, users, currentUser]);

  if (!currentUser) return null;

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
  const statusColors: { [key: string]: string } = {
    Menunggu: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/10',
    Diterima: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10',
    Diproses: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10',
    'Siap Diambil': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-orange-400 border-primary/10',
    Selesai: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10',
    Ditolak: 'bg-destructive/10 text-destructive border-destructive/20',
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
            const seller = users.find(u => u.id === order.sellerId);
            const canteenName = seller?.canteenName || 'Kantin';
            const isDitolak = order.status === 'Ditolak';
            const isSelesai = order.status === 'Selesai';
            const showRatingBtn = isSelesai && !order.rated;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border rounded-3xl p-5 sm:p-6 shadow-soft space-y-5 ${isDitolak ? 'border-destructive/20' : 'border-border'}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">
                        Kantin {canteenName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {order.id} • {formatDate(order.date)}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>

                {/* Rejected reason */}
                {isDitolak && order.rejectionReason && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-destructive/5 border border-destructive/20 rounded-xl">
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-destructive">Pesanan Ditolak</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Alasan: {order.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground">
                          {item.productName} <span className="font-bold text-foreground">x{item.quantity}</span>
                        </span>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(item.selectedOptions).map(([k, v]) => (
                              <span key={k} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md">{v}</span>
                            ))}
                          </div>
                        )}
                        {item.catatan && <p className="text-[10px] text-muted-foreground italic mt-0.5">📝 {item.catatan}</p>}
                      </div>
                      <span className="font-semibold text-foreground ml-4 shrink-0">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-3 border-t border-border/40 text-xs">
                    <span className="font-bold text-muted-foreground">Total Belanja</span>
                    <span className="font-extrabold text-sm text-primary tracking-wide">{formatRupiah(order.total)}</span>
                  </div>
                </div>

                {/* Status Stepper Timeline (only for non-rejected) */}
                {!isDitolak && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground block mb-4">
                      Tracking Status Pembuatan
                    </span>
                    <OrderTimeline status={order.status as any} />
                  </div>
                )}

                {/* Rating Button */}
                {showRatingBtn && (
                  <div className="pt-2 border-t border-border/40">
                    <button
                      onClick={() => setRatingOrder({ orderId: order.id, canteenId: order.sellerId || '', canteenName })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Beri Rating Kantin {canteenName}</span>
                    </button>
                  </div>
                )}

                {/* Already rated badge */}
                {isSelesai && order.rated && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Terima kasih sudah memberikan penilaian!</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingOrder && (
          <RatingModal
            isOpen={!!ratingOrder}
            onClose={() => setRatingOrder(null)}
            orderId={ratingOrder.orderId}
            canteenId={ratingOrder.canteenId}
            canteenName={ratingOrder.canteenName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
