"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Color, InstancedMesh, Object3D } from "three";
import { useGame, type Room } from "@/store/game";
import { Model } from "./Kenney";
import { Divider, MAT, Monitor, Rack } from "./props";

const wallX = -10.98; // just in front of the left wall

/** A workstation: Kenney desk + chair + our glowing monitor + keyboard/mouse. */
function Workstation({ x, z, rot = 0, glow }: { x: number; z: number; rot?: number; glow?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Model name="desk" />
      <Monitor position={[0, 0.76, -0.1]} glow={glow} />
      <Model name="computerKeyboard" position={[0, 0.76, 0.18]} />
      <Model name="computerMouse" position={[0.42, 0.76, 0.18]} />
      <Model name="chairDesk" position={[0, 0, 0.75]} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

/* ---------------------------------------------------------------- Lobby */
export function Lobby({ room }: { room: Room }) {
  const [, , z] = room.position;
  return (
    <group position={[0, 0, z]}>
      {/* reception counter */}
      <group position={[-4, 0, -2.5]}>
        <Model name="kitchenBar" position={[-1.3, 0, 0]} />
        <Model name="kitchenBar" position={[-0.43, 0, 0]} />
        <Model name="kitchenBar" position={[0.44, 0, 0]} />
        <Model name="kitchenBar" position={[1.31, 0, 0]} />
        <mesh position={[0, 0.86, 0]} castShadow>
          <boxGeometry args={[3.7, 0.05, 0.6]} />
          <meshStandardMaterial color={MAT.oak} roughness={0.5} />
        </mesh>
        <Model name="laptop" position={[0.5, 0.88, 0]} rotation={[0, 0.4, 0]} />
        <Model name="plantSmall2" position={[-1.4, 0.88, 0]} />
        <mesh position={[0, 0.45, 0.31]}>
          <planeGeometry args={[1.5, 0.35]} />
          <meshStandardMaterial color={MAT.brand} roughness={0.6} />
        </mesh>
      </group>
      {/* logo wall */}
      <mesh position={[wallX, 2.1, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7, 2.4]} />
        <meshStandardMaterial color={MAT.oakDark} roughness={0.7} />
      </mesh>
      <Html position={[wallX + 0.05, 2.1, -3]} rotation={[0, Math.PI / 2, 0]} transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div className="select-none whitespace-nowrap text-center">
          <div className="text-6xl font-semibold tracking-tight text-white">SolidBytes</div>
          <div className="mt-1 text-sm uppercase tracking-[0.5em] text-white/70">Feel the tech · Make the growth</div>
        </div>
      </Html>
      {/* waiting lounge */}
      <Model name="rugRectangle" position={[4.5, 0, -1.5]} scale={1.6} />
      <Model name="loungeSofaLong" position={[4.5, 0, -3.2]} />
      <Model name="loungeChair" position={[7, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]} />
      <Model name="tableCoffeeGlass" position={[4.5, 0, -1.2]} />
      <Model name="books" position={[4.3, 0.42, -1.2]} rotation={[0, 0.3, 0]} />
      <Model name="lampRoundFloor" position={[2.2, 0, -3.6]} />
      <Model name="pottedPlant" position={[-8.5, 0, 3.5]} scale={1.3} />
      <Model name="plantSmall1" position={[8.5, 0, -6]} scale={1.4} />
      <Model name="coatRackStanding" position={[-9, 0, -7]} />
      <Divider position={[0, 0, -8.5]} width={9} />
    </group>
  );
}

/* ------------------------------------------------------------ Brain Lab */
const NODES = [
  { name: "Client", x: 6, y: 50 },
  { name: "API Gateway", x: 26, y: 50 },
  { name: "Service", x: 48, y: 50 },
  { name: "Queue", x: 70, y: 28 },
  { name: "Cache", x: 70, y: 72 },
  { name: "DB", x: 92, y: 50 },
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
];

export function BrainLab({ room }: { room: Room }) {
  const [, , z] = room.position;
  const idea = useGame((s) => s.idea);
  return (
    <group position={[0, 0, z]}>
      {/* glass-board on the left wall with the architecture sketch */}
      <mesh position={[wallX, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 2.6]} />
        <meshStandardMaterial color="#f7f7f4" roughness={0.3} />
      </mesh>
      <Html position={[wallX + 0.03, 2.0, 0]} rotation={[0, Math.PI / 2, 0]} transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div className="relative h-[20rem] w-[62rem] select-none">
          <div className="absolute left-4 top-3 text-2xl font-medium text-neutral-800">
            Kiến trúc cho: <span className="text-[#1f6fe0]">{idea ? `“${idea}”` : "ý tưởng của bạn"}</span>
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {EDGES.map(([a, b], i) => (
              <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="#1f6fe0" strokeWidth={0.4} strokeDasharray="1.2 0.8" />
            ))}
          </svg>
          {NODES.map((n) => (
            <div
              key={n.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-[#1f6fe0] bg-white px-4 py-2 text-xl font-medium text-neutral-800 shadow"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              {n.name}
            </div>
          ))}
        </div>
      </Html>
      <Workstation x={-7} z={3} rot={Math.PI / 2} />
      <Workstation x={-7} z={-3} rot={Math.PI / 2} glow="#ffe9cc" />
      <Model name="bookcaseOpen" position={[-10.5, 0, 6.5]} rotation={[0, Math.PI / 2, 0]} />
      <Model name="bookcaseClosedWide" position={[-10.5, 0, -6.5]} rotation={[0, Math.PI / 2, 0]} />
      <Model name="pottedPlant" position={[-3, 0, 7]} scale={1.2} />
      <Model name="trashcan" position={[-8.5, 0, 0.3]} />
      <Divider position={[0, 0, -9]} width={9} />
    </group>
  );
}

/* ----------------------------------------------------------- Load Arena */
export function LoadArena({ room }: { room: Room }) {
  const [, , z] = room.position;
  const rps = useRef<HTMLSpanElement>(null);
  const p99 = useRef<HTMLSpanElement>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const load = 0.5 + 0.5 * Math.sin(t * 0.7);
    if (rps.current) rps.current.textContent = Math.round(8000 + load * 6500 + Math.sin(t * 9) * 300).toLocaleString("vi-VN");
    if (p99.current) p99.current.textContent = `${Math.round(42 + load * 70 + Math.sin(t * 5) * 6)} ms`;
  });

  return (
    <group position={[0, 0, z]}>
      {/* server room behind glass on the left */}
      <mesh position={[-7.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 10]} />
        <meshStandardMaterial color="#2b2e35" roughness={0.6} />
      </mesh>
      <mesh position={[-4, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4.2]} />
        <meshPhysicalMaterial color="#9fb5c8" transmission={0.85} roughness={0.08} thickness={0.1} transparent opacity={0.3} />
      </mesh>
      {[-3.5, -1.2, 1.2, 3.5].map((zz, i) =>
        [-6.2, -8.6].map((x, j) => <Rack key={`${i}${j}`} position={[x, 0, zz]} rotation={[0, Math.PI / 2, 0]} seed={i + j * 3} />),
      )}
      <pointLight position={[-7.5, 3, 0]} color="#7fc3ff" intensity={25} distance={12} decay={2} />

      {/* wall monitor with live metrics */}
      <mesh position={[wallX, 2.3, -4]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.06, 1.6, 2.8]} />
        <meshStandardMaterial color={MAT.black} />
      </mesh>
      <Html position={[wallX + 0.04, 2.3, -4]} rotation={[0, Math.PI / 2, 0]} transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div className="flex h-[18rem] w-[32rem] select-none flex-col justify-between bg-[#0b1220] p-6 font-mono text-white">
          <div className="text-sm uppercase tracking-[0.3em] text-white/50">Live traffic · mô phỏng</div>
          <div className="flex items-baseline gap-10">
            <div>
              <span ref={rps} className="text-6xl font-semibold text-[#ff8a3d]">0</span>
              <span className="ml-2 text-lg text-white/50">rps</span>
            </div>
            <div>
              <span ref={p99} className="text-6xl font-semibold">0</span>
              <span className="ml-2 text-lg text-white/50">p99</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full w-2/3 bg-[#ff8a3d]" />
          </div>
        </div>
      </Html>
      <Workstation x={3} z={2} glow="#dfe8ff" />
      <Model name="pottedPlant" position={[8, 0, -6]} scale={1.2} />
      <Divider position={[0, 0, -9]} width={9} />
    </group>
  );
}

/* ----------------------------------------------------------- Team Floor */
const DESK_COLS = 4;
const DESK_ROWS = 4;
const PEOPLE = DESK_COLS * DESK_ROWS * 2;
const SHIRTS = ["#e8e4dc", "#3f4a5c", "#8aa5c8", "#c9b79c", "#2f6f73", "#b85c5c"];
const dummy = new Object3D();
const color = new Color();

export function TeamFloor({ room }: { room: Room }) {
  const [, , z] = room.position;
  const bodies = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);

  const seats = useMemo(
    () =>
      Array.from({ length: PEOPLE }, (_, i) => {
        const pair = Math.floor(i / 2);
        const side = i % 2 === 0 ? -1 : 1;
        const c = pair % DESK_COLS;
        const r = Math.floor(pair / DESK_COLS);
        return {
          x: (c - (DESK_COLS - 1) / 2) * 4.2,
          z: (r - (DESK_ROWS - 1) / 2) * 3.4 + side * 1.15,
          face: side === 1 ? Math.PI : 0,
          phase: ((i * 104729) % 628) / 100,
          shirt: SHIRTS[i % SHIRTS.length],
        };
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!bodies.current || !heads.current) return;
    seats.forEach((s, i) => {
      bodies.current!.setColorAt(i, color.set(s.shirt));
      heads.current!.setColorAt(i, color.set(i % 3 === 0 ? "#e9c3a5" : i % 3 === 1 ? "#c98e6a" : "#8d5a3c"));
    });
    bodies.current.instanceColor!.needsUpdate = true;
    heads.current.instanceColor!.needsUpdate = true;
  }, [seats]);

  useFrame(({ clock }) => {
    if (!bodies.current || !heads.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < PEOPLE; i++) {
      const s = seats[i];
      const breathe = Math.sin(t * 1.2 + s.phase) * 0.015;
      dummy.position.set(s.x, 0.78 + breathe, s.z);
      dummy.rotation.set(0, s.face + Math.sin(t * 0.5 + s.phase) * 0.15, 0);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);
      dummy.position.y = 1.32 + breathe;
      dummy.rotation.y += Math.sin(t * 0.8 + s.phase) * 0.2;
      dummy.updateMatrix();
      heads.current.setMatrixAt(i, dummy.matrix);
    }
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, 0, z]}>
      {seats
        .filter((_, i) => i % 2 === 0)
        .map((s, i) => (
          <group key={i} position={[s.x, 0, s.z + 1.15]}>
            <Model name="desk" position={[0, 0, -0.42]} />
            <Model name="desk" position={[0, 0, 0.42]} rotation={[0, Math.PI, 0]} />
            <Monitor position={[0, 0.76, -0.12]} />
            <Monitor position={[0, 0.76, 0.12]} rotation={[0, Math.PI, 0]} glow="#e9f0ff" />
            <Model name="computerKeyboard" position={[0, 0.76, -0.62]} />
            <Model name="computerKeyboard" position={[0, 0.76, 0.62]} rotation={[0, Math.PI, 0]} />
          </group>
        ))}
      <instancedMesh ref={bodies} args={[undefined, undefined, PEOPLE]} castShadow>
        <capsuleGeometry args={[0.2, 0.45, 6, 12]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, PEOPLE]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <Model name="pottedPlant" position={[-9.5, 0, 6]} scale={1.2} />
      <Model name="plantSmall3" position={[-9.5, 0, -6]} scale={1.4} />
      <Model name="bookcaseClosedWide" position={[-10.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Html position={[wallX + 0.05, 2.6, 0]} rotation={[0, Math.PI / 2, 0]} transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div className="select-none whitespace-nowrap text-center">
          <div className="text-7xl font-semibold text-neutral-800">{PEOPLE}+</div>
          <div className="text-sm uppercase tracking-[0.5em] text-neutral-500">Dedicated Bytes</div>
        </div>
      </Html>
      <Divider position={[0, 0, -9]} width={9} />
    </group>
  );
}

/* ------------------------------------------------------ Mission Control */
export function MissionControl({ room }: { room: Room }) {
  const [, , z] = room.position;
  return (
    <group position={[0, 0, z]}>
      <Model name="rugRectangle" position={[0, 0, 0]} scale={2.6} />
      <Model name="tableCross" position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1.6} />
      {[-2.2, -0.75, 0.75, 2.2].map((zz) => (
        <group key={zz}>
          <Model name="chairModernCushion" position={[-1.6, 0, zz]} rotation={[0, Math.PI / 2, 0]} />
          <Model name="chairModernCushion" position={[1.6, 0, zz]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      ))}
      <Model name="laptop" position={[0, 0.84, 0.6]} rotation={[0, -0.5, 0]} />
      <Model name="kitchenCoffeeMachine" position={[8.5, 0, 4]} />
      <Model name="sideTable" position={[8.5, 0, 4]} />
      {/* wall screen */}
      <mesh position={[wallX, 2.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.06, 2.2, 3.9]} />
        <meshStandardMaterial color={MAT.black} />
      </mesh>
      <Html position={[wallX + 0.04, 2.3, 0]} rotation={[0, Math.PI / 2, 0]} transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div className="flex h-[26rem] w-[46rem] select-none flex-col justify-between bg-white p-8 text-neutral-800">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-neutral-500">Mission Control</div>
            <div className="mt-2 text-5xl font-semibold">Đặt lịch với SolidBytes</div>
            <p className="mt-3 max-w-xl text-xl text-neutral-600">
              Gửi mission của bạn. Sol lên lịch meeting — Jev kiểm tra và chỉ chuyển lead thật tới team.
            </p>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="font-medium">Jev · anti-spam gate</span>
            <span className="text-neutral-500">· đang chờ cấu hình</span>
          </div>
        </div>
      </Html>
      <Model name="pottedPlant" position={[-9.5, 0, 6]} scale={1.3} />
      <Model name="plantSmall1" position={[9, 0, -6]} scale={1.4} />
    </group>
  );
}
