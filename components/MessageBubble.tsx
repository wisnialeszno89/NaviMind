"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css"; // podświetlanie kodu

type Props = {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
  time?: string;

  onRetry?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function MessageBubble({
  content,
  role,
  isTyping,
  time,
  onRetry,
  onEdit,
  onDelete
}: Props) {
  const [mounted, setMounted] = useState(false);
  const isAssistant = role === "assistant";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
  }

  return (
    <div
      className={`w-full flex gap-3 items-start mb-4 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {/* Avatar */}
      {isAssistant ? (
        <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold">
          N
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center text-white font-semibold">
          Ty
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          relative group max-w-[min(80%,700px)] px-4 py-3 rounded-2xl shadow-md
          whitespace-pre-wrap leading-relaxed transition-all duration-200 
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
          ${
            isAssistant
              ? "bg-[#0e0f10] border border-[#1b1b1b] text-gray-200"
              : "bg-blue-600 text-white ml-auto"
          }
        `}
      >
        {/* Action Buttons */}
        <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all text-[11px]">
          <button
            onClick={copyToClipboard}
            className="px-1 py-0.5 rounded bg-white/5 border border-white/20 hover:bg-white/10"
          >
            ⧉
          </button>

          {isAssistant && onRetry && (
            <button
              onClick={onRetry}
              className="px-1 py-0.5 rounded bg-white/5 border border-white/20 hover:bg-white/10"
            >
              ↻
            </button>
          )}

          {!isAssistant && onEdit && (
            <button
              onClick={onEdit}
              className="px-1 py-0.5 rounded bg-white/5 border border-white/20 hover:bg-white/10"
            >
              ✎
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-1 py-0.5 rounded bg-white/5 border border-white/20 hover:bg-white/10"
            >
              🗑
            </button>
          )}
        </div>

        {/* Typing animation */}
        {isTyping ? (
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400/70" />
            <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400/50" />
            <div className="h-2 w-2 rounded-full animate-pulse bg-gray-400/40" />
          </div>
        ) : (
<div className="prose prose-invert max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {content}
  </ReactMarkdown>
</div>


        )}

        {time && (
          <div
            className={`mt-2 text-[11px] ${
              isAssistant ? "text-gray-500" : "text-blue-100/80"
            } text-right`}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  );
}