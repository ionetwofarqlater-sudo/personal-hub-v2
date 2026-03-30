import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Забанений або pending юзер з JWT — виганяємо
  if (session && session.user.status !== "active") {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/api/saved") ||
      pathname.startsWith("/api/user")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (session.user.role !== "admin") return NextResponse.redirect(new URL("/403", req.url));
  }

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && session.user.status === "active" && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/saved/:path*", "/api/user/:path*"]
};
