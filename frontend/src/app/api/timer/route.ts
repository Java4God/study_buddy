import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const response = await axios.post(
      `${API_DOMAIN}${POMODORO_SESSIONS}/by-token`,
      { token },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

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

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const response = await axios.post(
      `${API_DOMAIN}${POMODORO_SESSIONS}/by-token/create`,
      {
        token,
        mode: payload.mode,
        durationMinutes: payload.durationMinutes,
        subject: payload.subject ?? null,
        completed: payload.completed ?? true,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      },
    );

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
