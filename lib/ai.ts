import Groq from "groq-sdk";
import { AI_MODES } from "@/lib/modes"; // <- tryby AI

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ------------------------------------
// GŁÓWNA FUNKCJA DO TWORZENIA ODPOWIEDZI
// ------------------------------------
export async function askGroq(messages: any[], mode: string = "default") {
  try {
    const systemPrompt = AI_MODES[mode] || AI_MODES.default;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq API error:", err);
    throw new Error("Groq request failed");
  }
}

// ------------------------------------
// GENEROWANIE TYTUŁU WĄTKU
// ------------------------------------
export async function generateTitle(firstUserMessage: string) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Stwórz bardzo krótki, trafny, maks 2–4 wyrazowy tytuł opisujący rozmowę.",
        },
        { role: "user", content: firstUserMessage },
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "Rozmowa";
  } catch (err) {
    console.error("Groq title error:", err);
    return "Rozmowa";
  }
}
