# Real content to use in every mockup (and in the final prompt)

> Machine-readable version (what the mockups actually import): `shared/sb-data.js` — BRAND, BOT (Byte), TEAM (11, with photos), PROJECTS (12, with images/metrics), LOAD_CASES. Keep the two in sync; the JS file wins.

Source: live site repo `../solidbytes-landingpage/translations/{en,vi}/*.json` and `components/sections/hero-section.tsx`,
pulled 2026-10-12. Use these facts and phrases instead of invented copy. English in the mockups; Vietnamese lines
are listed where they exist so the final build can switch via next-intl.

## Brand facts (verified)
- Name: **SolidBytes**. Tagline/badge: **"Feel the Tech · Make the Growth"** (vi: "Cảm nhận công nghệ · Tạo ra tăng trưởng").
- Hero headline on the current site: **"Turning Your Vision into High-Performance Software"**
  (vi: "Hiện thực hóa ý tưởng bằng Giải pháp phần mềm chất lượng cao").
- Sub: "We deliver stable, secure, and scalable digital products that optimize your operations and drive sustainable growth."
- Stats shown on the live hero: **150+ Projects Delivered · 15+ Countries Served · 100+ Dedicated Bytes** (team).
  → Do NOT say "eighty people". Say **100+** / "a hundred-plus bytes".
- Two domains: **AI Solutions** and **E-commerce Platforms** ("Two Domains. Real Results.").
  - AI features: Machine Learning & LLM · NLP & GenAI · AI-powered recommendation · Strategic business forecasting · Intelligent process automation · AI chatbots & assistants · Data pipeline architecture.
  - E-commerce features: Custom platform development · Multi-vendor marketplaces · Payment & checkout optimization · Inventory & order management · Analytics & BI · Mobile commerce.
  - Also offered: Web & Mobile (PWA, native iOS/Android, API, cloud) and **Remote Teams / staff augmentation** with QA.
- Values ("Why choose us"): Deep Expertise · Scalable Solutions · Continuous Innovation · Global Standards.
- "The Solid Standard": **Smart · Scalable · Solid**.
- Name story (about page): **Solid** = hard to break, "like the ancient Mediterranean harbors that withstood centuries of storms";
  **Bytes** = "each team member is a byte: individually valuable, collectively powerful".
- Signature quote: *"If you're an overseas organization seeking to cross the digital ocean, we become part of your ship — your dedicated crew, your local harbor."*
  Section titles that reuse the metaphor: "The Crew Behind SolidBytes", "Harbors Across the Globe", "Our Compass".
- Milestones: Foundation (2020) → First major e-commerce client → AI division launched → Global expansion to 10+ countries → **Gaming division** → continued growth.
- Regions served: North America, Europe, Asia Pacific, Middle East. Vietnam-based.
- Team shown in the mockups (Khánh, 2026-10-12): **Steven Cao (CEO) and Giang Pham (CEO) highlighted as leads**, then Dan Tran, Khanh Nguyen, Nghi Pham, Duc Pham, Gam Nguyen, Kieu Mai. Tram Le, Thang Vo and Phuong Truong were removed on request. Photos: `assets/team/`.

## Real projects (use these names in Projects/Intelligence/Load chapters instead of made-up ones)
- **AI Smart Companion: The Future of AR & Voice Interaction** — POC, real-time voice intelligence + AR embodiment, context-aware digital partner. *(This is the companion the boss wants shown.)*
- **AI Virtual Personal Assistant** — emotionally intelligent assistant, syncs with Google services, context-aware reminders, real-time location.
- **Next-Gen AI Agents for Insurance** — 24/7 service automation for a US insurer.
- **Kinetic Eye** — real-time AI video surveillance, 80% fewer recognition errors (US client).
- **ThaiMarket** — multi-vendor e-commerce & affiliate ecosystem, multi-tier commissions (Thailand).
- **Salus Learning** — gamified training ecosystem for AIA Vietnam.
- **Match 3 Puzzle** — cross-platform casual game, microservices backend (Singapore).
- **Mobifone Management** — internal platform for **5,000+ employees** (Mobifone Vietnam).
- **Casbu** — AI email productivity, 40% less processing time (US).
- **JobFi** — recruitment & talent marketplace.
- **Clinic Manager** — healthcare operations platform.
- **Kara Idols** — mobile singing-competition app for Pepsi, thousands of contestants.
- **PV GAS** — enterprise portal, Headless CMS + Next.js, +120% traffic.

## Boss's requirements → chapter mapping (from docs/BRIEF.md §1)
| Boss asked for | Chapter | What must be on screen |
|---|---|---|
| "Ra một sản phẩm luôn", game / VR / thế giới 3D | whole page | the page IS the 3D experience; no brochure sections |
| Voice AI | 01 Voice | companion listens/speaks (mic UI; Web Speech for now) |
| 3D character like the POC | 01 Voice (+ guide in every chapter) | companion placeholder → VRM later; reference project: AI Smart Companion |
| Trí thông minh (intelligence) | 02 Intelligence | an idea becomes an architecture, live |
| Thiết kế hệ thống chịu tải cao | 03 Load | racks / traffic / metrics; real cases: ThaiMarket, Mobifone 5,000+, Kara Idols |
| Đội ngũ nhân viên đông đảo | 04 Team | 100+ "bytes", roles: engineers, QA, BA, design; remote teams offer |
| Liên hệ chống spam, gắn Jev | 05 Contact | form gated by Jev ("Jev screens every message") |

## Copy rules for mockups
- Hero may use the real headline or a Kage-style rewrite of it, but keep **"Feel the Tech · Make the Growth"** as the mono eyebrow somewhere in chapter 00.
- Team chapter: "100+ dedicated bytes" / "one crew", never a made-up headcount.
- Load chapter counters stay clearly labelled as demo numbers; project names above may be cited as captions.
- Keep the harbor/crew/ship metaphor available: it is the company's own language and is fair game for scene concepts.
