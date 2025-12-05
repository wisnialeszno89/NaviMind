"use client";

import { useState } from "react";
import { chatStore } from "@/lib/chatStore";

type Props = {
  threadId: string;
  mode: string; 
  onSend: () => void;
};

export default function SendForm({ threadId, mode, onSend }: Props) {
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;

    // 1) dodaj wiadomość użytkownika + pustego assistant
    await chatStore.sendMessage(threadId, msg);

    // 2) wywołaj API do generowania odpowiedzi
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: chatStore.getMessages(threadId),
        mode,
      }),
    });

    // 3) odbiór streamu tokenów
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let streamed = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      streamed += chunk;

      chatStore.replaceLastAssistantMessage(threadId, streamed);
      onSend(); // odśwież UI
    }

    setMsg("");
    onSend(); // refresh
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-neutral-800 flex gap-2">
      <input
        className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Napisz wiadomość..."
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
      >
        Wyślij
      </button>
    </form>
  );
}