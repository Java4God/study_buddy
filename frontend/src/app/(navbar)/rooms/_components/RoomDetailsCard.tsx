import { CalendarClock, Lock, ShieldCheck, Users } from "lucide-react";
import Button from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { formatDate, type MemberStatus, type Room } from "../_shared";

type Props = {
  room: Room | null;
  memberCount: number;
  isMember: boolean;
  onStatus: (status: MemberStatus) => void;
};

export default function RoomDetailsCard({
  room,
  memberCount,
  isMember,
  onStatus,
}: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:col-span-2">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle>Room details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <Meta icon={<ShieldCheck />} text={room?.isPrivate ? "Private" : "Public"} />
            <Meta icon={<CalendarClock />} text={`Created ${formatDate(room?.createdAt ?? "")}`} />
            <Meta icon={<Users />} text={`${memberCount || room?.memberCount || 0} members`} />
            {room?.accessCode && <Meta icon={<Lock />} text={`Access code ${room.accessCode}`} />}
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your status
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["STUDYING", "ON_BREAK", "DONE"] as MemberStatus[]).map((s) => (
                <Button key={s} variant="outline" disabled={!isMember} onClick={() => onStatus(s)}>
                  {s === "ON_BREAK" ? "On break" : s === "DONE" ? "Done" : "Studying"}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {room?.description && (
          <p className="text-sm text-slate-600">{room.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 first:mt-0">
      <span className="[&_svg]:size-4 [&_svg]:text-slate-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
