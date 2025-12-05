"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-full w-full flex">
      
      {/* SIDEBAR — DESKTOP */}
      <div className="hidden md:block w-64 border-r border-neutral-800 bg-neutral-950">
        <Sidebar />
      </div>

      {/* SIDEBAR — MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-neutral-950 border-r border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onSelect={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 relative">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden absolute top-3 left-3 z-50 bg-neutral-800 px-3 py-1.5 text-sm rounded border border-neutral-700"
          onClick={() => setMobileOpen(true)}
        >
          Menu
        </button>

        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}