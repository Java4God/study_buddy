import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import { POMODORO_SESSIONS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: toLocalDateString(from),
    to: toLocalDateString(to),
  };
}

async function fetchHeatmap(accessToken: string, from: string, to: string) {
  const searchParams = new URLSearchParams({ from, to });

  return axios.get(`${API_DOMAIN}${POMODORO_SESSIONS}heatmap?${searchParams}`, {
    timeout: 10_000,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const defaults = buildDefaultRange();
  const from = url.searchParams.get("from") ?? defaults.from;
  const to = url.searchParams.get("to") ?? defaults.to;

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await fetchHeatmap(accessToken, from, to);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await fetchHeatmap(accessToken, from, to);
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
