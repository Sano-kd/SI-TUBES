'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, Phone, Mail, LogOut, Save, Edit3, Settings, DollarSign, Receipt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import Dialog from '@/components/ui/dialog';

export default function SellerProfilePage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const updateProfile = useStore((state) => state.updateProfile);
  const logout = useStore((state) => state.logout);
  const orders = useStore((state) => state.orders);
  const toast = useToastStore((state) => state.toast);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [canteenName, setCanteenName] = useState(currentUser?.canteenName || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  if (!currentUser) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Nama wajib diisi.', 'error');
      return;
    }
    if (!canteenName.trim()) {
      toast('Nama Kantin wajib diisi.', 'error');
      return;
    }
    if (!contact.trim()) {
      toast('Nomor kontak wajib diisi.', 'error');
      return;
    }

    updateProfile({ name, canteenName, contact, avatar: avatar || undefined });
    toast('Profil berhasil diperbarui.', 'success');
    setEditDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast('Anda telah keluar dari akun.', 'info');
    router.push('/login');
  };

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
        <Store className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">Profil Kantin</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Canteen Summary Card (Span 1) */}
        <div className="md:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60'}
              alt={currentUser.canteenName}
              className="w-24 h-24 rounded-2xl bg-muted object-cover border border-border"
            />
            <button
              onClick={() => {
                setName(currentUser.name);
                setCanteenName(currentUser.canteenName || '');
                setContact(currentUser.contact);
                setAvatar(currentUser.avatar || '');
                setEditDialogOpen(true);
              }}
              className="absolute bottom-[-5px] right-[-5px] p-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md border border-card transition-all cursor-pointer"
              title="Edit Profil"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h4 className="font-extrabold text-base text-foreground">Kantin {currentUser.canteenName || 'Mencintai'}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold text-primary">{currentUser.name} (Pemilik)</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">{currentUser.email}</p>
          </div>

          <span className="text-[10px] bg-primary/10 text-primary border border-primary/10 rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider">
            Mitra Penjual Kantin
          </span>
        </div>

        {/* Stats & Detailed Info (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Canteen performance summary metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-soft flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-2xl shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Pendapatan</span>
                <h4 className="text-sm sm:text-base font-extrabold text-foreground tracking-wide mt-0.5">
                  {formatRupiah(totalRevenue)}
                </h4>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 shadow-soft flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary dark:bg-primary/20 rounded-2xl shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Penjualan</span>
                <h4 className="text-sm sm:text-base font-extrabold text-foreground tracking-wide mt-0.5">
                  {totalOrders} Orders
                </h4>
              </div>
            </div>
          </div>

          {/* Detailed Info Forms */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>Detail Informasi Toko</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Nama Kantin</span>
                <p className="font-bold text-foreground">Kantin {currentUser.canteenName || 'Mencintai'}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Nama Pemilik</span>
                <p className="font-bold text-foreground">{currentUser.name}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Email Toko</span>
                <p className="font-bold text-foreground font-mono">{currentUser.email}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Kontak Toko (WhatsApp)</span>
                <p className="font-bold text-foreground">{currentUser.contact}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2.5 px-5 bg-destructive/10 hover:bg-destructive hover:text-white border border-destructive/20 hover:border-destructive text-destructive rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun Mitra</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <Dialog isOpen={editDialogOpen} onClose={() => setEditDialogOpen(false)} title="Edit Profil Kantin & Toko">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nama Kantin / Toko
            </label>
            <input
              type="text"
              value={canteenName}
              onChange={(e) => setCanteenName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nama Pemilik Kantin
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nomor Kontak Toko (WhatsApp)
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              URL Foto Avatar Toko
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </form>
      </Dialog>
    </div>
  );
}
