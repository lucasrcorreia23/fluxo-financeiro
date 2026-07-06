"use client";

import { motion } from "framer-motion";
import { CalendarClock, PiggyBank, Repeat, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertBanner } from "@/components/alert-banner";
import { BalanceHero } from "@/components/balance-hero";
import { CategoryDonut } from "@/components/charts/category-donut";
import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { IncomeDialog } from "@/components/income-dialog";
import { useData } from "@/lib/data/provider";
import {
  activeAlerts,
  commitmentPct,
  predictedSurplus,
  spendByCategory,
  totalsByType,
  upcomingDue,
} from "@/lib/finance";
import { fadeUp, stagger } from "@/lib/motion";
import { formatBRL } from "@/lib/utils";

function dueBadge(days: number) {
  if (days <= 0) return { tone: "red" as const, label: "vence hoje" };
  if (days <= 3) return { tone: "red" as const, label: `em ${days}d` };
  if (days <= 7) return { tone: "amber" as const, label: `em ${days}d` };
  return { tone: "neutral" as const, label: `em ${days}d` };
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${gradient}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-[var(--color-muted)]">{label}</p>
          <p className="truncate text-fluid-stat font-semibold tnum">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { ready, db, setIncome, dismissAlert, markPurchased } = useData();
  const [incomeOpen, setIncomeOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-9 w-40 rounded-xl" />
        <CardSkeleton className="h-56" />
        <div className="grid gap-5 lg:grid-cols-2">
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  const income = db.profile.monthly_income;
  const totals = totalsByType(db.expenses);
  const surplus = predictedSurplus(income, totals.total);
  const commit = commitmentPct(totals.total, income);
  const spend = spendByCategory(db.expenses, db.categories);
  const due = upcomingDue(db.expenses, db.categories);
  const alerts = activeAlerts(db.wishlist);

  const handlePurchase = (id: string) => {
    const wish = markPurchased(id);
    if (wish) toast.success(`${wish.name} comprado`, { description: "Virou um gasto." });
  };

  return (
    <>
      <PageHeader
        title="Painel"
        subtitle="Visão geral do seu mês — sobra, comprometimento e vencimentos."
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
      >
        <motion.div variants={fadeUp}>
          <BalanceHero
            income={income}
            total={totals.total}
            surplus={surplus}
            commitment={commit}
            onSetIncome={() => setIncomeOpen(true)}
          />
        </motion.div>

        {alerts.length > 0 && (
          <motion.div variants={fadeUp}>
            <AlertBanner
              alerts={alerts}
              onDismiss={dismissAlert}
              onPurchase={handlePurchase}
            />
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Wallet className="h-5 w-5" />}
            label="Total fixo"
            value={formatBRL(totals.fixed)}
            gradient="from-indigo-500 to-violet-600"
          />
          <StatCard
            icon={<Repeat className="h-5 w-5" />}
            label="Total variável"
            value={formatBRL(totals.variable)}
            gradient="from-fuchsia-500 to-purple-600"
          />
          <StatCard
            icon={<PiggyBank className="h-5 w-5" />}
            label="Metas ativas"
            value={String(db.goals.length)}
            gradient="from-emerald-400 to-teal-600"
          />
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader
                title="Distribuição por categoria"
                subtitle="Onde o dinheiro vai"
              />
              <CategoryDonut data={spend} total={totals.total} />
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader
                title="Próximos vencimentos"
                subtitle="Contas a pagar em breve"
                icon={
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80">
                    <CalendarClock className="h-[18px] w-[18px]" />
                  </span>
                }
              />
              {due.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Nada vencendo"
                  description="Cadastre um dia de vencimento nos gastos para acompanhar aqui."
                />
              ) : (
                <ul className="flex flex-col gap-2">
                  {due.map(({ expense, category, days }) => {
                    const badge = dueBadge(days);
                    return (
                      <li
                        key={expense.id}
                        className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5"
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${
                            category?.gradient ?? "from-slate-400 to-slate-600"
                          }`}
                        >
                          <CategoryIcon
                            icon={category?.icon ?? "shapes"}
                            className="h-[18px] w-[18px]"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{expense.name}</p>
                          <p className="text-xs text-[var(--color-muted)]">
                            dia {expense.due_day} · {category?.name ?? "Outros"}
                          </p>
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-1">
                          <span className="text-sm font-semibold tnum">
                            {formatBRL(expense.amount)}
                          </span>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <IncomeDialog
        open={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        initial={income}
        onSave={(v) => {
          setIncome(v);
          toast.success("Renda atualizada");
        }}
      />
    </>
  );
}
