"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ROOMS, rail, roomIndex, useGame } from "@/store/game";
import Hud from "@/components/hud/Hud";
import Welcome from "@/components/hud/Welcome";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Three.js touches `window`; keep the whole world out of SSR.
const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-muted text-sm tracking-widest uppercase">
      Loading HQ…
    </div>
  ),
});

/** Scroll distance per room, in viewport heights. */
const VH_PER_ROOM = 140;

/**
 * Layers (bottom → top): fixed canvas · scroller (owns wheel/touch) · HUD · welcome card.
 * ScrollTrigger maps the scroller's progress onto `rail.target`; <Rail/> does the rest.
 */
export default function WorldLoader() {
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const phase = useGame((s) => s.phase);
  const requestedRoom = useGame((s) => s.requestedRoom);
  const jumpTo = useGame((s) => s.jumpTo);

  useGSAP(
    () => {
      if (!scroller.current || !track.current) return;
      ScrollTrigger.create({
        scroller: scroller.current,
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        // Settle on a room instead of between two.
        snap: { snapTo: 1 / (ROOMS.length - 1), duration: { min: 0.2, max: 0.8 }, delay: 0.05, ease: "power1.inOut" },
        onUpdate: (self) => {
          rail.target = self.progress;
        },
      });
      ScrollTrigger.refresh();
    },
    { scope: scroller, dependencies: [phase] },
  );

  // "Take me straight to …" from the welcome card: scroll the rail there.
  useEffect(() => {
    if (phase !== "explore" || !requestedRoom || !scroller.current) return;
    const el = scroller.current;
    const p = roomIndex(requestedRoom) / (ROOMS.length - 1);
    el.scrollTo({ top: p * (el.scrollHeight - el.clientHeight), behavior: "smooth" });
    jumpTo(null);
  }, [phase, requestedRoom, jumpTo]);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <World />
      </div>

      <div
        ref={scroller}
        className={`fixed inset-0 z-10 ${phase === "explore" ? "overflow-y-auto" : "overflow-hidden"} no-scrollbar`}
      >
        <div ref={track} style={{ height: `${100 + (ROOMS.length - 1) * VH_PER_ROOM}vh` }} />
      </div>

      {phase === "explore" && <Hud />}
      {phase === "welcome" && <Welcome />}
    </>
  );
}
