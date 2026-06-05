import { CheckCircle2, UserCheck, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/app/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { getStatusMeta, initials, type RoomMember } from "../_shared";

type Props = {
  members: RoomMember[];
};

export default function MembersPanel({ members }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {members.map((member) => {
            const statusMeta = getStatusMeta(member.status);
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-indigo-100 text-xs text-indigo-600">
                    {initials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-sm">
                  {member.username}
                </p>
                <div className="flex items-center gap-2">
                  {statusMeta.icon}
                  <span className="text-xs text-slate-500">
                    {statusMeta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 space-y-2 rounded-2xl bg-slate-50 p-6 text-xs">
          <Legend icon={<UserCheck />} text="Studying" />
          <Legend icon={<CheckCircle2 />} text="Done" />
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="[&_svg]:size-3 [&_svg]:text-slate-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
