import type { Credentials, IncomingNotification } from "./types";

function instanceUrl(creds: Credentials) {
  return `${creds.apiUrl}/waInstance${creds.idInstance}`;
}

async function request<T>(
  creds: Credentials,
  method: string,
  methodPath: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${instanceUrl(creds)}/${methodPath}`;
  const response = await fetch(url, {
    ...init,
    method,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ошибка GREEN-API: ${response.status}`);
  }

  const raw = await response.text();
  if (!raw) return null as T;
  return JSON.parse(raw) as T;
}

export function resolveApiUrl(idInstance: string) {
  const prefix = idInstance.slice(0, 4);
  if (/^\d{4}$/.test(prefix)) {
    return `https://${prefix}.api.green-api.com`;
  }
  return "https://api.green-api.com";
}

export function toChatId(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Введите номер в международном формате, например 79001234567");
  }
  return `${digits}@c.us`;
}

export function formatPhone(chatId: string) {
  return chatId.replace(/@c\.us$|@g\.us$/, "");
}

export async function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(
    creds,
    "GET",
    `getStateInstance/${creds.apiTokenInstance}`,
  );
}

export async function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(
    creds,
    "POST",
    `sendMessage/${creds.apiTokenInstance}`,
    { body: JSON.stringify({ chatId, message }) },
  );
}

export async function receiveNotification(
  creds: Credentials,
  signal?: AbortSignal,
): Promise<IncomingNotification | null> {
  return request<IncomingNotification | null>(
    creds,
    "GET",
    `receiveNotification/${creds.apiTokenInstance}?receiveTimeout=20`,
    { signal },
  );
}

export async function deleteNotification(creds: Credentials, receiptId: number) {
  return request<{ result: boolean }>(
    creds,
    "DELETE",
    `deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
  );
}

export function extractText(body: IncomingNotification["body"]) {
  const type = body.messageData?.typeMessage;
  if (type === "textMessage") {
    return body.messageData?.textMessageData?.textMessage?.trim() ?? "";
  }
  if (type === "extendedTextMessage") {
    return body.messageData?.extendedTextMessageData?.text?.trim() ?? "";
  }
  return "";
}
