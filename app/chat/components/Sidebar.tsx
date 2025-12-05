"use client";

import { useRouter } from "next/navigation";
import { chatStore } from "@/lib/chatStore";
import { useEffect, useState } from "react";

type Props = {
  onSelect?: () => void; // dla mobile, zamykanie sidebaru
};

export default function Sidebar({ onSelect }: Props) {
  const router = useRouter();

  const [threads, setThreads] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      setThreads(Object.keys(chatStore.messages));
    };
    update();
    const unsub = chatStore.subscribe(update);
    return () => unsub();
  }, []);

  function openThread(id: string) {
    router.push(`/chat/${id}`);
    onSelect?.();
  }

  function newThread() {
    const id = String(Date.now());
    chatStore.initThread(id);
    router.push(`/chat/${id}`);
    onSelect?.();
  }

  function clearAll() {
    Object.keys(chatStore.messages).forEach((id) => chatStore.clearThread(id));
    router.refresh();
  }

  return (
    <div className="h-full flex flex-col text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-neutral-800">
        <div className="text-lg font-semibold">Wątki</div>
        <div className="text-xs text-neutral-400">Twoje rozmowy</div>
      </div>

      {/* THREAD LIST */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 && (
          <div className="p-4 text-neutral-500 text-sm">Brak wątków</div>
        )}

        {threads.map((id) => (
          <button
            key={id}
            onClick={() => openThread(id)}
            className="w-full text-left px-4 py-3 border-b border-neutral-800 hover:bg-neutral-800 transition"
          >
            <div className="font-semibold text-sm">{id}</div>

            <div className="text-xs text-neutral-400 truncate">
              {chatStore.getMessages(id).slice(-1)[0]?.content || "—"}
            </div>
          </button>
        ))}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="p-4 border-t border-neutral-800 space-y-2">
        <button
          onClick={newThread}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
        >
          + Nowy wątek
        </button>

        <button
          onClick={clearAll}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
        >
          Wyczyść wszystko
        </button>
      </div>
    </div>
  );
}