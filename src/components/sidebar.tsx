"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  ClipboardList,
  User,
  LayoutDashboard,
  Receipt,
  CookingPot,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Coffee,
  X,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const logout = useStore((state) => state.logout);
  const toast = useToastStore((state) => state.toast);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "mahasiswa") {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${currentUser.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil jumlah keranjang");
        }

        const count = result.data.reduce(
          (
            total: number,
            item: {
              quantity: number;
            },
          ) => total + item.quantity,
          0,
        );

        setCartCount(count);
      } catch (error) {
        console.error("GET SIDEBAR CART COUNT ERROR:", error);
      }
    };

    fetchCartCount();
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) return null;

  const role = currentUser.role;

  interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    badge?: boolean;
  }

  const studentLinks: SidebarLink[] = [
    { name: "Beranda", href: "/mahasiswa/dashboard", icon: Home },
    { name: "Daftar Kantin Kampus", href: "/mahasiswa/menu", icon: Store },
    {
      name: "Keranjang",
      href: "/mahasiswa/cart",
      icon: ShoppingBag,
      badge: true,
    },
    { name: "Dompet Saya", href: "/mahasiswa/wallet", icon: Wallet },
    { name: "Status Pesanan", href: "/mahasiswa/orders", icon: ClipboardList },
    { name: "Profil Saya", href: "/mahasiswa/profile", icon: User },
  ];

  const sellerLinks: SidebarLink[] = [
    { name: "Dashboard", href: "/penjual/dashboard", icon: LayoutDashboard },
    { name: "Daftar Pesanan", href: "/penjual/orders", icon: Receipt },
    { name: "Kelola Menu", href: "/penjual/menu", icon: CookingPot },
    { name: "Profile Kantin", href: "/penjual/profile", icon: Store },
  ];

  const links = role === "mahasiswa" ? studentLinks : sellerLinks;

  const handleLogout = () => {
    logout();
    toast("Anda telah keluar dari akun.", "info");
    router.push("/login");
  };

  const isCollapsed = sidebarCollapsed && !mobileOpen;

  // Sidebar wrapper class
  const sidebarClass = `fixed md:relative top-0 bottom-0 left-0 z-40 bg-card border-r border-border h-screen flex flex-col transition-all duration-300 ease-in-out
  ${isCollapsed ? "w-20" : "w-64"}
  ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
`;

  return (
    <>
      {/* Mobile background backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}
      <aside className={sidebarClass}>
        {/* Upper Portion */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo Section */}
          <div
            className={`border-b border-border ${
              isCollapsed
                ? "h-20 flex flex-col items-center justify-center gap-2"
                : "h-20 flex items-center justify-between px-6"
            }`}
          >
            {!isCollapsed && (
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl text-primary"
              >
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-extrabold tracking-tight"
                  >
                    e-Kantin<span className="text-foreground">.</span>
                  </motion.span>
                )}
              </Link>
            )}

            {/* Mobile Close Button */}
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Desktop Collapse Toggle */}
            {!mobileOpen && (
              <button
                onClick={toggleSidebar}
                className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-md hover:bg-primary hover:text-white transition-all duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
            <div></div>
          </div>

          {/* Links Section */}
          <nav
            className={`flex-1 overflow-y-auto ${
              isCollapsed ? "px-3 py-5 space-y-3" : "px-4 py-5 space-y-2"
            }`}
          >
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              const showBadge = link.badge && cartCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`group relative flex items-center rounded-2xl transition-all duration-200 
                    ${
                      isCollapsed
                        ? "justify-center h-14 rounded-xl"
                        : "justify-start gap-4 py-3 px-5 rounded-2xl"
                    }
                    ${
                      isActive
                        ? "bg-primary text-white font-semibold shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-orange-50 hover:text-foreground"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`${
                        isCollapsed ? "w-6 h-6" : "w-5 h-5"
                      } shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors"}`}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[15px] font-medium"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </div>

                  {/* Cart/Badge Count */}
                  {showBadge && (
                    <span
                      className={`flex h-5 items-center justify-center rounded-full px-2 text-xs font-bold shrink-0
                      ${isActive ? "bg-white text-primary" : "bg-primary text-white"}
                    `}
                    >
                      {cartCount}
                    </span>
                  )}

                  {/* Tooltip on Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-950 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                      {link.name}{" "}
                      {link.badge && cartCount > 0 ? `(${cartCount})` : ""}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Portion (User profile summary & logout icon button) */}
        <div className="border-t border-zinc-200 bg-white p-3 shrink-0">
          {/* User info */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-destructive hover:text-white transition-all"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}

                <div className="overflow-hidden">
                  <p className="font-semibold truncate">{currentUser.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {role === "mahasiswa"
                      ? "Mahasiswa"
                      : currentUser.canteenName || "Penjual"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 hover:bg-destructive hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
