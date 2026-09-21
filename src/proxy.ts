import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACADEMIC_HEAD"];

// Messaging is a cross-role feature (parents/teachers/staff message each
// other), so these paths stay open to every authenticated role even though
// they live inside the admin dashboard's route group.
const SHARED_PATHS = ["/portal", "/communication/messages"];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isSharedPath = SHARED_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (
    isLoggedIn &&
    !isSharedPath &&
    !ADMIN_ROLES.includes(req.auth?.user?.role as string) &&
    !isLoginPage
  ) {
    return NextResponse.redirect(new URL("/portal", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
