import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  buildUrl,
  callExternal,
  extractMessage,
  jsonError,
} from "../../_shared";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    const path = `${id}/members`;
    let res = await callExternal("get", buildUrl(path), undefined, accessToken);
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("get", buildUrl(path), undefined, accessToken);
    }

    if (res.status < 200 || res.status >= 400) {
      return jsonError(
        extractMessage(res.data) ?? "External API error",
        res.status,
      );
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return jsonError(
      extractMessage(error?.response?.data) ?? "Internal server error",
      error?.response?.status ?? 500,
    );
  }
}
