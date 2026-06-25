'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Wallet, ArrowLeftRight, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const login = useStore((state) => state.login);
  
  const darkMode = useStore((state) => state.darkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);
  const toast = useToastStore((state) => state.toast);

  if (!currentUser) return null;

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Quick switch role utility for review convenience
  const handleRoleSwitch = () => {
    if (currentUser.role === 'mahasiswa') {
      // Switch to Penjual
      const seller = users.find(u => u.role === 'penjual');
      if (seller) {
        login(seller.email, 'password');
        toast('Role disimulasikan: Penjual Kantin', 'info');
        router.push('/penjual/dashboard');
      }
    } else {
      // Switch to Mahasiswa
      const student = users.find(u => u.role === 'mahasiswa');
      if (student) {
        login(student.email, 'password');
        toast('Role disimulasikan: Mahasiswa', 'info');
        router.push('/mahasiswa/dashboard');
      }
    }
  };

  // Get Page Title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/menu')) return pathname.includes('/mahasiswa') ? 'Menu Kantin' : 'Kelola Menu';
    if (pathname.includes('/cart')) return 'Keranjang Belanja';
    if (pathname.includes('/checkout')) return 'Konfirmasi Checkout';
    if (pathname.includes('/success')) return 'Pembayaran Sukses';
    if (pathname.includes('/orders')) return 'Daftar Pesanan';
    if (pathname.includes('/wallet')) return 'Dompet Saya';
    if (pathname.includes('/profile')) return 'Profil Pengguna';
    return 'e-Kantin';
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground select-none hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Student Balance Shortcut */}
        {currentUser.role === 'mahasiswa' && (
          <button 
            onClick={() => router.push('/mahasiswa/wallet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-sm group shrink-0"
          >
            <Wallet className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left leading-none">
              <span className="text-[10px] text-muted-foreground block">Saldo Saya</span>
              <span className="font-semibold text-xs tracking-wide">{formatRupiah(currentUser.balance)}</span>
            </div>
          </button>
        )}

        {/* Developer Sandbox Role Switcher */}
        <button
          onClick={handleRoleSwitch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all shadow-xs shrink-0"
          title="Klik untuk berpindah role demo secara cepat"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ganti ke {currentUser.role === 'mahasiswa' ? 'Penjual' : 'Mahasiswa'}</span>
          <span className="md:hidden">{currentUser.role === 'mahasiswa' ? 'Penjual' : 'Mhs'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Fake Notifications */}
        <button
          onClick={() => toast('Tidak ada notifikasi baru', 'info')}
          className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
