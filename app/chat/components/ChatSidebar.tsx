"use client";

import { useEffect, useState } from "react";
import { threadStore, Thread } from "@/lib/chatThreads";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export default function ChatSidebar({ activeId, onSelect, onNew }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    threadStore.init();
    setThreads([...threadStore.list]);

    // 🔥 Subskrypcja na zmiany (nowy wątek, rename, delete)
    const unsub = threadStore.subscribe(() => {
      setThreads([...threadStore.list]);
    });

    return () => unsub();
  }, []);

  return (
    <div className="w-64 bg-[#111] border-r border-[#333] h-full flex flex-col">
      <div className="p-4 border-b border-[#333] flex justify-between items-center">
        <h2 className="text-white font-semibold">Twoje rozmowy</h2>
        <button onClick={onNew} className="text-blue-400 text-lg leading-none">
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 && (
          <div className="p-4 text-gray-500 text-sm">Brak rozmów</div>
        )}

        {threads.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`p-3 cursor-pointer transition ${
              t.id === activeId
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-[#222]"
            }`}
          >
            {t.title}
          </div>
        ))}
      </div>
    </div>
  );
}