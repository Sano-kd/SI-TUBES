"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, Sun, Moon, Wallet } from "lucide-react";
import { useStore } from "@/store/useStore";
import NotificationBell from "@/components/notification-bell";

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useStore((state) => state.currentUser);

  const darkMode = useStore((state) => state.darkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);

  if (!currentUser) return null;

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Get Page Title from pathname
  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/menu"))
      return pathname.includes("/mahasiswa") ? "Daftar Kantin" : "Kelola Menu";
    if (pathname.includes("/cart")) return "Keranjang Belanja";
    if (pathname.includes("/checkout")) return "Konfirmasi Checkout";
    if (pathname.includes("/success")) return "Pembayaran Sukses";
    if (pathname.includes("/orders")) return "Daftar Pesanan";
    if (pathname.includes("/wallet")) return "Dompet Saya";
    if (pathname.includes("/profile")) return "Profil Pengguna";
    return "e-Kantin";
  };

  return (
    <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
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
        {currentUser.role === "mahasiswa" && (
          <button
            onClick={() => router.push("/mahasiswa/wallet")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-sm group shrink-0"
          >
            <Wallet className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left leading-none">
              <span className="text-[10px] text-muted-foreground block">
                Saldo Saya
              </span>
              <span className="font-semibold text-xs tracking-wide">
                {formatRupiah(currentUser.balance)}
              </span>
            </div>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Real Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}
