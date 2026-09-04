import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { siteConfig } from "@/user-control/site-config";

const PROTECTED_ROUTES = ["/dashboard", "/admin"];
// Role gating (admin-only) happens in src/app/(admin)/layout.tsx via a DB
// read — the session cookie here only proves a session exists, not role.
const AUTH_ROUTES = ["/login", "/register", "/verify-email"];

// Route prefixes gated by a site-config.ts module flag. Without this,
// turning a module off only hid its sidebar link and Quick Actions entry —
// the page and its API routes stayed fully reachable and functional by
// direct URL. Each entry covers both the dashboard page(s) and the
// matching API route(s) for that module.
const MODULE_ROUTES: Array<{ prefixes: string[]; enabled: boolean }> = [
  {
    prefixes: ["/dashboard/chat", "/api/ai/chat"],
    enabled: siteConfig.features.modules.ai && siteConfig.features.ai.chat,
  },
  {
    prefixes: ["/dashboard/image-lab", "/api/ai/image"],
    enabled: siteConfig.features.modules.ai && siteConfig.features.ai.imageGeneration,
  },
  {
    prefixes: ["/dashboard/knowledge-base", "/api/ai/rag", "/api/knowledge-base"],
    enabled: siteConfig.features.modules.ai && siteConfig.features.ai.knowledgeBase,
  },
  {
    prefixes: ["/dashboard/products", "/api/products"],
    enabled: siteConfig.features.modules.shop,
  },
  {
    prefixes: ["/dashboard/orders", "/api/shop"],
    enabled: siteConfig.features.modules.shop,
  },
  {
    prefixes: ["/dashboard/posts", "/api/posts"],
    enabled: siteConfig.features.modules.content,
  },
  {
    prefixes: ["/dashboard/leads", "/api/leads"],
    enabled: siteConfig.features.modules.leads,
  },
  {
    prefixes: ["/dashboard/projects", "/api/projects"],
    enabled: siteConfig.features.modules.projects,
  },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/webhooks")
  ) {
    return NextResponse.next();
  }

  // Block disabled modules before any auth/routing logic. App Router has
  // no rewrite target for its built-in not-found.tsx from middleware —
  // notFound()/not-found.tsx only works from within a page/layout. So we
  // return a plain 404 Response directly here instead.
  for (const module of MODULE_ROUTES) {
    if (module.enabled) continue;
    if (module.prefixes.some((p) => pathname.startsWith(p))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "This feature is not enabled." }, { status: 404 });
      }
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
