"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { authenticate, type AuthMode, type AuthState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const TABS: { key: Exclude<AuthMode, "magiclink">; label: string }[] = [
  { key: "signin", label: "Entrar" },
  { key: "signup", label: "Criar conta" },
];

export function LoginForm({ configured }: { configured: boolean }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const confirmationFailed = params.get("error") === "confirmation";

  const [mode, setMode] = useState<Exclude<AuthMode, "magiclink">>("signin");
  const [magicLink, setMagicLink] = useState(false);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    authenticate,
    undefined,
  );

  // Reset the magic-link toggle whenever the user switches tabs.
  useEffect(() => setMagicLink(false), [mode]);

  const submittedMode: AuthMode = magicLink ? "magiclink" : mode;

  return (
    <div className="relative w-full max-w-md">
      {/* floating orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="animate-float absolute -left-16 -top-20 h-52 w-52 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="animate-float-slow absolute -right-12 top-10 h-48 w-48 rounded-full bg-fuchsia-500/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass w-full overflow-hidden rounded-3xl border-white/10 p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Fluxo</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {mode === "signin"
            ? "Entre para acessar sua organização financeira."
            : "Crie sua conta e comece a organizar suas finanças."}
        </p>

        {/* tabs */}
        <div className="relative mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-white/5 p-1">
          {TABS.map((tab) => {
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={cn(
                  "relative z-10 rounded-xl py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {!configured && (
          <Notice tone="warn" icon={AlertCircle}>
            Supabase ainda não está configurado. Defina{" "}
            <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            e{" "}
            <code className="rounded bg-white/10 px-1">
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </code>{" "}
            em <code className="rounded bg-white/10 px-1">.env.local</code>.
          </Notice>
        )}

        {confirmationFailed && !state?.message && (
          <Notice tone="warn" icon={AlertCircle}>
            Link inválido ou expirado. Tente entrar novamente.
          </Notice>
        )}

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="mode" value={submittedMode} />
          <input type="hidden" name="next" value={next} />

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@email.com"
                className="pl-9"
              />
            </div>
          </div>

          {!magicLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!magicLink}
                  minLength={6}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">
                  Mínimo de 6 caracteres.
                </p>
              )}
            </motion.div>
          )}

          {state?.error && (
            <Notice tone="error" icon={AlertCircle}>
              {state.error}
            </Notice>
          )}
          {state?.message && (
            <Notice tone="success" icon={CheckCircle2}>
              {state.message}
            </Notice>
          )}

          <Button type="submit" disabled={pending} className="mt-1 w-full justify-center">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando…
              </>
            ) : magicLink ? (
              <>
                <Wand2 className="h-4 w-4" />
                Enviar link mágico
              </>
            ) : mode === "signin" ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMagicLink((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <Wand2 className="h-3.5 w-3.5" />
          {magicLink ? "Usar email e senha" : "Entrar com link mágico (sem senha)"}
        </button>
      </motion.div>

      <p className="mt-5 text-center text-[11px] text-[var(--color-muted)]">
        Ao continuar você concorda em organizar suas finanças com carinho. 💜
      </p>
    </div>
  );
}

function Notice({
  tone,
  icon: Icon,
  children,
}: {
  tone: "error" | "success" | "warn";
  icon: typeof AlertCircle;
  children: React.ReactNode;
}) {
  const tones = {
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  } as const;
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
        tones[tone],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
