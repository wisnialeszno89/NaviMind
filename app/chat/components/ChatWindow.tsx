"use client";

import { useEffect, useState, useRef } from "react";
import { chatStore, Message } from "@/lib/chatStore";

import SendForm from "@/app/chat/components/SendForm";
import MessageBubble from "@/components/MessageBubble";
import TypingBubble from "@/components/TypingBubble";
import ChatHeader from "@/app/chat/components/ChatHeader";
import OnboardingBanner from "@/app/chat/components/OnboardingBanner";
import { useRouter } from "next/navigation";

type Props = {
  threadId: string;
  onRefresh: () => void;
  mode: string; // NIE używamy już tego — zostawiamy dla kompatybilności
};

export default function ChatWindow({ threadId, onRefresh }: Props) {
  const router = useRouter();

  /* -------------------------------------------
     MODE (AI TRYB)
  --------------------------------------------- */
  const [modeState, setModeState] = useState<string>(() => {
    try {
      return localStorage.getItem("nm_mode") || "normal";
    } catch {
      return "normal";
    }
  });

  const [messages, setMessages] = useState<Message[]>(
    chatStore.getMessages(threadId)
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [showOnboard, setShowOnboard] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("nm_onboard_seen_v1");
      return v !== "1";
    } catch {
      return true;
    }
  });

  /* INIT THREAD ON MOUNT / THREAD CHANGE */
  useEffect(() => {
    chatStore.initThread(threadId);
    setMessages([...chatStore.getMessages(threadId)]);
  }, [threadId]);

  /* SUBSCRIBE TO STORE */
  useEffect(() => {
    const unsub = chatStore.subscribe(() => {
      setMessages([...chatStore.getMessages(threadId)]);
    });
    return () => unsub();
  }, [threadId]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ACTIONS */
  function handleDelete(index: number) {
    chatStore.deleteMessage(threadId, index);
  }

  function handleEdit(index: number) {
    const msg = messages[index];
    if (!msg || msg.role !== "user") return;

    chatStore.setDraft(threadId, msg.content);
    chatStore.deleteMessage(threadId, index);
  }

  async function handleRetry(index: number) {
    await chatStore.retryMessage(threadId, index);
    onRefresh();
  }

  /* NEW THREAD (Nowy wątek) */
  function handleNewThread() {
    const id = String(Date.now());
    router.push(`/chat/${id}`);
  }

  /* CLEAR THREAD */
  function handleClearThread() {
    chatStore.clearThread(threadId);
    router.refresh();
  }

  /* DISMISS ONBOARDING */
  function dismissOnboard() {
    try {
      localStorage.setItem("nm_onboard_seen_v1", "1");
    } catch {}
    setShowOnboard(false);
  }

  /* RENDER */
  return (
    <div className="flex flex-col flex-1 bg-neutral-900 text-white h-full">

      {/* HEADER */}
      <ChatHeader
        threadId={threadId}
        mode={modeState}
        onModeChange={(m) => setModeState(m)}
        onNewThread={handleNewThread}
        onClearThread={handleClearThread}
      />

      {/* ONBOARDING */}
      {showOnboard && (
        <OnboardingBanner visible={showOnboard} onDismiss={dismissOnboard} />
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            content={m.content}
            role={m.role}
            time={new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            onRetry={m.role === "assistant" ? () => handleRetry(i) : undefined}
            onEdit={m.role === "user" ? () => handleEdit(i) : undefined}
            onDelete={() => handleDelete(i)}
          />
        ))}

        {chatStore.isTyping(threadId) && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <SendForm
        threadId={threadId}
        onSend={onRefresh}
        mode={modeState}
      />
    </div>
  );
}