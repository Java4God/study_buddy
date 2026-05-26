import { AssistantMessage } from "../../types/assistant";

export const assistantDemoMessages: AssistantMessage[] = [
  {
    id: "demo-assistant-1",
    role: "assistant",
    content:
      "Welcome to Study Buddy AI. Ask me about revision plans, exam prep, or study routines once the backend endpoint is connected.",
    timestamp: "2026-05-25T08:00:00.000Z",
  },
  {
    id: "demo-user-1",
    role: "user",
    content: "I need a focused plan for calculus this week.",
    timestamp: "2026-05-25T08:01:00.000Z",
  },
  {
    id: "demo-assistant-2",
    role: "assistant",
    content:
      "This layout is ready for live replies from the backend API. The styling should already feel close to the final experience.",
    timestamp: "2026-05-25T08:01:20.000Z",
  },
];

export default assistantDemoMessages;
