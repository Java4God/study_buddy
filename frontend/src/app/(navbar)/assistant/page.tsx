"use client";

import AssistantPanel from "../../components/assistant/assistant-panel";

export default function AIAssistantPage() {
  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 w-full max-w-6xl ml-20 px-4 py-8">
        <header className="space-y-2 mb-4">
          <h1 className="text-3xl text-slate-900 mb-8">
            AI Study Assistant
          </h1>
        </header>

        <AssistantPanel />
      </div>
    </div>
  );
}
