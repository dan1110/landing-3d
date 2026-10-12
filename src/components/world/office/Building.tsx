"use client";

import { useLayoutEffect } from "react";
import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace } from "three";
import { MAT } from "./props";

/** Corridor extents (world z): rooms run from Z_START down to Z_END. */
export const Z_START = 14;
export const Z_END = -102;
export const HALF_W = 11;
export const CEIL = 4.2;

const LEN = Z_START - Z_END;
const MID_Z = (Z_START + Z_END) / 2;
const WINDOW_COUNT = Math.floor(LEN / 4);
const LIGHT_COUNT = Math.floor(LEN / 6);

/** Laminate floor (Poly Haven, CC0) with a faint reflection. */
function Floor() {
  const maps = useTexture({
    map: "/textures/floor/floor_diff.jpg",
    normalMap: "/textures/floor/floor_nor_gl.jpg",
    roughnessMap: "/textures/floor/floor_rough.jpg",
    aoMap: "/textures/floor/floor_ao.jpg",
  });
  useLayoutEffect(() => {
    Object.entries(maps).forEach(([key, t]) => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(HALF_W, LEN / 2);
      t.anisotropy = 8;
      if (key === "map") t.colorSpace = SRGBColorSpace;
      t.needsUpdate = true;
    });
  }, [maps]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, MID_Z]} receiveShadow>
      <planeGeometry args={[HALF_W * 2, LEN]} />
      <MeshReflectorMaterial
        {...maps}
        blur={[500, 150]}
        resolution={1024}
        mixBlur={1}
        mixStrength={2.5}
        roughness={0.7}
        depthScale={0.6}
        minDepthThreshold={0.7}
        maxDepthThreshold={1.3}
        color="#ffffff"
        metalness={0}
        mirror={0}
      />
    </mesh>
  );
}

/**
 * The shell of the office: laminate floor, off-white walls, a glazed wall of
 * windows on the right, dropped ceiling with recessed light panels.
 */
export default function Building() {
  return (
    <group>
      <Floor />

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, MID_Z]}>
        <planeGeometry args={[HALF_W * 2, LEN]} />
        <meshStandardMaterial color={MAT.white} roughness={1} />
      </mesh>
      {Array.from({ length: LIGHT_COUNT }, (_, i) => (
        <group key={i} position={[0, CEIL - 0.02, Z_START - 3 - i * 6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 2.6]} />
            <meshStandardMaterial color="#fff" emissive="#fff6e6" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[0, -0.6, 0]} color="#fff3df" intensity={14} distance={9} decay={2} />
        </group>
      ))}

      {/* left wall (solid) */}
      <mesh position={[-HALF_W, CEIL / 2, MID_Z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[LEN, CEIL]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.95} />
      </mesh>
      <mesh position={[-HALF_W + 0.03, 0.06, MID_Z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, 0.12]} />
        <meshStandardMaterial color={MAT.wallDark} roughness={0.9} />
      </mesh>

      {/* right wall: glazing with mullions, sill and a sky outside */}
      <mesh position={[HALF_W + 0.6, CEIL / 2, MID_Z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, CEIL]} />
        <meshStandardMaterial color="#cfe3f5" emissive="#dbeeff" emissiveIntensity={0.9} roughness={1} />
      </mesh>
      <mesh position={[HALF_W, CEIL / 2, MID_Z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, CEIL]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.05} thickness={0.2} transparent opacity={0.35} />
      </mesh>
      {Array.from({ length: WINDOW_COUNT + 1 }, (_, i) => (
        <mesh key={i} position={[HALF_W, CEIL / 2, Z_START - i * 4]} castShadow>
          <boxGeometry args={[0.12, CEIL, 0.12]} />
          <meshStandardMaterial color={MAT.black} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[HALF_W, 0.45, MID_Z]}>
        <boxGeometry args={[0.3, 0.9, LEN]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.9} />
      </mesh>
      <mesh position={[HALF_W, CEIL - 0.15, MID_Z]}>
        <boxGeometry args={[0.3, 0.3, LEN]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.9} />
      </mesh>

      {/* end walls */}
      <mesh position={[0, CEIL / 2, Z_END]} receiveShadow>
        <planeGeometry args={[HALF_W * 2 + 2, CEIL]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, CEIL / 2, Z_START]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALF_W * 2 + 2, CEIL]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.95} />
      </mesh>
    </group>
  );
}
