"use client";

import { useEffect, useState } from "react";
import { Wallet, History, PlusCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import WalletCard from "@/components/wallet-card";
import TransactionTable from "@/components/transaction-table";
import Dialog from "@/components/ui/dialog";

interface WalletTransaction {
  id: string;
  userId: string;
  orderId: string | null;
  type: "topup" | "purchase" | "income" | "refund";
  amount: number;
  date: string;
  description: string;
}

export default function StudentWalletPage() {
  const currentUser = useStore((state) => state.currentUser);

  const setCurrentUser = useStore((state) => state.setCurrentUser);

  const toast = useToastStore((state) => state.toast);

  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // ============================================================
  // AMBIL RIWAYAT TRANSAKSI DARI MYSQL
  // ============================================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);

        const response = await fetch(
          `/api/wallet/transactions?userId=${encodeURIComponent(
            currentUser.id,
          )}`,
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil riwayat transaksi",
          );
        }

        setWalletTransactions(result.data);
      } catch (error) {
        console.error("GET WALLET TRANSACTIONS ERROR:", error);

        toast(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil transaksi",
          "error",
        );
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser?.id, toast]);

  if (!currentUser) {
    return null;
  }

  // ============================================================
  // TOP UP SALDO KE MYSQL
  // ============================================================

  const handleTopUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const amount = Number(topUpAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast("Masukkan nominal top up yang valid!", "error");

      return;
    }

    if (amount % 1000 !== 0) {
      toast("Nominal top up harus kelipatan Rp1.000", "error");

      return;
    }

    if (amount > 1000000) {
      toast("Maksimum top up sekali transaksi adalah Rp1.000.000", "error");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/wallet/topup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: currentUser.id,
          amount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Top Up gagal");
      }

      // ========================================================
      // UPDATE CURRENT USER ZUSTAND
      // ========================================================

      setCurrentUser(result.data.user);

      // ========================================================
      // TAMBAHKAN TRANSAKSI BARU KE TAMPILAN
      // ========================================================

      setWalletTransactions((previousTransactions) => [
        result.data.transaction,
        ...previousTransactions,
      ]);

      toast(
        `Top Up ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount)} berhasil!`,
        "success",
      );

      setTopUpAmount("");

      setDialogOpen(false);
    } catch (error) {
      console.error("TOP UP ERROR:", error);

      toast(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat melakukan Top Up",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  const presets = [10000, 20000, 50000, 100000, 200000, 500000];

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />

        <h3 className="font-extrabold text-lg text-foreground">
          Dompet e-Kantin
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <WalletCard onTopUpClick={() => setDialogOpen(true)} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />

            <h4 className="font-extrabold text-sm text-foreground">
              Riwayat Transaksi
            </h4>
          </div>

          {transactionsLoading ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
              Memuat riwayat transaksi...
            </div>
          ) : (
            <TransactionTable transactions={walletTransactions} />
          )}
        </div>
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => {
          if (!loading) {
            setDialogOpen(false);
          }
        }}
        title="Top Up Saldo e-Kantin"
      >
        <form onSubmit={handleTopUpSubmit} className="space-y-5">
          <div className="text-center bg-muted/40 p-4 rounded-2xl border border-border/60">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Saldo Terkini
            </span>

            <h5 className="text-xl font-extrabold text-foreground mt-1">
              {formatRupiah(currentUser.balance)}
            </h5>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nominal Top Up (Rp)
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-muted-foreground">
                Rp
              </span>

              <input
                type="number"
                placeholder="cth. 50000"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold disabled:opacity-60"
                min="1000"
                step="1000"
                required
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-muted-foreground block mb-2">
              Pilih Nominal Cepat
            </span>

            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickSelect(preset)}
                  className="py-2 px-2 border border-border hover:border-primary/50 bg-background hover:bg-primary/5 text-[11px] font-bold rounded-xl text-center transition-all cursor-pointer text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formatRupiah(preset).replace(",00", "")}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />

                <span>Konfirmasi Top Up</span>
              </>
            )}
          </button>
        </form>
      </Dialog>
    </div>
  );
}
