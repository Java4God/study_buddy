import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Pages, RESTRICTED_PAGES } from "@/app/routes";
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === Pages.LOGIN;
  const isRestrictedPage = RESTRICTED_PAGES.some((page) =>
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

      if (!refreshResponse.ok) {
        const bodyText = await refreshResponse.text().catch(() => null);
        console.error(
          "Token refresh request returned non-OK:",
          refreshResponse.status,
          refreshResponse.statusText,
          bodyText,
        );
      }
    } catch (error) {
      // Log full error details including AggregateError inner errors if present
      console.error("Token refresh failed:", error);
    }
  }

  if (isRestrictedPage && !hasValidToken) {
    return NextResponse.redirect(new URL(Pages.LOGIN, request.url));
  }

  if (isLoginPage && hasValidToken) {
    return NextResponse.redirect(new URL(Pages.DASHBOARD, request.url));
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
    "/assistant/:path*",
    "/profile/:path*",
  ],
};
