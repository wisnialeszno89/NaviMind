"use client";

import { useContext, useState, useEffect } from "react";
import { UIContext } from "@/context/UIContext";
import { Check, Copy } from "lucide-react";

// Регулируешь ширину сообщений здесь:
const USER_MESSAGE_WIDTH = "max-w-[70%]";
const ASSISTANT_MESSAGE_WIDTH = "w-fit max-w-full";

// Кнопка копирования с тултипом (позицию задаём через props)
function CopyButton({ copied, onCopy, className = "" }) {
  // Показываем тултип только на десктопе и когда не скопировано
  return (
    <div className={`flex mt-2 relative group w-fit ${className}`}>
      <button
        onClick={onCopy}
        className="text-gray-400 hover:text-white transition text-sm"
        aria-label={copied ? "Copied" : "Copy"}
        tabIndex={0}
        type="button"
      >
        {copied ? (
          <Check size={16} strokeWidth={2} className="text-green-400" />
        ) : (
          <Copy size={16} strokeWidth={2} />
        )}
      </button>
      {/* Tooltip: hidden на мобилке */}
      {!copied && (
        <div className="hidden sm:block absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white text-xs px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Copy
        </div>
      )}
    </div>
  );
}

// Компонент сообщения пользователя — кнопка копии справа
function UserMessage({ content, copied, onCopy }) {
  return (
    <div className="w-full flex justify-end mt-6">
      <div
        className={`
          p-3 rounded-xl
          text-[17px] sm:text-base font-normal
          leading-relaxed whitespace-pre-wrap shadow-md break-words
          ${USER_MESSAGE_WIDTH}
          bg-gray-700/40 backdrop-blur-md border border-white/5 text-white shadow-lg

        `}
      >
        {content}
        <CopyButton copied={copied} onCopy={onCopy} className="justify-end ml-auto" />
      </div>
    </div>
  );
}

// Компонент сообщения AI — кнопка копии слева
function AssistantMessage({ content, copied, onCopy }) {
  return (
    <div className="w-full flex justify-start mt-6">
      <div
        className={`
          p-3 rounded-xl
          text-[17px] sm:text-base font-normal
          leading-relaxed whitespace-pre-wrap shadow-md break-words
          w-fit max-w-full
          bg-gray-900 text-gray-200
        `}
      >
        {content}
        <CopyButton copied={copied} onCopy={onCopy} className="justify-start" />
      </div>
    </div>
  );
}

export default function ChatMessage({ message }) {
  const { role, content } = message;
  const { language } = useContext(UIContext);

  const isUser = role === "user";
  const isAssistant = role === "assistant";

  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const testContent =
    "Certainly. Here’s a detailed explanation that spans multiple lines to simulate a long, thoughtful AI response designed to fill the entire MainArea. In professional maritime operations, it is critical that every officer understands not only the procedural steps, but also the underlying purpose and implications of each action taken during navigation, cargo transfer, or inspection readiness.\n\nFor instance, during Port State Control preparation, a well-structured checklist not only ensures compliance but also boosts the confidence of your crew and demonstrates operational discipline to inspectors. This includes readiness of logbooks, certifications, safety equipment, engine room cleanliness, and bridge documentation.\n\nFurthermore, the integration of modern digital tools, such as AI-enhanced checklists and real-time inspection simulations, can dramatically reduce human error and enhance compliance readiness. It is not simply about ticking boxes, but about maintaining a culture of safety, efficiency, and continuous improvement across all departments on board the vessel.\n\nThus, leveraging tools like DeepSea AI not only improves inspection outcomes but also cultivates a professional standard that aligns with global best practices across IMO, SOLAS, and ISM Code frameworks.";

  const finalText = isAssistant ? testContent : content;

  const handleCopy = () => {
    if (typeof window === "undefined") return;

    if (typeof finalText === "string" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(finalText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(finalText));
    } else {
      fallbackCopy(finalText);
    }
  };

  function fallbackCopy(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy не поддерживается этим браузером.");
    }
  }

  // Не рендерим ничего, пока не клиент (SSR-safe)
  if (!isClient) return null;

  if (isUser) {
    return (
      <UserMessage content={content} copied={copied} onCopy={handleCopy} />
    );
  }
  if (isAssistant) {
    return (
      <AssistantMessage content={finalText} copied={copied} onCopy={handleCopy} />
    );
  }
  return null;
}
