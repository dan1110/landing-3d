"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { companionPose } from "@/store/game";

/**
 * Placeholder for the POC companion (anime girl, headphones, neon hoodie).
 * Proportions/colours follow the concept art so the real GLB drops in later
 * without touching the rail. Pose comes from `companionPose` (written by <Rail/>);
 * this component only animates limbs, bob and head.
 */
export default function Companion() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const walkPhase = useRef(0);

  useFrame(({ clock, pointer }, rawDelta) => {
    if (!root.current || !body.current || !head.current) return;
    const delta = Math.min(rawDelta, 0.1);
    const { position, yaw, walk, wave } = companionPose;

    root.current.position.copy(position);
    root.current.rotation.y = yaw;

    // Walk cycle scaled by speed; idle bob when still.
    walkPhase.current += delta * 11 * walk;
    const swing = Math.sin(walkPhase.current) * 0.6 * walk;
    if (legL.current && legR.current && armL.current && armR.current) {
      legL.current.rotation.x = swing;
      legR.current.rotation.x = -swing;
      armL.current.rotation.x = -swing * 0.7;
      // Right arm: walk swing, or a raised wave while greeting.
      const waveZ = -2.6 * wave;
      const waveX = Math.sin(clock.elapsedTime * 9) * 0.35 * wave;
      armR.current.rotation.x = swing * 0.7 * (1 - wave) + waveX;
      armR.current.rotation.z = MathUtils.damp(armR.current.rotation.z, waveZ, 8, delta);
    }
    body.current.position.y =
      walk > 0.05 ? Math.abs(Math.sin(walkPhase.current)) * 0.06 * walk : Math.sin(clock.elapsedTime * 1.6) * 0.05;

    // Head glances at the pointer when idle, looks ahead while walking.
    const idle = 1 - walk;
    head.current.rotation.y = MathUtils.damp(head.current.rotation.y, pointer.x * 0.5 * idle, 6, delta);
    head.current.rotation.x = MathUtils.damp(head.current.rotation.x, -pointer.y * 0.25 * idle, 6, delta);
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs — group pivots at the hip */}
        <group ref={legL} position={[-0.18, 0.95, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.75, 6, 12]} />
            <meshStandardMaterial color="#1b1f2e" roughness={0.8} />
          </mesh>
        </group>
        <group ref={legR} position={[0.18, 0.95, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.75, 6, 12]} />
            <meshStandardMaterial color="#1b1f2e" roughness={0.8} />
          </mesh>
        </group>
        {/* torso — white hoodie with neon trim */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.55, 8, 16]} />
          <meshStandardMaterial color="#eef1f7" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <torusGeometry args={[0.33, 0.035, 8, 32]} />
          <meshStandardMaterial color="#c7ff4a" emissive="#c7ff4a" emissiveIntensity={2.5} />
        </mesh>
        {/* arms — group pivots at the shoulder */}
        <group ref={armL} position={[-0.42, 1.6, 0]}>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
            <meshStandardMaterial color="#eef1f7" roughness={0.6} />
          </mesh>
        </group>
        <group ref={armR} position={[0.42, 1.6, 0]}>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
            <meshStandardMaterial color="#eef1f7" roughness={0.6} />
          </mesh>
        </group>
        {/* head */}
        <group ref={head} position={[0, 2.05, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#9fb4ff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.1, -0.04]}>
            <sphereGeometry args={[0.37, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            <meshStandardMaterial color="#1a2340" roughness={0.7} />
          </mesh>
          {/* headphones */}
          <mesh position={[-0.36, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
            <meshStandardMaterial color="#c7ff4a" emissive="#c7ff4a" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.36, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
            <meshStandardMaterial color="#c7ff4a" emissive="#c7ff4a" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.37, 0.03, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#2a3350" />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.11, 0.03, 0.3]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#0b0f1c" />
          </mesh>
          <mesh position={[0.11, 0.03, 0.3]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#0b0f1c" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
