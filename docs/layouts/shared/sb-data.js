// Real SolidBytes content for the layout mockups. Source: ../solidbytes-landingpage (translations + data/*.ts), 2026-10-12.
// Images live in docs/layouts/assets (resized webp copies of the live site's own assets).

export const BRAND = {
  name: 'SolidBytes',
  tagline: 'Feel the Tech · Make the Growth',
  headline: 'Turning Your Vision into High-Performance Software',
  sub: 'We deliver stable, secure, and scalable digital products that optimize your operations and drive sustainable growth.',
  stats: [['150+', 'Projects delivered'], ['15+', 'Countries served'], ['100+', 'Dedicated bytes']],
  standard: ['Smart', 'Scalable', 'Solid'],
  quote: "If you're an overseas organization seeking to cross the digital ocean, we become part of your ship — your dedicated crew, your local harbor.",
  domains: ['AI Solutions', 'E-commerce Platforms', 'Web & Mobile', 'Remote Teams'],
};

// The guide. One constant to rename everywhere.
export const BOT = {
  name: 'Byte',
  title: 'YOUR GUIDE · ONE OF 100+ BYTES',
  lines: {
    hero: "Hi, I'm Byte, one of a hundred-plus at SolidBytes. Scroll. I'll walk you through.",
    voice: "Talk to me. I'm built on our AI Smart Companion POC: real-time voice, AR embodiment, context-aware.",
    intel: "Tell me the product. I'll sketch the system live: load balancer, services, cache, queue, data.",
    work: "Twelve of the hundred and fifty we've shipped. Hover one. Click to open it.",
    load: "Mobifone, five thousand employees. ThaiMarket on campaign day. We design for the peak, not the average.",
    team: "Meet the crew. Hover a face. Behind them stand a hundred more bytes.",
    contact: "Tell us what you want to build. Jev reads it first, so spam never reaches a human.",
  },
  // Scripted answers for the mic demo (keyword → reply). First match wins; last entry is the fallback.
  intents: [
    [/price|cost|budget|quote|how much/i, 'Every project is scoped after a short call. Tell Jev what you are building and the crew will come back with numbers.'],
    [/team|people|how many|crew|size/i, 'A hundred-plus bytes in Vietnam: engineers, QA, BA and design. Remote teams that plug straight into yours.'],
    [/voice|speak|talk|companion|character|3d/i, 'This is our AI Smart Companion work: real-time voice, a 3D character, context awareness. You are talking to a small piece of it.'],
    [/ai|llm|gpt|agent|machine learning|chatbot/i, 'AI is one of our two domains: LLM agents, NLP, forecasting, computer vision. Kinetic Eye cut recognition errors by eighty percent.'],
    [/shop|commerce|store|marketplace|payment/i, 'E-commerce is the other domain. ThaiMarket is a multi-vendor marketplace with multi-tier affiliate commissions.'],
    [/load|scale|traffic|peak|performance|fast/i, 'Peak traffic is a design input. Mobifone runs five thousand employees on our platform; Kara Idols took thousands of video uploads for Pepsi.'],
    [/contact|hire|start|project|work with|email/i, 'Scroll to the last chapter and tell us what you want to build. Jev screens it, a human answers.'],
    [/hello|hi|hey|who are you|your name/i, "Hi. I'm Byte, your guide. Ask me about the team, the projects, or what we can build for you."],
    [/.*/, "Good question. Scroll on and I'll show you, or ask me about the team, our projects, or how we handle load."],
  ],
};

