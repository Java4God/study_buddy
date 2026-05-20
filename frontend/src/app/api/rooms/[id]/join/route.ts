import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  callExternal,
  buildUrl,
  jsonError,
  extractMessage,
} from "../../_shared";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  console.log("Joining room with id:", id);
  if (!id) return jsonError("Missing room id", 400);

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    const path = `${id}/join`;
    let res = await callExternal(
      "post",
      buildUrl(path),
      undefined,
      accessToken,
    );
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("post", buildUrl(path), undefined, accessToken);
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
