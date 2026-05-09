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

async function requestPasswordReset(email: string, accessToken?: string) {
  return axios.post(
    `${API_DOMAIN}password-reset/request`,
    { email },
    {
      timeout: 10_000,
      validateStatus: () => true,
      headers: buildHeaders(accessToken),
    },
  );
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const email = body.email?.trim();
  if (!email) {
    return jsonError("Email is required", 400);
  }

  let accessToken = await getAuthorizedToken();

  try {
    let response = await requestPasswordReset(email, accessToken ?? undefined);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (accessToken) {
        response = await requestPasswordReset(email, accessToken);
      }
    }

    if (response.status === 404) {
      return NextResponse.json(
        { message: "If the account exists, a reset email has been sent." },
        { status: 200 },
      );
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
        extractMessage(error.response?.data) ??
        "If the account exists, a reset email has been sent.";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}
