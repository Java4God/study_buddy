import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  callExternal,
  buildUrl,
  jsonError,
  extractMessage,
  externalError,
} from "./_shared";

export async function GET() {
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let res = await callExternal("get", buildUrl(""), undefined, accessToken);
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("get", buildUrl(""), undefined, accessToken);
    }

    if (res.status < 200 || res.status >= 400) {
      return jsonError(
        extractMessage(res.data) ?? "External API error",
        res.status,
      );
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    return externalError(error);
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let res = await callExternal("post", buildUrl("new"), payload, accessToken);
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("post", buildUrl("new"), payload, accessToken);
    }

    if (res.status < 200 || res.status >= 400) {
      return jsonError(
        extractMessage(res.data) ?? "External API error",
        res.status,
      );
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    return externalError(error);
  }
}
