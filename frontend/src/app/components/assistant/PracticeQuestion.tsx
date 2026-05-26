"use client";

import React from "react";
import { Card, CardContent } from "../card";
import Textarea from "../textarea";
import Button from "../button";
import { Badge } from "../badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export interface PracticeQuestionProps {
  id: string;
  question: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
  userAnswer?: string;
  isSubmitted?: boolean;
  feedback?: string;
  onChange?: (id: string, value: string) => void;
  onSubmit?: (id: string) => void;
}

function getDifficultyColor(d?: "easy" | "medium" | "hard") {
  switch (d) {
    case "easy":
      return "bg-green-100 text-green-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "hard":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PracticeQuestion({
  id,
  question,
  subject,
  difficulty,
  userAnswer,
  isSubmitted,
  feedback,
  onChange,
  onSubmit,
}: PracticeQuestionProps) {
  return (
    <Card className="border-2 border-indigo-100">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="text-xs">Question</Badge>
          {difficulty && (
            <Badge className={`text-xs ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </Badge>
          )}
          {subject && (
            <Badge variant="secondary" className="text-xs">
              {subject}
            </Badge>
          )}
        </div>

        <p className="font-medium">{question}</p>

        {!isSubmitted ? (
          <div className="space-y-2">
            <Textarea
              value={userAnswer || ""}
              onChange={(e) => onChange?.(id, e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => onSubmit?.(id)}
                disabled={!userAnswer || userAnswer.trim() === ""}
              >
                <CheckCircle2 className="size-3" />
                Submit Answer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-slate-500 mb-1">Your Answer:</p>
              <p className="text-sm">{userAnswer}</p>
            </div>

            {feedback && (
              <div
                className={`flex gap-3 p-3 rounded-lg ${feedback.includes("correct") ? "bg-green-50 border border-green-200" : feedback.includes("right track") ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}
              >
                {feedback.includes("correct") ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : feedback.includes("right track") ? (
                  <AlertCircle className="size-5 text-yellow-600" />
                ) : (
                  <XCircle className="size-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {feedback.includes("correct")
                      ? "Correct! 🎉"
                      : feedback.includes("right track")
                        ? "Close! 💭"
                        : "Keep Trying! 💪"}
                  </p>
                  <p className="text-sm text-slate-700">{feedback}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
