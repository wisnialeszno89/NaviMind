import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // STREAMING RESPONSE (nowy OpenAI SDK)
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      stream: true,

      input: [
        {
          role: "system",
          content: "Jesteś NaviMind — precyzyjny przewodnik klarowności.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of response) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(new TextEncoder().encode(event.delta));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("STREAM ERROR:", err);

    return NextResponse.json(
      { error: "STREAM_ERROR" },
      { status: 500 }
    );
  }
}