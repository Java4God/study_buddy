import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  callExternal,
  buildUrl,
  jsonError,
  extractMessage,
  externalError,
} from "../../_shared";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return jsonError("Missing room id", 400);

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object" || !("status" in payload)) {
      return jsonError("Status is required", 400);
    }

    const path = `${id}/status`;
    let res = await callExternal("put", buildUrl(path), payload, accessToken);
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("put", buildUrl(path), payload, accessToken);
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
