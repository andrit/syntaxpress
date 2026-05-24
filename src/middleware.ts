import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware';

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
// Runs on every matched route. Two responsibilities:
// 1. Refresh Supabase auth tokens (keeps session alive)
// 2. Protect /admin/* routes — redirect unauthenticated users to login
//
// Storefront routes are completely unaffected.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip if Supabase is not configured ──
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // If someone tries to access /admin without Supabase configured,
    // show a helpful message instead of crashing.
    if (pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/not-configured';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── Refresh auth session (all routes) ──
  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Protect /admin routes ──
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (!user && !isLoginPage) {
      // Not authenticated → redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
      // Already authenticated → redirect to dashboard
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/admin/dashboard';
      const url = request.nextUrl.clone();
      url.pathname = redirectTo;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all /admin routes
    '/admin/:path*',
    // Also refresh auth tokens on API routes (for future admin API endpoints)
    '/api/admin/:path*',
  ],
};
