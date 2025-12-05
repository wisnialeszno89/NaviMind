import Groq from "groq-sdk";
import { AI_MODES } from "@/lib/modes";

export const runtime = "edge";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  const { messages, mode } = await req.json();

  const systemPrompt = AI_MODES[mode] || AI_MODES.default;

  // 🧹 USUWAMY puste wiadomości asystenta (powstają podczas retry)
  const cleanedMessages = messages.filter(
    (m: any) => !(m.role === "assistant" && (!m.content || m.content.trim() === ""))
  );

  // 🧹 UPEWNIAMY SIĘ, ŻE SYSTEM PROMPT ZAWSZE JEST PIERWSZY
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...cleanedMessages,
  ];

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    // STREAM ON
    stream: true,

    messages: fullMessages,

    // 🧠 lepsza kontrola jakości tekstu
    temperature: 0.65,
    top_p: 0.9,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(token));
        }
      } catch (err) {
        console.error("Streaming error:", err);
        controller.enqueue(encoder.encode("\n[STREAMING ERROR]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}