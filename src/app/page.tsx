"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function Home() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    // Small timeout to prevent flashing during hydration
    const timer = setTimeout(() => {
      if (!currentUser) {
        router.replace("/login");
      } else if (currentUser.role === "mahasiswa") {
        router.replace("/mahasiswa/dashboard");
      } else if (currentUser.role === "penjual") {
        router.replace("/penjual/dashboard");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-primary">
            e-Kantin Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Menyiapkan hidangan lezat untuk Anda...
          </p>
        </div>
      </div>
    </div>
  );
}
