"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  mapMember,
  mapRoom,
  toMessage,
  type MemberStatus,
  type Room,
  type RoomMember,
} from "../_shared";

export function useRoomDetails(roomId: string) {
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
          axios.get("/api/profile/me").catch(() => null),
        ]);
      setRoom(mapRoom(roomResponse.data));
      const nextMembers = Array.isArray(membersResponse.data)
        ? membersResponse.data.map(mapMember)
        : [];
      setMembers(nextMembers);
      setCurrentUsername(
        profileResponse ? String(profileResponse.data?.username ?? "") : null,
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
    queueMicrotask(() => {
      setLoading(true);
      void loadRoom();
    });
  }, [loadRoom]);

  const joinRoom = async () => {
    await axios.post(`/api/rooms/${roomId}/join`);
    await loadRoom();
  };

  const leaveRoom = async () => {
    await axios.delete(`/api/rooms/${roomId}/leave`);
  };

  const deleteRoom = async () => {
    await axios.delete(`/api/rooms/${roomId}`);
  };

  const updateStatus = async (status: MemberStatus) => {
    await axios.put(`/api/rooms/${roomId}/status`, { status });
    await loadRoom();
  };

  const isOwner =
    Boolean(currentUsername) && room?.ownerUsername === currentUsername;
  const isMember =
    Boolean(currentUsername) &&
    (isOwner || members.some((member) => member.username === currentUsername));

  return {
    room,
    members,
    currentUsername,
    loading,
    error,
    setError,
    isOwner,
    isMember,
    joinRoom,
    leaveRoom,
    deleteRoom,
    updateStatus,
  };
}
