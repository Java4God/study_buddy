export const DEFAULT_OPENAI_MODEL = "gpt-5-nano";
export const DEFAULT_MAX_FILE_MB = 10;
export const DEFAULT_MAX_QUESTIONS = 30;
export const MAX_TEXT_CHARACTERS = 20_000;
export const MAX_HISTORY_MESSAGES = 4;
export const MAX_HISTORY_MESSAGE_CHARACTERS = 1_000;
export const MAX_OUTPUT_TOKENS = 4_000;

export function getOpenAiConfig() {
  const maxFileMb = Number(process.env.OPENAI_ASSISTANT_MAX_FILE_MB);
  const maxQuestions = Number(process.env.OPENAI_ASSISTANT_MAX_QUESTIONS);

  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    maxQuestions:
      Number.isFinite(maxQuestions) && maxQuestions > 0
        ? Math.floor(maxQuestions)
        : DEFAULT_MAX_QUESTIONS,
    maxFileBytes:
      (Number.isFinite(maxFileMb) && maxFileMb > 0
        ? maxFileMb
        : DEFAULT_MAX_FILE_MB) *
      1024 *
      1024,
  };
}
