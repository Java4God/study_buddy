"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";
import Button from "../../components/button";
import Input from "../../components/input";
import { ScrollArea } from "../../components/scroll-area";
import {
  Plus,
  Users,
  Lock,
  Globe,
  Clock,
  Send,
  UserCheck,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/dialogs";
import { Avatar, AvatarFallback } from "@/app/components/avatar";

interface Room {
  id: string;
  name: string;
  members: number;
  isPrivate: boolean;
  topic: string;
}

interface RoomMember {
  id: string;
  name: string;
  status: "studying" | "break" | "done";
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
}

export default function StudyRoomsPage() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Create Room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    topic?: string;
  }>({});

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Calculus Study Group",
      members: 8,
      isPrivate: false,
      topic: "Mathematics",
    },
    {
      id: "2",
      name: "Chemistry Finals Prep",
      members: 5,
      isPrivate: false,
      topic: "Chemistry",
    },
    {
      id: "3",
      name: "History Essay Writing",
      members: 3,
      isPrivate: true,
      topic: "History",
    },
  ]);

  const roomMembers: RoomMember[] = [
    { id: "1", name: "Alex Johnson", status: "studying" },
    { id: "2", name: "Sarah Chen", status: "studying" },
    { id: "3", name: "Mike Brown", status: "break" },
    { id: "4", name: "Emily Davis", status: "studying" },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      user: "Sarah Chen",
      message: "Anyone else on chapter 5?",
      time: "10:23 AM",
    },
    {
      id: "2",
      user: "Alex Johnson",
      message: "Yes! Working through it now",
      time: "10:24 AM",
    },
    {
      id: "3",
      user: "Mike Brown",
      message: "Taking a quick break, brb",
      time: "10:30 AM",
    },
  ];

  const openCreateModal = () => {
    setNewRoomName("");
    setNewRoomTopic("");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCreateRoom = () => {
    const errors: { name?: string; topic?: string } = {};
    if (!newRoomName.trim()) errors.name = "Room name is required";
    if (!newRoomTopic.trim()) errors.topic = "Topic is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName.trim(),
      topic: newRoomTopic.trim(),
      members: 1,
      isPrivate: false,
    };
    setRooms((prev) => [...prev, newRoom]);
    setShowCreateModal(false);
  };

  const getStatusIcon = (status: RoomMember["status"]) => {
    switch (status) {
      case "studying":
        return <UserCheck className="size-4 text-green-600" />;
      case "break":
        return <Coffee className="size-4 text-orange-600" />;
      case "done":
        return <CheckCircle2 className="size-4 text-gray-600" />;
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

  return (
    <div className="relative overflow-hidden bg-switch-background/20 w-full">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Study Rooms</h1>
            <p className="text-gray-600">
              Join or create a collaborative study session
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal} variant="primary">
            <Plus className="size-4" />
            Create Room
          </Button>
        </div>

        {activeRoom ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur lg:col-span-2 rounded-2xl p-4">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{activeRoomData?.name ?? "Study Room"}</CardTitle>
                  <Button variant="outline" onClick={() => setActiveRoom(null)}>
                    Leave Room
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex h-[500px] flex-col">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {msg.user}
                            </span>
                            <span className="text-xs text-gray-500">
                              {msg.time}
                            </span>
                          </div>
                          <p className="inline-block max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t border-slate-200 p-6 pb-0">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        setValue={(e) => setMessage(e)}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Members ({roomMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {roomMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{member.name}</p>
                      </div>
                      {getStatusIcon(member.status)}
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6">
                  <p className="text-sm font-semibold">Status Legend</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <UserCheck className="size-3 text-green-600" />
                      <span>Studying</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Coffee className="size-3 text-orange-600" />
                      <span>On Break</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-3 text-gray-600" />
                      <span>Done</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="group cursor-pointer border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg rounded-2xl"
                onClick={() => setActiveRoom(room.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="mb-3 font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                          {room.name}
                        </h3>
                        <div className="text-sm text-slate-600">
                          {room.topic}
                        </div>
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
                        <span>{room.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>Active</span>
                      </div>
                    </div>
                    <Button className="w-full">Join Room</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          if (!open) setShowCreateModal(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Study Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="room-name">
                Room Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="room-name"
                placeholder="e.g., Physics Study Group"
                value={newRoomName}
                setValue={(e) => {
                  setNewRoomName(e);
                  if (formErrors.name)
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="room-topic">
                Topic <span className="text-red-500">*</span>
              </label>
              <Input
                id="room-topic"
                placeholder="e.g., Quantum Mechanics"
                value={newRoomTopic}
                setValue={(e) => {
                  setNewRoomTopic(e);
                  if (formErrors.topic)
                    setFormErrors((prev) => ({ ...prev, topic: undefined }));
                }}
              />
              {formErrors.topic && (
                <p className="text-xs text-red-500">{formErrors.topic}</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateRoom}>
                Create Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
