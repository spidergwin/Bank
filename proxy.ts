import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Account lock protection
  const transactionalRoutes = ["/transfer", "/withdraw"];
  if (session.user.isLocked && transactionalRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin protection
  if (request.nextUrl.pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/transfer",
    "/withdraw",
    "/transactions"
  ],
};

