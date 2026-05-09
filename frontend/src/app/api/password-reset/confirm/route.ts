import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const message = (data as { message?: unknown; error?: unknown }).message;
  if (typeof message === "string") return message;

  const error = (data as { error?: unknown }).error;
  if (typeof error === "string") return error;

  return undefined;
}

function buildHeaders(accessToken?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function confirmPasswordReset(
  token: string,
  newPassword: string,
  accessToken?: string,
) {
  return axios.post(
    `${API_DOMAIN}password-reset/confirm`,
    { token, newPassword },
    {
      timeout: 10_000,
      validateStatus: () => true,
      headers: buildHeaders(accessToken),
    },
  );
}

export async function POST(request: Request) {
  let body: { token?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const token = body.token?.trim();
  const newPassword = body.newPassword ?? "";

  if (!token) {
    return jsonError("Token is required", 400);
  }

  if (!newPassword) {
    return jsonError("New password is required", 400);
  }

  let accessToken = await getAuthorizedToken();

  try {
    let response = await confirmPasswordReset(
      token,
      newPassword,
      accessToken ?? undefined,
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (accessToken) {
        response = await confirmPasswordReset(token, newPassword, accessToken);
      }
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
