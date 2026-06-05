import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  buildUrl,
  callExternal,
  externalError,
  extractMessage,
  jsonError,
} from "../../_shared";

function messagePath(id: string, request: Request) {
  const search = new URL(request.url).searchParams;
  const before = search.get("before");
  const limit = search.get("limit") ?? "50";
  const params = new URLSearchParams({ limit });
  if (!before) return `${id}/messages?${params}`;
  params.set("before", before);
  return `${id}/messages/before?${params}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return jsonError("Missing room id", 400);

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    const path = messagePath(id, request);
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
  } catch (error: unknown) {
    return externalError(error);
  }
}
