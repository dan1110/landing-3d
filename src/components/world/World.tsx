"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Stats } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Companion from "./Companion";
import Hq from "./Hq";
import Rail from "./Rail";

export default function World() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows="percentage"
      camera={{ position: [4.5, 1.8, 9], fov: 45, near: 0.1, far: 160 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      // Scroll input is owned by the HTML scroller above the canvas.
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      {process.env.NODE_ENV === "development" && <Stats className="sb-stats" />}
      <color attach="background" args={["#d8dde4"]} />
      <fog attach="fog" args={["#d8dde4", 34, 95]} />

      {/* daylight through the glazed wall + soft fill */}
      <hemisphereLight args={["#eaf2ff", "#6b6f78", 0.8]} />
      <directionalLight
        position={[18, 10, -30]}
        intensity={2.2}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={120}
      />

      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.5} />
        <Hq />
        <Companion />
      </Suspense>

      <Rail />

      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={0.3} mipmapBlur />
        <Vignette offset={0.3} darkness={0.4} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
