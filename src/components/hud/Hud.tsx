"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ROOMS, ROOM_BY_ID, useGame } from "@/store/game";
import { canListen, listen, speak, stopSpeaking } from "@/lib/voice";

gsap.registerPlugin(useGSAP);

/** Overlay during exploration: brand, room caption, companion subtitle, rail progress, mic. */
export default function Hud() {
  const root = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const subtitle = useRef<HTMLDivElement>(null);
  const room = useGame((s) => s.room);
  const speech = useGame((s) => s.speech);
  const voiceOn = useGame((s) => s.voiceOn);
  const setVoiceOn = useGame((s) => s.setVoiceOn);
  const say = useGame((s) => s.say);
  const [listening, setListening] = useState(false);
  const current = ROOM_BY_ID[room];
  const index = ROOMS.findIndex((r) => r.id === room);

  useGSAP(
    () => {
      gsap.from(".hud-item", { y: 12, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power2.out" });
    },
    { scope: root },
  );
  useGSAP(
    () => {
      if (!caption.current) return;
      gsap.fromTo(caption.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
    },
    { dependencies: [room] },
  );
  useGSAP(
    () => {
      if (!speech || !subtitle.current) return;
      gsap.fromTo(subtitle.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    },
    { dependencies: [speech] },
  );

  const ask = async () => {
    stopSpeaking();
    setListening(true);
    const heard = await listen();
    setListening(false);
    if (!heard) return;
    // Placeholder reply until the real Voice AI is wired in (docs/BRIEF.md R3).
    const reply = `Mình nghe: “${heard}”. Khi Voice AI thật được nối, mình sẽ trả lời ngay tại đây.`;
    say(reply);
    if (voiceOn) void speak(reply);
  };

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="hud-item glass backdrop-blur-xl rounded-2xl px-4 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted">SolidBytes HQ</div>
          <div className="text-base font-semibold">Mission: Ship It</div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (voiceOn) stopSpeaking();
            setVoiceOn(!voiceOn);
          }}
          className="hud-item glass backdrop-blur-xl pointer-events-auto rounded-full px-3.5 py-2 text-[11px] uppercase tracking-widest text-muted hover:text-foreground"
        >
          {voiceOn ? "🔊 Voice" : "🔇 Voice"}
        </button>
      </header>

      {/* rail progress */}
      <nav className="hud-item pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2.5 md:right-6">
        {ROOMS.map((r, i) => (
          <div key={r.id} className="flex items-center justify-end gap-2">
            <span className={`hidden text-[10px] uppercase tracking-widest transition md:inline ${i === index ? "text-foreground" : "text-muted/40"}`}>
              {r.label}
            </span>
            <span className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-brand" : "w-1.5 bg-white/25"}`} />
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3">
        {speech && (
          <div ref={subtitle} className="glass backdrop-blur-xl mx-auto flex max-w-xl items-center gap-3 rounded-2xl px-4 py-2.5 text-sm md:text-[15px]">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-soft">
              <Image src="/companion.png" alt="" fill sizes="32px" className="scale-[1.9] object-cover object-[50%_18%]" />
            </div>
            <span>{speech}</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-4">
          <div ref={caption} className="glass backdrop-blur-xl max-w-lg rounded-2xl px-5 py-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-brand">
              {index + 1} / {ROOMS.length} · {current.shows}
            </div>
            <div className="text-xl font-semibold md:text-2xl">{current.label}</div>
            <p className="mt-1 text-sm text-muted">{current.caption}</p>
          </div>

          <div className="hud-item flex shrink-0 flex-col items-end gap-2">
            {canListen() && (
              <button
                type="button"
                onClick={ask}
                disabled={listening}
                className="glass backdrop-blur-xl pointer-events-auto rounded-full px-4 py-2.5 text-sm hover:bg-white/10 disabled:opacity-60"
              >
                {listening ? "● đang nghe…" : "🎙 Hỏi companion"}
              </button>
            )}
            <div className="text-[10px] uppercase tracking-widest text-muted/70">Cuộn để đi tiếp ↓</div>
          </div>
        </div>
      </div>
    </div>
  );
}
