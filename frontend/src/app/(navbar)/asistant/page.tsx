"use client";

import AssistantPanel from "../../components/assistant/assistant-panel";

export default function AIAssistantPage() {
  return (
    <div className="w-full bg-switch-background/20">
      <div className="space-y-6 w-full max-w-6xl mx-auto px-4 py-8">
        <header className="space-y-2 mb-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            AI Study Assistant
          </h1>
          <p className="max-w-2xl text-sm text-gray-600">
            A chat surface ready for a backend assistant API, with demo messages
            shown below so you can verify the styling right away.
          </p>
        </header>

        <AssistantPanel />
      </div>
    </div>
  );
}
