"use client";

import { use, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import Button from "../../../components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/card";
import { Avatar, AvatarFallback } from "@/app/components/avatar";
import {
  formatDate,
  getStatusMeta,
  initials,
  mapMember,
  mapRoom,
  type MemberStatus,
  type Room,
  type RoomMember,
} from "../_shared";

function toMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      fallback
    );
  }
  return fallback;
}

type RoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const { roomId } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRoom = useCallback(async () => {
    setError("");

    try {
      const [roomResponse, membersResponse, profileResponse] =
        await Promise.all([
          axios.get(`/api/rooms/${roomId}`),
          axios.get(`/api/rooms/${roomId}/members`),
          axios.get(`/api/profile/me`).catch(() => null),
        ]);

      setRoom(mapRoom(roomResponse.data));
      setMembers(
        (Array.isArray(membersResponse.data) ? membersResponse.data : []).map(
          mapMember,
        ),
      );
      setCurrentUsername(
        profileResponse
          ? String(
              (profileResponse.data as { username?: unknown })?.username ?? "",
            )
          : null,
      );
    } catch (loadError) {
      setError(toMessage(loadError, "Could not load room."));
      setRoom(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    setLoading(true);
    loadRoom();
  }, [loadRoom]);

  const isOwner =
    Boolean(currentUsername) && room?.ownerUsername === currentUsername;
  const isMember =
    Boolean(currentUsername) &&
    (isOwner || members.some((member) => member.username === currentUsername));

  const handleBack = () => router.push("/rooms");
  const handleJoin = async () => {
    await axios.post(`/api/rooms/${roomId}/join`);
    await loadRoom();
  };
  const handleLeave = async () => {
    await axios.delete(`/api/rooms/${roomId}/leave`);
    router.push("/rooms");
  };
  const handleDelete = async () => {
    await axios.delete(`/api/rooms/${roomId}`);
    router.push("/rooms");
  };
  const handleStatus = async (status: MemberStatus) => {
    await axios.put(`/api/rooms/${roomId}/status`, { status });
    await loadRoom();
  };

  return (
    <div className="relative w-full overflow-hidden bg-switch-background/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="mb-2 text-3xl">{room?.name ?? "Study Room"}</h1>
            <p className="text-gray-600">
              {room?.subject || "General study topic"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              Back to All Rooms
            </Button>
            {isOwner ? (
              <Button variant="outline" onClick={handleDelete}>
                Delete Room
              </Button>
            ) : isMember ? (
              <Button variant="outline" onClick={handleLeave}>
                Leave Room
              </Button>
            ) : (
              <Button onClick={handleJoin}>Join Room</Button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-slate-600">
            <Loader2 className="size-5 animate-spin text-indigo-600" />
            Loading room details...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:col-span-2">
              <CardHeader className="border-b border-gray-200 pb-4">
                <CardTitle>Room details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck className="size-4 text-indigo-600" />
                      <span>{room?.isPrivate ? "Private" : "Public"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <CalendarClock className="size-4 text-slate-500" />
                      <span>Created {formatDate(room?.createdAt ?? "")}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Users className="size-4 text-slate-500" />
                      <span>
                        {members.length || room?.memberCount || 0} members
                      </span>
                    </div>
                    {room?.accessCode && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <Lock className="size-4 text-slate-500" />
                        <span>Access code {room.accessCode}</span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Your status
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleStatus("STUDYING")}
                      >
                        Studying
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatus("ON_BREAK")}
                      >
                        On break
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatus("DONE")}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
                {room?.description && (
                  <p className="text-sm text-slate-600">{room.description}</p>
                )}
              </CardContent>
            </Card>

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
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{member.username}</p>
                        </div>
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
                  <div className="flex items-center gap-3">
                    <UserCheck className="size-3 text-green-600" />
                    <span>Studying</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-3 text-gray-600" />
                    <span>Done</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
