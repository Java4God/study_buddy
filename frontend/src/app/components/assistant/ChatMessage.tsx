"use client";

import React from "react";
import { Avatar, AvatarFallback } from "../avatar";
import { Sparkles } from "lucide-react";

export interface MessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string | Date;
  initials?: string;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  initials,
}: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar>
        {isUser ? (
          <AvatarFallback className="bg-indigo-100 text-indigo-600">
            {initials ?? "U"}
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles className="size-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 max-w-[80%] space-y-3">
        <div
          className={`${isUser ? "bg-indigo-500 text-white rounded-2xl rounded-tr-sm" : "border border-slate-200 bg-white text-slate-900 rounded-2xl rounded-tl-sm"} px-4 py-3`}
        >
          <p className="whitespace-pre-line leading-relaxed">{content}</p>
          <p
            className={`text-xs mt-2 ${isUser ? "text-indigo-100" : "text-slate-500"}`}
          >
            {new Date(timestamp).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
