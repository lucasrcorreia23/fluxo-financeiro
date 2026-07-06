import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Paths reachable without an authenticated session. */
const PUBLIC_PATHS = ["/login", "/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Refreshes the Supabase session on every request and gates protected routes.
 * Called from `proxy.ts` (Next.js 16 renamed Middleware → Proxy).
 *
 * When Supabase isn't configured the app runs in local mode, so we no-op and
 * let every request through.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL!,
    SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  // getUser() revalidates the auth token and, if refreshed, writes new cookies
  // via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Not signed in and trying to reach a protected page → send to /login,
  // remembering where they were headed.
  if (!user && !isPublicPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Already signed in but on the login page → bounce to the dashboard.
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Must return supabaseResponse as-is so refreshed auth cookies survive.
  return supabaseResponse;
}
