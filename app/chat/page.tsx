"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  function startChat() {
    const id = String(Date.now());
    router.push(`/chat/${id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-6">
      
      {/* Logo / Avatar */}
      <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center shadow-lg border border-neutral-700 mb-6">
        <svg
          width="36"
          height="36"
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

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">NaviMind</h1>
      <p className="text-neutral-400 mb-8 text-center text-sm max-w-md">
        Inteligentny czat AI nowej generacji.  
        To jest wczesna wersja testowa — możesz zauważyć błędy lub niedokończone funkcje.
      </p>

      {/* CTA BUTTON */}
      <button
        onClick={startChat}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-medium shadow-md transition"
      >
        Przejdź do czatu
      </button>

      {/* Footer note */}
      <div className="text-neutral-600 text-xs mt-12">
        NaviMind – Test Beta v0.1
      </div>
    </div>
  );
}