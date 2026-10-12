import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const EXACT_PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/request",
  "/features",
  "/pricing",
  "/careers",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/favicon.ico",
]);

const PUBLIC_PREFIXES = ["/api/", "/_next/"];

const isPublicRoute = (pathname: string) => {
  if (EXACT_PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

const isResidentLogin = (pathname: string) => /^\/[^\/]+\/login$/.test(pathname);

const AUTH_SECRET = process.env.AUTH_SECRET || "fallback-secret-do-not-use-in-production";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function getRequiredRole(pathname: string): "ADMIN" | "DRIVER" | "RESIDENT" | null {
  if (pathname === "/dashboard") return "ADMIN";
  if (pathname.startsWith("/dashboard/admin")) return "ADMIN";
  if (pathname.startsWith("/dashboard/driver")) return "DRIVER";
  if (pathname.startsWith("/dashboard/resident")) return "RESIDENT";
  if (/^\/[^\/]+\/portal/.test(pathname)) return "RESIDENT";
  return null;
}

function redirectToRoleDashboard(role: string, orgSlug?: string): string {
  if (role === "ADMIN") return "/dashboard";
  if (role === "DRIVER") return "/dashboard/driver/routes";
  if (role === "RESIDENT" && orgSlug) return `/${orgSlug}/portal`;
  if (role === "RESIDENT") return "/login";
  return "/login";
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname) || isResidentLogin(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);
  if (!requiredRole) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    const redirectRes = NextResponse.redirect(new URL("/login", req.url));
    redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return redirectRes;
  }

  let decoded: { role?: string; orgSlug?: string } | null = null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(AUTH_SECRET));
    decoded = { role: payload.role as string, orgSlug: payload.orgSlug as string };
  } catch {
    const redirectRes = NextResponse.redirect(new URL("/login", req.url));
    redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return redirectRes;
  }

  if (decoded.role !== requiredRole) {
    const url = req.nextUrl.clone();
    url.pathname = redirectToRoleDashboard(decoded.role || "", decoded.orgSlug);
    const redirectRes = NextResponse.redirect(url);
    redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return redirectRes;
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
