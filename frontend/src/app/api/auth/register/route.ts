import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

interface RegisterRequestBody {
  email: string;
  password: string;
  username: string;
}

interface ExternalApiResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export async function POST(req: Request) {
  const { email, password, username }: RegisterRequestBody = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json(
      { message: "Missing required fields: email, password, username" },
      { status: 400 },
    );
  }
  try {
    const { data } = await axios.post<ExternalApiResponse>(
      `${API_DOMAIN}${USERS}register-user`,
      { email, password, username },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

    const { token, user } = data;

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";

      return NextResponse.json({ message }, { status });
    }

    console.error("[register] Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
