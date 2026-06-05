import OpenAI, { APIError } from "openai";
import {
  ResponseInput,
  ResponseInputMessageContentList,
} from "openai/resources/responses/responses";
import { getOpenAiConfig, MAX_OUTPUT_TOKENS } from "./config";
import { AssistantRouteError } from "./errors";
import { buildQuestionPrompt, buildStudyQuestionInstructions } from "./prompt";
import { AssistantRequestInput } from "./types";

function createClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

function fileDataUrl(input: AssistantRequestInput) {
  if (!input.file || input.file.kind !== "pdf") return null;

  return `data:${input.file.type};base64,${input.file.buffer.toString("base64")}`;
}

function textFileContent(input: AssistantRequestInput) {
  if (!input.file || input.file.kind !== "txt") return null;

  return input.file.buffer.toString("utf8").trim();
}

function buildResponseInput(input: AssistantRequestInput): ResponseInput {
  const content: ResponseInputMessageContentList = [
    {
      type: "input_text",
      text: buildQuestionPrompt(input),
    },
  ];

  const textContent = textFileContent(input);
  if (textContent) {
    content.push({
      type: "input_text",
      text: `TXT lecture file content from ${input.file?.name}:\n\n${textContent}`,
    });
  }

  const fileData = fileDataUrl(input);
  if (input.file && fileData) {
    content.push({
      type: "input_file",
      filename: input.file.name,
      file_data: fileData,
    });
  }

  return [
    {
      role: "user",
      content,
    },
  ];
}

function messageForOpenAiError(error: APIError) {
  if (error.status === 401) {
    return "OpenAI API key is invalid or missing.";
  }

  if (error.status === 403 || error.status === 404) {
    return "OpenAI model is not available for this API key. Check OPENAI_MODEL.";
  }

  if (error.status === 429) {
    return "OpenAI rate limit or quota was reached. Try again later.";
  }

  if (error.status === 400) {
    return "OpenAI rejected the assistant request. Try a smaller or clearer lecture file.";
  }

  return "Assistant service is unavailable right now.";
}

function statusForOpenAiError(error: APIError) {
  if (error.status === 401 || error.status === 403 || error.status === 404) {
    return 500;
  }

  if (error.status === 429) {
    return 429;
  }

  if (error.status === 400) {
    return 400;
  }

  return 502;
}

export async function createStudyQuestions(input: AssistantRequestInput) {
  const config = getOpenAiConfig();

  if (!config.apiKey) {
    throw new AssistantRouteError("OpenAI API key is not configured.", 500);
  }

  try {
    const response = await createClient(config.apiKey).responses.create({
      model: config.model,
      instructions: buildStudyQuestionInstructions(config.maxQuestions),
      input: buildResponseInput(input),
      max_output_tokens: MAX_OUTPUT_TOKENS,
      reasoning: {
        effort: "minimal",
      },
      store: false,
    });

    const message = response.output_text?.trim();
    if (!message) {
      console.error("OpenAI assistant returned no visible output", {
        id: response.id,
        status: response.status,
        incompleteDetails: response.incomplete_details,
        usage: response.usage,
      });
      throw new AssistantRouteError(
        "Assistant could not generate visible output. Try again with a shorter lecture.",
        502,
      );
    }

    return message;
  } catch (error) {
    if (error instanceof AssistantRouteError) {
      throw error;
    }

    if (error instanceof APIError) {
      console.error("OpenAI assistant request failed", {
        status: error.status,
        code: error.code,
        type: error.type,
        requestID: error.requestID,
        message: error.message,
      });
      throw new AssistantRouteError(
        messageForOpenAiError(error),
        statusForOpenAiError(error),
      );
    }

    console.error("OpenAI assistant request failed", error);
    throw new AssistantRouteError(
      "Assistant service is unavailable right now.",
      502,
    );
  }
}
