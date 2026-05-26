"use client";

import React from "react";
import Button from "../button";
import { Lightbulb, Brain, Target, Clock } from "lucide-react";

const quickPrompts = [
  {
    icon: Lightbulb,
    text: "Give me study tips",
    query: "What are some effective study tips?",
  },
  {
    icon: Brain,
    text: "Help with flashcards",
    query: "How do I create effective flashcards?",
  },
  {
    icon: Target,
    text: "Exam prep strategy",
    query: "Help me prepare for an upcoming exam",
  },
  {
    icon: Clock,
    text: "Time management",
    query: "Give me time management tips for studying",
  },
];

export default function QuickPrompts({
  onSelect,
}: {
  onSelect: (q: string) => void;
}) {
  return (
    <div className="px-6 pb-4">
      <p className="text-sm text-gray-600 mb-3">Quick prompts:</p>
      <div className="grid grid-cols-2 gap-2">
        {quickPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            onClick={() => onSelect(prompt.query)}
          >
            <prompt.icon className="size-4 shrink-0" />
            <span className="text-left text-sm">{prompt.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
