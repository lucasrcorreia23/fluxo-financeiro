"use client";

import { motion } from "framer-motion";
import { Check, Pencil, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ExpenseDialog } from "@/components/expense-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useData } from "@/lib/data/provider";
import type { Category, Expense, ExpenseType } from "@/lib/data/types";
import { fadeUp, stagger } from "@/lib/motion";
import { cn, formatBRL } from "@/lib/utils";

const TABS: { value: ExpenseType; label: string }[] = [
  { value: "fixed", label: "Fixos" },
  { value: "variable", label: "Variáveis" },
];

// Visual fallback for expenses with no category.
const UNCATEGORIZED = {
  name: "Sem categoria",
  gradient: "from-slate-400 to-slate-600",
  icon: "shapes",
};

interface Group {
  key: string;
  category: Pick<Category, "name" | "gradient" | "icon">;
  expenses: Expense[];
  subtotal: number;
}

function groupByCategory(expenses: Expense[], categories: Category[]): Group[] {
  const byCat = new Map<string | null, Expense[]>();
  for (const e of expenses) {
    const arr = byCat.get(e.category_id) ?? [];
    arr.push(e);
    byCat.set(e.category_id, arr);
  }

  const subtotal = (rows: Expense[]) =>
    rows.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const groups: Group[] = [];
  // Follow the catalog order so groups stay stable across renders.
  for (const cat of categories) {
    const rows = byCat.get(cat.id);
    if (rows && rows.length) {
      groups.push({ key: cat.id, category: cat, expenses: rows, subtotal: subtotal(rows) });
    }
  }
  const uncat = byCat.get(null);
  if (uncat && uncat.length) {
    groups.push({
      key: "uncategorized",
      category: UNCATEGORIZED,
      expenses: uncat,
      subtotal: subtotal(uncat),
    });
  }
  return groups;
}

function ExpenseRow({
  expense,
  onToggle,
  onEdit,
}: {
  expense: Expense;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const pending = expense.amount == null;
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 transition-colors",
        pending && "ring-1 ring-amber-400/30",
        expense.is_paid && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={expense.is_paid ? "Marcar como não pago" : "Marcar como pago"}
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
          expense.is_paid
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-[var(--color-border)] text-transparent hover:border-emerald-400/60",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              expense.is_paid && "line-through",
            )}
          >
            {expense.name}
          </p>
          {expense.owner && <Badge tone="neutral">{expense.owner}</Badge>}
        </div>
        {expense.due_day != null && (
          <p className="text-xs text-[var(--color-muted)]">vence dia {expense.due_day}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {pending ? (
          <Badge tone="amber">definir valor</Badge>
        ) : (
          <span
            className={cn(
              "text-sm font-semibold tnum",
              expense.is_paid && "text-[var(--color-muted)] line-through",
            )}
          >
            {formatBRL(expense.amount)}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar gasto">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

export default function GastosPage() {
  const { ready, currentUser, db, addExpense, updateExpense, removeExpense, togglePaid } =
    useData();
  const [tab, setTab] = useState<ExpenseType>("fixed");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-9 w-40 rounded-xl" />
        <div className="skeleton h-11 w-56 rounded-2xl" />
        <CardSkeleton className="h-48" />
        <CardSkeleton className="h-48" />
      </div>
    );
  }

  const items = db.expenses.filter((e) => e.type === tab);
  const groups = groupByCategory(items, db.categories);
  const tabTotal = items.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Gastos"
        subtitle="Contas fixas e variáveis, agrupadas por categoria."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Novo gasto
          </Button>
        }
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-[var(--color-border)] bg-white/5 p-1">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  "relative rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="gastos-tab"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Total{" "}
          <span className="font-semibold text-[var(--color-foreground)] tnum">
            {formatBRL(tabTotal)}
          </span>
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={tab === "fixed" ? "Nenhum gasto fixo" : "Nenhum gasto variável"}
          description="Cadastre suas contas para acompanhar tudo em um só lugar."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Novo gasto
            </Button>
          }
        />
      ) : (
        <motion.div
          key={tab}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          {groups.map((group) => (
            <motion.div key={group.key} variants={fadeUp}>
              <Card>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white ${group.category.gradient}`}
                    >
                      <CategoryIcon
                        icon={group.category.icon}
                        className="h-[18px] w-[18px]"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{group.category.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {group.expenses.length}{" "}
                        {group.expenses.length === 1 ? "item" : "itens"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tnum">
                    {formatBRL(group.subtotal)}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {group.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      onToggle={() => togglePaid(expense.id)}
                      onEdit={() => openEdit(expense)}
                    />
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        categories={db.categories}
        currentUser={currentUser}
        defaultType={tab}
        onCreate={(input) => addExpense(input)}
        onUpdate={(id, patch) => updateExpense(id, patch)}
        onDelete={(id) => removeExpense(id)}
      />
    </>
  );
}
