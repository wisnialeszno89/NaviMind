"use client";

import { useEffect, useState } from "react";
import { chatStore } from "@/lib/chatStore";
import { Thread } from "@/types/thread";

type Props = {
  onSelect: (id: string) => void;
  activeId: string | null;
};

export default function ThreadList({ onSelect, activeId }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    setThreads(chatStore.getThreads());
  }, []);

  return (
    <div className="w-64 bg-[#111] border-r border-[#333] p-4 space-y-2">
      {threads.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`p-3 rounded cursor-pointer ${
            activeId === t.id ? "bg-blue-600 text-white" : "bg-[#222] text-gray-300"
          }`}
        >
          {t.title}
        </div>
      ))}
    </div>
  );
}