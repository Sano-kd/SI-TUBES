'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, ShieldAlert, HelpCircle, Save, Edit3, Settings, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import Dialog from '@/components/ui/dialog';

export default function StudentProfilePage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const updateProfile = useStore((state) => state.updateProfile);
  const logout = useStore((state) => state.logout);
  const toast = useToastStore((state) => state.toast);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  if (!currentUser) return null;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) {
      toast('Nama dan kontak wajib diisi!', 'error');
      return;
    }

    updateProfile({ name, contact, avatar: avatar || undefined });
    toast('Profil berhasil diperbarui!', 'success');
    setEditDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast('Anda telah keluar dari akun.', 'info');
    router.push('/login');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">Profil Pengguna</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'}
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl bg-muted object-cover border border-border"
            />
            <button
              onClick={() => {
                setName(currentUser.name);
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
            <h4 className="font-extrabold text-base text-foreground">{currentUser.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{currentUser.email}</p>
          </div>

          <span className="text-[10px] bg-primary/10 text-primary border border-primary/10 rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider">
            Mahasiswa / Pembeli
          </span>
        </div>

        {/* Details & Settings List (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info details */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>Detail Informasi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Nama Lengkap</span>
                <p className="font-bold text-foreground">{currentUser.name}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Email Kampus</span>
                <p className="font-bold text-foreground font-mono">{currentUser.email}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Nomor Kontak (WhatsApp)</span>
                <p className="font-bold text-foreground">{currentUser.contact}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Negara / Wilayah</span>
                <p className="font-bold text-foreground">Indonesia</p>
              </div>
            </div>
          </div>

          {/* Settings list Menu */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-3">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-3 mb-2">
              Menu Pengaturan & Bantuan
            </h4>

            <button
              onClick={() => toast('Fitur Kebijakan Privasi disimulasikan', 'info')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/40 border border-transparent hover:border-border transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-3 text-foreground font-bold">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                <span>Kebijakan Privasi & Privasi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => toast('Fitur Pusat Bantuan disimulasikan', 'info')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/40 border border-transparent hover:border-border transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-3 text-foreground font-bold">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Pusat Bantuan & Syarat Layanan</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-destructive/5 hover:border-destructive/20 border border-transparent text-xs text-destructive font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <Dialog isOpen={editDialogOpen} onClose={() => setEditDialogOpen(false)} title="Edit Profil Pengguna">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nama Lengkap
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
              Nomor Kontak (WhatsApp)
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
              URL Foto Avatar (Unsplash/Dicebear)
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
