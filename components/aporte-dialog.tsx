"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import type { Goal } from "@/lib/data/types";
import { formatBRL } from "@/lib/utils";

export function AporteDialog({
  open,
  onClose,
  goal,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSubmit: (amount: number) => void; // negative = withdraw
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const submit = (sign: 1 | -1) => {
    const n = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    onSubmit(sign * n);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={goal ? `Aportar em ${goal.name}` : "Aportar"}
      description={
        goal
          ? `Saldo atual ${formatBRL(goal.current_amount)} de ${formatBRL(goal.target_amount)}.`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={() => submit(-1)}>
            Retirar
          </Button>
          <Button onClick={() => submit(1)}>Aportar</Button>
        </>
      }
    >
      <Field label="Valor (R$)" htmlFor="aporte">
        <Input
          id="aporte"
          inputMode="decimal"
          autoFocus
          placeholder="Ex: 200"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(1)}
        />
      </Field>
    </Dialog>
  );
}
