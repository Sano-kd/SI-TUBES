"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  LogOut,
  ShieldAlert,
  HelpCircle,
  Save,
  Edit3,
  Settings,
  ChevronRight,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import Dialog from "@/components/ui/dialog";

export default function StudentProfilePage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const logout = useStore((state) => state.logout);
  const toast = useToastStore((state) => state.toast);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [contact, setContact] = useState(currentUser?.contact || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

  if (!currentUser) return null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast("User tidak ditemukan", "error");
      return;
    }

    if (!name.trim()) {
      toast("Nama wajib diisi", "error");
      return;
    }

    if (!contact.trim()) {
      toast("Nomor kontak wajib diisi", "error");
      return;
    }

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          avatar: avatar.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      setCurrentUser(result.data);

      toast(result.message, "success");

      setEditDialogOpen(false);
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui profil",
        "error",
      );
    }
  };

  const handleLogout = () => {
    logout();
    toast("Anda telah keluar dari akun.", "info");
    router.push("/login");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="font-extrabold text-lg text-foreground">
          Profil Pengguna
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                currentUser.avatar ||
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60"
              }
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl bg-muted object-cover border border-border"
            />
            <button
              onClick={() => {
                setName(currentUser.name);
                setContact(currentUser.contact);
                setAvatar(currentUser.avatar || "");
                setEditDialogOpen(true);
              }}
              className="absolute bottom-[-5px] right-[-5px] p-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md border border-card transition-all cursor-pointer"
              title="Edit Profil"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h4 className="font-extrabold text-base text-foreground">
              {currentUser.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {currentUser.email}
            </p>
          </div>

          <span className="text-[10px] bg-primary/10 text-primary border border-primary/10 rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider">
            Mahasiswa / Pembeli
          </span>
        </div>

        {/* Details & Settings List */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>Detail Informasi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Nama Lengkap
                </span>
                <p className="font-bold text-foreground">{currentUser.name}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Email Kampus
                </span>
                <p className="font-bold text-foreground font-mono">
                  {currentUser.email}
                </p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Nomor Kontak (WhatsApp)
                </span>
                <p className="font-bold text-foreground">
                  {currentUser.contact}
                </p>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Negara / Wilayah
                </span>
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
              onClick={() => setPrivacyDialogOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/40 border border-transparent hover:border-border transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-3 text-foreground font-bold">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                <span>Kebijakan Privasi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => setHelpDialogOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/40 border border-transparent hover:border-border transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-3 text-foreground font-bold">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Pusat Bantuan</span>
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

      {/* Edit Profile Dialog */}
      <Dialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit Profil Pengguna"
      >
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
              URL Foto Avatar (Opsional)
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
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

      {/* Help Center Dialog */}
      <Dialog
        isOpen={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        title="Pusat Bantuan"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-3">
            {[
              {
                q: "Bagaimana cara memesan makanan?",
                a: "Buka halaman Menu Kantin, pilih kantin yang diinginkan, klik produk untuk melihat detail dan pilihan pesanan, lalu tambahkan ke keranjang. Setelah selesai, checkout dan bayar menggunakan saldo e-Kantin.",
              },
              {
                q: "Bagaimana cara top up saldo?",
                a: "Buka halaman Dompet Saya, masukkan jumlah yang ingin ditambahkan, dan konfirmasi transaksi. Saldo akan langsung bertambah.",
              },
              {
                q: "Apa yang terjadi jika pesanan saya ditolak?",
                a: "Saldo Anda akan otomatis dikembalikan (refund) jika pesanan ditolak oleh kantin. Anda akan mendapat notifikasi beserta alasan penolakan.",
              },
              {
                q: "Bagaimana cara memberi rating kantin?",
                a: 'Setelah pesanan selesai, tombol "Beri Rating" akan muncul di halaman Status Pesanan. Klik tombol tersebut dan berikan penilaian bintang 1-5.',
              },
              {
                q: "Apakah saya bisa membatalkan pesanan?",
                a: "Pesanan yang sudah masuk tidak dapat dibatalkan secara langsung. Hubungi kantin melalui kontak yang tersedia jika ada masalah.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-3.5 bg-muted/40 rounded-2xl border border-border/40 space-y-1.5"
              >
                <p className="font-bold text-foreground flex items-start gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </p>
                <p className="text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground pt-2">
            Masih ada pertanyaan? Hubungi admin melalui email:{" "}
            <span className="text-primary font-bold">support@ekantin.id</span>
          </p>
        </div>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog
        isOpen={privacyDialogOpen}
        onClose={() => setPrivacyDialogOpen(false)}
        title="Kebijakan Privasi"
      >
        <div className="space-y-4 text-xs text-muted-foreground max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h5 className="font-bold text-foreground mb-1">
                1. Pengumpulan Data
              </h5>
              <p className="leading-relaxed">
                e-Kantin Digital mengumpulkan data pribadi yang Anda berikan
                saat mendaftar, termasuk nama, email, dan nomor kontak. Data ini
                digunakan semata-mata untuk keperluan layanan pemesanan makanan
                di lingkungan kampus.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-1">
                2. Penggunaan Data
              </h5>
              <p className="leading-relaxed">
                Data Anda digunakan untuk: memproses pesanan, mengelola saldo
                dompet digital, mengirimkan notifikasi status pesanan, dan
                meningkatkan kualitas layanan.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-1">
                3. Keamanan Data
              </h5>
              <p className="leading-relaxed">
                Kami berkomitmen menjaga keamanan data Anda. Seluruh transaksi
                dienkripsi dan tidak dibagikan kepada pihak ketiga tanpa
                persetujuan Anda.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-1">
                4. Penyimpanan Data
              </h5>
              <p className="leading-relaxed">
                Data disimpan secara lokal dalam browser Anda (localStorage)
                sebagai simulasi. Pada implementasi nyata, data akan disimpan di
                server yang aman dengan enkripsi standar industri.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-1">
                5. Hak Pengguna
              </h5>
              <p className="leading-relaxed">
                Anda berhak mengakses, memperbarui, atau menghapus data pribadi
                Anda kapan saja melalui halaman Profil atau dengan menghubungi
                tim dukungan kami.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-1">
                6. Perubahan Kebijakan
              </h5>
              <p className="leading-relaxed">
                Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan
                signifikan akan diberitahukan melalui notifikasi aplikasi.
              </p>
            </div>
          </div>
          <p className="text-center pt-2 border-t border-border">
            Terakhir diperbarui: Juni 2026 • e-Kantin Digital v1.0
          </p>
        </div>
      </Dialog>
    </div>
  );
}
