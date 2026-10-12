// Photo cards, in-world labels, hover/click picking and the detail panel shared by all layout options.
// Usage:
//   import { photoCard, labelSprite, createPicker, createDetail, tip } from './shared/sb-cards.js';
//   const card = photoCard({ url: m.img, w: 1, h: 1.25, imgRatio: 0.8 }); scene.add(card);
//   picker.add(card, { kind: 'person', data: m });  each frame: picker.update();
import * as THREE from 'three';

let stylesDone = false;
export function injectCardStyles() {
  if (stylesDone) return; stylesDone = true;
  const s = document.createElement('style');
  s.textContent = `
  .sb-tip { position: fixed; left: 0; top: 0; z-index: 13; pointer-events: none; transform: translate(14px, 18px); padding: 9px 12px; border: 1px solid rgba(239,233,221,.14); background: rgba(7,9,13,.82); backdrop-filter: blur(8px); border-radius: 6px; color: var(--bone,#efe9dd); font: 300 14px/1.3 var(--display,'Inter Tight',system-ui,sans-serif); white-space: nowrap; opacity: 0; transition: opacity .15s; }
  .sb-tip.on { opacity: 1; } .sb-tip small { display: block; margin-top: 3px; font: 500 9px/1 var(--mono,ui-monospace,monospace); letter-spacing: .22em; color: var(--mute,#8b93a1); text-transform: uppercase; }
  .sb-tip em { font-style: normal; color: var(--sb,#1f8fd6); }
  .sb-detail { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center; padding: 24px; background: rgba(7,9,13,.55); backdrop-filter: blur(6px); opacity: 0; pointer-events: none; transition: opacity .25s; }
  .sb-detail.on { opacity: 1; pointer-events: auto; }
  .sb-detail .sbd * { opacity: 1 !important; transform: none !important; filter: none !important; visibility: visible !important; transition: none; }
  .sb-detail .sbd { width: min(880px, 100%); max-height: calc(100vh - 48px); overflow: auto; display: grid; grid-template-columns: 1.1fr 1fr; border: 1px solid rgba(239,233,221,.14); background: #0b0e13; color: var(--bone,#efe9dd); transform: translateY(14px); transition: transform .3s cubic-bezier(.2,.7,.2,1); }
  .sb-detail.on .sbd { transform: none; }
  .sb-detail .sbd-img { aspect-ratio: 1; background: #10141b center/cover no-repeat; min-height: 280px; }
  .sb-detail .sbd-img.sbd-person { background-size: cover; background-position: top; }
  .sb-detail .sbd-body { padding: 28px 28px 26px; display: flex; flex-direction: column; gap: 12px; font-family: var(--display,'Inter Tight',system-ui,sans-serif); font-weight: 300; }
  .sb-detail .sbd-k { font: 500 9px/1 var(--mono,ui-monospace,monospace); letter-spacing: .26em; color: var(--mute,#8b93a1); }
  .sb-detail .sbd-h { font-size: clamp(24px, 3vw, 34px); font-weight: 300; letter-spacing: -.02em; line-height: 1.05; margin: 0; }
  .sb-detail .sbd-metric { font-size: 40px; line-height: 1; font-weight: 300; color: var(--sb,#1f8fd6); letter-spacing: -.03em; } .sb-detail .sbd-metric small { display: block; font: 500 9px/1 var(--mono,ui-monospace,monospace); letter-spacing: .22em; color: var(--mute,#8b93a1); margin-top: 8px; }
  .sb-detail .sbd-p { font-size: 15px; line-height: 1.5; color: #c9c3b8; margin: 0; }
  .sb-detail .sbd-tags { display: flex; flex-wrap: wrap; gap: 6px; } .sb-detail .sbd-tags span { font: 500 9px/1 var(--mono,ui-monospace,monospace); letter-spacing: .18em; color: var(--mute,#8b93a1); border: 1px solid #222a36; padding: 7px 9px; }
  .sb-detail .sbd-x { position: absolute; right: 28px; top: 22px; font: 500 10px/1 var(--mono,ui-monospace,monospace); letter-spacing: .26em; color: var(--mute,#8b93a1); background: none; border: 0; cursor: pointer; padding: 10px; }
  .sb-detail .sbd-x:hover { color: var(--bone,#efe9dd); }
  @media (max-width: 720px) { .sb-detail .sbd { grid-template-columns: 1fr; } .sb-detail .sbd-img { min-height: 220px; aspect-ratio: 16/10; } }`;
  document.head.appendChild(s);
}

