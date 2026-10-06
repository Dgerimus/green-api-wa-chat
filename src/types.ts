export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  outgoing: boolean;
};

export type Chat = {
  chatId: string;
  title: string;
  messages: ChatMessage[];
};

export type IncomingNotification = {
  receiptId: number;
  body: {
    typeWebhook?: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: {
      chatId?: string;
      sender?: string;
      senderName?: string;
      chatName?: string;
    };
    messageData?: {
      typeMessage?: string;
      textMessageData?: { textMessage?: string };
      extendedTextMessageData?: { text?: string };
    };
  };
};
