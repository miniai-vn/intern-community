export type ChatRole = "user" | "bot";

export type ChatMessage = {
  id: string;
  from: ChatRole;
  text: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

