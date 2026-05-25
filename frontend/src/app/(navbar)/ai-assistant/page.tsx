"use client";

import AssistantPanel from "../../components/assistant/assistant-panel";

export default function AIPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          AI Study Assistant
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          A chat surface ready for a backend assistant API.
        </p>
      </header>

      <AssistantPanel />
    </div>
  );
}