export const TEAM = [
  { id: 'steven', name: 'Steven Cao', role: 'CEO', lead: true, img: 'assets/team/stevencao-ceo.webp', line: 'Sets the course. Fifteen countries and counting.' },
  { id: 'giang', name: 'Giang Pham', role: 'CEO', lead: true, img: 'assets/team/giangpham-ceo.webp', line: 'Runs the harbor: delivery, clients, growth.' },
  { id: 'dan', name: 'Dan Tran', role: 'Frontend Lead', img: 'assets/team/dantran-fe.webp', line: 'Owns the screen: React, Next.js, motion.' },
  { id: 'khanh', name: 'Khanh Nguyen', role: 'Backend Lead', img: 'assets/team/khanhnguyen-be.webp', line: 'Owns the load: services, queues, data.' },
  { id: 'nghi', name: 'Nghi Pham', role: 'Backend Developer', img: 'assets/team/nghipham-be.webp', line: 'APIs, pipelines, uptime.' },
  { id: 'duc', name: 'Duc Pham', role: 'Backend Developer', img: 'assets/team/ducpham-be.webp', line: 'Microservices and the glue between them.' },
  { id: 'gam', name: 'Gam Nguyen', role: 'HR Manager', img: 'assets/team/gamnguyen-hr.webp', line: 'Finds and keeps the bytes.' },
  { id: 'kieu', name: 'Kieu Mai', role: 'Sales & Admin', img: 'assets/team/kieumai-sale.webp', line: 'First voice you hear after Jev.' },
];
// Khánh 2026-10-12: Tram, Thang, Phuong removed on request; the two CEOs carry `lead: true` and must be staged bigger/brighter.
export const TEAM_LEADS = TEAM.filter((m) => m.lead);
export const TEAM_CREW = TEAM.filter((m) => !m.lead);
export const TEAM_ROLES = ['Engineers', 'QA', 'Business Analysts', 'Designers', 'Project Managers', 'Remote squads'];

