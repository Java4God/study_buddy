import { AssistantChatPayload, AssistantMessage } from "../types/assistant";

const DEFAULT_ASSISTANT_ENDPOINT = "/api/assistant";

export class AssistantApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AssistantApiError";
    this.status = status;
  }
}

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }

  return `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractText(data: unknown): string | null {
  if (typeof data === "string") return data.trim() || null;
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  const directCandidates = [
    raw.content,
    raw.message,
    raw.reply,
    raw.text,
    raw.answer,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }

  const nested = raw.data;
  if (nested && typeof nested === "object") {
    return extractText(nested);
  }

  return null;
}

function getAssistantEndpoint() {
  return (
    process.env.NEXT_PUBLIC_ASSISTANT_API_URL ?? DEFAULT_ASSISTANT_ENDPOINT
  );
}

export async function sendAssistantMessage(
  payload: AssistantChatPayload,
): Promise<AssistantMessage> {
  const response = await fetch(getAssistantEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: payload.message,
      content: payload.message,
      history: payload.history,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AssistantApiError(
      extractText(data) ??
        `Assistant API request failed with status ${response.status}`,
      response.status,
    );
  }

  const content = extractText(data);
  if (!content) {
    throw new AssistantApiError("Assistant API returned no response content.");
  }

  return {
    id: createMessageId(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
  };
}
