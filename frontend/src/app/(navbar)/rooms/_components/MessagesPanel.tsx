import { Loader2, Send } from "lucide-react";
import Button from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { formatTime, type ChatMessage } from "../_shared";

type Props = {
  messages: ChatMessage[];
  draft: string;
  currentUsername: string | null;
  isMember: boolean;
  loading: boolean;
  sending: boolean;
  error: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export default function MessagesPanel({
  messages,
  draft,
  currentUsername,
  isMember,
  loading,
  sending,
  error,
  onDraftChange,
  onSend,
}: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur lg:col-span-3">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {error}
          </div>
        )}
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500">
              {isMember ? "No messages yet." : "Join the room to read messages."}
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                mine={message.senderUsername === currentUsername}
              />
            ))
          )}
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <textarea
            className="min-h-24 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={draft}
            disabled={!isMember || sending}
            maxLength={2000}
            placeholder={isMember ? "Write a message..." : "Join to chat"}
            onChange={(event) => onDraftChange(event.target.value)}
          />
          <Button type="submit" disabled={!isMember || sending || !draft.trim()}>
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`}>
        <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
          <span>{message.senderUsername}</span>
          <span>{formatTime(message.sentAt)}</span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
