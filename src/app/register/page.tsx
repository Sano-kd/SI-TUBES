'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, User, Phone, Mail, Lock, Store, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

export default function RegisterPage() {
  const router = useRouter();
  const register = useStore((state) => state.register);
  const toast = useToastStore((state) => state.toast);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mahasiswa' | 'penjual'>('mahasiswa');
  const [canteenName, setCanteenName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !email || !password || !passwordConfirm) {
      toast('Silahkan isi semua kolom!', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      toast('Kata sandi dan konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    if (role === 'penjual' && !canteenName) {
      toast('Nama Kantin wajib diisi untuk penjual!', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = register({
        name,
        email,
        contact,
        role,
        canteenName: role === 'penjual' ? canteenName : undefined,
        passwordConfirm
      });
      setLoading(false);

      if (res.success) {
        toast('Akun berhasil dibuat. Selamat datang!', 'success');
        router.push('/');
      } else {
        toast(res.message, 'error');
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-premium p-8 z-10 my-8"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
            <Coffee className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Daftar Akun
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Daftarkan diri Anda untuk mulai bertransaksi di e-Kantin
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('mahasiswa')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer
                  ${role === 'mahasiswa'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                Mahasiswa / Pembeli
              </button>
              <button
                type="button"
                onClick={() => setRole('penjual')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer
                  ${role === 'penjual'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                Penjual Kantin
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="cth. Muhammad Fikry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          {role === 'penjual' && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Nama Kantin
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="cth. Kantin Mencintai"
                  value={canteenName}
                  onChange={(e) => setCanteenName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nomor Kontak (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="cth. 082111222333"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="nama@email.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Daftar Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5 select-none">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Masuk Disini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
