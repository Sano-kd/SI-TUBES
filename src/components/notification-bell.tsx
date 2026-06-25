'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function NotificationBell() {
  const currentUser = useStore(s => s.currentUser);
  const notifications = useStore(s => s.notifications);
  const markNotificationRead = useStore(s => s.markNotificationRead);
  const markAllNotificationsRead = useStore(s => s.markAllNotificationsRead);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const userNotifs = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const typeStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-premium z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-extrabold text-sm text-foreground">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => currentUser && markAllNotificationsRead(currentUser.id)}
                    className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai semua dibaca
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted cursor-pointer">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notif List */}
            <div className="max-h-80 overflow-y-auto">
              {userNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Belum ada notifikasi</p>
                </div>
              ) : (
                userNotifs.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`px-4 py-3 border-b border-border/60 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors
                      ${!notif.read ? 'bg-primary/3' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDate(notif.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
