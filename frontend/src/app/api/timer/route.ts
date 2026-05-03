import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

const API_DOMAIN = process.env.API_DOMAIN ?? "";
const POMODORO_SESSIONS = "pomodoro-sessions";

type PomodoroMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

interface PomodoroRequestBody {
  mode: PomodoroMode;
  durationMinutes: number;
  subject?: string;
  completed?: boolean;
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const maybeMessage = (data as { message?: unknown; error?: unknown }).message;
  if (typeof maybeMessage === "string") {
    return maybeMessage;
  }

  const maybeError = (data as { error?: unknown }).error;
  if (typeof maybeError === "string") {
    return maybeError;
  }

  return undefined;
}

function isPomodoroRequestBody(
  payload: unknown,
): payload is PomodoroRequestBody {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const body = payload as Partial<PomodoroRequestBody>;
  const validMode =
    body.mode === "FOCUS" ||
    body.mode === "SHORT_BREAK" ||
    body.mode === "LONG_BREAK";

  return (
    validMode &&
    typeof body.durationMinutes === "number" &&
    Number.isFinite(body.durationMinutes) &&
    body.durationMinutes > 0
  );
}
export async function GET() {
  let token = await getAuthorizedToken();

  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  try {
    let response = await axios.post(
      `${API_DOMAIN}${POMODORO_SESSIONS}/by-token`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );

    if (response.status === 401 || response.status === 403) {
      token = await refreshAccessToken();
      if (!token) {
        return jsonError("Unauthorized", 401);
      }

      response = await axios.post(
        `${API_DOMAIN}${POMODORO_SESSIONS}/by-token`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10_000,
          validateStatus: () => true,
        },
      );
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError(
        extractMessage(response.data) ?? "External API error",
        response.status,
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

    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  const payload = await req.json();

  if (!isPomodoroRequestBody(payload)) {
    return jsonError("Invalid pomodoro payload", 400);
  }

  let token = await getAuthorizedToken();

  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  try {
    let response = await axios.post(
      `${API_DOMAIN}${POMODORO_SESSIONS}/by-token/create`,
      {
        token,
        mode: payload.mode,
        durationMinutes: payload.durationMinutes,
        subject: payload.subject ?? null,
        completed: payload.completed ?? true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );

    if (response.status === 401 || response.status === 403) {
      token = await refreshAccessToken();
      if (!token) {
        return jsonError("Unauthorized", 401);
      }

      response = await axios.post(
        `${API_DOMAIN}${POMODORO_SESSIONS}/by-token/create`,
        {
          token,
          mode: payload.mode,
          durationMinutes: payload.durationMinutes,
          subject: payload.subject ?? null,
          completed: payload.completed ?? true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10_000,
          validateStatus: () => true,
        },
      );
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError(
        extractMessage(response.data) ?? "External API error",
        response.status,
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

    return jsonError("Internal server error", 500);
  }
}
