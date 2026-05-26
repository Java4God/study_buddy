export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  timestamp: string;
}

export interface AssistantChatPayload {
  message: string;
  history: Array<Pick<AssistantMessage, "role" | "content">>;
}
