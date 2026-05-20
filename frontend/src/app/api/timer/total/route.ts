import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import { POMODORO_SESSIONS } from "@/app/consts";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

async function fetchTotal(accessToken: string, id: string) {
  return axios.get(`${API_DOMAIN + POMODORO_SESSIONS}user/${id}`, {
    timeout: 10_000,
    validateStatus: () => true,
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
    let response = await fetchTotal(accessToken, id);

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await fetchTotal(accessToken, id);
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
