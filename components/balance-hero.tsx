"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { ProgressBar, commitmentColor } from "@/components/ui/progress";
import { formatBRL, formatPercent } from "@/lib/utils";

export function BalanceHero({
  income,
  total,
  surplus,
  commitment,
  onSetIncome,
}: {
  income: number;
  total: number;
  surplus: number;
  commitment: number;
  onSetIncome?: () => void;
}) {
  const positive = surplus >= 0;
  const commitLabel =
    commitment < 50 ? "saudável" : commitment < 70 ? "atenção" : "alerta";

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
      {/* animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-70">
        <div className="animate-float absolute -left-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="animate-float-slow absolute -right-10 top-0 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="animate-float absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-muted)]">Sobra prevista este mês</p>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-2 flex items-end gap-3"
        >
          <span
            className={`text-4xl font-semibold tracking-tight tnum sm:text-5xl ${
              positive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatBRL(surplus)}
          </span>
          <span
            className={`mb-1.5 inline-flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-emerald-400/80" : "text-rose-400/80"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {income > 0 ? formatPercent((surplus / income) * 100) : "—"} da renda
          </span>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onSetIncome}
            className="rounded-2xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
          >
            <p className="text-xs text-[var(--color-muted)]">Renda mensal</p>
            <p className="mt-0.5 text-lg font-semibold tnum">
              {income > 0 ? formatBRL(income) : "definir"}
            </p>
          </button>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-xs text-[var(--color-muted)]">Gastos previstos</p>
            <p className="mt-0.5 text-lg font-semibold tnum">{formatBRL(total)}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-[var(--color-muted)]">Comprometimento da renda</span>
            <span
              className={`font-medium ${
                commitment < 50
                  ? "text-emerald-400"
                  : commitment < 70
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {income > 0 ? formatPercent(commitment) : "—"} · {commitLabel}
            </span>
          </div>
          <ProgressBar value={commitment} gradient={commitmentColor(commitment)} height="h-3" />
        </div>
      </div>
    </div>
  );
}
