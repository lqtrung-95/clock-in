import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/onboarding");
  const isCallbackPage = request.nextUrl.pathname.startsWith("/callback");
  // App routes that support guest mode — the 4-item nav plus settings.
  // Legacy paths (/dashboard, /stats, /social, ...) resolve via the
  // redirects in next.config.ts before middleware sees them, so they don't
  // need entries here.
  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/focus") ||
    request.nextUrl.pathname.startsWith("/today") ||
    request.nextUrl.pathname.startsWith("/insights") ||
    request.nextUrl.pathname.startsWith("/progress") ||
    request.nextUrl.pathname.startsWith("/settings");

  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    isDashboardRoute ||
    isAuthPage ||
    isCallbackPage;

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage && !request.nextUrl.pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/focus";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
