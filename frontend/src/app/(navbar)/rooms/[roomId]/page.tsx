"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import MembersPanel from "../_components/MembersPanel";
import MessagesPanel from "../_components/MessagesPanel";
import RoomDetailsCard from "../_components/RoomDetailsCard";
import RoomHeader from "../_components/RoomHeader";
import { useRoomChat } from "../_hooks/useRoomChat";
import { useRoomDetails } from "../_hooks/useRoomDetails";
import { toMessage } from "../_shared";

type RoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const { roomId } = use(params);
  const detail = useRoomDetails(roomId);
  const chat = useRoomChat(roomId, detail.isMember);

  const handleBack = () => router.push("/rooms");
  const runAction = async (action: () => Promise<void>, redirect = false) => {
    try {
      await action();
      if (redirect) router.push("/rooms");
    } catch (error) {
      detail.setError(toMessage(error, "Room action failed."));
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-switch-background/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-8">
        <RoomHeader
          room={detail.room}
          isOwner={detail.isOwner}
          isMember={detail.isMember}
          onBack={handleBack}
          onJoin={() => runAction(detail.joinRoom)}
          onLeave={() => runAction(detail.leaveRoom, true)}
          onDelete={() => runAction(detail.deleteRoom, true)}
        />

        {detail.error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {detail.error}
          </div>
        )}

        {detail.loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-slate-600">
            <Loader2 className="size-5 animate-spin text-indigo-600" />
            Loading room details...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RoomDetailsCard
              room={detail.room}
              memberCount={detail.members.length}
              isMember={detail.isMember}
              onStatus={(status) => runAction(() => detail.updateStatus(status))}
            />
            <MembersPanel members={detail.members} />
            <MessagesPanel
              messages={chat.messages}
              draft={chat.draft}
              currentUsername={detail.currentUsername}
              isMember={detail.isMember}
              loading={chat.loadingMessages}
              sending={chat.sending}
              error={chat.chatError}
              onDraftChange={chat.setDraft}
              onSend={chat.sendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
