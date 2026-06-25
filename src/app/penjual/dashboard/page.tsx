'use client';

import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Receipt, 
  Star, 
  TrendingUp, 
  UtensilsCrossed, 
  User, 
  Store,
  ChevronRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import AnalyticsCard from '@/components/analytics-card';

export default function SellerDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);

  if (!currentUser) return null;

  const canteenName = currentUser.canteenName || 'Mencintai';

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageRating = 4.8; // mock rating or average of active items
  const activeMenusCount = products.filter(p => p.available).length;

  const recentOrders = orders.slice(0, 3); // top 3

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  const statusColors = {
    Diterima: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10',
    Diproses: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10',
    'Siap Diambil': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-orange-400 border-primary/10',
    Selesai: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Canteen Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-soft flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider">Dashboard Mitra Kantin</span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Kantin {canteenName}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Pantau laporan penjualan dan kelola pesanan mahasiswa secara real-time.
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/penjual/orders')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <span>Proses Pesanan Masuk</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Pendapatan Total"
          value={formatRupiah(totalRevenue)}
          icon={DollarSign}
          change={{ value: '+18.4%', isPositive: true }}
          description="vs. minggu lalu"
          color="emerald"
        />
        <AnalyticsCard
          title="Total Orderan"
          value={totalOrders}
          icon={Receipt}
          change={{ value: '+12.5%', isPositive: true }}
          description="Pesanan masuk"
          color="primary"
        />
        <AnalyticsCard
          title="Rating Kantin"
          value={`${averageRating} / 5.0`}
          icon={Star}
          change={{ value: '+0.2', isPositive: true }}
          description="Dari ulasan mahasiswa"
          color="amber"
        />
        <AnalyticsCard
          title="Menu Tersedia"
          value={activeMenusCount}
          icon={UtensilsCrossed}
          description="Aktif di katalog"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Statistics Chart Visualizer */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground">Grafik Volume Transaksi Harian</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-lg">
              Live updates
            </span>
          </div>
          
          {/* Simulated Bars */}
          <div className="h-48 flex items-end justify-between gap-2.5 pt-6 select-none">
            {[35, 45, 60, 40, 75, 90, 80].map((val, idx) => {
              const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-muted rounded-lg h-36 relative overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ type: 'spring', delay: idx * 0.05 }}
                      className="absolute bottom-0 left-0 right-0 bg-primary group-hover:bg-primary-hover transition-colors rounded-b-lg rounded-t-xs"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Orders checklist (Span 1 on lg) */}
        <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3 mb-3">
              Pesanan Terbaru
            </h3>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-start justify-between text-xs gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{order.buyerName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{formatDate(order.date)}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">{formatRupiah(order.total)}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md border mt-1 ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/penjual/orders')}
            className="w-full text-center py-2.5 bg-muted hover:bg-muted/80 border border-border text-xs font-bold rounded-xl text-foreground mt-4 cursor-pointer"
          >
            Lihat Semua Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
