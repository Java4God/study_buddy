import Button from "@/app/components/button";
import type { Room } from "../_shared";

type Props = {
  room: Room | null;
  isOwner: boolean;
  isMember: boolean;
  onBack: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
};

export default function RoomHeader({
  room,
  isOwner,
  isMember,
  onBack,
  onJoin,
  onLeave,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="mb-2 text-3xl">{room?.name ?? "Study Room"}</h1>
        <p className="text-gray-600">{room?.subject || "General study topic"}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Back to All Rooms
        </Button>
        {isOwner ? (
          <Button variant="outline" onClick={onDelete}>
            Delete Room
          </Button>
        ) : isMember ? (
          <Button variant="outline" onClick={onLeave}>
            Leave Room
          </Button>
        ) : (
          <Button onClick={onJoin}>Join Room</Button>
        )}
      </div>
    </div>
  );
}
