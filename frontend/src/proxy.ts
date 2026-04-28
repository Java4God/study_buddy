import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const restrictedPages = [
  "/dashboard",
  "/timer",
  "/rooms",
  "/flashcards",
  "/exams",
  "/ai-assistant",
  "/profile",
];
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isRestrictedPage = restrictedPages.some((page) =>
    pathname.startsWith(page),
  );

  let hasValidToken = Boolean(token);

  if (!hasValidToken && refreshToken) {
    try {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      });

      hasValidToken = refreshResponse.ok;
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }

  if (isRestrictedPage && !hasValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/timer/:path*",
    "/rooms/:path*",
    "/flashcards/:path*",
    "/exams/:path*",
    "/ai-assistant/:path*",
    "/profile/:path*",
  ],
};
