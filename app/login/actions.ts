"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthMode = "signin" | "signup" | "magiclink";

export type AuthState =
  | { error?: string; message?: string; mode?: AuthMode }
  | undefined;

/** Only allow same-origin, non-protocol-relative redirect targets. */
function sanitizeNext(value: string): string {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

/** Map the most common Supabase auth errors to friendly PT-BR copy. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu email antes de entrar.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Este email já tem conta. Faça login.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas. Aguarde um instante e tente de novo.";
  if (m.includes("password"))
    return "A senha precisa ter ao menos 6 caracteres.";
  return message;
}

async function siteUrl(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? "";
}

/**
 * Handles the login form for all three modes: password sign-in, sign-up and
 * magic link. On success it redirects to `next`; otherwise it returns a state
 * object for `useActionState` to render.
 */
export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const mode = (String(formData.get("mode") ?? "signin") as AuthMode) || "signin";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNext(String(formData.get("next") ?? "/"));

  if (!isSupabaseConfigured()) {
    return {
      mode,
      error:
        "Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  if (!email) return { mode, error: "Informe seu email." };

  const supabase = await createClient();

  // ----- Magic link (passwordless) -----
  if (mode === "magiclink") {
    const origin = await siteUrl();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) return { mode, error: translateAuthError(error.message) };
    return {
      mode,
      message: "Link mágico enviado! Confira seu email para entrar.",
    };
  }

  // ----- Password flows -----
  if (!password) return { mode, error: "Informe sua senha." };
  if (password.length < 6)
    return { mode, error: "A senha precisa ter ao menos 6 caracteres." };

  if (mode === "signup") {
    const origin = await siteUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) return { mode, error: translateAuthError(error.message) };
    // When email confirmation is enabled there's no session yet.
    if (!data.session) {
      return {
        mode,
        message: "Conta criada! Confirme pelo link enviado ao seu email.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { mode, error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Ends the current session and returns the user to /login. */
export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
