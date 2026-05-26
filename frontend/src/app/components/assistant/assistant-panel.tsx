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
import { useState, useRef } from "react";

export default function AssistantPanel() {
  const { messages, draft, setDraft, isSending, sendMessage } =
    useAssistantConversation(assistantDemoMessages as any);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadFile(file: File | null) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await fetch("/api/files", { method: "POST", body: fd });
      sendMessage(`I uploaded file: ${file.name}` as unknown as string);
    } catch (err) {
      sendMessage(`Failed to upload file: ${file.name}` as unknown as string);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <ScrollArea className="p-6">
          <div className="space-y-6">

            <div className="overflow-auto h-[60vh] p-2">
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

                <div />
              </div>
            </div>
          </div>
        </ScrollArea>

        {messages.length <= 1 && <QuickPrompts onSelect={(q) => setDraft(q)} />}

        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                uploadFile(file);
              }}
            />
            <p className="text-sm text-gray-600">
              You can upload PDF or TXT files to generate practice questions
              from the document. Select a file and it will be processed
              automatically.
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? "Uploading..." : "Add file"}
            </Button>
          </div>
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
