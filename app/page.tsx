"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">

      {/* LOGO / TITLE */}
      <h1 className="text-5xl font-bold mb-4 tracking-tight">
        Navi<span className="text-blue-400">Mind</span>
      </h1>

      {/* SUBTITLE */}
      <p className="text-gray-300 max-w-md text-lg mb-10 leading-relaxed">
        Twój osobisty przewodnik klarowności.  
        Zadaje właściwe pytania i prowadzi Cię do sedna.
      </p>

      {/* MAIN CTA */}
      <Link
        href="/chat"
        className="px-7 py-3 bg-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
      >
        Wejdź do sesji →
      </Link>

      {/* FOOTER */}
      <p className="text-gray-600 text-xs mt-12">
        NaviMind © {new Date().getFullYear()}
      </p>

    </div>
  );
}