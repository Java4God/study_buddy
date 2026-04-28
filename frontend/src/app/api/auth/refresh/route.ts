import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

interface RefreshApiResponse {
  access_token: string;
  refresh_token?: string;
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No refresh token provided" },
      { status: 401 },
    );
  }

  try {
    const { data } = await axios.post<RefreshApiResponse>(
      `${API_DOMAIN}${USERS}refresh`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

    const { access_token, refresh_token } = data;

    cookieStore.set("auth_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60, // 1 minute
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (refresh_token) {
      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Failed to refresh token";

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
