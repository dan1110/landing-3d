"use client";

import { ROOM_BY_ID } from "@/store/game";
import Building from "./office/Building";
import { BrainLab, Lobby, LoadArena, MissionControl, TeamFloor } from "./office/Rooms";

/** The whole HQ: one office corridor with five rooms along the rail. */
export default function Hq() {
  return (
    <group>
      <Building />
      <Lobby room={ROOM_BY_ID.lobby} />
      <BrainLab room={ROOM_BY_ID["brain-lab"]} />
      <LoadArena room={ROOM_BY_ID["load-arena"]} />
      <TeamFloor room={ROOM_BY_ID["team-floor"]} />
      <MissionControl room={ROOM_BY_ID["mission-control"]} />
    </group>
  );
}
