import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

interface LoginRequestBody {
  username: string;
  password: string;
}

interface ExternalApiResponse {
  access_token: string;
  refresh_token: string;
}

export async function POST(req: Request) {
  const { username, password }: LoginRequestBody = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: "Missing required fields: username, password" },
      { status: 400 },
    );
  }

  try {
    const { data } = await axios.post<ExternalApiResponse>(
      `${API_DOMAIN}${USERS}login`,
      { username, password },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

    const { access_token } = data;

    const cookieStore = await cookies();
    cookieStore.set("auth_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
