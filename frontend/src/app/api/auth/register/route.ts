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
  access_token?: string;
  refresh_token?: string;
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

    const { access_token, refresh_token } = data;

    const cookieStore = await cookies();
    cookieStore.set("auth_token", access_token ?? "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    cookieStore.set("refresh_token", refresh_token ?? "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json(data, { status: 201 });
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
