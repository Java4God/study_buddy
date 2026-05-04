import axios from "axios";
import { NextResponse } from "next/server";
import { USERS } from "@/app/consts";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

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

async function updateUserProfile(
  id: string,
  data: Record<string, unknown>,
  accessToken?: string,
) {
  return axios.put(`${API_DOMAIN}${USERS}update-user/${id}`, data, {
    timeout: 10_000,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

export async function PUT(request: Request) {
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const userId = body.id as string | undefined;
  if (!userId) {
    return jsonError("Missing user id", 400);
  }

  try {
    let response = await updateUserProfile(userId, body, accessToken);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return jsonError("Unauthorized", 401);
      }

      response = await updateUserProfile(userId, body, accessToken);
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
