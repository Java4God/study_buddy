import { Coffee, CheckCircle2, UserCheck } from "lucide-react";
import axios from "axios";

export type MemberStatus = "STUDYING" | "ON_BREAK" | "DONE";

export interface Room {
  id: string;
  name: string;
  subject: string;
  accessCode: string;
  isPrivate: boolean;
  description?: string | null;
  ownerUsername: string;
  createdAt: string;
  memberCount: number;
}

export interface RoomMember {
  id: string;
  userId: string;
  username: string;
  status: MemberStatus;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  sentAt: string;
}

export function mapRoom(dto: unknown): Room {
  const raw = dto as Record<string, unknown>;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "Untitled Room"),
    subject: String(raw.subject ?? ""),
    accessCode: String(raw.accessCode ?? ""),
    isPrivate: !(raw.isPublic ?? true),
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    ownerUsername: String(raw.ownerUsername ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    memberCount:
      typeof raw.memberCount === "number"
        ? raw.memberCount
        : Number(raw.memberCount ?? 0),
  };
}

export function mapMember(dto: unknown): RoomMember {
  const raw = dto as Record<string, unknown>;
  return {
    id: String(raw.id ?? ""),
    userId: String(raw.userId ?? ""),
    username: String(raw.username ?? ""),
    status:
      raw.status === "ON_BREAK"
        ? "ON_BREAK"
        : raw.status === "DONE"
          ? "DONE"
          : "STUDYING",
    joinedAt: String(raw.joinedAt ?? ""),
  };
}

export function mapChatMessage(dto: unknown): ChatMessage {
  const raw = dto as Record<string, unknown>;
  return {
    id: String(raw.id ?? ""),
    roomId: String(raw.roomId ?? ""),
    senderId: String(raw.senderId ?? ""),
    senderUsername: String(raw.senderUsername ?? "Unknown"),
    content: String(raw.content ?? ""),
    sentAt: String(raw.sentAt ?? ""),
  };
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently created";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function toMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string; error?: string }
    | undefined;
  return data?.message ?? data?.error ?? fallback;
}

export function getStatusMeta(status: MemberStatus) {
  switch (status) {
    case "ON_BREAK":
      return { label: "On break", icon: <Coffee className="size-4 text-orange-600" /> };
    case "DONE":
      return { label: "Done", icon: <CheckCircle2 className="size-4 text-gray-600" /> };
    default:
      return { label: "Studying", icon: <UserCheck className="size-4 text-green-600" /> };
  }
}
