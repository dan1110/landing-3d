/**
 * Voice layer. speak() tries the server TTS (/api/tts, real provider when a key is
 * configured) and falls back to the browser's SpeechSynthesis. listen() uses the
 * browser's SpeechRecognition. The rest of the app only calls these two.
 */

const LANG = "vi-VN";

let serverTts: boolean | null = null; // null = unknown until first call
let current: HTMLAudioElement | null = null;

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === lang && /female|nữ|HoaiMy|Linh/i.test(v.name)) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
  );
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || "Audio" in window);
}

/** True once we know the server has a real TTS provider. */
export function hasServerTts(): boolean {
  return serverTts === true;
}

async function speakServer(text: string): Promise<boolean> {
  if (serverTts === false) return false;
  try {
    const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (res.status === 503) {
      serverTts = false;
      return false;
    }
    if (!res.ok) return false;
    serverTts = true;
    const url = URL.createObjectURL(await res.blob());
    await new Promise<void>((resolve) => {
      const a = new Audio(url);
      current = a;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

function speakBrowser(text: string, lang: string): Promise<void> {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1.0;
    u.pitch = 1.05;
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

/** Speak `text`; resolves when playback ends. Cancels any prior speech. */
export async function speak(text: string, lang = LANG): Promise<void> {
  if (typeof window === "undefined") return;
  stopSpeaking();
  if (await speakServer(text)) return;
  await speakBrowser(text, lang);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (current) {
    current.pause();
    current = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return getRecognition() !== null;
}

/** Listen once; resolves with the transcript, or null on no-speech/denied/unsupported. */
export function listen(lang = LANG): Promise<string | null> {
  const Ctor = getRecognition();
  if (!Ctor) return Promise.resolve(null);
  return new Promise((resolve) => {
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let done = false;
    const finish = (v: string | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    rec.onresult = (e) => finish(e.results[0]?.[0]?.transcript ?? null);
    rec.onerror = () => finish(null);
    rec.onend = () => finish(null);
    rec.start();
  });
}
