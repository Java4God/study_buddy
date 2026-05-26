"use client";

import { useCallback, useState } from "react";
import { sendAssistantMessage, AssistantApiError } from "../lib/assistantApi";
import { AssistantMessage } from "../types/assistant";

function createMessage(role: AssistantMessage["role"], content: string) {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  } as AssistantMessage;
}

export function useAssistantConversation(initialMessages: AssistantMessage[]) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (rawMessage?: string) => {
      const nextMessage = (rawMessage ?? draft).trim();
      if (!nextMessage || isSending) return;

      const userMessage = createMessage("user", nextMessage);
      const conversation = [...messages, userMessage];

      setMessages(conversation);
      setDraft("");
      setIsSending(true);
      setError(null);

      try {
        const assistantMessage = await sendAssistantMessage({
          message: nextMessage,
          history: conversation.map(({ role, content }) => ({ role, content })),
        });
        setMessages((current) => [...current, assistantMessage]);
      } catch (caughtError) {
        const message =
          caughtError instanceof AssistantApiError
            ? caughtError.message
            : "The assistant API is unavailable right now.";
        setError(message);
        setMessages((current) => [
          ...current,
          createMessage("assistant", message),
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [draft, isSending, messages],
  );

  return { messages, draft, setDraft, isSending, error, sendMessage };
}
