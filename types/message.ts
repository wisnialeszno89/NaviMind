export type Message = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};