"use client";

import { ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react";
import { WalletTransaction } from "@/store/useStore";

interface TransactionTableProps {
  transactions: WalletTransaction[];
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground text-xs uppercase tracking-wider select-none">
              <th className="p-4">Deskripsi</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">ID Transaksi</th>
              <th className="p-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-muted-foreground text-xs"
                >
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isDebit = tx.type === "purchase";

                const typeIcon = {
                  topup: <ArrowDownLeft className="w-4 h-4 text-emerald-500" />,
                  income: (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  ),
                  purchase: <ArrowUpRight className="w-4 h-4 text-rose-500" />,
                  refund: <PlusCircle className="w-4 h-4 text-blue-500" />,
                }[tx.type];

                const badgeBg = {
                  topup:
                    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                  income:
                    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                  purchase:
                    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
                  refund:
                    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
                }[tx.type];

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Description & Icon */}
                    <td className="p-4 flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${badgeBg}`}>
                        {typeIcon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-xs">
                          {tx.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold sm:hidden block mt-0.5">
                          {tx.type}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>

                    {/* Transaction ID */}
                    <td className="p-4 text-xs font-mono text-muted-foreground font-semibold">
                      {tx.id}
                    </td>

                    {/* Amount */}
                    <td
                      className={`p-4 text-right font-extrabold text-sm tracking-wide ${isDebit ? "text-foreground" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {isDebit ? "-" : "+"}
                      {formatRupiah(tx.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
