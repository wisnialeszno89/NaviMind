"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

type Props = {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
  time?: string;

  // Inline editing props
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  onSave?: () => void;
  onCancel?: () => void;

  // Bubble actions
  onRetry?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

export default function MessageBubble({
  content,
  role,
  isTyping,
  time,

  isEditing,
  editValue,
  onEditChange,
  onSave,
  onCancel,

  onRetry,
  onDelete,
  onEdit
}: Props) {
  const [mounted, setMounted] = useState(false);
  const isAssistant = role === "assistant";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`w-full flex gap-3 items-start mb-4 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {/* Avatar assistant */}
      {isAssistant && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center text-white font-bold shadow-sm">
          N
        </div>
      )}

      <div
        className={`
          relative group
          max-w-[min(82%,700px)]
          px-4 py-3 rounded-2xl
          shadow-md
          whitespace-pre-wrap
          transform transition-all duration-250 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
          ${
            isAssistant
              ? "bg-[#0d0f10] border border-[#1b1b1b] text-gray-200"
              : "bg-blue-600/90 text-white"
          }
        `}
        style={{ wordBreak: "break-word" }}
      >

        {/* --------------------- */}
        {/*   MENU HOVER ACTIONS  */}
        {/* --------------------- */}
        {!isEditing && (
          <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {/* Copy */}
            <button
              onClick={() => navigator.clipboard.writeText(content)}
              className="p-1 rounded-md bg-white/10 border border-white/20 text-[10px]"
            >
              ⧉
            </button>

            {/* Retry only for assistant */}
            {isAssistant && onRetry && (
              <button
                onClick={onRetry}
                className="p-1 rounded-md bg-white/10 border border-white/20 text-[10px]"
              >
                ↻
              </button>
            )}

            {/* Edit only for user */}
            {!isAssistant && onEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded-md bg-white/10 border border-white/20 text-[10px]"
              >
                ✎
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 rounded-md bg-white/10 border border-white/20 text-[10px]"
              >
                🗑
              </button>
            )}
          </div>
        )}

        {/* --------------------- */}
        {/*   TRYB EDYCJI INLINE  */}
        {/* --------------------- */}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editValue}
              onChange={(e) => onEditChange?.(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-lg p-2 text-sm text-white resize-none focus:outline-none"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-sm rounded bg-white/10 border border-white/20"
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                className="px-3 py-1 text-sm rounded bg-blue-500 border border-blue-300 text-white"
              >
                Save & Send
              </button>
            </div>
          </div>
        ) : isTyping ? (
          // Typing bubble
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full animate-pulse bg-gray-400/70" />
            <div className="h-3 w-3 rounded-full animate-pulse bg-gray-400/50" />
            <div className="h-3 w-3 rounded-full animate-pulse bg-gray-400/30" />
          </div>
        ) : (
          // Normal content
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        )}

        {/* Timestamp */}
        {!isEditing && time && (
          <div className="mt-2 text-[11px] text-right opacity-60">
            {time}
          </div>
        )}
      </div>

      {/* Avatar user */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center text-white font-semibold">
          Ty
        </div>
      )}
    </div>
  );
}