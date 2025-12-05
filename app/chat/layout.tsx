"use client";

import { useState } from "react";
// ❌ Sidebar tymczasowo usuwamy dla MVP
// import Sidebar from "./components/Sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex">
      {/* MAIN CHAT AREA */}
      <div className="flex-1 relative">
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}