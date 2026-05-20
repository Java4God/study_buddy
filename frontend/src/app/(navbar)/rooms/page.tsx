"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import RoomCard from "@/app/components/room-card";
import CreateRoomModal from "@/app/components/create-room-modal";
import { mapRoom, type Room } from "./_shared";

type FormErrors = { name?: string; subject?: string };

export default function RoomsClient() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  async function loadRooms() {
    setLoadingRooms(true);
    setRoomsError("");
    try {
      const response = await axios.get("/api/rooms", { withCredentials: true });
      const payload = response.data as { content?: unknown[] } | unknown[];
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.content)
          ? payload.content
          : [];
      setRooms(list.map(mapRoom));
    } catch (error) {
      setRoomsError(
        axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? "Could not load rooms.")
          : "Could not load rooms.",
      );
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => {
    loadRooms();
    axios
      .get("/api/profile/me", { withCredentials: true })
      .then((response) =>
        setCurrentUsername(
          String((response.data as { username?: unknown })?.username ?? ""),
        ),
      )
      .catch(() => setCurrentUsername(null));
  }, []);

  const openCreateModal = () => {
    setNewRoomName("");
    setNewRoomSubject("");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCreateRoom = async () => {
    const errors: FormErrors = {};
    if (!newRoomName.trim()) errors.name = "Room name is required";
    if (!newRoomSubject.trim()) errors.subject = "Subject is required";
    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    try {
      const response = await axios.post(
        "/api/rooms",
        {
          name: newRoomName.trim(),
          subject: newRoomSubject.trim(),
          description: "",
          isPublic: true,
        },
        { withCredentials: true },
      );
      const createdRoom = mapRoom(response.data);
      setRooms((prev) => [createdRoom, ...prev]);
      setShowCreateModal(false);
      router.push(`/rooms/${createdRoom.id}`);
      await loadRooms();
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        subject: axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? "Could not create room.")
          : "Could not create room.",
      }));
    }
  };

  const handleOpenRoom = async (room: Room) => {
    try {
      if (currentUsername !== room.ownerUsername) {
        await axios.post(
          `/api/rooms/${room.id}/join`,
          {},
          { withCredentials: true },
        );
      }
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      setRoomsError(
        axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? "Could not join room.")
          : "Could not join room.",
      );
    }
  };

  const handleDelete = async (room: Room) => {
    try {
      await axios.delete(`/api/rooms/${room.id}`, { withCredentials: true });
      await loadRooms();
    } catch (error) {
      setRoomsError(
        axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? "Could not delete room.")
          : "Could not delete room.",
      );
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-switch-background/20 px-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 right-10 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>
      <div className="relative mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl">Study Rooms</h1>
            <p className="text-gray-600">
              Join or create a collaborative study session
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal} variant="primary">
            <Plus className="size-4" />
            Create Room
          </Button>
        </div>
        {roomsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {roomsError}
          </div>
        )}
        {loadingRooms ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-slate-600">
            <Loader2 className="size-5 animate-spin text-indigo-600" />
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <Card className="border border-dashed border-slate-300 bg-white/70">
            <CardContent className="px-6 py-10 text-center text-slate-600">
              No public rooms yet. Create the first one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                currentUsername={currentUsername}
                onPrimaryAction={handleOpenRoom}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      <CreateRoomModal
        open={showCreateModal}
        name={newRoomName}
        subject={newRoomSubject}
        nameError={formErrors.name}
        subjectError={formErrors.subject}
        onNameChange={setNewRoomName}
        onSubjectChange={setNewRoomSubject}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
}
