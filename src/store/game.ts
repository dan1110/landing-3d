import { create } from "zustand";
import { Vector3 } from "three";

export type RoomId = "lobby" | "brain-lab" | "load-arena" | "team-floor" | "mission-control";

/** welcome: the receptionist greeting in the lobby · explore: scroll along the rail */
export type Phase = "welcome" | "explore";

/** The companion's name — change here only. */
export const COMPANION_NAME = "Sol";

export interface Room {
  id: RoomId;
  label: string;
  /** Requirement it demonstrates, see docs/BRIEF.md §2 */
  shows: string;
  color: string;
  position: [number, number, number];
  /** What the companion says when the rail arrives here (placeholder for voice). */
  line: string;
  /** HUD caption under the room title. */
  caption: string;
}

export const ROOMS: Room[] = [
  {
    id: "lobby",
    label: "Lobby",
    shows: "Voice AI · 3D companion",
    color: "#1f6fe0",
    position: [0, 0, 0],
    line: "Đây là Lobby của SolidBytes HQ. Cuộn xuống, mình dẫn bạn đi một vòng.",
    caption: `Bạn vừa gặp ${COMPANION_NAME} — companion 3D từ dự án AI Smart Companion, nghe và trả lời bằng giọng nói.`,
  },
  {
    id: "brain-lab",
    label: "Brain Lab",
    shows: "Trí thông minh",
    color: "#7c4dff",
    position: [-9, 0, -22],
    line: "Brain Lab. Kể ý tưởng cho mình, mình vẽ kiến trúc hệ thống ngay tại đây.",
    caption: "Khách nêu ý tưởng, AI hỏi lại và dựng sơ đồ kiến trúc ngay trong không gian 3D — không phải slide có sẵn.",
  },
  {
    id: "load-arena",
    label: "Load Arena",
    shows: "Hệ thống chịu tải cao",
    color: "#ff8a3d",
    position: [9, 0, -44],
    line: "Load Arena. Traffic đang ập vào. Thử đặt cache, queue, replica xem hệ thống chịu được bao nhiêu.",
    caption: "Mini-game thiết kế hệ thống: traffic thật bắn vào kiến trúc của bạn, RPS và p99 hiển thị live.",
  },
  {
    id: "team-floor",
    label: "Team Floor",
    shows: "Đội ngũ đông đảo",
    color: "#2fa36b",
    position: [-9, 0, -66],
    line: "Team Floor. Đây là đội ngũ SolidBytes. Chọn squad cho dự án của bạn.",
    caption: "Mỗi avatar là một thành viên thật, số lượng lấy từ hệ thống nhân sự. Ai đang online thì vẫy tay.",
  },
  {
    id: "mission-control",
    label: "Mission Control",
    shows: "Liên hệ · Jev chống spam",
    color: "#e0a81f",
    position: [0, 0, -88],
    line: "Mission Control. Gửi mission cho team, mình lên lịch meeting cho bạn. Jev sẽ chặn bot và spam.",
    caption: "Cổng liên hệ chỉ mở khi Jev xác nhận không phải bot/spam. Lead đạt chuẩn mới về tới team.",
  },
];

export const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, Room>;
export const roomIndex = (id: RoomId) => ROOMS.findIndex((r) => r.id === id);

/* ---------- transient, per-frame state (kept out of React on purpose) ---------- */

/** Scroll rail: `target` is written by ScrollTrigger, `progress` eased toward it each frame. */
export const rail = { target: 0, progress: 0 };

/** Companion pose, written by <Rail/>, read by <Companion/>. */
export const companionPose = {
  position: new Vector3(1.2, 0, 4.5),
  yaw: 0,
  /** 0 = idle, 1 = full walk cycle */
  walk: 0,
  /** 0..1 — raised-arm wave, used during the welcome */
  wave: 0,
};

/* ---------- React state ---------- */

interface GameState {
  phase: Phase;
  room: RoomId;
  /** Room the visitor asked to jump to (consumed by the scroller). */
  requestedRoom: RoomId | null;
  /** What the visitor said they want to build. */
  idea: string | null;
  speech: string | null;
  voiceOn: boolean;
  setPhase: (phase: Phase) => void;
  setRoom: (room: RoomId) => void;
  jumpTo: (room: RoomId | null) => void;
  setIdea: (idea: string | null) => void;
  say: (text: string | null) => void;
  setVoiceOn: (on: boolean) => void;
}

export const useGame = create<GameState>((set) => ({
  phase: "welcome",
  room: "lobby",
  requestedRoom: null,
  idea: null,
  speech: null,
  voiceOn: true,
  setPhase: (phase) => set({ phase }),
  setRoom: (room) => set({ room }),
  jumpTo: (requestedRoom) => set({ requestedRoom }),
  setIdea: (idea) => set({ idea }),
  say: (speech) => set({ speech }),
  setVoiceOn: (voiceOn) => set({ voiceOn }),
}));
