export type AssistantFileKind = "pdf" | "txt";

export interface AssistantHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantUploadedFile {
  name: string;
  type: string;
  size: number;
  kind: AssistantFileKind;
  buffer: Buffer;
}

export interface AssistantRequestInput {
  message: string;
  history: AssistantHistoryMessage[];
  file?: AssistantUploadedFile;
}
