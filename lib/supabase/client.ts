import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. The app currently runs on a localStorage-backed
 * store (see lib/data/*), so this is wired for when you flip to Supabase:
 * set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
