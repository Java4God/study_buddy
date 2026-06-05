import { Api } from "@/app/routes";
import { AssistantMessage } from "../types/assistant";
import { AssistantApiError } from "./assistantApi";

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const message = (data as { message?: unknown }).message;
  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

export async function sendAssistantFile(
  file: File,
  history: Array<Pick<AssistantMessage, "role" | "content">>,
): Promise<AssistantMessage> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("history", JSON.stringify(history));

  const response = await fetch(Api.ASSISTANT, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AssistantApiError(
      extractText(data) ??
        `Assistant file request failed with status ${response.status}`,
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
