import { parseAssistantRequest } from "./parser";
import { createStudyQuestions } from "./openAiAssistantService";
import { toAssistantErrorResponse, toAssistantResponse } from "./response";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const input = await parseAssistantRequest(req);
    const message = await createStudyQuestions(input);

    return toAssistantResponse(message);
  } catch (error) {
    return toAssistantErrorResponse(error);
  }
}
