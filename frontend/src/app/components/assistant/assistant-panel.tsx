"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ScrollArea } from "../scroll-area";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import QuickPrompts from "./QuickPrompts";
import Composer from "./Composer";
import assistantDemoMessages from "./assistant-demo";
import { useAssistantConversation } from "../../hooks/useAssistantConversation";
import Button from "../button";
import { useState } from "react";

export default function AssistantPanel() {
  const { messages, draft, setDraft, isSending, sendMessage } =
    useAssistantConversation(assistantDemoMessages as any);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector(
      "input[type=file]",
    ) as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await fetch("/api/files", { method: "POST", body: fd });
      // show minimal success message in chat
      sendMessage(`I uploaded file: ${file.name}` as unknown as string);
    } catch (err) {
      // show error in chat
      sendMessage(`Failed to upload file: ${file.name}` as unknown as string);
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100%-5rem)]">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center gap-2">
          Study Buddy AI
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((m: any) => (
              <ChatMessage
                key={m.id}
                id={m.id}
                role={m.role}
                content={m.content}
                timestamp={m.timestamp}
              />
            ))}

            {isSending && <TypingIndicator />}
          </div>
        </ScrollArea>

        {messages.length <= 1 && <QuickPrompts onSelect={(q) => setDraft(q)} />}

        <div className="px-6 pb-4">
          <form onSubmit={handleFileUpload} className="flex items-center gap-2">
            <input type="file" name="file" className="" />
            <Button type="submit" disabled={uploading} className="gap-2">
              {uploading ? "Uploading..." : "Add file"}
            </Button>
          </form>
        </div>

        <Composer
          value={draft}
          setValue={setDraft}
          onSend={() => sendMessage()}
          disabled={isSending}
        />
      </CardContent>
    </Card>
  );
}
