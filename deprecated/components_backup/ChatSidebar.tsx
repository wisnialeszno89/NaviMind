"use client";

import { useEffect, useState } from "react";
import { threadStore, Thread } from "@/lib/chatThreads";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
};

const MODE_ICONS: Record<string, string> = {
  default: "⚡",
  tech: "🛠️",
  coach: "🎯",
  business: "💼",
  spiritual: "✨",
};

const MODES = [
  { id: "default", label: "Default", icon: "⚡" },
  { id: "tech", label: "Tech", icon: "🛠️" },
  { id: "coach", label: "Coach", icon: "🎯" },
  { id: "business", label: "Biznes", icon: "💼" },
  { id: "spiritual", label: "Spiritual", icon: "✨" },
];

export default function ChatSidebar({ activeId, onSelect, onNew }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    threadStore.init();
    setThreads([...threadStore.list]);

    const unsub = threadStore.subscribe(() => {
      setThreads([...threadStore.list]);
    });

    return unsub;
  }, []);

  function changeMode(id: string, mode: string) {
    threadStore.setMode(id, mode);
  }

  return (
    <div className="w-64 bg-[#0b0b0b] border-r border-[#222] h-full flex flex-col">

      <div className="p-4 border-b border-[#222] flex justify-between items-center">
        <h2 className="text-white font-semibold text-lg">NaviMind</h2>
        <button
          onClick={onNew}
          className="text-blue-400 text-2xl hover:scale-110 transition"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 && (
          <div className="p-4 text-gray-500 text-sm">Brak rozmów</div>
        )}

        {threads.map((t) => {
          const isActive = t.id === activeId;

          return (
            <div key={t.id}>
              <div
                onClick={() => onSelect(t.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer transition
                  ${isActive 
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-[#1a1a1a]"
                  }
                `}
              >
                <span className="text-lg">{MODE_ICONS[t.mode]}</span>
                <span className="truncate">{t.title}</span>
              </div>

              {isActive && (
                <div className="bg-[#0f0f0f] p-2 border-b border-[#1f1f1f] flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => changeMode(t.id, m.id)}
                      className={`
                        flex items-center gap-1 text-xs px-2 py-1 rounded border transition
                        ${
                          t.mode === m.id
                            ? "bg-blue-600 text-white border-blue-500"
                            : "text-gray-400 border-[#333] hover:bg-[#222]"
                        }
                      `}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
