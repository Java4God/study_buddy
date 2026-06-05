"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { mapMember, mapRoom, toMessage, type Room } from "../_shared";

type CreateRoomInput = { name: string; subject: string };
type Memberships = Record<string, boolean>;

function listFromPayload(payload: unknown) {
  const maybePage = payload as { content?: unknown[] };
  if (Array.isArray(payload)) return payload;
  return Array.isArray(maybePage.content) ? maybePage.content : [];
}

async function loadMemberships(rooms: Room[], username: string | null) {
  if (!username) return {};
  const entries = await Promise.all(
    rooms.map(async (room) => {
      if (room.ownerUsername === username) return [room.id, true] as const;
      try {
        const response = await axios.get(`/api/rooms/${room.id}/members`);
        const members = Array.isArray(response.data) ? response.data : [];
        return [
          room.id,
          members.map(mapMember).some((m) => m.username === username),
        ] as const;
      } catch {
        return [room.id, false] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [memberships, setMemberships] = useState<Memberships>({});
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError("");
    try {
      const [roomsResponse, profileResponse] = await Promise.all([
        axios.get("/api/rooms"),
        axios.get("/api/profile/me").catch(() => null),
      ]);
      const username = profileResponse
        ? String(profileResponse.data?.username ?? "")
        : null;
      const nextRooms = listFromPayload(roomsResponse.data).map(mapRoom);
      setRooms(nextRooms);
      setCurrentUsername(username);
      setMemberships(await loadMemberships(nextRooms, username));
    } catch (error) {
      setRoomsError(toMessage(error, "Could not load rooms."));
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadRooms());
  }, [loadRooms]);

  const createRoom = async ({ name, subject }: CreateRoomInput) => {
    const response = await axios.post("/api/rooms", {
      name,
      subject,
      description: "",
      isPublic: true,
    });
    const room = mapRoom(response.data);
    setRooms((prev) => [room, ...prev]);
    setMemberships((prev) => ({ ...prev, [room.id]: true }));
    return room;
  };

  const joinRoom = async (room: Room) => {
    await axios.post(`/api/rooms/${room.id}/join`, {});
    setMemberships((prev) => ({ ...prev, [room.id]: true }));
    setRooms((prev) =>
      prev.map((item) =>
        item.id === room.id
          ? { ...item, memberCount: item.memberCount + 1 }
          : item,
      ),
    );
  };

  const deleteRoom = async (room: Room) => {
    await axios.delete(`/api/rooms/${room.id}`);
    await loadRooms();
  };

  return {
    rooms,
    memberships,
    currentUsername,
    loadingRooms,
    roomsError,
    setRoomsError,
    loadRooms,
    createRoom,
    joinRoom,
    deleteRoom,
  };
}
