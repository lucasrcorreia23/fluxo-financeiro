"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { useData } from "@/lib/data/provider";
import { useUser } from "@/lib/users/provider";

export function Onboarding() {
  const { ready, currentUser, db, completeOnboarding } = useData();
  const { loggedInUser } = useUser();
  const [value, setValue] = useState("");

  // Só pede a renda para a própria conta logada vendo os próprios dados —
  // não incomoda quando você está espiando a visão da outra pessoa.
  const open = ready && currentUser === loggedInUser && !db.profile.onboarded;

  const start = () => {
    const n = parseFloat(value.replace(",", "."));
    completeOnboarding(Number.isFinite(n) && n > 0 ? n : 0);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Bem-vindo ao Fluxo"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="glass relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl border-white/10 p-7 sm:rounded-3xl"
          >
            {/* orbs */}
            <div className="pointer-events-none absolute inset-0 -z-0 opacity-70">
              <div className="animate-float absolute -left-10 -top-14 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="animate-float-slow absolute -right-8 -top-6 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" />
            </div>

            <div className="relative z-10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Olá, {currentUser}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Organize seus gastos, desejos e metas com clareza. Pra começar, qual é a
                sua renda mensal?
              </p>

              <div className="mt-6">
                <Label htmlFor="onb-income">Renda mensal (R$)</Label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                  <Input
                    id="onb-income"
                    inputMode="decimal"
                    autoFocus
                    placeholder="Ex: 9000"
                    className="pl-9"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && start()}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">
                  Você pode alterar depois no painel. Seus dados ficam salvos na
                  sua conta.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => completeOnboarding(0)}>
                  Agora não
                </Button>
                <Button onClick={start}>Começar</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
