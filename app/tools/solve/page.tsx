"use client";

import { useState } from "react";

type SolveSession = {
  problem: string;
  root: string;
  plan: string;
  timestamp: number;
};

// SAVE / LOAD
function loadHistory(): SolveSession[] {
  try {
    return JSON.parse(localStorage.getItem("nm_solve_history") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(data: SolveSession[]) {
  localStorage.setItem("nm_solve_history", JSON.stringify(data));
}

export default function SolveMode() {
  const [problem, setProblem] = useState("");
  const [root, setRoot] = useState("");
  const [plan, setPlan] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const session: SolveSession = {
      problem,
      root,
      plan,
      timestamp: Date.now(),
    };

    const existing = loadHistory();
    const updated = [...existing, session];

    saveHistory(updated);
    setSaved(true);
  }

  return (
    <div className="flex flex-col p-6 space-y-6 text-white bg-[#0d0d0d] min-h-screen">
      <h1 className="text-2xl font-semibold">🧩 Solve Mode</h1>
      <p className="text-gray-400">Przeprowadź szybką analizę problemu krok po kroku.</p>

      {/* PROBLEM */}
      <div>
        <label className="block mb-1 text-gray-300">1) Problem:</label>
        <textarea
          className="w-full p-3 rounded bg-[#1a1a1a] border border-[#333]"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={3}
        />
      </div>

      {/* ROOT CAUSE */}
      <div>
        <label className="block mb-1 text-gray-300">2) Główna przyczyna:</label>
        <textarea
          className="w-full p-3 rounded bg-[#1a1a1a] border border-[#333]"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
          rows={3}
        />
      </div>

      {/* PLAN */}
      <div>
        <label className="block mb-1 text-gray-300">3) Plan działania:</label>
        <textarea
          className="w-full p-3 rounded bg-[#1a1a1a] border border-[#333]"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={3}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!problem || !root || !plan}
        className="px-5 py-3 bg-blue-600 rounded-lg font-semibold disabled:bg-gray-600"
      >
        Zapisz rozwiązanie
      </button>

      {saved && (
        <p className="text-green-500">✔ Zapisano! Możesz zobaczyć historię w menu.</p>
      )}
    </div>
  );
}