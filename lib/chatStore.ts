// /lib/chatStore.ts

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Listener = () => void;

const STORAGE_KEY = "nm_messages_v1";

class ChatStore {
  messages: Record<string, ChatMessage[]> = {};
  typing: Record<string, boolean> = {};
  draft: Record<string, string> = {};
  listeners: Listener[] = [];

  aborter: AbortController | null = null;

  /* -------------------------------------------
      Persistence
  --------------------------------------------- */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      this.messages = JSON.parse(raw);
    } catch {}
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages));
    } catch {}
  }

  /* -------------------------------------------
      Subscriptions
  --------------------------------------------- */
  subscribe(fn: Listener) {
    this.listeners.push(fn);

    // CLEANUP FUNCTION – zawsze czysta funkcja, React-safe
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  notify() {
    this.save();
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error("ChatStore listener error:", e);
      }
    });
  }

  /* -------------------------------------------
      Thread init
  --------------------------------------------- */
  initThread(id: string) {
    if (!this.messages[id]) this.messages[id] = [];
    this.typing[id] = false;
    this.draft[id] = "";
    this.notify();
  }

  /* -------------------------------------------
      Message helpers
  --------------------------------------------- */
  addMessage(id: string, role: "user" | "assistant", content: string) {
    if (!this.messages[id]) this.messages[id] = [];
    this.messages[id].push({ role, content });
    this.notify();
  }

  replaceLastAssistantMessage(id: string, content: string) {
    const arr = this.messages[id];
    if (!arr || arr.length === 0) return;

    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].role === "assistant") {
        arr[i].content = content;
        break;
      }
    }
    this.notify();
  }

  getMessages(id: string): ChatMessage[] {
    return this.messages[id] || [];
  }

  /* -------------------------------------------
      DELETE MESSAGE
  --------------------------------------------- */
  deleteMessage(id: string, index: number) {
    if (!this.messages[id]) return;
    this.messages[id].splice(index, 1);
    this.notify();
  }

  /* -------------------------------------------
      EDIT (draft)
  --------------------------------------------- */
  setDraft(id: string, text: string) {
    this.draft[id] = text;
    this.notify();
  }

  getDraft(id: string): string {
    return this.draft[id] || "";
  }

  /* -------------------------------------------
      Typing indicator
  --------------------------------------------- */
  setTyping(id: string, state: boolean) {
    this.typing[id] = state;
    this.notify();
  }

  isTyping(id: string) {
    return this.typing[id] || false;
  }

  /* -------------------------------------------
      STOP STREAMING
  --------------------------------------------- */
  abortStreaming() {
    if (this.aborter) {
      this.aborter.abort();
      this.aborter = null;
    }
  }

  /* -------------------------------------------
      SEND MESSAGE (no streaming here)
      streaming obsługiwany w SendForm
  --------------------------------------------- */
  async sendMessage(id: string, content: string, isRetry = false) {
    // dodaj wiadomość użytkownika
    this.addMessage(id, "user", content);

    // dodaj pustą wiadomość asystenta
    this.addMessage(id, "assistant", "");

    // ustaw typing indicator
    this.setTyping(id, true);

    // ustaw abort controllera dla przyszłych funkcji
    this.aborter = new AbortController();
  }

  /* -------------------------------------------
      RETRY — spójny z ChatWindow
  --------------------------------------------- */
  async retryMessage(id: string, index: number) {
    const arr = this.messages[id];
    if (!arr) return;

    const prevUser = arr[index - 1];
    if (!prevUser || prevUser.role !== "user") return;

    // usuń starą odpowiedź AI
    this.deleteMessage(id, index);

    // wyślij ponownie
    await this.sendMessage(id, prevUser.content, true);
  }

  /* -------------------------------------------
      Clear thread
  --------------------------------------------- */
  clearThread(id: string) {
    delete this.messages[id];
    delete this.typing[id];
    delete this.draft[id];
    this.notify();
  }
}

export const chatStore = new ChatStore();

if (typeof window !== "undefined") {
  try {
    chatStore.load();
  } catch {}
}

export type Message = ChatMessage;