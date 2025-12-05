// app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Bezpieczeństwo - walidacja prosta
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;
    const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3-70b";

    if (!GROQ_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    // Wywołanie Groq OpenAI-compatible Chat Completions
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.2
      }),
    });

    // Jeśli błąd od Groq → przepuść dalej treść do devloga i zwróć 500
    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      return new Response(errText, { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Parsujemy wynik (nie-stream) i zwracamy tekst asystenta
    const data = await groqRes.json();

    // Standardowy OpenAI-like shape: choices[0].message.content
    const assistantMessage =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "";

    return new Response(JSON.stringify({ text: assistantMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate route error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}