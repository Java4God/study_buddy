import axios from "axios";
import { cookies } from "next/headers";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${API_DOMAIN}${USERS}refresh`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );

    if (response.status < 200 || response.status >= 400) return null;

    const accessToken = response.data?.access_token;
    const nextRefreshToken = response.data?.refresh_token;

    if (typeof accessToken !== "string" || !accessToken) return null;

    cookieStore.set("auth_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (typeof nextRefreshToken === "string" && nextRefreshToken) {
      cookieStore.set("refresh_token", nextRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return accessToken;
  } catch {
    return null;
  }
}

export async function getAuthorizedToken() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  return accessToken;
}
