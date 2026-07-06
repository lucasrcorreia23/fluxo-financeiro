/**
 * Central place for the Supabase connection env vars.
 *
 * Supports both the new publishable key (`sb_publishable_...`, recommended) and
 * the legacy anon JWT key — whichever is present. `NEXT_PUBLIC_*` vars are
 * inlined at build time, so these are safe to read from server or client code.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether Supabase auth is wired up. When the env vars are missing the app
 * falls back to its local (localStorage) mode and auth is skipped entirely —
 * so a fresh clone still runs without a backend.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}
