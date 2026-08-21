import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/api", "/_next", "/favicon.ico", "/features", "/pricing", "/careers", "/about", "/contact", "/privacy-policy", "/terms-of-service"];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route));

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
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let decoded: { role?: string; orgSlug?: string } | null = null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(AUTH_SECRET));
    decoded = { role: payload.role as string, orgSlug: payload.orgSlug as string };
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (decoded.role !== requiredRole) {
    const url = req.nextUrl.clone();
    url.pathname = redirectToRoleDashboard(decoded.role || "", decoded.orgSlug);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
