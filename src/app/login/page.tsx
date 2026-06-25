'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);
  const toast = useToastStore((state) => state.toast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Email wajib diisi.', 'error');
      return;
    }
    if (!password) {
      toast('Password wajib diisi.', 'error');
      return;
    }

    setLoading(true);

    // Simulate small latency
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);

      if (res.success) {
        toast(res.message, 'success');
        // Let Root redirect handle it based on role
        router.push('/');
      } else {
        toast(res.message, 'error');
      }
    }, 600);
  };

  // Quick action login helper
  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    toast('Detail akun demo diisi', 'info', 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-premium p-8 z-10"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
            <Coffee className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            e-Kantin Digital
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Pesan makanan kantin kampus secara instan & praktis
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Email Kampus
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="nama@mahasiswa.id"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6 select-none">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Daftar Sekarang
          </Link>
        </p>

        {/* Demo Accounts Panel */}
        <div className="mt-8 pt-6 border-t border-border/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-3 text-center">
            Demo Sandbox Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('kadek@mahasiswa.id')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-left text-xs transition-colors cursor-pointer"
            >
              <span className="font-bold text-foreground truncate w-full">Kadek Sudarsana (Mhs)</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">kadek@mahasiswa.id</span>
            </button>

            <button
              onClick={() => handleQuickLogin('kantin@mencintai.id')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-left text-xs transition-colors cursor-pointer"
            >
              <span className="font-bold text-foreground truncate w-full">Kantin Mencintai</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">kantin@mencintai.id</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
