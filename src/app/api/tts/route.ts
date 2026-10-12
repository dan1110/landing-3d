import { NextResponse } from "next/server";

/**
 * Text-to-speech proxy. Uses OpenAI TTS when OPENAI_API_KEY is set; otherwise
 * returns 503 so the client falls back to the browser voice (see src/lib/voice.ts).
 * Swap the fetch below for ElevenLabs / Gemini without touching the client.
 */
export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "no-provider" }, { status: 503 });

  const { text } = (await req.json()) as { text?: string };
  if (!text || text.length > 600) return NextResponse.json({ error: "bad-input" }, { status: 400 });

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE ?? "coral",
      input: text,
      instructions: "Giọng nữ trẻ, thân thiện, tự nhiên, nói tiếng Việt rõ ràng, nhịp vừa phải.",
      response_format: "mp3",
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }
  return new Response(upstream.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