export const PROJECTS = [
  { id: 'companion', name: 'AI Smart Companion', short: 'AR & voice companion (POC)', img: 'assets/projects/ai-companion.webp', ratio: 1,
    category: 'AI', client: 'Internal POC', metric: ['Real-time', 'voice + AR'],
    blurb: 'Proof of concept merging real-time voice intelligence with AR embodiment: a context-aware digital partner that listens, navigates and schedules.',
    tags: ['Voice AI', 'AR', '3D character'] },
  { id: 'kinetic', name: 'Kinetic Eye', short: 'AI video surveillance', img: 'assets/projects/kinetic-eye.webp', ratio: 1,
    category: 'AI', client: 'US client', metric: ['-80%', 'recognition errors'],
    blurb: 'High-precision AI web application that automates anomaly detection in real-time video, cutting image recognition errors by 80%.',
    tags: ['React', 'FastAPI', 'AWS'] },
  { id: 'insurance', name: 'AI Agents for Insurance', short: '24/7 service automation', img: 'assets/projects/ai-insurance.webp', ratio: 900 / 512,
    category: 'AI', client: 'US insurance provider', metric: ['24/7', 'automated service'],
    blurb: 'AI agent framework that automates product consulting and customer support for a US insurer with human-like precision.',
    tags: ['LLM agents', 'RAG', 'Automation'] },
  { id: 'casbu', name: 'Casbu', short: 'AI email productivity', img: 'assets/projects/casbu.webp', ratio: 1,
    category: 'AI', client: 'US client', metric: ['-40%', 'email processing time'],
    blurb: 'AI email ecosystem that prioritizes the inbox and drafts responses, reducing internal email processing time by 40%.',
    tags: ['NLP', 'GenAI', 'SaaS'] },
  { id: 'thaimarket', name: 'ThaiMarket', short: 'Multi-vendor e-commerce', img: 'assets/projects/thai-market.webp', ratio: 1,
    category: 'E-commerce', client: 'Thailand', metric: ['Multi-tier', 'affiliate engine'],
    blurb: 'E-commerce and affiliate ecosystem with multi-tier commissions, marketing campaigns and vendor-buyer management at scale.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL · Redis', 'AWS'] },
  { id: 'mobifone', name: 'Mobifone Management', short: 'Enterprise platform', img: 'assets/projects/mobi-management.webp', ratio: 900 / 574,
    category: 'Enterprise', client: 'Mobifone Vietnam', metric: ['5,000+', 'employees'],
    blurb: 'Internal management ecosystem for Mobifone Vietnam: real-time communication, task tracking and engagement tools for 5,000+ employees.',
    tags: ['Mobile', 'Realtime', 'Enterprise'] },
  { id: 'kara', name: 'Kara Idols', short: 'Singing contest app for Pepsi', img: 'assets/projects/kara-idol.webp', ratio: 1,
    category: 'Mobile', client: 'Pepsi', metric: ['Thousands', 'of video entries'],
    blurb: 'Multimedia mobile app for a viral Pepsi campaign: thousands of contestants recording, editing and uploading video entries.',
    tags: ['React Native', 'FFmpeg · OpenCV', 'Node.js'] },
  { id: 'pvgas', name: 'PV GAS', short: 'Enterprise portal', img: 'assets/projects/pv-gas.webp', ratio: 2,
    category: 'Web', client: 'PV GAS', metric: ['+120%', 'web traffic'],
    blurb: 'Corporate portal on Headless CMS + Next.js delivering a 120% increase in traffic and stronger SEO.',
    tags: ['Next.js', 'Headless CMS', 'SEO'] },
  { id: 'salus', name: 'Salus Learning', short: 'Gamified training for AIA', img: 'assets/projects/salus-learning.webp', ratio: 900 / 857,
    category: 'Web', client: 'AIA Vietnam', metric: ['Gamified', 'KPIs + live contests'],
    blurb: 'Role-based simulation platform that turns financial-consultant training into gamified KPIs and real-time competitions.',
    tags: ['Gamification', 'Realtime', 'LMS'] },
  { id: 'match3', name: 'Match 3 Puzzle', short: 'Cross-platform casual game', img: 'assets/projects/match-3-puzzle.webp', ratio: 900 / 546,
    category: 'Game', client: 'Singapore', metric: ['<0.2%', 'crash rate'],
    blurb: 'Casual mobile game on Unity with a microservices backend (Go, Node.js, MongoDB, Redis) and cross-device cloud saves.',
    tags: ['Unity', 'Go · Node.js', 'AWS'] },
  { id: 'jobfi', name: 'JobFi', short: 'Recruitment marketplace', img: 'assets/projects/jobfi.webp', ratio: 900 / 847,
    category: 'Web', client: 'Talent marketplace', metric: ['Automated', 'job matching'],
    blurb: 'Recruitment marketplace that bridges top talent and enterprises with automated matching and a subscription model.',
    tags: ['Marketplace', 'Matching', 'Subscriptions'] },
  { id: 'clinic', name: 'Clinic Manager', short: 'Healthcare operations', img: 'assets/projects/clinic-management.webp', ratio: 900 / 630,
    category: 'Web', client: 'Healthcare', metric: ['End-to-end', 'clinic workflow'],
    blurb: 'Web-based system covering patient records, scheduling and financial reporting with secure, high-performance operations.',
    tags: ['Healthcare', 'Security', 'Reporting'] },
];

// Chapter 04 LOAD: the three cases the boss can name. Numbers are the live site's own claims.
export const LOAD_CASES = [
  { id: 'mobifone', name: 'Mobifone Management', fact: '5,000+ employees on one internal platform', img: 'assets/projects/mobi-management.webp' },
  { id: 'thaimarket', name: 'ThaiMarket', fact: 'Multi-vendor marketplace, multi-tier affiliate traffic', img: 'assets/projects/thai-market.webp' },
  { id: 'kara', name: 'Kara Idols · Pepsi', fact: 'Thousands of video uploads during a viral campaign', img: 'assets/projects/kara-idol.webp' },
];

// Chapter 02 INTELLIGENCE: the architecture Byte "draws". Labels only; each option stages them its own way.
export const ARCH = ['LB', 'API', 'CACHE', 'QUEUE', 'DB'];
