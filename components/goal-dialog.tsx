"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import type { Goal } from "@/lib/data/types";

export interface GoalInput {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string | null;
}

const COLORS: { value: string; label: string }[] = [
  { value: "from-emerald-400 to-teal-600", label: "Esmeralda" },
  { value: "from-sky-400 to-indigo-600", label: "Azul" },
  { value: "from-fuchsia-500 to-purple-600", label: "Roxo" },
  { value: "from-amber-400 to-orange-600", label: "Âmbar" },
  { value: "from-indigo-500 to-violet-600", label: "Índigo" },
];

export function GoalDialog({
  open,
  onClose,
  initial,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  initial: Goal | null;
  onSubmit: (input: GoalInput) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState(COLORS[0].value);

  // Reset fields to the goal being edited (or blank) each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setTarget(initial ? String(initial.target_amount) : "");
    setCurrent(initial?.current_amount ? String(initial.current_amount) : "");
    setDeadline(initial?.deadline ?? "");
    setColor(initial?.color ?? COLORS[0].value);
  }, [open, initial]);

  const submit = () => {
    const t = parseFloat(target.replace(",", "."));
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return;
    const c = parseFloat(current.replace(",", "."));
    onSubmit({
      name: name.trim(),
      target_amount: t,
      current_amount: Number.isFinite(c) && c > 0 ? c : 0,
      deadline: deadline || null,
      color,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Editar meta" : "Nova meta"}
      description="Defina para onde você quer chegar e acompanhe o progresso."
      footer={
        <>
          {onDelete && (
            <Button variant="danger" className="mr-auto" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{initial ? "Salvar" : "Criar meta"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nome da meta" htmlFor="goal-name">
          <Input
            id="goal-name"
            autoFocus
            placeholder="Ex: Reserva de emergência"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor alvo (R$)" htmlFor="goal-target">
            <Input
              id="goal-target"
              inputMode="decimal"
              placeholder="Ex: 10000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
          <Field label="Valor atual (R$)" htmlFor="goal-current">
            <Input
              id="goal-current"
              inputMode="decimal"
              placeholder="0"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prazo (opcional)" htmlFor="goal-deadline">
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
          <Field label="Cor" htmlFor="goal-color">
            <Select
              id="goal-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </Dialog>
  );
}
