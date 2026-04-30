import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const message = (data as { message?: unknown; error?: unknown }).message;
  if (typeof message === "string") {
    return message;
  }

  const error = (data as { error?: unknown }).error;
  if (typeof error === "string") {
    return error;
  }

  return undefined;
}

async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return null;
  }

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

    if (response.status < 200 || response.status >= 400) {
      return null;
    }

    const accessToken = response.data?.access_token;
    const nextRefreshToken = response.data?.refresh_token;

    if (typeof accessToken !== "string" || !accessToken) {
      return null;
    }

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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return null;
    }

    return null;
  }
}

async function fetchCurrentProfile(accessToken?: string) {
  return axios.get(`${API_DOMAIN}${USERS}me`, {
    timeout: 10_000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      return jsonError("Unauthorized", 401);
    }
  }

  try {
    let response = await fetchCurrentProfile(accessToken);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return jsonError("Unauthorized", 401);
      }

      response = await fetchCurrentProfile(accessToken);
    }

    if (response.status === 404) {
      return jsonError("User not found", 404);
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError(
        extractMessage(response.data) ?? "External API error",
        response.status,
      );
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        extractMessage(error.response?.data) ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}
