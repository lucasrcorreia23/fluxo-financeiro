"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";

export function IncomeDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: number;
  onSave: (value: number) => void;
}) {
  const [value, setValue] = useState(initial > 0 ? String(initial) : "");

  const submit = () => {
    const n = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return;
    onSave(n);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Renda mensal"
      description="Usada para calcular sobra prevista e comprometimento."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>Salvar</Button>
        </>
      }
    >
      <Field label="Quanto entra por mês (R$)" htmlFor="income">
        <Input
          id="income"
          inputMode="decimal"
          autoFocus
          placeholder="Ex: 9000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </Field>
    </Dialog>
  );
}
