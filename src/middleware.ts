import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/api", "/_next", "/favicon.ico"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/request")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const sessionToken = req.cookies.get("auth-token");
    if (!sessionToken?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
