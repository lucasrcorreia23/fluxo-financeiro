import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Entrar · Fluxo",
  description: "Acesse sua organização financeira.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {/* backdrop glow */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(120%_100%_at_50%_-10%,rgba(99,102,241,0.18),transparent_60%)]" />
      <Suspense fallback={null}>
        <LoginForm configured={isSupabaseConfigured()} />
      </Suspense>
    </main>
  );
}
