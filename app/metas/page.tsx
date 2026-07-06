"use client";

import { motion } from "framer-motion";
import { PartyPopper, Pencil, Plus, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AporteDialog } from "@/components/aporte-dialog";
import { GoalDialog, type GoalInput } from "@/components/goal-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressRing } from "@/components/ui/progress";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useData } from "@/lib/data/provider";
import type { Goal } from "@/lib/data/types";
import { avgMonthlySurplus } from "@/lib/finance";
import { fadeUp, stagger } from "@/lib/motion";
import { daysUntilDate, formatBRL, formatDate } from "@/lib/utils";

// Hex pairs for the progress ring, keyed by the same gradient tokens the
// GoalDialog offers. Tailwind can't build ring gradients from runtime strings,
// so we map the known options explicitly.
const RING_HEX: Record<string, [string, string]> = {
  "from-emerald-400 to-teal-600": ["#34d399", "#0d9488"],
  "from-sky-400 to-indigo-600": ["#38bdf8", "#4f46e5"],
  "from-fuchsia-500 to-purple-600": ["#d946ef", "#9333ea"],
  "from-amber-400 to-orange-600": ["#fbbf24", "#ea580c"],
  "from-indigo-500 to-violet-600": ["#6366f1", "#7c3aed"],
};
const RING_DEFAULT: [string, string] = ["#818cf8", "#e879f9"];

function GoalCard({
  goal,
  surplus,
  onAporte,
  onEdit,
}: {
  goal: Goal;
  surplus: number;
  onAporte: () => void;
  onEdit: () => void;
}) {
  const pct =
    goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const reached = remaining <= 0;
  const [from, to] = RING_HEX[goal.color ?? ""] ?? RING_DEFAULT;

  const days = goal.deadline ? daysUntilDate(goal.deadline) : null;
  const monthsLeft = days != null ? Math.ceil(days / 30) : null;
  const monthsAtRate =
    surplus > 0 && remaining > 0 ? Math.ceil(remaining / surplus) : null;

  return (
    <motion.div variants={fadeUp}>
      <Card className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <ProgressRing
            value={pct}
            size={72}
            stroke={7}
            gradientId={`ring-${goal.id}`}
            from={from}
            to={to}
          >
            {Math.round(pct)}%
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight">
                {goal.name}
              </h3>
              <button
                onClick={onEdit}
                aria-label="Editar meta"
                className="-mr-1 shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-foreground)]"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)] tnum">
              {formatBRL(goal.current_amount)} de {formatBRL(goal.target_amount)}
            </p>
            {reached && (
              <Badge tone="green" className="mt-2">
                <PartyPopper className="h-3 w-3" /> Meta batida 🎉
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
          {monthsLeft != null && monthsLeft > 0 && remaining > 0 && (
            <p>
              Guarde{" "}
              <span className="font-medium text-[var(--color-foreground)] tnum">
                {formatBRL(remaining / monthsLeft)}
              </span>
              /mês até {formatDate(goal.deadline!)}
            </p>
          )}
          {!reached &&
            (monthsAtRate != null ? (
              <p>
                ≈ {monthsAtRate} {monthsAtRate === 1 ? "mês" : "meses"} no ritmo
                atual
              </p>
            ) : (
              <p>Sem sobra prevista para estimar o prazo.</p>
            ))}
        </div>

        <div className="mt-auto">
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={onAporte}
          >
            <Plus className="h-4 w-4" /> Aportar
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function MetasPage() {
  const { ready, db, addGoal, updateGoal, removeGoal, contributeGoal } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [aporteGoal, setAporteGoal] = useState<Goal | null>(null);

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-9 w-40 rounded-xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton className="h-52" />
          <CardSkeleton className="h-52" />
          <CardSkeleton className="h-52" />
        </div>
      </div>
    );
  }

  const income = db.profile.monthly_income;
  const surplus = avgMonthlySurplus(income, db.monthly_history);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setDialogOpen(true);
  };

  const handleSubmit = (input: GoalInput) => {
    if (editing) {
      updateGoal(editing.id, input);
      toast.success("Meta atualizada");
    } else {
      addGoal(input);
      toast.success("Meta criada");
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    removeGoal(editing.id);
    setDialogOpen(false);
    toast.success("Meta excluída");
  };

  const handleAporte = (amount: number) => {
    if (!aporteGoal) return;
    contributeGoal(aporteGoal.id, amount);
    toast.success(
      amount >= 0
        ? `Aporte de ${formatBRL(amount)}`
        : `Retirada de ${formatBRL(-amount)}`,
      { description: aporteGoal.name },
    );
  };

  return (
    <>
      <PageHeader
        title="Metas"
        subtitle="Onde você quer chegar — e quanto falta."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova meta
          </Button>
        }
      />

      {db.goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta ainda"
          description="Crie sua primeira meta e acompanhe o progresso rumo a ela."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nova meta
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {db.goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              surplus={surplus}
              onAporte={() => setAporteGoal(goal)}
              onEdit={() => openEdit(goal)}
            />
          ))}
        </motion.div>
      )}

      <GoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
        onDelete={editing ? handleDelete : undefined}
      />
      <AporteDialog
        open={aporteGoal != null}
        onClose={() => setAporteGoal(null)}
        goal={aporteGoal}
        onSubmit={handleAporte}
      />
    </>
  );
}
