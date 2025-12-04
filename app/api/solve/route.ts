import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Jesteś NaviMind Solve Mode — prowadzisz użytkownika krok po kroku,
krótko, konkretnie, praktycznie. Zero lania wody.
Twoje odpowiedzi mają być klarowne, krótkie i mocne.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({ reply: response.output_text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Błąd Solve Mode" }, { status: 500 });
  }
}