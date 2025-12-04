import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "NaviMind",
  description: "Twój osobisty przewodnik klarowności.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-[#0d0d0d] text-white antialiased">
        <div className="max-w-2xl mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}