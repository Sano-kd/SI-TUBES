'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Coffee
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const logout = useStore((state) => state.logout);
  const toast = useToastStore((state) => state.toast);

  if (!currentUser) return null;

  const role = currentUser.role;

  interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    badge?: boolean;
  }

  const studentLinks: SidebarLink[] = [
    { name: 'Beranda', href: '/mahasiswa/dashboard', icon: Home },
    { name: 'Menu Kantin', href: '/mahasiswa/menu', icon: UtensilsCrossed },
    { name: 'Keranjang', href: '/mahasiswa/cart', icon: ShoppingBag, badge: true },
    { name: 'Dompet Saya', href: '/mahasiswa/wallet', icon: Wallet },
    { name: 'Status Pesanan', href: '/mahasiswa/orders', icon: ClipboardList },
    { name: 'Profile Saya', href: '/mahasiswa/profile', icon: User },
  ];

  const sellerLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/penjual/dashboard', icon: LayoutDashboard },
    { name: 'Daftar Pesanan', href: '/penjual/orders', icon: Receipt },
    { name: 'Kelola Menu', href: '/penjual/menu', icon: CookingPot },
    { name: 'Profile Kantin', href: '/penjual/profile', icon: Store },
  ];

  const links = role === 'mahasiswa' ? studentLinks : sellerLinks;
  const cartItems = useStore((state) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    toast('Anda telah keluar dari akun.', 'info');
    router.push('/login');
  };

  const isCollapsed = sidebarCollapsed && !mobileOpen;

  // Sidebar wrapper class
  const sidebarClass = `fixed md:relative top-0 bottom-0 left-0 z-40 bg-card border-r border-border h-screen flex flex-col justify-between transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
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
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary overflow-hidden">
              <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
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

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Links Section */}
          <nav className="p-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const showBadge = link.badge && cartCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm tracking-wide"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Cart/Badge Count */}
                  {showBadge && (
                    <span className={`flex h-5 items-center justify-center rounded-full px-2 text-xs font-bold shrink-0
                      ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'}
                    `}>
                      {cartCount}
                    </span>
                  )}

                  {/* Tooltip on Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-950 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                      {link.name} {link.badge && cartCount > 0 ? `(${cartCount})` : ''}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Portion (User profile summary & logout) */}
        <div className="p-3 border-t border-border space-y-2">
          {/* User info */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2">
              {currentUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-10 h-10 rounded-xl bg-muted object-cover border border-border shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate leading-none mb-1">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {role === 'mahasiswa' ? 'Mahasiswa' : currentUser.canteenName || 'Penjual'}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200 group relative
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Keluar</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-destructive text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                Keluar
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
