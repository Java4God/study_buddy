import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const API_DOMAIN = process.env.API_DOMAIN ?? "";
const EXAMS = "exams";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const message = (data as { message?: unknown }).message;
  if (typeof message === "string") return message;
  return undefined;
}

async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${API_DOMAIN}users/refresh`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );

    if (response.status < 200 || response.status >= 400) return null;

    const accessToken = response.data?.access_token;
    const nextRefreshToken = response.data?.refresh_token;

    if (typeof accessToken !== "string" || !accessToken) return null;

    cookieStore.set("auth_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (typeof nextRefreshToken === "string" && nextRefreshToken) {
      cookieStore.set("refresh_token", nextRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return accessToken;
  } catch (error) {
    return null;
  }
}

async function callExternal(
  method: string,
  url: string,
  data?: unknown,
  accessToken?: string,
) {
  const opts: any = { timeout: 10_000, headers: {} };
  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`;
  if (method === "get") return axios.get(url, opts);
  if (method === "post")
    return axios.post(url, data, {
      ...opts,
      headers: { ...(opts.headers || {}), "Content-Type": "application/json" },
    });
  if (method === "put")
    return axios.put(url, data, {
      ...opts,
      headers: { ...(opts.headers || {}), "Content-Type": "application/json" },
    });
  if (method === "delete") return axios.delete(url, opts);
  throw new Error("Unsupported method");
}

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) return jsonError("Unauthorized", 401);
  }

  try {
    let response = await callExternal(
      "get",
      `${API_DOMAIN}${EXAMS}`,
      undefined,
      accessToken,
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await callExternal(
        "get",
        `${API_DOMAIN}${EXAMS}`,
        undefined,
        accessToken,
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
    return jsonError("Internal server error");
  }
}

export async function POST(req: Request) {
  const payload = await req.json();
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) return jsonError("Unauthorized", 401);
  }

  try {
    let response = await callExternal(
      "post",
      `${API_DOMAIN}${EXAMS}`,
      payload,
      accessToken,
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await callExternal(
        "post",
        `${API_DOMAIN}${EXAMS}`,
        payload,
        accessToken,
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
    return jsonError("Internal server error");
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonError("Missing exam id", 400);
  }

  const payload = await req.json();
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) return jsonError("Unauthorized", 401);
  }

  try {
    let response = await callExternal(
      "put",
      `${API_DOMAIN}${EXAMS}/${id}`,
      payload,
      accessToken,
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await callExternal(
        "put",
        `${API_DOMAIN}${EXAMS}/${id}`,
        payload,
        accessToken,
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
    return jsonError("Internal server error");
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonError("Missing exam id", 400);
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("auth_token")?.value ?? null;

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) return jsonError("Unauthorized", 401);
  }

  try {
    let response = await callExternal(
      "delete",
      `${API_DOMAIN}${EXAMS}/${id}`,
      undefined,
      accessToken,
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await callExternal(
        "delete",
        `${API_DOMAIN}${EXAMS}/${id}`,
        undefined,
        accessToken,
      );
    }

    return NextResponse.json({ status: response.status });
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
