"use client";

import { Center, Clone, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

/**
 * Kenney Furniture Kit (CC0) — public/models/kenney/*.glb.
 * The kit is authored at roughly half-metre units with corner pivots, so every
 * model is scaled ×2 and re-centred on its footprint (bottom at y = 0).
 */
export const KENNEY = [
  "desk",
  "deskCorner",
  "chairDesk",
  "chairModernCushion",
  "chairModernFrameCushion",
  "computerKeyboard",
  "computerMouse",
  "laptop",
  "plantSmall1",
  "plantSmall2",
  "plantSmall3",
  "pottedPlant",
  "loungeSofa",
  "loungeSofaLong",
  "loungeDesignSofa",
  "loungeChair",
  "loungeDesignChair",
  "tableCoffee",
  "tableCoffeeGlass",
  "bookcaseOpen",
  "bookcaseClosedWide",
  "rugRectangle",
  "rugRound",
  "lampRoundFloor",
  "table",
  "tableGlass",
  "tableCross",
  "trashcan",
  "coatRackStanding",
  "sideTable",
  "kitchenCoffeeMachine",
  "kitchenBar",
  "books",
] as const;
export type KenneyName = (typeof KENNEY)[number];

const url = (name: KenneyName) => `/models/kenney/${name}.glb`;
const UNIT = 2;

export function Model({ name, scale = 1, ...props }: ThreeElements["group"] & { name: KenneyName; scale?: number }) {
  const { scene } = useGLTF(url(name));
  return (
    <group {...props} scale={UNIT * scale}>
      <Center top>
        <Clone object={scene} castShadow receiveShadow />
      </Center>
    </group>
  );
}

KENNEY.forEach((n) => useGLTF.preload(url(n)));
