import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: Middleware is now called Proxy (same functionality).
// Runs before every matched request to refresh the Supabase session and gate
// protected routes.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (build assets)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static image files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
