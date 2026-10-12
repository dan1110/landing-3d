# SolidBytes — Website mới (landing-3D)

> File này là nguồn sự thật cho dự án. Mọi quyết định build đều đối chiếu với **Yêu cầu gốc** bên dưới.
> Cập nhật: 2026-10-07.

> **Cập nhật 2026-10-12 (chiều):** vòng 2 cho cả 5 layout: nội dung thật từ site cũ (11 ảnh team, 12 dự án + số liệu trong `docs/layouts/shared/sb-data.js`), chương **03 WORK** mới, hover/click mở chi tiết, và **Byte** — bot chibi của SolidBytes thay cho khối "SB", dẫn đường từng chương, nói bằng Web Speech, mic nghe thật với câu trả lời kịch bản (`shared/sb-bot.js`). Byte là tên tạm (đổi ở `BOT.name`). Mockup phải chạy qua http (`docs/layouts/serve.command`). QA headless: `node tools/shots.mjs <file> --click`.
>
> **Cập nhật 2026-10-12:** hướng "game 5 phòng" ở §3 tạm gác. Khánh chọn làm **landing page 3D kiểu Kage** (tối, điện ảnh, camera bay theo cuộn, chữ biên tập cỡ lớn), companion là người dẫn xuất hiện mỗi chương, voice tạm Web Speech, nhân vật VRM tạm. Ba layout mockup chạy được nằm ở `docs/layouts/` (mở `index.html`), spec chung ở `docs/layouts/SPEC.md`. Prompt chính thức sẽ viết sau khi chốt layout. **Không publish artifact** cho dự án này (tài khoản dùng chung).

## 1. Yêu cầu gốc của sếp (nguyên văn, mới nhất)

> anh cần dựng lại website công ty. Ko cần giới thiệu rườm rà nữa mà ra một sản phẩm luôn.
> Anh muốn
>
> Ý tưởng amazing: 1 game, 1 thực tế ảo, một thế giới 3d,...
> Show được skills: Voice AI, 3D character (giống dự án POC), trí thông minh, khả năng thiết kế hệ thống chịu tải cao, đội ngũ nhân viên đông đảo
> Có chỗ liên hệ nhưng phải chống spam: gắn Jev vào để liên hệ nào ko spam thì mới nhận
> CHo anh ý tưởng nha
>
> Rồi dùng compute use mcp á
> Cho nó tự thao tác máy mình
> Concept

