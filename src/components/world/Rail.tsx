"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { ROOMS, companionPose, rail, useGame } from "@/store/game";
import { speak } from "@/lib/voice";

/** Eye-height walk down the corridor, looking slightly left into each room. */
const CAM_OFFSET = new Vector3(4.5, 1.8, 9);
const LOOK_OFFSET = new Vector3(-2.5, 1.3, 0);
const COMPANION_OFFSET = new Vector3(1.2, 0, 4.5);
/** The companion walks a little ahead of the camera so she leads. */
const LEAD = 0.012;

// Scratch
const camPos = new Vector3();
const lookPos = new Vector3();
const compPos = new Vector3();
const tangent = new Vector3();

function curveThroughRooms(offset: Vector3) {
  const pts = ROOMS.map((r) => new Vector3(0, 0, r.position[2]).add(offset));
  return new CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

/**
 * Drives camera and companion along parallel curves from the scroll progress.
 * Owns `rail.progress` smoothing and room-change announcements.
 */
export default function Rail() {
  const curves = useMemo(
    () => ({
      cam: curveThroughRooms(CAM_OFFSET),
      look: curveThroughRooms(LOOK_OFFSET),
      comp: curveThroughRooms(COMPANION_OFFSET),
    }),
    [],
  );
  const lastRoom = useRef(-1);
  const prevCompT = useRef(0);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { phase } = useGame.getState();

    // During the welcome we hold at the lobby (companion waves); afterwards ease toward the scroll target.
    const target = phase === "welcome" ? 0 : rail.target;
    companionPose.wave = MathUtils.damp(companionPose.wave, phase === "welcome" ? 1 : 0, 4, delta);
    rail.progress = MathUtils.damp(rail.progress, target, 5, delta);
    const t = MathUtils.clamp(rail.progress, 0, 1);

    curves.cam.getPointAt(t, camPos);
    curves.look.getPointAt(t, lookPos);
    camera.position.copy(camPos);
    camera.lookAt(lookPos);

    // Companion: slightly ahead, faces her heading while walking, faces the camera when idle.
    const ct = MathUtils.clamp(t + LEAD, 0, 1);
    curves.comp.getPointAt(ct, compPos);
    const dist = compPos.distanceTo(companionPose.position);
    const speed = dist / Math.max(delta, 1e-4);
    companionPose.position.copy(compPos);
    const walk = MathUtils.clamp(speed / 5, 0, 1);
    companionPose.walk = MathUtils.damp(companionPose.walk, walk, 8, delta);
    let yaw: number;
    if (walk > 0.15) {
      curves.comp.getTangentAt(ct, tangent);
      if (ct < prevCompT.current) tangent.negate();
      yaw = Math.atan2(tangent.x, tangent.z);
    } else {
      yaw = Math.atan2(camPos.x - compPos.x, camPos.z - compPos.z);
    }
    let diff = yaw - companionPose.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    companionPose.yaw += diff * Math.min(1, delta * 6);
    prevCompT.current = ct;

    // Announce the room we are closest to (discrete event → store, once per change).
    const idx = Math.round(t * (ROOMS.length - 1));
    if (idx !== lastRoom.current) {
      const first = lastRoom.current === -1;
      lastRoom.current = idx;
      const room = ROOMS[idx];
      const { setRoom, say, voiceOn } = useGame.getState();
      setRoom(room.id);
      if (!first && phase === "explore") {
        say(room.line);
        if (voiceOn) void speak(room.line);
      }
    }
  });

  return null;
}
