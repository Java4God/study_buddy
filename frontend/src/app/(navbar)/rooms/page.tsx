"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateRoomModal from "@/app/components/create-room-modal";
import RoomGrid from "./_components/RoomGrid";
import RoomsHeader from "./_components/RoomsHeader";
import RoomsState from "./_components/RoomsState";
import { toMessage, type Room } from "./_shared";
import { useRooms } from "./_hooks/useRooms";

type FormErrors = { name?: string; subject?: string };

export default function RoomsClient() {
  const router = useRouter();
  const roomsState = useRooms();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
      const createdRoom = await roomsState.createRoom({
        name: newRoomName.trim(),
        subject: newRoomSubject.trim(),
      });
      setShowCreateModal(false);
      router.push(`/rooms/${createdRoom.id}`);
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        subject: toMessage(error, "Could not create room."),
      }));
    }
  };

  const handleJoin = async (room: Room) => {
    try {
      await roomsState.joinRoom(room);
    } catch (error) {
      roomsState.setRoomsError(toMessage(error, "Could not join room."));
    }
  };

  const handleDelete = async (room: Room) => {
    try {
      await roomsState.deleteRoom(room);
    } catch (error) {
      roomsState.setRoomsError(toMessage(error, "Could not delete room."));
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-switch-background/20 px-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 right-10 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>
      <div className="relative mx-auto space-y-6 py-8">
        <RoomsHeader onCreate={openCreateModal} />
        <RoomsState
          error={roomsState.roomsError}
          loading={roomsState.loadingRooms}
          isEmpty={roomsState.rooms.length === 0}
        />
        {!roomsState.loadingRooms && roomsState.rooms.length > 0 && (
          <RoomGrid
            rooms={roomsState.rooms}
            memberships={roomsState.memberships}
            currentUsername={roomsState.currentUsername}
            onEnter={(room) => router.push(`/rooms/${room.id}`)}
            onJoin={handleJoin}
            onDelete={handleDelete}
          />
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
