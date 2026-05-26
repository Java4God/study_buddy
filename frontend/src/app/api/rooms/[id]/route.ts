import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";
import { callExternal, buildUrl, jsonError, extractMessage } from "../_shared";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let res = await callExternal("get", buildUrl(id), undefined, accessToken);
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal("get", buildUrl(id), undefined, accessToken);
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let res = await callExternal(
      "delete",
      buildUrl(`delete/${id}`),
      undefined,
      accessToken,
    );
    if (res.status === 401 || res.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      res = await callExternal(
        "delete",
        buildUrl(`delete/${id}`),
        undefined,
        accessToken,
      );
    }

    if (res.status < 200 || res.status >= 400) {
      return jsonError(
        extractMessage(res.data) ?? "External API error",
        res.status,
      );
    }

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return jsonError(
      extractMessage(error?.response?.data) ?? "Internal server error",
      error?.response?.status ?? 500,
    );
  }
}
