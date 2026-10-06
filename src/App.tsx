import { useCallback, useEffect, useState } from "react";
import {
  deleteNotification,
  extractText,
  formatPhone,
  receiveNotification,
  sendMessage,
  toChatId,
} from "./api";
import { ChatWindow } from "./components/ChatWindow";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import type { Chat, ChatMessage, Credentials } from "./types";

const STORAGE_KEY = "green-api-wa-creds";

function loadCreds(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCreds);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const upsertMessage = useCallback((message: ChatMessage, title?: string) => {
    setChats((prev) => {
      const existing = prev.find((chat) => chat.chatId === message.chatId);
      if (!existing) {
        return [
          ...prev,
          {
            chatId: message.chatId,
            title: title || formatPhone(message.chatId),
            messages: [message],
          },
        ];
      }
      if (existing.messages.some((item) => item.id === message.id)) return prev;
      return prev.map((chat) =>
        chat.chatId === message.chatId
          ? {
              ...chat,
              title: title || chat.title,
              messages: [...chat.messages, message],
            }
          : chat,
      );
    });
  }, []);

  useEffect(() => {
    if (!creds) return;
    const abort = new AbortController();
    let cancelled = false;

    async function poll() {
      while (!cancelled && creds) {
        try {
          const notification = await receiveNotification(creds, abort.signal);
          if (!notification) continue;
          const { body, receiptId } = notification;
          const text = extractText(body);
          const chatId = body.senderData?.chatId;
          if (
            (body.typeWebhook === "incomingMessageReceived" ||
              body.typeWebhook === "outgoingMessageReceived") &&
            text &&
            chatId
          ) {
            upsertMessage(
              {
                id: body.idMessage || `${receiptId}`,
                chatId,
                text,
                timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
                outgoing: body.typeWebhook === "outgoingMessageReceived",
              },
              body.senderData?.senderName || body.senderData?.chatName,
            );
            setActiveChatId((current) => current ?? chatId);
          }
          await deleteNotification(creds, receiptId);
        } catch (error) {
          if (cancelled || abort.signal.aborted) return;
          if (error instanceof DOMException && error.name === "AbortError") return;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [creds, upsertMessage]);

  function handleLogin(next: Credentials) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCreds(next);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setCreds(null);
    setChats([]);
    setActiveChatId(null);
  }

  function handleCreate(phone: string) {
    const chatId = toChatId(phone);
    setChats((prev) => {
      if (prev.some((chat) => chat.chatId === chatId)) return prev;
      return [...prev, { chatId, title: formatPhone(chatId), messages: [] }];
    });
    setActiveChatId(chatId);
  }

  async function handleSend(text: string) {
    if (!creds || !activeChatId) return;
    setSending(true);
    try {
      const result = await sendMessage(creds, activeChatId, text);
      upsertMessage({
        id: result.idMessage,
        chatId: activeChatId,
        text,
        timestamp: Date.now(),
        outgoing: true,
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  }

  if (!creds) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const activeChat = chats.find((chat) => chat.chatId === activeChatId);

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onCreate={handleCreate}
        onLogout={handleLogout}
      />
      <ChatWindow chat={activeChat} sending={sending} onSend={handleSend} />
    </div>
  );
}
