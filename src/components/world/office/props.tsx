"use client";

import type { ThreeElements } from "@react-three/fiber";

/* Shared office furniture built from primitives. Materials are deliberately
 * restrained (matte paint, oak, brushed metal) so the scene reads as a real
 * interior. Replace any of these with GLB assets later without touching rooms. */

export const MAT = {
  wall: "#e7e3dc",
  wallDark: "#cfcac1",
  floor: "#4a4d54",
  oak: "#a87c52",
  oakDark: "#7d5a3a",
  metal: "#8c9199",
  black: "#1d1f24",
  white: "#f4f2ee",
  fabric: "#3f4a5c",
  screen: "#101722",
  leaf: "#3f7d4b",
  leafDark: "#2d5c37",
  brand: "#1f6fe0",
} as const;

export function Desk(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.04, 0.8]} />
        <meshStandardMaterial color={MAT.oak} roughness={0.55} />
      </mesh>
      {[-0.72, 0.72].map((x) =>
        [-0.32, 0.32].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.36, z]} castShadow>
            <boxGeometry args={[0.04, 0.72, 0.04]} />
            <meshStandardMaterial color={MAT.metal} metalness={0.7} roughness={0.35} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function Monitor({ glow = "#dfe8ff", ...props }: ThreeElements["group"] & { glow?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[0.62, 0.38, 0.03]} />
        <meshStandardMaterial color={MAT.black} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.98, 0.016]}>
        <planeGeometry args={[0.58, 0.34]} />
        <meshStandardMaterial color={MAT.screen} emissive={glow} emissiveIntensity={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.78, -0.02]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
        <meshStandardMaterial color={MAT.black} />
      </mesh>
      <mesh position={[0, 0.76, -0.02]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
        <meshStandardMaterial color={MAT.black} />
      </mesh>
    </group>
  );
}

export function Chair(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.48]} />
        <meshStandardMaterial color={MAT.fabric} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.74, -0.22]} castShadow>
        <boxGeometry args={[0.46, 0.5, 0.06]} />
        <meshStandardMaterial color={MAT.fabric} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 10]} />
        <meshStandardMaterial color={MAT.metal} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.03, 20]} />
        <meshStandardMaterial color={MAT.black} />
      </mesh>
    </group>
  );
}

export function Plant({ size = 1, ...props }: ThreeElements["group"] & { size?: number }) {
  return (
    <group {...props} scale={size}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 20]} />
        <meshStandardMaterial color="#b9b1a4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color={MAT.leaf} roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 1.1, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color={MAT.leafDark} roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, 1.05, -0.1]} castShadow>
        <sphereGeometry args={[0.26, 16, 12]} />
        <meshStandardMaterial color={MAT.leaf} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Sofa(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 0.9]} />
        <meshStandardMaterial color={MAT.fabric} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.72, -0.35]} castShadow>
        <boxGeometry args={[2.2, 0.5, 0.2]} />
        <meshStandardMaterial color={MAT.fabric} roughness={0.95} />
      </mesh>
      {[-1.0, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.9]} />
          <meshStandardMaterial color={MAT.fabric} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/** A low-poly wooden-slat divider used between rooms. */
export function Divider({ width = 6, ...props }: ThreeElements["group"] & { width?: number }) {
  const slats = Math.round(width / 0.25);
  return (
    <group {...props}>
      {Array.from({ length: slats }, (_, i) => (
        <mesh key={i} position={[(i - (slats - 1) / 2) * 0.25, 1.4, 0]} castShadow>
          <boxGeometry args={[0.06, 2.8, 0.1]} />
          <meshStandardMaterial color={MAT.oakDark} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Server rack with a column of status LEDs. */
export function Rack({ seed = 0, ...props }: ThreeElements["group"] & { seed?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 2.2, 1]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.5} metalness={0.4} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-0.2 + ((i + seed) % 3) * 0.08, 0.3 + i * 0.19, 0.505]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial
            color="#000"
            emissive={(i + seed) % 4 === 0 ? "#ff8a3d" : "#5dd6ff"}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`v${i}`} position={[0, 0.3 + i * 0.33, 0.5]}>
          <boxGeometry args={[0.62, 0.02, 0.01]} />
          <meshStandardMaterial color="#15171b" />
        </mesh>
      ))}
    </group>
  );
}
