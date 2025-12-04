"use client";

import { useEffect, useState } from "react";

type SolveSession = {
  problem: string;
  root: string;
  plan: string;
  timestamp: number;
};

export default function SolveHistory() {
  const [history, setHistory] = useState<SolveSession[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nm_solve_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      setHistory([]);
    }
  }, []);

  return (
    <div className="p-6 text-white bg-[#0d0d0d] min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">📚 Historia rozwiązań</h1>

      {history.length === 0 && (
        <p className="text-gray-400">Brak zapisanych sesji.</p>
      )}

      <div className="space-y-4">
        {history.map((item, i) => (
          <div
            key={i}
            className="p-4 bg-[#1a1a1a] border border-[#333] rounded-lg"
          >
            <p className="text-sm text-gray-400">
              {new Date(item.timestamp).toLocaleString()}
            </p>
            <h2 className="font-semibold mt-2">🧩 Problem:</h2>
            <p>{item.problem}</p>

            <h2 className="font-semibold mt-2">🔍 Główna przyczyna:</h2>
            <p>{item.root}</p>

            <h2 className="font-semibold mt-2">🚀 Plan działania:</h2>
            <p>{item.plan}</p>
          </div>
        ))}
      </div>
    </div>
  );
}