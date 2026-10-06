import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Chat } from "../types";

type Props = {
  chat: Chat | undefined;
  sending: boolean;
  onSend: (text: string) => Promise<void>;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatWindow({ chat, sending, onSend }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  async function submit() {
    const value = text.trim();
    if (!value || !chat || sending) return;
    setText("");
    await onSend(value);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  if (!chat) {
    return (
      <section className="chat-window empty-chat">
        <p>Выберите чат или создайте новый по номеру телефона</p>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <span className="avatar">{chat.title.slice(0, 1)}</span>
        <div>
          <strong>{chat.title}</strong>
          <small>текстовые сообщения</small>
        </div>
      </header>

      <div className="messages">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={message.outgoing ? "bubble outgoing" : "bubble incoming"}
          >
            <p>{message.text}</p>
            <time>{formatTime(message.timestamp)}</time>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          Отправить
        </button>
      </form>
    </section>
  );
}
