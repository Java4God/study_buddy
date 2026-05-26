"use client";

import React from "react";
import Input from "../input";
import Button from "../button";
import { Send } from "lucide-react";

export default function Composer({
  value,
  setValue,
  onSend,
  disabled,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex gap-2">
        <Input
          value={value}
          setValue={setValue}
          placeholder="Ask me anything about studying..."
          wrapperClassName="flex-1"
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="gap-2"
        >
          <Send className="size-4" />
          Send
        </Button>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        💡 Pro tip: Try asking about study techniques, exam prep, or time
        management
      </p>
    </div>
  );
}
