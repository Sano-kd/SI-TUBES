"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useStore } from "@/store/useStore";

export default function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      if (!currentUser) {
        router.replace("/login");
      } else if (currentUser.role !== "mahasiswa") {
        router.replace("/penjual/dashboard");
      }
    }
  }, [currentUser, hydrated, router]);

  // Sinkronisasi user saat layout pertama kali aktif
  useEffect(() => {
    if (!hydrated || !currentUser || currentUser.role !== "mahasiswa") {
      return;
    }

    const fetchLatestUser = async () => {
      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil data user terbaru",
          );
        }

        setCurrentUser(result.data);
      } catch (error) {
        console.error("SYNC CURRENT USER ERROR:", error);
      }
    };

    fetchLatestUser();
  }, [hydrated, currentUser?.id, currentUser?.role, setCurrentUser]);

  // Sinkronisasi user saat mahasiswa kembali ke tab browser
  useEffect(() => {
    if (!hydrated || !currentUser || currentUser.role !== "mahasiswa") {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil data user terbaru",
          );
        }

        setCurrentUser(result.data);
      } catch (error) {
        console.error("SYNC USER ON TAB ACTIVE ERROR:", error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrated, currentUser?.id, currentUser?.role, setCurrentUser]);

  if (!hydrated || !currentUser || currentUser.role !== "mahasiswa") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Expandable Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
