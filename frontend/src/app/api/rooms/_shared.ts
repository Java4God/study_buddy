import axios, { AxiosRequestConfig } from "axios";
import { NextResponse } from "next/server";

const API_DOMAIN = process.env.API_DOMAIN ?? "";
const ROOMS = "rooms";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const message = (data as { message?: unknown }).message;
  if (typeof message === "string") return message;
  const error = (data as { error?: unknown }).error;
  if (typeof error === "string") return error;
  return undefined;
}

function buildUrl(path = "") {
  const suffix = path ? `/${path}` : "";
  return `${API_DOMAIN}${ROOMS}${suffix}`;
}

type HttpMethod = "get" | "post" | "put" | "delete";

async function callExternal(
  method: HttpMethod,
  url: string,
  data?: unknown,
  accessToken?: string,
) {
  const opts: AxiosRequestConfig = { timeout: 10_000, headers: {} };
  if (!opts.headers) opts.headers = {};
  if (accessToken)
    (opts.headers as Record<string, string>).Authorization =
      `Bearer ${accessToken}`;

  if (method === "get")
    return axios.get(url, { ...opts, validateStatus: () => true });
  if (method === "post")
    return axios.post(url, data, {
      ...opts,
      validateStatus: () => true,
      headers: { ...(opts.headers || {}), "Content-Type": "application/json" },
    });
  if (method === "put")
    return axios.put(url, data, {
      ...opts,
      validateStatus: () => true,
      headers: { ...(opts.headers || {}), "Content-Type": "application/json" },
    });
  if (method === "delete")
    return axios.delete(url, { ...opts, validateStatus: () => true });
  throw new Error("Unsupported method");
}

export { jsonError, extractMessage, buildUrl, callExternal };
