import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

const API_DOMAIN = process.env.API_DOMAIN ?? "";
const EXAMS = "exams";

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

async function fetchNextExams(accessToken: string) {
  return axios.get(`${API_DOMAIN}${EXAMS}/next`, {
    timeout: 10_000,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

export async function GET() {
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await fetchNextExams(accessToken);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await fetchNextExams(accessToken);
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError(
        extractMessage(response.data) ?? "External API error",
        response.status,
      );
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        extractMessage(error.response?.data) ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error", 500);
  }
}
