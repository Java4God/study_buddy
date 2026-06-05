"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Client, type IMessage } from "@stomp/stompjs";
import { mapChatMessage, toMessage, type ChatMessage } from "../_shared";

function appendUnique(current: ChatMessage[], message: ChatMessage) {
  if (current.some((item) => item.id === message.id)) return current;
  return [...current, message];
}

export function useRoomChat(roomId: string, enabled: boolean) {
  const clientRef = useRef<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [connected, setConnected] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!enabled) return;
    setLoadingMessages(true);
    setChatError("");
    try {
      const response = await axios.get(`/api/rooms/${roomId}/messages`, {
        params: { limit: 50 },
      });
      const list = Array.isArray(response.data) ? response.data : [];
      setMessages(list.map(mapChatMessage));
    } catch (error) {
      setChatError(toMessage(error, "Could not load messages."));
    } finally {
      setLoadingMessages(false);
    }
  }, [enabled, roomId]);

  useEffect(() => {
    queueMicrotask(() => void loadMessages());
  }, [loadMessages]);

  useEffect(() => {
    if (!enabled) {
      queueMicrotask(() => {
        setMessages([]);
        setConnected(false);
      });
      return;
    }
    let cancelled = false;
    axios
      .get("/api/rooms/chat-auth")
      .then((response) => {
        if (cancelled) return;
        const { accessToken, wsUrl } = response.data as {
          accessToken?: string;
          wsUrl?: string;
        };
        if (!accessToken || !wsUrl) throw new Error("Missing chat auth.");
        const client = new Client({
          brokerURL: wsUrl,
          connectHeaders: { Authorization: `Bearer ${accessToken}` },
          reconnectDelay: 5000,
          onConnect: () => {
            setConnected(true);
            client.subscribe(`/topic/chat/${roomId}`, (frame: IMessage) => {
              setMessages((prev) =>
                appendUnique(prev, mapChatMessage(JSON.parse(frame.body))),
              );
            });
          },
          onDisconnect: () => setConnected(false),
          onStompError: () => setChatError("Chat connection failed."),
          onWebSocketError: () => {
            setConnected(false);
            setChatError("Chat connection failed.");
          },
        });
        clientRef.current = client;
        client.activate();
      })
      .catch((error) => setChatError(toMessage(error, "Could not open chat.")));

    return () => {
      cancelled = true;
      setConnected(false);
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [enabled, roomId]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !clientRef.current?.connected) return;
    setSending(true);
    setChatError("");
    try {
      clientRef.current.publish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify({ content }),
      });
      setDraft("");
    } catch (error) {
      setChatError(toMessage(error, "Could not send message."));
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    draft,
    setDraft,
    loadingMessages,
    sending,
    chatError,
    connected,
    sendMessage,
  };
}
