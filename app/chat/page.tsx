"use client";

import { useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ShortcutType = "clarify" | "analyze" | "plan" | "emotion" | null;

// ─────────────────────────────────────────────
// LOCAL STORAGE CHAT
// ─────────────────────────────────────────────
function loadChat(): Message[] {
  try {
    const raw = localStorage.getItem("nm_chat");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChat(messages: Message[]) {
  try {
    localStorage.setItem("nm_chat", JSON.stringify(messages));
  } catch {}
}

// ─────────────────────────────────────────────
// SHORTCUT SYSTEM
// ─────────────────────────────────────────────
function detectShortcut(input: string): ShortcutType {
  if (!input.startsWith("/")) return null;

  const cmd = input.slice(1).split(" ")[0].trim().toLowerCase();
  const valid = ["clarify", "analyze", "plan", "emotion"];

  return valid.includes(cmd) ? (cmd as ShortcutType) : null;
}

function shortcutPrompt(type: ShortcutType, userMessage: string): string {
  switch (type) {
    case "clarify":
      return `Tryb: CLARIFY
Pomóż uporządkować myśl.
Użytkownik: "${userMessage}"`;

    case "analyze":
      return `Tryb: ANALYZE
Analiza logiczna sytuacji.
Użytkownik: "${userMessage}"`;

    case "plan":
      return `Tryb: PLAN
Stwórz konkretny plan działania.
Użytkownik: "${userMessage}"`;

    case "emotion":
      return `Tryb: EMOTION
Pomóż nazwać i uspokoić emocje.
Użytkownik: "${userMessage}"`;

    default:
      return userMessage;
  }
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Record<number, ShortcutType[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // FLOW MODE SYSTEM
  const [flowMode, setFlowMode] = useState(false);
  const [awaitingFlowTopic, setAwaitingFlowTopic] = useState(false);
  const [flowTopic, setFlowTopic] = useState<string | null>(null);

  // ───────────────────────────────────────────
  // INTRO + RESTORE
  // ───────────────────────────────────────────
  useEffect(() => {
    const visits = Number(localStorage.getItem("nm_visits") || "0");
    const lastVisit = Number(localStorage.getItem("nm_lastVisit") || "0");
    const now = Date.now();

    const history = loadChat();

    if (history.length > 0) {
      setMessages(history);
    } else {
      const diffHours = (now - lastVisit) / 1000 / 60 / 60;

      let intro =
        visits === 0
          ? "Cześć, jestem NaviMind. Od czego zaczynamy?"
          : diffHours > 24 * 7
          ? "Trochę Cię nie było. Co ostatnio najbardziej Cię zajmuje?"
          : diffHours > 24
          ? "Hej, wracasz? Kontynuujemy?"
          : "Wracamy do gry. Co teraz przerabiamy?";

      const initialMsg: Message = {
        role: "assistant" as const,
        content: intro,
      };

      setMessages([initialMsg]);
      saveChat([initialMsg]);
    }

    localStorage.setItem("nm_visits", (visits + 1).toString());
    localStorage.setItem("nm_lastVisit", Date.now().toString());
  }, []);

  // ───────────────────────────────────────────
  // AI AUTO-SUGGESTIONS
  // ───────────────────────────────────────────
  async function getAutoSuggestions(userMessage: string, index: number) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `
Twoje zadanie: wybierz NAJLEPSZE tryby pomocy.
Możliwe: clarify, analyze, plan, emotion.
Zwróć TYLKO tablicę JSON.

Wiadomość użytkownika:
"${userMessage}"
`,
        }),
      });

      const data = await res.json();
      let parsed: ShortcutType[] = [];

      try {
        parsed = JSON.parse(data.reply);
      } catch {
        parsed = [];
      }

      setAiSuggestions((prev) => ({ ...prev, [index]: parsed }));
    } catch {}
  }

  // ───────────────────────────────────────────
  // SEND MESSAGE
  // ───────────────────────────────────────────
  async function sendMessage(forced?: string) {
    const text = forced ?? input;
    if (!text.trim() || loading) return;

    const messageText = text.trim();

    // FLOW MODE — step 1: choosing the topic
    if (awaitingFlowTopic) {
      setFlowTopic(messageText);
      setAwaitingFlowTopic(false);
      setFlowMode(true);

      const confirm: Message = {
        role: "assistant" as const,
        content: `Dobrze. Skupiamy się na temacie: **${messageText}**.\nO czym dokładnie chcesz dziś porozmawiać?`,
      };

      const updated: Message[] = [
        ...messages,
        { role: "user" as const, content: messageText },
        confirm,
      ];

      setMessages(updated);
      saveChat(updated);
      setInput("");
      return;
    }

    // SHORTCUT DETECT
    const shortcut = detectShortcut(messageText);
    const cleanInput =
      shortcut === null
        ? messageText
        : messageText.replace(`/${shortcut}`, "").trim();

    const userMsg: Message = {
      role: "user" as const,
      content: shortcut ? `/${shortcut} ${cleanInput}` : cleanInput,
    };

    const msgIndex = messages.length;
    const newList = [...messages, userMsg];
    setMessages(newList);
    saveChat(newList);
    setInput("");

    // BUILD FINAL PROMPT
    let finalPrompt = shortcutPrompt(shortcut, cleanInput);

    if (flowMode && flowTopic) {
      finalPrompt = `
Tryb: FLOW
Temat przewodni: ${flowTopic}

Zadanie:
- trzymaj się tematu
- prowadź głęboko
- zero ogólników
- kończ pytaniem pogłębiającym

Wiadomość:
"${cleanInput}"
`;
    }

    setLoading(true);
    getAutoSuggestions(cleanInput, msgIndex);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalPrompt }),
      });

      const data = await res.json();

      const botMsg: Message = {
        role: "assistant" as const,
        content: data?.reply ?? "Błąd odpowiedzi.",
      };

      const updated: Message[] = [...newList, botMsg];
      setMessages(updated);
      saveChat(updated);
    } catch {
      const botMsg: Message = {
        role: "assistant" as const,
        content: "Błąd połączenia.",
      };

      const updated: Message[] = [...newList, botMsg];
      setMessages(updated);
      saveChat(updated);
    } finally {
      setLoading(false);
    }
  }

  // ───────────────────────────────────────────
  // FLOW BUTTON
  // ───────────────────────────────────────────
  function toggleFlowMode() {
    if (!flowMode) {
      setAwaitingFlowTopic(true);

      const ask: Message = {
        role: "assistant" as const,
        content: "Jaki jeden konkretny temat chcesz dziś naprawdę przepracować?",
      };

      const updated: Message[] = [...messages, ask];
      setMessages(updated);
      saveChat(updated);
    } else {
      setFlowMode(false);
      setFlowTopic(null);
      setAwaitingFlowTopic(false);

      const msg: Message = {
        role: "assistant" as const,
        content: "Wyłączam Flow Mode. Wracamy do normalnej rozmowy.",
      };

      const updated: Message[] = [...messages, msg];
      setMessages(updated);
      saveChat(updated);
    }
  }

  // ───────────────────────────────────────────
  // RESET CHAT
  // ───────────────────────────────────────────
  function resetChat() {
    const msg: Message = {
      role: "assistant" as const,
      content: "Zaczynamy od nowa. Co masz na myśli?",
    };

    const updated: Message[] = [msg];
    setMessages(updated);
    setAiSuggestions({});
    saveChat(updated);

    setFlowTopic(null);
    setFlowMode(false);
    setAwaitingFlowTopic(false);
  }

  // ───────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#f6f7fb]">

      {/* TOP BAR */}
      <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-[#2b3a67]">
            💬 NaviMind
          </h2>
          <p className="text-sm text-gray-500">
            Twój osobisty przewodnik klarowności.
          </p>

          {flowMode && flowTopic && (
            <p className="text-xs text-blue-600 mt-1">
              FLOW MODE: <span className="font-semibold">{flowTopic}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleFlowMode}
            className={`px-3 py-2 text-sm rounded-lg transition text-white ${
              flowMode ? "bg-blue-700" : "bg-blue-600"
            }`}
          >
            {flowMode ? "Wyłącz Flow" : "Flow Mode"}
          </button>

          <button
            onClick={resetChat}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">

            <div
              className={`max-w-[80%] p-3 rounded-xl shadow text-sm whitespace-pre-wrap ${
                m.role === "assistant"
                  ? "bg-white border text-gray-800"
                  : "bg-blue-600 ml-auto text-white"
              }`}
            >
              {m.content}
            </div>

            {aiSuggestions[i] && aiSuggestions[i]!.length > 0 && (
              <div className="flex gap-2 ml-1 text-xs text-gray-600">
                <span className="opacity-70">Sugeruję:</span>
                {aiSuggestions[i]!.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(`/${s} proszę.`)}
                    className="px-2 py-1 bg-white border rounded shadow-sm hover:bg-gray-100"
                  >
                    {s === "clarify"
                      ? "Wyjaśnij"
                      : s === "analyze"
                      ? "Analiza"
                      : s === "plan"
                      ? "Plan"
                      : "Emocje"}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="max-w-[80%] p-3 rounded-xl bg-white border animate-pulse text-gray-500">
            NaviMind pisze…
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white shadow-inner">
        <div className="flex gap-3">
          <input
            className="flex-1 p-3 rounded bg-[#f0f0f5] text-gray-900 outline-none border border-[#ccc] placeholder-gray-500"
            placeholder="Napisz…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
}