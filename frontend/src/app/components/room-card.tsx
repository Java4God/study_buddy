import { Clock, Globe, Lock, Users } from "lucide-react";
import Button from "./button";
import { Card, CardContent } from "./card";
import { Room } from "../(navbar)/rooms/_shared";

type Props = {
  room: Room;
  isOwner: boolean;
  isMember: boolean;
  onEnter: (room: Room) => void;
  onJoin: (room: Room) => void;
  onDelete: (room: Room) => void;
};

export default function RoomCard({
  room,
  isOwner,
  isMember,
  onEnter,
  onJoin,
  onDelete,
}: Props) {
  const primaryLabel = isOwner || isMember ? "Enter Room" : "Join Room";
  const primaryAction = isOwner || isMember ? onEnter : onJoin;

  return (
    <Card className="group rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg w-sm">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-3 font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                {room.name}
              </h3>
              <div className="text-sm text-slate-600">{room.subject}</div>
            </div>
            <div className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
              {room.isPrivate ? (
                <Lock className="size-4" />
              ) : (
                <Globe className="size-4" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{room.memberCount} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <span>Active</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Owner: {room.ownerUsername || "Unknown"}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => primaryAction(room)}>
              {isOwner ? "Open Room" : primaryLabel}
            </Button>
            {isOwner && (
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => onDelete(room)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
