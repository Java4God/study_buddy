import { getOpenAiConfig } from "./config";
import { AssistantRouteError } from "./errors";
import { AssistantRequestInput } from "./types";
import {
  sanitizeHistory,
  trimText,
  validateAssistantInput,
  validateUploadedFile,
} from "./validation";

function contentTypeOf(req: Request) {
  return req.headers.get("content-type")?.toLowerCase() ?? "";
}

export async function parseAssistantRequest(
  req: Request,
): Promise<AssistantRequestInput> {
  const contentType = contentTypeOf(req);

  if (contentType.includes("application/json")) {
    return parseJsonRequest(req);
  }

  if (contentType.includes("multipart/form-data")) {
    return parseMultipartRequest(req);
  }

  throw new AssistantRouteError(
    "Unsupported content type. Use JSON or multipart form data.",
    415,
  );
}

function parseHistory(rawHistory: FormDataEntryValue | null) {
  if (typeof rawHistory !== "string" || !rawHistory.trim()) return [];

  try {
    return sanitizeHistory(JSON.parse(rawHistory));
  } catch {
    throw new AssistantRouteError("Invalid assistant history.", 400);
  }
}

async function parseJsonRequest(req: Request): Promise<AssistantRequestInput> {
  const body = await req.json().catch(() => {
    throw new AssistantRouteError("Invalid JSON request body.", 400);
  });

  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message = trimText(
    typeof raw.message === "string"
      ? raw.message
      : typeof raw.content === "string"
        ? raw.content
        : "",
  );

  validateAssistantInput(message.length > 0, false);

  return {
    message,
    history: sanitizeHistory(raw.history),
  };
}

async function parseMultipartRequest(
  req: Request,
): Promise<AssistantRequestInput> {
  const config = getOpenAiConfig();
  const formData = await req.formData().catch(() => {
    throw new AssistantRouteError("Invalid multipart request body.", 400);
  });

  const rawFile = formData.get("file");
  const rawMessage = formData.get("message");
  const rawHistory = formData.get("history");

  const message = trimText(typeof rawMessage === "string" ? rawMessage : "");
  const history = parseHistory(rawHistory);

  if (!(rawFile instanceof File)) {
    validateAssistantInput(message.length > 0, false);
    return { message, history };
  }

  const file = await validateUploadedFile(rawFile, config.maxFileBytes);
  validateAssistantInput(message.length > 0, true);

  return {
    message,
    history,
    file,
  };
}
