import { useState, type FormEvent } from "react";
import { getStateInstance, resolveApiUrl } from "../api";
import type { Credentials } from "../types";

type Props = {
  onLogin: (creds: Credentials) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const id = idInstance.trim();
    const token = apiTokenInstance.trim();
    if (!id || !token) {
      setError("Заполните idInstance и apiTokenInstance");
      return;
    }

    const creds: Credentials = {
      idInstance: id,
      apiTokenInstance: token,
      apiUrl: resolveApiUrl(id),
    };

    setLoading(true);
    try {
      const state = await getStateInstance(creds);
      if (state.stateInstance !== "authorized") {
        throw new Error(
          `Инстанс не авторизован в WhatsApp (статус: ${state.stateInstance}). Отсканируйте QR-код в кабинете GREEN-API.`,
        );
      }
      onLogin(creds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand">
          <div className="logo">M</div>
          <div>
            <h1>Чат MAX</h1>
            <p>Текстовые сообщения через GREEN-API WhatsApp</p>
          </div>
        </div>

        <label>
          idInstance
          <input
            autoComplete="off"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101..."
          />
        </label>
        <label>
          apiTokenInstance
          <input
            autoComplete="off"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="Токен инстанса"
          />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Проверка..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
