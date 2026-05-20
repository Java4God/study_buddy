import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import {
  callExternal,
  buildUrl,
  jsonError,
  extractMessage,
} from "../../../rooms/_shared";

export async function GET(
  _req: Request,
  { params }: { params: { accessCode: string } },
) {
  const { accessCode } = params;
  if (!accessCode) return jsonError("Missing access code", 400);

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    const path = `by-code/${accessCode}`;
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
