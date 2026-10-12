# Layout mockups — shared spec (2026-10-12)

Three single-file HTML studies so Khánh can scroll each one and pick a direction.
Reference feel: **Kage** (https://mengto.github.io/kage/) — dark, cinematic, scroll-driven camera,
editorial typography over a live Three.js world. Technique only; no Kage code or art.

Files: `docs/layouts/option-1-night-shift.html`, `option-2-city-of-systems.html`, `option-3-black-box.html`.
Each file is self-contained (one `index.html`-style document), runs from `file://` or any static server,
no build step, no local assets. Everything in the 3D world is **procedural** (boxes, planes, instanced meshes,
particles, shader materials). No downloads.

## Allowed external resources (only these)
- Three.js via importmap from jsdelivr:
  `"three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"`,
  `"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"`
  (EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass are fine.)
- Google Fonts: `Inter Tight` (display, weights 300/500/700) + `JetBrains Mono` (labels, 400/500).
- Nothing else. No GSAP, no analytics, no images.

## Palette (CSS vars, same in all three)
```
--ink:    #07090d   /* page background, near-black */
--slate:  #141a24   /* blue-charcoal surfaces, fog colour */
--bone:   #efe9dd   /* primary text */
--mute:   #8b93a1   /* labels */
--amber:  #f2b25c   /* warm light: lamps, monitors, companion rim */
--sb:     #1f8fd6   /* SolidBytes blue (brand primary hsl(205 75% 48%)): cold light, accent, active state */
```
Restraint: one warm + one cold light source per shot. Bloom strength ≤ 0.35, threshold ≥ 0.85.
Film grain + vignette via a final ShaderPass (subtle: grain amplitude ~0.04). Fog colour = `--slate`.
No neon outlines, no glassmorphism, no particles-everywhere "space" look. Khánh rejected "vũ trụ" once already.

## Page skeleton (identical across options)
1. **Loader**: centered mark "SB", tiny mono label `BUILDING THE WORLD` + percent, ≤ 1.2 s, fades out.
2. **Fixed full-viewport canvas** behind everything (`position: fixed; inset: 0; z-index: 0`).
3. **Top bar**: left `SOLIDBYTES` + mono sub-label `AI · SYSTEMS · PEOPLE`; right nav links to chapters.
4. **Chapter rail** bottom-left: `01 02 03 04 05`, active one in `--sb`, others `--mute`.
5. **Sections** (each `min-height: 100vh`, content in normal document flow, `pointer-events: none` except links):
   - `00 HERO` — oversized display heading (clamp 56px → 160px, weight 300, tight leading), 2-line tagline,
     mono label `CHAPTER 00 — THE THRESHOLD`, hint `SCROLL TO ENTER`.
   - `01 VOICE` — companion. Heading e.g. `SPEAK, AND IT LISTENS.` Body ≤ 40 words.
     In-world: a **companion placeholder** figure (capsule body + sphere head, amber rim-light, soft idle bob).
     HTML overlay: small card bottom-right `COMPANION · VRM PLACEHOLDER` + a mic button (no-op, visual only).
   - `02 INTELLIGENCE` — heading e.g. `AN IDEA BECOMES AN ARCHITECTURE.` In-world: architecture blocks
     (LB / API / cache / queue / DB as labelled boxes) assemble as this chapter becomes active.
   - `03 LOAD` — heading e.g. `BUILT TO TAKE THE HIT.` In-world: server racks with blinking LEDs,
     particle traffic streaming through them. Overlay: mono counters `RPS 48,210 · p99 38 ms` ticking.
   - `04 TEAM` — heading e.g. `EIGHTY PEOPLE. ONE FLOOR.` In-world: instanced crowd (≥ 60 simple figures).
   - `05 CONTACT` — heading `TELL US WHAT YOU WANT TO BUILD.` Overlay: a form mock (name, idea, button
     `SEND TO JEV`) with label `JEV SCREENS EVERY MESSAGE` — visual only.
   - Footer line: `© SOLIDBYTES · MOCKUP OPTION N · NOTHING HERE IS FINAL`.
6. **Scroll choreography**: progress `p = scrollY / (docHeight - innerHeight)` smoothed with lerp (0.06/frame).
   Camera follows a `CatmullRomCurve3` path + a separate look-at curve; chapter index derived from `p`.
   Each chapter must read as a **new composed shot** (different angle/height), not a hard cut.
   Headings reveal **word by word** (`opacity` + `translateY`, 40 ms stagger) when the section is ≥ 40% in view.
   Foreground HTML "plates" (dark gradient bands or procedural SVG silhouettes) may pin while active and
   fade + blur out on handoff — optional but on-brand.
7. **Custom cursor** (small ring, `--sb`) for `(pointer: fine)` only. Default cursor otherwise.
8. **Responsive**: works at 390 × 844 (headings clamp down, rail hides, nav collapses to a `MENU` word).
9. **Perf**: target 60 fps on an M-series Mac at 1512×795; DPR capped at 1.5; ≤ 150k triangles;
   `renderer.setAnimationLoop`; pause rendering when `document.hidden`.
10. **Console clean**: zero errors, zero 404s. Verify by loading in Chrome and reading the console.

## What differs per option (the only thing each author decides)
The **world** the camera moves through and how the six chapters are staged inside it.
See each option's brief in the Agent prompt. Keep the HTML skeleton above identical so the comparison is fair.

## Copy
English for the mockups (Vietnamese comes later with next-intl). Short, confident, no buzzword salad.
Company facts you may use: SolidBytes, Vietnam-based, AI solutions + e-commerce engineering, ~80 people,
site solidbytes.vn. Don't invent clients or numbers beyond the mock counters.

---

# Round 2 (2026-10-12, afternoon) — real content, Byte the guide, hover/click

Khánh's feedback on round 1: "chung chung quá" (too generic). Team must show **real people**, projects must show **real work**, things must **react** when the visitor looks at them, and the "SB" placeholder becomes a **chibi SolidBytes bot that guides you**. Applies to **all five options**; each keeps its own world and camera language.

## Shared modules (`docs/layouts/shared/`, already built and tested in `test-shared.html` — do not edit them)
- `sb-data.js` — `BRAND`, `BOT` (name **Byte**, per-chapter `lines`, mic `intents`), `TEAM` (11 real people with photo paths), `TEAM_ROLES`, `PROJECTS` (12 real projects with image, `ratio`, `metric`, `blurb`, `tags`), `LOAD_CASES` (3), `ARCH`.
- `sb-bot.js` — `createBot({scale, light})` → `{ group, update(dt, camera), place(pos, yaw), goTo(pos, {face}), say(text), hush(), setMood('idle'|'wave'|'talk'|'point'|'cheer'), pointAt(vec3), lookAt(vec3|null), anchor(), attachBubble(camera) }`; `voice` (Web Speech: `enable/toggle/speak/listen`), `createVoiceToggle()` (fixed pill "VOICE OFF/ON", top-right under the topbar).
  Byte ≈ 1.9 units tall at scale 1; use scale 0.8–1.0 next to human-sized props, bigger only in aerial shots. Adds **one** PointLight unless `light:false`.
- `sb-cards.js` — `photoCard({url, w, h, imgRatio, radius, dim})` (rounded, cover-fit, border, `mesh.userData.card.ease(hovered?1:0, dt)`, `setOpacity`, `setDim`), `labelSprite(text, {sub, width})`, `createPicker({camera, onHover, onLeave, onClick})` (+ `picker.enabled`, `picker.update()` each frame, toggles `body.sb-hover`), `tip(html, x, y)` / `tipPerson(m)` / `tipProject(p)`, `createDetail()` → `showPerson(m)` / `showProject(p)` / `hide()`, `preload(urls)`.
- Images: `assets/team/*.webp` (400×500) and `assets/projects/*.webp` (≤900 px), ~600 KB total. **Pages must be served over http** (`serve.command` or `python3 -m http.server 4190 --bind 127.0.0.1` from `docs/layouts`); `file://` blocks module imports and textures.
- Import with `import { ... } from './shared/sb-bot.js'` etc. The importmap for `three` stays as is (shared modules import `'three'` through it).

## What every option must now have
1. **Seven chapters**: `00 HERO · 01 VOICE · 02 INTELLIGENCE · 03 WORK (new) · 04 LOAD · 05 TEAM · 06 CONTACT`. Section ids: `hero, voice, intel|intelligence, work, load, team, contact`. Rail shows 01–06, nav adds WORK. Camera path gets a new keyed shot for WORK.
2. **Byte replaces the capsule companion** and appears in **every chapter**: `place()` at the first shot, `goTo()` a new spot when the chapter changes (walks, then faces the camera), `say(BOT.lines[chapter])` on enter (debounce ~400 ms; `hush()` on leave), a mood per chapter: hero `wave` → voice `talk` → intel `pointAt(architecture)` → work `pointAt(gallery)` → load `cheer` or `pointAt(racks)` → team `wave` → contact `pointAt(form/desk)`. `attachBubble(camera)` once; `createVoiceToggle()` once. Never park Byte under the heading column; headings alternate left/right per section, put Byte on the other side or lower in frame. Byte must be fully in frame and lit in every shot.
3. **Mic is real (placeholder voice)**: the VOICE overlay button calls `voice.listen({onStart, onResult, onEnd})`; while listening add class `listening` (pulse). On result: first matching `BOT.intents` regex → `bot.say(reply)`. If `listen()` returns `null` → `bot.say('No microphone API in this browser. Chrome works.')`. If voice is off when the mic is clicked, call `voice.enable()` first (there is a user gesture) so the reply is spoken. Overlay label: `BYTE · YOUR GUIDE` + mono sub-line `3D CHARACTER · POC-STYLE VRM LATER`. Remove every "Sol" / "VRM placeholder" string.
4. **TEAM = 11 real faces**: one `photoCard` per `TEAM` entry (≈1 × 1.25 units, `imgRatio: 0.8`), `labelSprite(name, {sub: role, width: 1.3})` below each, staged in the option's own world (desks / pier / plaza / stage / assembly floor) as the front row(s); the existing silhouette crowd (≥ 60) stays behind them as "100+ bytes". Cards **enter with stagger** (~60 ms each: opacity 0→1 + rise 0.3) when the chapter becomes active. **Hover** → `card.ease(1, dt)`, lift ~0.08 toward camera, `tip(tipPerson(m), x, y)`; **click** → `detail.showPerson(m)`. Faces must be readable: each card ≥ 110 px tall in a 1600 × 900 shot; heading goes on the opposite side.
5. **WORK = 12 real projects** (new chapter between INTELLIGENCE and LOAD): one `photoCard` per `PROJECTS` entry with `imgRatio: p.ratio` (keep a consistent card height ≈ 1.1, width = height × min(ratio, 1.6)), small label `labelSprite(p.name, {sub: p.metric.join(' '), width})`. Stage it in the option's vocabulary (HQ gallery wall · district billboards · floating frames in the black box · lit posters on the quay warehouse / crates · finished products on the belt / screens over stations). Cards **fly or slide in** with stagger when active. Hover → `tip(tipProject(p))` + ease; click → `detail.showProject(p)`. Copy: heading `150+ shipped. Twelve you can open.`, body `AI, e-commerce, games, enterprise software. Fifteen countries, one crew.`, caption `HOVER A PROJECT · CLICK TO OPEN`.
6. **LOAD** keeps its scene and adds the three `LOAD_CASES` as small photo cards / lit posters near the racks (name + fact via labelSprite), hoverable (tip = fact). Counters stay demo-labelled.
7. **INTELLIGENCE**: the LB / API / CACHE / QUEUE / DB blocks become hoverable (`picker.add(block, {kind:'arch', data:{name, role}})`, tip = `LB — spreads traffic`, `API — stateless services`, `CACHE — hot reads`, `QUEUE — absorbs spikes`, `DB — source of truth`) and Byte points at them while they assemble.
8. **CONTACT**: form fields become real inputs (pointer-events auto). `SEND TO JEV` → 900 ms "JEV IS READING…" state → verdict line: text with `http`, `casino`, `$$$`, or < 8 characters → `JEV: blocked. Looks like spam.` (amber); otherwise `JEV: looks human. Routed to Kieu (Sales & Admin).` Byte reacts (`cheer` on pass, `say` on block). No network.
9. **Hero copy** from `BRAND` (tagline eyebrow, headline or its Kage-style rewrite, sub, stats). All names/numbers come from `sb-data.js`; invent nothing.
10. **Preload** all 23 images during the loader (`preload([...TEAM, ...PROJECTS].map(x => x.img))`) and fold it into the loader percentage so nothing pops in.
11. **Perf / hygiene** unchanged: DPR ≤ 1.5, ≥ 55 fps headless, zero console errors, zero 404s, **constant light count** (Byte adds one; pass `light:false` if the budget is full; animate intensity, never `visible`), `picker.enabled` only in chapters that have pickables, `history.scrollRestoration = 'manual'` stays.

## QA loop (mandatory, headless — do not use the Chrome extension)
```
cd docs/layouts && node tools/shots.mjs option-3-black-box --click
```
Prints `{fps, sections, hovers, clicks, errs}` and writes `shots/<name>-<section>.jpg`, `-hover.jpg`, `-click.jpg`. Expect 7 sections, `errs: []`, hovers for at least `work` and `team` (the probe sweeps a grid around the viewport centre, so pickables must sit near the middle third of the frame), fps ≥ 55. Open every jpg (Read tool) and fix: headings over cards, unreadable faces, Byte clipped or in the dark, blown-out cards (lower `dim`), cards intersecting props, bubble off-screen. Also `node --check` the extracted module script before each run. Iterate until clean.

---

# Round 3 (2026-10-12, evening) — phones

Khánh checked the live site on his phone: option 5 reads fine, options 1–4 do not (desktop camera framing on a 390×844 portrait: cards cropped at the edges, headings printed over the 3D subject, Byte or the cards behind the paragraph). Fix options 1–4 so every chapter reads on a phone, keeping the desktop shots exactly as they are.

## Rules for portrait / narrow viewports (`innerWidth <= 720` or `aspect < 0.8`)
1. **Stack, don't overlap**: text in the top ~45% of the screen (kicker, heading, one short paragraph), the 3D subject in the bottom ~55%. Achieve it in the camera, not with CSS hacks: per chapter either raise the look point / lower the camera so the subject sits in the lower half, or multiply the camera's distance from the subject by ~1.5–1.8 for portrait, and widen `camera.fov` (e.g. 38 → 52) when `aspect < 0.8`. Recompute on resize.
2. **Cards must fit**: the whole TEAM group and the whole WORK grid must be inside the frame with ≥ 16 px side margin at 390 px wide; faces ≥ 64 px tall (in CSS px). If the desktop staging is a wide row, re-grid for portrait (e.g. 2 leads on top, crew 3×2 below; WORK 3 columns × 4 rows) — do it by repositioning the same meshes when portrait is detected (no duplicate meshes).
3. **Byte** stays visible and small on phones (scale ×0.8), never under the text column; the shared bubble is now a fixed strip above the chapter overlays on phones (handled in `shared/sb-bot.js`, nothing to do).
4. **Text**: headings `clamp(34px, 9.5vw, 56px)` on phones, paragraphs ≤ 3 lines, hide the chapter rail, nav → MENU (already), overlays (`.ov-*`) full-width at the bottom with 16 px gutters and ≤ 40% of the viewport height. Keep `pointer-events` only on interactive overlays.
5. **Touch**: tap a card = open detail (no hover state needed); the picker's pointerdown/up already does this — verify with `page.tap` if you like. The detail panel is one column on phones (shared CSS).
6. **No horizontal scroll** (`hscroll` in the tool must be 0), no console errors, fps ≥ 50 on the headless phone viewport.

## QA
```
cd docs/layouts && node tools/shots.mjs option-1-night-shift --mobile     # → shots/<name>-m-<section>.jpg, prints hscroll + fps + errs
node tools/shots.mjs option-1-night-shift                                  # desktop must be unchanged (compare with the previous jpgs)
```
Open every `-m-` jpg with Read: text and 3D never overlap, all 8 faces / 12 projects visible, Byte visible, nothing clipped at the edges.
