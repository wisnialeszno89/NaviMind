"use client";

const MODES = [
  { id: "default", label: "Default", icon: "⚡" },
  { id: "tech", label: "Tech", icon: "🛠️" },
  { id: "coach", label: "Coach", icon: "🎯" },
  { id: "business", label: "Biznes", icon: "💼" },
  { id: "spiritual", label: "Spiritual", icon: "✨" },
];

type Props = {
  mode: string;
  onChange: (mode: string) => void;
};

export default function ChatModeBar({ mode, onChange }: Props) {
  return (
    <div className="flex gap-2 p-3 border-b border-[#222] bg-[#0f0f0f]">
      {MODES.map((m) => {
        const isActive = m.id === mode;

        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`
              flex items-center gap-1 px-3 py-1 rounded text-sm transition-all
              border ${isActive
                ? "bg-blue-600 border-blue-500 text-white shadow-lg scale-105"
                : "border-[#333] text-gray-400 hover:bg-[#1a1a1a]"
              }
            `}
          >
            {m.icon} {m.label}
          </button>
        );
      })}
    </div>
  );
}
