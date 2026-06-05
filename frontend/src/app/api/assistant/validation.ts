import {
  MAX_HISTORY_MESSAGE_CHARACTERS,
  MAX_HISTORY_MESSAGES,
  MAX_TEXT_CHARACTERS,
} from "./config";
import { AssistantRouteError } from "./errors";
import {
  AssistantFileKind,
  AssistantHistoryMessage,
  AssistantUploadedFile,
} from "./types";

const ALLOWED_FILE_TYPES: Record<AssistantFileKind, string[]> = {
  pdf: ["application/pdf"],
  txt: ["text/plain"],
};

function extensionFor(filename: string) {
  return filename.toLowerCase().split(".").pop() ?? "";
}

export function trimText(value: string, maxLength = MAX_TEXT_CHARACTERS) {
  return value.trim().slice(0, maxLength);
}

export function sanitizeHistory(history: unknown): AssistantHistoryMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object";
    })
    .filter((item) => item.role === "user" || item.role === "assistant")
    .map((item) => ({
      role: item.role as AssistantHistoryMessage["role"],
      content: trimText(
        typeof item.content === "string" ? item.content : "",
        MAX_HISTORY_MESSAGE_CHARACTERS,
      ),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES);
}

export function resolveFileKind(file: File): AssistantFileKind {
  const extension = extensionFor(file.name);

  if (extension === "pdf" && ALLOWED_FILE_TYPES.pdf.includes(file.type)) {
    return "pdf";
  }

  if (
    extension === "txt" &&
    (ALLOWED_FILE_TYPES.txt.includes(file.type) || file.type === "")
  ) {
    return "txt";
  }

  throw new AssistantRouteError("Only PDF and TXT files are supported.", 400);
}

export async function validateUploadedFile(
  file: File,
  maxFileBytes: number,
): Promise<AssistantUploadedFile> {
  if (file.size <= 0) {
    throw new AssistantRouteError("Uploaded file is empty.", 400);
  }

  if (file.size > maxFileBytes) {
    throw new AssistantRouteError("Uploaded file is too large.", 413);
  }

  const kind = resolveFileKind(file);
  const arrayBuffer = await file.arrayBuffer();

  return {
    name: file.name,
    type: file.type || (kind === "pdf" ? "application/pdf" : "text/plain"),
    size: file.size,
    kind,
    buffer: Buffer.from(arrayBuffer),
  };
}

export function validateAssistantInput(hasText: boolean, hasFile: boolean) {
  if (!hasText && !hasFile) {
    throw new AssistantRouteError(
      "Provide lecture text or upload a PDF/TXT file.",
      400,
    );
  }
}
