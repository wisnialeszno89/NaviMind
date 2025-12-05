"use client";

import React from "react";
import ModeSelector from "@/app/chat/components/ModeSelector";

type Props = {
  threadId: string;
  mode: string;
  onModeChange: (m: string) => void;
  onNewThread: () => void;
  onClearThread: () => void;
};

export default function ChatHeader({
  threadId,
  mode,
  onModeChange,
  onNewThread,
  onClearThread,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
      
      {/* LEFT SIDE: AI Avatar + Title */}
      <div className="flex items-center gap-3">
        
        {/* AI AVATAR — clean SVG icon */}
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shadow border border-neutral-700">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-400"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9v4.28c0 .62-.24 1.21-.66 1.64L3 16.25v1.25h6v4h6v-4h6v-1.25l-1.34-1.33A2.32 2.32 0 0 1 19 13.28V9c0-3.87-3.13-7-7-7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <div className="text-sm font-semibold">NaviMind</div>
          <div className="text-xs text-neutral-400">Wątek: {threadId}</div>
        </div>
      </div>

      {/* RIGHT SIDE: Actions */}
      <div className="flex items-center gap-3">
        
        {/* MODE SELECTOR */}
        <ModeSelector
          mode={mode}
          onChange={(m) => onModeChange(m)}
        />

        {/* NEW THREAD */}
        <button
          onClick={onNewThread}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
        >
          Nowy wątek
        </button>

        {/* CLEAR THREAD */}
        <button
          onClick={onClearThread}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
        >
          Wyczyść
        </button>
      </div>
    </div>
  );
}