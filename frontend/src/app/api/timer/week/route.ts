import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

async function fetchWeek(accessToken: string) {
  return axios.get(`${API_DOMAIN}pomodoro-sessions/week`, {
    timeout: 10_000,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET() {
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await fetchWeek(accessToken);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await fetchWeek(accessToken);
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError("External API error", response.status);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }
    return jsonError("Internal server error", 500);
  }
}
