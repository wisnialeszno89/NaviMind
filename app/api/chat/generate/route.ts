import OpenAI from "openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  // Mapujemy wiadomości usera/assystenta na format Responses API
  const input = messages.map((m: any) => ({
    role: m.role,
    content: [
      {
        type: "text",
        text: m.content
      }
    ]
  }));

  // Otwieramy streaming
  const stream = await client.responses.stream({
    model: "gpt-4.1",
    input,
  });

  const encoder = new TextEncoder();

  const webStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream as any) {

        // Nowe API — to jest jedyne źródło tekstu
        if (event.type === "response.output_text.delta") {
          controller.enqueue(encoder.encode(event.delta));
        }
      }

      controller.close();
    },
  });

  return new Response(webStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}