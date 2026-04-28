import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { USERS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

interface UserDto {
  uuid?: string;
  username?: string;
  email?: string;
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

async function fetchUserById(id: string, token: string) {
  return axios.get<UserDto>(
    `${API_DOMAIN}${USERS}user/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10_000,
    },
  );
}

async function fetchCurrentUserByToken(token: string) {
  return axios.post<UserDto>(
    `${API_DOMAIN}${USERS}user/by-token`,
    { token },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    },
  );
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const requestedId = searchParams.get("id")?.trim();

  try {
    const meResponse = await fetchCurrentUserByToken(token);
    const me = meResponse.data;
    const currentUserId = me.uuid;

    if (!currentUserId) {
      return jsonError("Invalid user data", 500);
    }

    const shouldReturnOwnProfile =
      !requestedId || requestedId === "me" || requestedId === currentUserId;

    if (shouldReturnOwnProfile) {
      return NextResponse.json(
        {
          id: currentUserId,
          username: me.username ?? "Unknown user",
          email: me.email ?? null,
          isOwnProfile: true,
        },
        { status: 200 },
      );
    }

    const response = await fetchUserById(requestedId, token);
    const data = response.data;

    return NextResponse.json(
      {
        id: data.uuid ?? requestedId,
        username: data.username ?? "Unknown user",
        email: null,
        isOwnProfile: false,
      },
      { status: 200 },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };
  const email = body.email?.trim();

  if (!email) {
    return jsonError("Email is required", 400);
  }

  try {
    const response = await axios.post(
      `${API_DOMAIN}password-reset/request`,
      { email },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Failed to request password reset";
      return jsonError(message, status);
    }

    return jsonError("Internal server error", 500);
  }
}
