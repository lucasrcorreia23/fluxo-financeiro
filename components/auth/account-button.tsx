"use client";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

/**
 * Shows the signed-in account + a sign-out button. Renders nothing when
 * Supabase isn't configured or no one is signed in (local mode), so the
 * existing UI is untouched until auth is turned on.
 */
export function AccountButton({ className }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!email) return null;

  const initial = email.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/5 px-2.5 py-2",
        className,
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
        {initial}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-[var(--color-muted)]">
        {email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
