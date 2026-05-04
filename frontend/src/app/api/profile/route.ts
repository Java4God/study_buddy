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

async function fetchProfileById(id: string, accessToken?: string) {
  return axios.get(`${API_DOMAIN}${USERS}user-by-id/${id}`, {
    timeout: 10_000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonError("Missing user id", 400);
  }

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await fetchProfileById(id, accessToken);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return jsonError("Unauthorized", 401);
      }

      response = await fetchProfileById(id, accessToken);
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
