import { useMemo, useState, type FormEvent } from "react";
import { formatPhone } from "../api";
import type { Chat } from "../types";

type Props = {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => void;
  onLogout: () => void;
};

export function Sidebar({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const sorted = useMemo(
    () =>
      [...chats].sort((a, b) => {
        const at = a.messages.at(-1)?.timestamp ?? 0;
        const bt = b.messages.at(-1)?.timestamp ?? 0;
        return bt - at;
      }),
    [chats],
  );

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      onCreate(phone);
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать чат");
    }
  }

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div>
          <strong>Чаты</strong>
          <span>WhatsApp · GREEN-API</span>
        </div>
        <button className="ghost" type="button" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <form className="new-chat" onSubmit={handleCreate}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер получателя, 7900..."
        />
        <button type="submit">Создать</button>
      </form>
      {error ? <div className="error sidebar-error">{error}</div> : null}

      <ul className="chat-list">
        {sorted.length === 0 ? (
          <li className="empty">Создайте чат по номеру телефона</li>
        ) : (
          sorted.map((chat) => {
            const last = chat.messages.at(-1);
            return (
              <li key={chat.chatId}>
                <button
                  type="button"
                  className={chat.chatId === activeChatId ? "active" : ""}
                  onClick={() => onSelect(chat.chatId)}
                >
                  <span className="avatar">{chat.title.slice(0, 1)}</span>
                  <span className="meta">
                    <strong>{chat.title}</strong>
                    <small>{last?.text || formatPhone(chat.chatId)}</small>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
