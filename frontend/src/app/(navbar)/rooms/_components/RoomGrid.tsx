import RoomCard from "@/app/components/room-card";
import type { Room } from "../_shared";

type Props = {
  rooms: Room[];
  memberships: Record<string, boolean>;
  currentUsername: string | null;
  onEnter: (room: Room) => void;
  onJoin: (room: Room) => void;
  onDelete: (room: Room) => void;
};

export default function RoomGrid({
  rooms,
  memberships,
  currentUsername,
  onEnter,
  onJoin,
  onDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => {
        const isOwner = currentUsername === room.ownerUsername;
        return (
          <RoomCard
            key={room.id}
            room={room}
            isOwner={isOwner}
            isMember={isOwner || Boolean(memberships[room.id])}
            onEnter={onEnter}
            onJoin={onJoin}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}
