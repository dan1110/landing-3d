"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { COMPANION_NAME, ROOMS, useGame, type RoomId } from "@/store/game";
import { canListen, hasServerTts, listen, speak, stopSpeaking } from "@/lib/voice";

gsap.registerPlugin(useGSAP);

const HELLO = `Chào bạn, mình là ${COMPANION_NAME}, lễ tân của SolidBytes HQ. Hôm nay bạn muốn gì?`;
const TOUR_LINE = "Tuyệt. Đi cùng mình nhé — cuộn xuống để qua từng phòng.";
const JUMP_LINE = (label: string) => `Được, mình đưa bạn tới ${label} ngay.`;
const IDEA_LINE = (idea: string) => `“${idea}” — hay đó. Qua Brain Lab, mình phác kiến trúc cho bạn.`;

type Mode = "menu" | "rooms" | "idea" | "listening" | "leaving";

/**
 * Receptionist greeting: the lobby is visible behind, the companion waves,
 * and the visitor picks a tour, a room, or tells their idea. Hands over to the rail.
 */
export default function Welcome() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("menu");
  const [text, setText] = useState("");
  const [missed, setMissed] = useState(false);
  const { setPhase, setIdea, say, voiceOn, setVoiceOn, jumpTo, speech } = useGame();

  useGSAP(
    () => {
      gsap.from(".w-item", { y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
    },
    { scope: root, dependencies: [mode] },
  );

  const finish = async (line: string, next: () => void) => {
    setMode("leaving");
    say(line);
    const spoken = voiceOn ? speak(line) : Promise.resolve();
    await Promise.race([spoken, new Promise((r) => setTimeout(r, 3000))]);
    const faded = new Promise<void>((resolve) => {
      gsap.to(root.current, { opacity: 0, y: 20, duration: 0.5, ease: "power2.inOut", onComplete: resolve });
    });
    await Promise.race([faded, new Promise((r) => setTimeout(r, 800))]);
    next();
    setPhase("explore");
  };

  const tour = () => finish(TOUR_LINE, () => {});
  const jump = (id: RoomId) => {
    const room = ROOMS.find((r) => r.id === id)!;
    void finish(JUMP_LINE(room.label), () => jumpTo(id));
  };
  const idea = (value: string) => {
    setIdea(value);
    void finish(IDEA_LINE(value), () => jumpTo("brain-lab"));
  };
  const talk = async () => {
    stopSpeaking();
    setMode("listening");
    const heard = await listen();
    if (heard) idea(heard);
    else {
      setMissed(true);
      setMode("idea");
    }
  };

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-4 pb-8 md:items-center md:p-6">
      <div className="glass backdrop-blur-xl pointer-events-auto w-full max-w-md rounded-3xl p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/15 bg-brand-soft">
            <Image src="/companion.png" alt={COMPANION_NAME} fill sizes="56px" className="scale-[1.9] object-cover object-[50%_18%]" priority />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted">{COMPANION_NAME} · Lễ tân SolidBytes HQ</div>
            <p className="w-item mt-0.5 text-[15px] leading-snug">{mode === "leaving" ? speech : HELLO}</p>
          </div>
        </div>

        {mode === "menu" && (
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={tour} className="w-item rounded-2xl bg-brand px-4 py-3 text-left text-sm font-semibold text-white hover:brightness-110">
              Dẫn mình tham quan HQ
              <span className="block text-xs font-normal text-white/75">5 phòng · 2 phút · {COMPANION_NAME} kể chuyện bằng giọng nói</span>
            </button>
            <button type="button" onClick={() => setMode("rooms")} className="w-item rounded-2xl border border-white/12 px-4 py-3 text-left text-sm hover:bg-white/5">
              Tới thẳng một phòng
              <span className="block text-xs text-muted">Brain Lab · Load Arena · Team Floor · Mission Control</span>
            </button>
            <button type="button" onClick={() => setMode("idea")} className="w-item rounded-2xl border border-white/12 px-4 py-3 text-left text-sm hover:bg-white/5">
              Mình có ý tưởng muốn kể
              <span className="block text-xs text-muted">Nói hoặc gõ — {COMPANION_NAME} phác kiến trúc ngay</span>
            </button>
          </div>
        )}

        {mode === "rooms" && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {ROOMS.filter((r) => r.id !== "lobby").map((r) => (
              <button key={r.id} type="button" onClick={() => jump(r.id)} className="w-item rounded-2xl border border-white/12 px-4 py-3 text-left hover:bg-white/5">
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-muted">{r.shows}</div>
              </button>
            ))}
            <button type="button" onClick={() => setMode("menu")} className="w-item col-span-2 text-xs text-muted hover:text-foreground">
              ← Quay lại
            </button>
          </div>
        )}

        {(mode === "idea" || mode === "listening") && (
          <form
            className="mt-5 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) idea(text.trim());
            }}
          >
            {missed && <div className="w-item text-xs text-muted">Mình chưa nghe rõ — nói lại hoặc gõ nhé.</div>}
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ví dụ: app đặt đồ ăn cho 100k user"
              className="w-item w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <div className="w-item flex items-center justify-between gap-2">
              <button type="button" onClick={() => setMode("menu")} className="text-xs text-muted hover:text-foreground">
                ← Quay lại
              </button>
              <div className="flex gap-2">
                {canListen() && (
                  <button type="button" onClick={talk} disabled={mode === "listening"} className="rounded-full border border-white/12 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-60">
                    {mode === "listening" ? "● đang nghe…" : "🎙 Nói"}
                  </button>
                )}
                <button type="submit" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
                  Gửi
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted/70">
          <span>{hasServerTts() ? "Voice AI" : "Giọng demo của trình duyệt"}</span>
          <button type="button" onClick={() => setVoiceOn(!voiceOn)} className="hover:text-foreground">
            {voiceOn ? "🔊 Giọng nói: bật" : "🔇 Giọng nói: tắt"}
          </button>
        </div>
      </div>
    </div>
  );
}
