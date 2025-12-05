import OpenAI from "openai";

export async function GET() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const caps = await client.responses.create({
    model: "gpt-4.1",
    input: "test",
  });

  return Response.json(caps);
}