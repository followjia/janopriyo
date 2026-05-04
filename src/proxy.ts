import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role as string | undefined;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isSystemDesignRoute = nextUrl.pathname.startsWith("/admin/system-design");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  // 1. Logged-in ইউজারদের login/register থেকে দূরে রাখো
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Admin route সুরক্ষা
  if (isAdminRoute) {
    // Login নেই → login এ পাঠাও
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // admin বা super_admin না হলে → home এ পাঠাও
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // /admin/system-design → শুধুমাত্র super_admin
    if (isSystemDesignRoute && role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
})

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
}
