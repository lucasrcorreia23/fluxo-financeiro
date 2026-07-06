"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import type { Category, Expense, ExpenseType } from "@/lib/data/types";
import type { AppUser } from "@/lib/users/types";
import { cn } from "@/lib/utils";

export interface ExpenseInput {
  name: string;
  amount: number | null;
  type: ExpenseType;
  category_id: string | null;
  due_day: number | null;
  owner: string | null;
  is_paid: boolean;
}

export function ExpenseDialog({
  open,
  onClose,
  editing,
  categories,
  currentUser,
  defaultType,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  editing: Expense | null;
  categories: Category[];
  currentUser: AppUser;
  defaultType: ExpenseType;
  onCreate: (input: ExpenseInput) => void;
  onUpdate: (id: string, patch: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<ExpenseType>(defaultType);
  const [categoryId, setCategoryId] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [owner, setOwner] = useState("");
  const [paid, setPaid] = useState(false);

  // Sync the form from the editing target — or reset for a new expense — on open.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setAmount(editing.amount == null ? "" : String(editing.amount));
      setType(editing.type);
      setCategoryId(editing.category_id ?? "");
      setDueDay(editing.due_day == null ? "" : String(editing.due_day));
      setOwner(editing.owner ?? "");
      setPaid(editing.is_paid);
    } else {
      setName("");
      setAmount("");
      setType(defaultType);
      setCategoryId("");
      setDueDay("");
      setOwner(currentUser);
      setPaid(false);
    }
  }, [open, editing, defaultType, currentUser]);

  const parseAmount = (): number | null => {
    const t = amount.trim();
    if (!t) return null;
    const n = parseFloat(t.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const parseDueDay = (): number | null => {
    const t = dueDay.trim();
    if (!t) return null;
    const n = Math.round(parseFloat(t.replace(",", ".")));
    if (!Number.isFinite(n)) return null;
    return Math.max(1, Math.min(31, n));
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Dê um nome ao gasto");
      return;
    }
    const payload: ExpenseInput = {
      name: trimmed,
      amount: parseAmount(),
      type,
      category_id: categoryId || null,
      due_day: parseDueDay(),
      owner: owner || null,
      is_paid: paid,
    };
    if (editing) {
      onUpdate(editing.id, payload);
      toast.success("Gasto atualizado");
    } else {
      onCreate(payload);
      toast.success(`${trimmed} adicionado`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editing) return;
    onDelete(editing.id);
    toast.success(`${editing.name} excluído`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Editar gasto" : "Novo gasto"}
      description={
        editing
          ? "Ajuste os detalhes deste gasto."
          : "Cadastre uma conta fixa ou variável."
      }
      footer={
        <>
          {editing && (
            <Button variant="danger" onClick={handleDelete} className="mr-auto">
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{editing ? "Salvar" : "Adicionar"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome" htmlFor="exp-name" className="col-span-2">
          <Input
            id="exp-name"
            autoFocus
            placeholder="Ex: Aluguel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        <Field label="Valor (R$)" htmlFor="exp-amount" hint="Deixe vazio se ainda não sabe.">
          <Input
            id="exp-amount"
            inputMode="decimal"
            placeholder="opcional"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        <Field label="Dia de vencimento" htmlFor="exp-due">
          <Input
            id="exp-due"
            type="number"
            min={1}
            max={31}
            placeholder="1–31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        <Field label="Tipo" htmlFor="exp-type">
          <Select
            id="exp-type"
            value={type}
            onChange={(e) => setType(e.target.value as ExpenseType)}
          >
            <option value="fixed">Fixo</option>
            <option value="variable">Variável</option>
          </Select>
        </Field>

        <Field label="Responsável" htmlFor="exp-owner">
          <Select
            id="exp-owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">Compartilhado</option>
            <option value={currentUser}>{currentUser}</option>
          </Select>
        </Field>

        <Field label="Categoria" htmlFor="exp-category" className="col-span-2">
          <Select
            id="exp-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="col-span-2 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white/5 px-3.5 py-2.5">
          <div>
            <p className="text-sm font-medium">Pago</p>
            <p className="text-[11px] text-[var(--color-muted)]">
              Marque se já foi pago este mês.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={paid}
            aria-label="Pago"
            onClick={() => setPaid((v) => !v)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              paid ? "bg-emerald-500" : "bg-white/15",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                paid && "translate-x-5",
              )}
            />
          </button>
        </div>
      </div>
    </Dialog>
  );
}