Bối cảnh thêm (từ Khánh):
- Site cũ: https://solidbytes.vn/ — brochure truyền thống (Next 16, repo `../solidbytes-landingpage`). Không kế thừa UI; có thể tái dùng backend chatbot (Gemini/OpenAI + Pinecone RAG), n8n (`auto-n8n.solidbytes.vn`), Clarity.
- 3 concept tĩnh trước đó (`../solidbytes-concepts`, https://sb-demo-one.vercel.app) **không** phải hướng hiện tại — chỉ để hiểu lịch sử.
- **POC** = "AI Smart Companion: The Future of AR & Voice Interaction": người dùng **nói chuyện với bot** bằng giọng nói, bot **chỉ đường, lên lịch**, trả lời câu hỏi. Nhân vật là cô gái anime, headphone, hoodie trắng-đen viền neon (ảnh concept: `../solidbytes-landingpage/public/assets/images/projects/ai-companion.png`). Chưa có file 3D; Khánh đang xin video POC.
- **Jev**: chưa rõ là gì — nhiều khả năng là cơ chế chặn bot/spam trước khi nhận form. Khánh sẽ hỏi lại sếp. Thiết kế phải cho phép cắm Jev vào sau mà không đổi phần còn lại.

## 2. Checklist bắt buộc (map 1-1 với yêu cầu)

| # | Yêu cầu | Cách đáp ứng | Trạng thái |
|---|---|---|---|
| R1 | Không giới thiệu rườm rà, ra sản phẩm luôn | Trang chủ = game 3D chơi được ngay, không hero text, không "About us" | ☐ |
| R2 | Game / VR / thế giới 3D | Thế giới 3D "SolidBytes HQ" chơi trong browser; WebXR (VR) là phase 2 | ☐ |
| R3 | Show Voice AI | NPC companion nghe/nói realtime, song ngữ vi/en, ngắt lời được | ☐ |
| R4 | Show 3D character giống POC | Nhân vật 3D dựng theo ảnh concept POC, lip-sync, chỉ đường + lên lịch như POC | ☐ |
| R5 | Show trí thông minh | Khách nêu ý tưởng → AI hỏi lại, vẽ kiến trúc hệ thống ngay trong 3D, ước lượng | ☐ |
| R6 | Show thiết kế hệ thống chịu tải cao | Load Arena: mini-game đặt LB/cache/queue chịu traffic; metrics RPS/p99 thật | ☐ |
| R7 | Show đội ngũ đông | Team Floor: N avatar = headcount thật, click xem vai trò | ☐ |
| R8 | Liên hệ chống spam, gắn Jev | Pipeline: Turnstile → rate limit → **Jev** → lưu lead → n8n. Jev là bước cắm thêm | ☐ |
| R9 | AI dùng computer-use MCP tự thao tác máy | Vòng lặp QA tự động: Claude mở Chrome (claude-in-chrome) / điều khiển desktop (computer-use) để chạy, chụp màn hình, đo FPS, đọc console rồi tự sửa. Thêm Blender/simulator khi cần | ☐ |

## 3. Concept: "Mission: Ship It" — chốt 2026-10-07: Option B (đường ray cuộn) + mở màn "cuộc gọi" của Option C (xem `OPTIONS.md`)

**Mở màn (sau feedback 2026-10-07 "cuộc gọi giống lừa đảo")**: không còn màn hình gọi. Thế giới 3D hiện ngay, companion **Sol** (tên tạm, đổi ở `COMPANION_NAME`) đứng ở Lobby vẫy tay, card lễ tân hỏi: *Dẫn mình tham quan HQ* / *Tới thẳng một phòng* / *Mình có ý tưởng muốn kể* (nói hoặc gõ → Brain Lab). Giọng chỉ phát sau khi khách bấm.

Trạng thái code (`src/`): card lễ tân (Welcome, avatar = ảnh POC) → đường ray 5 phòng (Rail + ScrollTrigger, snap từng phòng) → companion placeholder đi cùng, nói câu giới thiệu mỗi phòng → HUD caption/progress/mic. Visual (sau feedback 2026-10-07 "đừng như vũ trụ, cho thật"): **văn phòng thật** — hành lang dài, tường trắng, tường kính có nắng, trần đèn panel, sàn bê tông bóng; Lobby = quầy lễ tân + logo wall; Brain Lab = bảng kính vẽ kiến trúc; Load Arena = phòng server sau kính + màn hình metrics; Team Floor = 4×4 bàn đôi, 32 người ngồi; Mission Control = phòng họp + màn hình đặt lịch. Đồ đạc = **Kenney Furniture Kit (CC0, GLB)** qua `office/Kenney.tsx` (scale ×2, `<Center top>`), sàn laminate texture Poly Haven (CC0); màn hình/rack server còn là primitive (`office/props.tsx`). Render: dpr tới 2, SMAA, shadow 4k. Credits: `docs/ASSETS.md`. Chưa có: nhân vật thật (VRM), voice AI thật (có sẵn `/api/tts`, cần key), Load Arena chơi được, dữ liệu team thật, Jev.

Khách = client có ý tưởng, "hạ cánh" xuống SolidBytes HQ. Companion (nhân vật POC) ra đón bằng giọng nói, hỏi "bạn muốn xây gì?", rồi **chỉ đường** qua các khu:

1. **Lobby** — gặp companion, voice 2 chiều (R3, R4)
2. **Brain Lab** — AI vẽ kiến trúc cho ý tưởng của khách (R5)
3. **Load Arena** — mini-game chịu tải (R6)
4. **Team Floor** — tuyển squad từ đội ngũ thật (R7)
5. **Mission Control** — submit mission = liên hệ, companion **lên lịch** meeting (R8)

Luôn có nút **Skip** → nói chuyện thẳng với companion. Thiết bị yếu / crawler → bản 2D SSR (SEO).

## 4. Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4
- **Three.js qua React Three Fiber** + drei; Rapier cho physics mini-game
- **GSAP** (+ @gsap/react) cho camera/scene transition, UI overlay
- Zustand cho game state; r3f-perf khi dev
- Voice: OpenAI Realtime hoặc Gemini Live (chọn theo latency khi test)
- Backend: Next API routes + Redis (rate limit) + Postgres (lead) + n8n webhook
- Skills cho AI agent: `.claude/skills/` (GSAP chính chủ, r3f-skills, three/r3f best practices)

## 5. Lộ trình

| Tuần | Deliverable |
|---|---|
| 1 | Scaffold, skills, scene đầu tiên có nhân vật placeholder, QA loop qua Chrome |
| 2–3 | Vertical slice: Lobby + companion voice + chỉ đường + Skip |
| 4–6 | Brain Lab, Load Arena, Team Floor |
| 7 | Mission Control + pipeline chống spam + Jev + n8n |
| 8 | Fallback 2D, SEO, i18n, perf mobile, deploy |

## 6. Câu hỏi còn mở

- [ ] Jev là gì? Có API/webhook không? (hỏi sếp)
- [ ] Dòng "Concept" cuối brief của sếp là tiêu đề của phần tiếp theo hay chỉ là "cho anh concept"? (hỏi sếp)
- [ ] Video/asset POC (Khánh đang xin)
- [ ] Hosting: Vercel hay VPS? (voice + Load Arena cần server)
- [ ] Headcount thật + nguồn dữ liệu (Directus/HR) cho Team Floor
- [ ] Voice provider đã có key nào?

## 7. Nguyên tắc

- Không copy video/demo của bên thứ ba.
- Mọi demo phải chạy thật; chỗ nào mô phỏng phải ghi rõ trên UI.
- Budget perf: first load < 3 MB, < 100k tri trên mobile, 60 fps desktop / 30 fps mobile.
- Load Arena phải có cap (concurrent, cooldown) — không để site tự thành công cụ DDoS.

## 8. Ghi chú kỹ thuật

- **`next.config.ts` phải giữ block `turbopack.rules["*.css"]`** (loader `@tailwindcss/turbopack`) — Next 16 compile Tailwind 4 qua Turbopack, không có PostCSS. Mất block này = toàn bộ class Tailwind biến mất mà không báo lỗi build.
- **Voice tạm = Web Speech API của trình duyệt** (`src/lib/voice.ts`: `speak()` / `listen()`), UI ghi rõ "voice demo". Nối provider thật chỉ cần thay file này.
- **Không dùng `r3f-perf`**: source map của nó làm Turbopack (Next 16) panic "invalid utf-8 sequence" → trang 500. Dùng `<Stats />` của drei (dev only) để đo FPS.
- Tab Chrome do extension điều khiển ở cửa sổ nền sẽ không chạy rAF → canvas đen, HUD không hiện. Khi QA tự động phải để tab ở cửa sổ đang hiển thị.
- Git: create-next-app đã tự `git init` + 1 commit. Chưa add gì thêm; chờ Khánh đưa repo chính thức rồi nối vào.
