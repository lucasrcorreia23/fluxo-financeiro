import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Browser Supabase client. Reads NEXT_PUBLIC_SUPABASE_URL and the publishable
 * key (or legacy anon key) from the environment — see lib/supabase/config.ts.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_KEY!);
}
