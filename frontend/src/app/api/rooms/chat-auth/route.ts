import { NextResponse } from "next/server";
import { getAuthorizedToken } from "@/app/lib/auth";
import { jsonError } from "../_shared";

function wsUrl() {
  const apiDomain = process.env.API_DOMAIN ?? "";
  const base = apiDomain.replace(/\/$/, "");
  return `${base.replace(/^http/, "ws")}/ws`;
}

export async function GET() {
  const accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);
  return NextResponse.json({ accessToken, wsUrl: wsUrl() });
}