// ---------- textures ----------
const cache = new Map();
const loader = new THREE.TextureLoader();
export function loadTexture(url, { anisotropy = 4 } = {}) {
  if (cache.has(url)) return cache.get(url);
  const p = new Promise((res, rej) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = anisotropy; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; res(t); }, undefined, rej));
  cache.set(url, p); return p;
}
export function preload(urls) { return Promise.allSettled(urls.map((u) => loadTexture(u))); }

// ---------- rounded photo card (cover-fit, border, hover glow) ----------
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
uniform sampler2D map; uniform float hasMap, uRadius, uBorder, uHover, uDim, uOpacity, uImgAspect; uniform vec2 uSize; uniform vec3 uBorderColor, uHoverColor, uFill; varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; }
void main(){
  vec2 p = (vUv - 0.5) * uSize; vec2 hb = uSize * 0.5;
  float d = sdRound(p, hb, uRadius); if (d > 0.0) discard;
  float cardA = uSize.x / uSize.y; vec2 uv = vUv - 0.5;
  if (uImgAspect > cardA) uv.x *= cardA / uImgAspect; else uv.y *= uImgAspect / cardA; uv += 0.5;
  vec3 col = hasMap > 0.5 ? texture2D(map, uv).rgb : uFill;
  col *= uDim * (1.0 + 0.3 * uHover);
  float inner = sdRound(p, hb - uBorder, max(uRadius - uBorder, 0.0));
  vec3 bc = mix(uBorderColor, uHoverColor, uHover);
  col = mix(col, bc, smoothstep(-0.003, 0.003, inner));
  float aa = 1.0 - smoothstep(-0.004, 0.0, d);
  gl_FragColor = vec4(col, uOpacity * max(aa, 0.6));
}`;
export function photoCard({ url, w = 1, h = 1.25, radius = 0.06, border = 0.022, borderColor = 0x1c2330, hoverColor = 0x1f8fd6, fill = 0x10141b, imgRatio = 1, dim = 0.78 } = {}) {
  const u = {
    map: { value: null }, hasMap: { value: 0 }, uSize: { value: new THREE.Vector2(w, h) }, uRadius: { value: radius }, uBorder: { value: border }, uHover: { value: 0 }, uDim: { value: dim }, uOpacity: { value: 1 },
    uImgAspect: { value: imgRatio }, uBorderColor: { value: new THREE.Color(borderColor) }, uHoverColor: { value: new THREE.Color(hoverColor) }, uFill: { value: new THREE.Color(fill) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  const api = {
    uniforms: u, hover: 0,
    setHover(v) { u.uHover.value = v; }, setDim(v) { u.uDim.value = v; }, setOpacity(v) { u.uOpacity.value = v; },
    // call each frame for smooth hover easing: card.ease(hovered, dt)
    ease(target, dt, k = 10) { api.hover += (target - api.hover) * (1 - Math.exp(-k * dt)); u.uHover.value = api.hover; },
  };
  mesh.userData.card = api; mesh.castShadow = false;
  if (url) loadTexture(url).then((t) => { u.map.value = t; u.hasMap.value = 1; if (t.image && t.image.width) u.uImgAspect.value = t.image.width / t.image.height; }).catch(() => {});
  return mesh;
}

// ---------- in-world text label (canvas) ----------
export function labelSprite(text, { sub = '', width = 1.2, color = '#efe9dd', subColor = '#8b93a1', accent = '#1f8fd6', size = 40, align = 'center', px = 1024 } = {}) {
  const c = document.createElement('canvas'); const ctx = c.getContext('2d'); c.width = px; c.height = sub ? Math.round(px * 0.19) : Math.round(px * 0.12);
  const draw = (t, s) => {
    ctx.clearRect(0, 0, c.width, c.height); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; const x = align === 'center' ? c.width / 2 : align === 'left' ? 0 : c.width;
    ctx.fillStyle = color; ctx.font = `300 ${size * 2}px "Inter Tight", system-ui, sans-serif`; ctx.fillText(t, x, size * 2.1);
    if (s) { ctx.fillStyle = subColor; ctx.font = `500 ${size * 0.72}px "JetBrains Mono", ui-monospace, monospace`; const sp = s.toUpperCase().split('').join(String.fromCharCode(8202)); ctx.fillText(sp, x, size * 2.1 + size * 1.25); }
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * c.height / c.width), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  mesh.userData.redraw = draw; mesh.renderOrder = 2;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(text, sub)); draw(text, sub);
  return mesh;
}

// ---------- picking (hover + click) ----------
export function createPicker({ camera, onHover, onLeave, onClick, dom = window } = {}) {
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(-9, -9); const objs = []; let hovered = null, moved = true, down = null; const p = { x: 0, y: 0 };
  const api = {
    enabled: true, hovered: null, pointer: p,
    add(obj, data) { obj.userData.pick = data; objs.push(obj); return obj; },
    remove(obj) { const i = objs.indexOf(obj); if (i >= 0) objs.splice(i, 1); if (hovered === obj) api.clear(); },
    clear() { if (hovered) { const o = hovered; hovered = api.hovered = null; document.body.classList.remove('sb-hover'); onLeave && onLeave(o, o.userData.pick); } },
    update() {
      if (!api.enabled) { api.clear(); return; } if (ndc.x < -1.5) return; moved = false;
      ray.setFromCamera(ndc, camera); const hits = ray.intersectObjects(objs, false); const h = hits.length ? hits[0].object : null;
      if (h !== hovered) { api.clear(); if (h) { hovered = api.hovered = h; document.body.classList.add('sb-hover'); onHover && onHover(h, h.userData.pick, p); } }
      else if (h && onHover) onHover(h, h.userData.pick, p, true);
    },
  };
  dom.addEventListener('pointermove', (e) => { p.x = e.clientX; p.y = e.clientY; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); moved = true; }, { passive: true });
  dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  dom.addEventListener('pointerup', (e) => { if (!down) return; const ok = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && performance.now() - down.t < 500; down = null; if (ok && hovered && api.enabled && onClick) onClick(hovered, hovered.userData.pick, p); });
  addEventListener('scroll', () => { moved = true; }, { passive: true });
  return api;
}

// ---------- tooltip near the pointer ----------
let tipEl = null;
export function tip(html, x, y) {
  injectCardStyles();
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'sb-tip'; document.body.appendChild(tipEl); }
  if (!html) { tipEl.classList.remove('on'); return; }
  tipEl.innerHTML = html; tipEl.classList.add('on');
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight; const fx = x + 14 + w > innerWidth ? x - w - 14 : x, fy = y + 18 + h > innerHeight ? y - h - 10 : y;
  tipEl.style.transform = `translate(${Math.round(fx + (fx === x ? 14 : 0))}px, ${Math.round(fy + (fy === y ? 18 : 0))}px)`;
}
export const tipPerson = (m) => `${m.name}<small>${m.role}</small>`;
export const tipProject = (p) => `${p.name}<small>${p.short} · <em>click to open</em></small>`;

// ---------- detail panel ----------
export function createDetail() {
  injectCardStyles();
  const el = document.createElement('div'); el.className = 'sb-detail'; el.setAttribute('role', 'dialog');
  el.innerHTML = `<div class="sbd"><div class="sbd-img"></div><div class="sbd-body"><div class="sbd-k"></div><h3 class="sbd-h"></h3><div class="sbd-metric"></div><p class="sbd-p"></p><div class="sbd-tags"></div></div><button class="sbd-x" type="button">CLOSE ✕</button></div>`;
  document.body.appendChild(el);
  const q = (s) => el.querySelector(s); let open = false;
  const api = {
    get open() { return open; },
    hide() { open = false; el.classList.remove('on'); },
    showProject(p) {
      q('.sbd-img').className = 'sbd-img'; q('.sbd-img').style.backgroundImage = `url(${p.img})`;
      q('.sbd-k').textContent = `${p.category} · ${p.client}`.toUpperCase(); q('.sbd-h').textContent = p.name;
      q('.sbd-metric').innerHTML = `${p.metric[0]}<small>${p.metric[1]}</small>`; q('.sbd-p').textContent = p.blurb;
      q('.sbd-tags').innerHTML = p.tags.map((t) => `<span>${t}</span>`).join(''); open = true; el.classList.add('on');
    },
    showPerson(m) {
      q('.sbd-img').className = 'sbd-img sbd-person'; q('.sbd-img').style.backgroundImage = `url(${m.img})`;
      q('.sbd-k').textContent = m.lead ? 'LEADERSHIP · SOLIDBYTES' : 'THE CREW · SOLIDBYTES'; q('.sbd-h').textContent = m.name;
      q('.sbd-metric').innerHTML = `${m.role}<small>${m.lead ? 'co-founder · leads the harbor' : 'one of 100+ bytes'}</small>`; q('.sbd-p').textContent = m.line;
      q('.sbd-tags').innerHTML = ''; open = true; el.classList.add('on');
    },
  };
  q('.sbd-x').addEventListener('click', api.hide); el.addEventListener('click', (e) => { if (e.target === el) api.hide(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') api.hide(); });
  return api;
}
