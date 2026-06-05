import { NextResponse } from "next/server";
import { AssistantRouteError } from "./errors";

export function toAssistantResponse(message: string, status = 200) {
  return NextResponse.json({ message }, { status });
}

export function toAssistantErrorResponse(error: unknown) {
  if (error instanceof AssistantRouteError) {
    return toAssistantResponse(error.message, error.status);
  }

  console.error("Unexpected assistant route error", error);
  return toAssistantResponse("Internal server error.", 500);
}
