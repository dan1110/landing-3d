// Byte — SolidBytes' chibi guide. Procedural (no model file), built from the AI Smart Companion POC look:
// dark bob hair, pale periwinkle skin, headphones with glowing pads, white/black hoodie with a blue trim, light cargo pants, sneakers.
// Usage:
//   import { createBot, voice } from './shared/sb-bot.js';
//   const bot = createBot({ scale: 0.9 }); scene.add(bot.group); bot.attachBubble(camera);
//   each frame: bot.update(dt, camera);
//   bot.goTo(new THREE.Vector3(x, 0, z));            // walks there (hop + leg swing), then faces the camera
//   bot.say(BOT.lines.voice);                        // speech bubble + Web Speech (if the visitor enabled voice) + talk animation
//   bot.setMood('wave' | 'talk' | 'point' | 'cheer' | 'idle'); bot.pointAt(vec3); bot.lookAt(vec3 | null)
import * as THREE from 'three';

const COL = {
  skin: 0xa9b1e6, skinDark: 0x8089c4, hair: 0x171c2b, hairLight: 0x27304d, hoodie: 0xece6da, hoodieDark: 0x14171e,
  trim: 0x1f8fd6, pad: 0xf2b25c, cup: 0x1b1f28, pants: 0xb7bbc4, cuff: 0x14171e, shoe: 0xf1ece2, eye: 0x111522, cheek: 0xe79aa8,
};
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0, ...o });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));
const smooth = (k) => k * k * (3 - 2 * k);

let stylesDone = false;
export function injectBotStyles() {
  if (stylesDone) return; stylesDone = true;
  const s = document.createElement('style');
  s.textContent = `
  .sb-bubble { position: fixed; left: 0; top: 0; z-index: 12; pointer-events: none; max-width: min(300px, 70vw); padding: 12px 14px 13px; border: 1px solid rgba(239,233,221,.14); border-radius: 12px 12px 12px 3px; background: rgba(7,9,13,.78); backdrop-filter: blur(8px); color: var(--bone, #efe9dd); font: 300 15px/1.4 var(--display, 'Inter Tight', system-ui, sans-serif); opacity: 0; transform: translate(0, -100%) translateY(8px); transition: opacity .25s ease, transform .25s ease; will-change: transform; }
  .sb-bubble.on { opacity: 1; transform: translate(0, -100%); }
  .sb-bubble b { display: block; font: 500 9px/1 var(--mono, 'JetBrains Mono', ui-monospace, monospace); letter-spacing: .26em; color: var(--sb, #1f8fd6); margin-bottom: 7px; }
  .sb-bubble .c { opacity: 0; } .sb-bubble .c.v { opacity: 1; }
  .sb-voice { position: fixed; right: 32px; top: 74px; z-index: 14; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px 0 10px; border: 1px solid rgba(239,233,221,.16); border-radius: 15px; background: rgba(7,9,13,.6); color: var(--mute, #8b93a1); font: 500 9px/1 var(--mono, ui-monospace, monospace); letter-spacing: .22em; cursor: pointer; pointer-events: auto; }
  .sb-voice i { width: 8px; height: 8px; border-radius: 50%; background: #3a4352; } .sb-voice.on { color: var(--bone, #efe9dd); border-color: var(--sb, #1f8fd6); } .sb-voice.on i { background: var(--sb, #1f8fd6); box-shadow: 0 0 10px var(--sb, #1f8fd6); }
  .sb-voice.unsupported { opacity: .4; pointer-events: none; }
  @media (max-width: 720px) { .sb-voice { right: 16px; top: 64px; } }`;
  document.head.appendChild(s);
}

// ---------- Web Speech (placeholder for the real voice provider) ----------
export const voice = {
  enabled: false,
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  _voice: null, _onChange: new Set(),
  _pick() {
    if (!this.supported) return null;
    const vs = speechSynthesis.getVoices();
    const prefer = ['Google US English', 'Samantha', 'Ava', 'Karen', 'Moira', 'Daniel', 'Microsoft Aria', 'Microsoft Jenny'];
    for (const p of prefer) { const v = vs.find((x) => x.name.includes(p)); if (v) return v; }
    return vs.find((x) => /^en(-|_)/.test(x.lang)) || vs[0] || null;
  },
  enable({ silent = false } = {}) { if (!this.supported) return false; this.enabled = true; this._voice = this._pick(); this._emit(); if (!silent) this.speak('Voice on.'); return true; },
  disable() { this.enabled = false; this.stop(); this._emit(); },
  toggle() { return this.enabled ? (this.disable(), false) : this.enable(); },
  onChange(fn) { this._onChange.add(fn); return () => this._onChange.delete(fn); },
  _emit() { this._onChange.forEach((f) => f(this.enabled)); },
  speak(text, { rate = 1.02, pitch = 1.18, onend } = {}) {
    if (!this.enabled || !this.supported) { onend && setTimeout(onend, 0); return false; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (!this._voice) this._voice = this._pick();
    if (this._voice) u.voice = this._voice;
    u.lang = (this._voice && this._voice.lang) || 'en-US'; u.rate = rate; u.pitch = pitch; u.volume = 1;
    u.onend = () => onend && onend(); u.onerror = () => onend && onend();
    speechSynthesis.speak(u); return true;
  },
  stop() { if (this.supported) speechSynthesis.cancel(); },
  // Mic: returns a controller or null when unsupported. onResult(text) fires once with the final transcript.
  listen({ onStart, onResult, onEnd, lang = 'en-US' } = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null;
    const r = new SR(); r.lang = lang; r.interimResults = false; r.maxAlternatives = 1;
    r.onstart = () => onStart && onStart();
    r.onresult = (e) => { const t = e.results[0][0].transcript; onResult && onResult(t); };
    r.onend = () => onEnd && onEnd(); r.onerror = () => onEnd && onEnd();
    try { r.start(); } catch { return null; }
    return { stop: () => r.stop() };
  },
};
if (voice.supported) speechSynthesis.onvoiceschanged = () => { voice._voice = voice._pick(); };

// A small fixed pill: VOICE OFF / VOICE ON. Browsers only allow speech after a user gesture, so the visitor flips this.
export function createVoiceToggle(parent = document.body) {
  injectBotStyles();
  const el = document.createElement('button'); el.type = 'button'; el.className = 'sb-voice'; el.innerHTML = '<i></i><span>VOICE OFF</span>';
  if (!voice.supported) { el.classList.add('unsupported'); el.querySelector('span').textContent = 'VOICE N/A'; }
  const sync = (on) => { el.classList.toggle('on', on); el.querySelector('span').textContent = on ? 'VOICE ON' : 'VOICE OFF'; };
  voice.onChange(sync); el.addEventListener('click', () => voice.toggle());
  parent.appendChild(el); return el;
}

// ---------- the chibi ----------
export function createBot({ scale = 1, name = 'Byte', light = true } = {}) {
  injectBotStyles();
  const group = new THREE.Group(); group.name = 'byte'; group.scale.setScalar(scale);
  const body = new THREE.Group(); group.add(body); // yaw for walking, independent of head
  const cast = (m) => { m.castShadow = true; m.receiveShadow = false; return m; };

  // torso (hoodie) — capsule for a soft chibi body
  const torso = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.2, 6, 18), std(COL.hoodie, { roughness: 0.8 }))); torso.position.y = 0.66; body.add(torso);
  const band = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.26, 0.14, 24), std(COL.hoodieDark, { roughness: 0.7 }))); band.position.y = 0.5; body.add(band);
  const trimM = new THREE.MeshBasicMaterial({ color: COL.trim, toneMapped: false });
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.012, 6, 36), trimM); trim.rotation.x = Math.PI / 2; trim.position.y = 0.575; body.add(trim);
  const zip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.01), new THREE.MeshStandardMaterial({ color: COL.hoodieDark, roughness: 0.5 })); zip.position.set(0, 0.7, 0.265); body.add(zip);
  // hood (collar) behind the neck
  const hood = cast(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 8, 24, Math.PI), std(COL.hoodie, { roughness: 0.85 }))); hood.rotation.x = -Math.PI / 2; hood.rotation.z = Math.PI; hood.position.set(0, 0.9, -0.06); body.add(hood);
  // SB badge
  const bc = document.createElement('canvas'); bc.width = bc.height = 128; const bx = bc.getContext('2d');
  bx.fillStyle = '#14171e'; bx.beginPath(); bx.roundRect(8, 8, 112, 112, 22); bx.fill(); bx.fillStyle = '#efe9dd'; bx.font = '700 58px Inter Tight, system-ui, sans-serif'; bx.textAlign = 'center'; bx.textBaseline = 'middle'; bx.fillText('SB', 64, 68);
  const badgeT = new THREE.CanvasTexture(bc); badgeT.colorSpace = THREE.SRGBColorSpace;
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), new THREE.MeshBasicMaterial({ map: badgeT, transparent: true })); badge.position.set(0.12, 0.74, 0.262); badge.rotation.y = 0.18; body.add(badge);

  // arms (pivot at shoulder, capsule hangs down -Y)
  const mkArm = (side) => {
    const piv = new THREE.Group(); piv.position.set(0.29 * side, 0.78, 0); body.add(piv);
    const sleeve = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 12), std(COL.hoodieDark, { roughness: 0.8 }))); sleeve.position.y = -0.16; piv.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 20), trimM); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.27; piv.add(cuff);
    const hand = cast(new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), std(COL.skin))); hand.position.y = -0.33; piv.add(hand);
    piv.rotation.z = 0.18 * side; piv.userData.rest = { x: 0, z: 0.18 * side }; return piv;
  };
  const armR = mkArm(1), armL = mkArm(-1);

  // legs + sneakers
  const mkLeg = (side) => {
    const piv = new THREE.Group(); piv.position.set(0.12 * side, 0.42, 0); body.add(piv);
    const leg = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.16, 4, 12), std(COL.pants, { roughness: 0.9 }))); leg.position.y = -0.14; piv.add(leg);
    const cuff = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.095, 0.06, 16), std(COL.cuff))); cuff.position.y = -0.26; piv.add(cuff);
    const shoe = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.14, 4, 12), std(COL.shoe, { roughness: 0.5 }))); shoe.rotation.x = Math.PI / 2; shoe.position.set(0, -0.33, 0.05); piv.add(shoe);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.025, 0.12), trimM); stripe.position.set(0, -0.345, 0.04); piv.add(stripe);
    return piv;
  };
  const legR = mkLeg(1), legL = mkLeg(-1);

  // head
  const neck = new THREE.Group(); neck.position.y = 1.0; body.add(neck);
  const head = new THREE.Group(); neck.add(head);
  const skull = cast(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), std(COL.skin, { roughness: 0.55 }))); skull.position.y = 0.4; skull.scale.set(1, 0.97, 0.95); head.add(skull);
  const hairM = std(COL.hair, { roughness: 0.45, metalness: 0.05 });
  // hair: full cap to the equator at the back/sides, a crescent of bangs across the forehead, a few tufts on its edge
  const cap = cast(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.36), hairM)); cap.position.y = 0.4; head.add(cap);
  const bob = cast(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 18, Math.PI * 0.8, Math.PI * 1.4, Math.PI * 0.3, Math.PI * 0.42), hairM)); bob.position.y = 0.4; head.add(bob);
  const bangs = cast(new THREE.Mesh(new THREE.SphereGeometry(0.455, 32, 12, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.3, Math.PI * 0.15), hairM)); bangs.position.y = 0.4; head.add(bangs);
  [-0.2, -0.06, 0.09, 0.22].forEach((x, i) => { const t = cast(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), hairM)); t.scale.set(1.15, 0.9 + (i % 2) * 0.35, 0.45); t.position.set(x, 0.49 - Math.abs(x) * 0.12 - (i % 2) * 0.02, 0.4 - Math.abs(x) * 0.18); head.add(t); });
  const sheen = new THREE.Mesh(new THREE.SphereGeometry(0.455, 24, 12, Math.PI * 1.1, Math.PI * 0.35, Math.PI * 0.12, Math.PI * 0.14), new THREE.MeshBasicMaterial({ color: COL.hairLight, transparent: true, opacity: 0.5 })); sheen.position.y = 0.4; head.add(sheen);
  // eyes
  const eyeM = std(COL.eye, { roughness: 0.25 }); const whiteM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = [1, -1].map((s) => {
    const e = new THREE.Group(); e.position.set(0.15 * s, 0.42, 0.37); head.add(e);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), eyeM); ball.scale.set(1, 1.55, 0.5); e.add(ball);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), whiteM); hl.position.set(0.02 * s, 0.035, 0.03); e.add(hl);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), whiteM); hl2.position.set(-0.015 * s, -0.025, 0.03); e.add(hl2);
    return e;
  });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.011, 6, 14, Math.PI), std(COL.skinDark)); mouth.rotation.z = Math.PI; mouth.scale.set(1, 0.5, 0.5); mouth.position.set(0, 0.29, 0.405); head.add(mouth); // a small smile; talk pulses scale.y
  [1, -1].forEach((s) => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), new THREE.MeshBasicMaterial({ color: COL.cheek, transparent: true, opacity: 0.35 })); c.position.set(0.25 * s, 0.33, 0.33); c.rotation.y = 0.55 * s; head.add(c); });
  // headphones
  const cupM = std(COL.cup, { roughness: 0.4, metalness: 0.2 });
  const bandG = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.028, 8, 36, Math.PI), cupM); bandG.position.y = 0.42; head.add(bandG);
  const padM = new THREE.MeshStandardMaterial({ color: COL.pad, emissive: COL.pad, emissiveIntensity: 0.9, roughness: 0.4 });
  const pads = [1, -1].map((s) => {
    const cup = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 24), cupM)); cup.rotation.z = Math.PI / 2; cup.position.set(0.44 * s, 0.4, 0); head.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.02, 8, 28), padM); ring.rotation.y = Math.PI / 2; ring.position.set(0.5 * s, 0.4, 0); head.add(ring);
    return ring;
  });
  // small warm rim so Byte reads in dark scenes (one light, created once, never toggled)
  let rim = null;
  if (light) { rim = new THREE.PointLight(COL.pad, 5, 3.2, 2); rim.position.set(0.7, 1.9, -0.6); group.add(rim); }

  // ---------- state ----------
  const S = { t: 0, mood: 'idle', moodT: 0, blinkAt: 1.6, blink: 0, look: null, point: null, move: null, baseY: 0, talk: 0, talkUntil: 0, prevMood: 'idle' };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const api = {
    group, head, body, name, state: S, parts: { torso, head, armR, armL, legR, legL, pads, rim, eyes },
    // world position above the head (for bubbles / labels)
    anchor(out = new THREE.Vector3()) { return head.getWorldPosition(out).add(tmp2.set(0, 0.95 * scale, 0)); },
    setMood(m) { if (S.mood !== m) { S.prevMood = S.mood; S.mood = m; S.moodT = 0; } return api; },
    lookAt(v) { S.look = v ? v.clone() : null; return api; },
    pointAt(v) { S.point = v ? v.clone() : null; if (v) api.setMood('point'); return api; },
    place(pos, faceYaw) { group.position.copy(pos); S.baseY = pos.y; S.move = null; if (faceYaw !== undefined) { body.rotation.y = faceYaw; S.faceAfter = null; } else S.faceAfter = 'camera'; return api; },
    // walk to a point (world). Faces travel direction while moving, then turns to face `face` (vec3) or the camera.
    goTo(pos, { duration, face = null, hop = 0.07 } = {}) {
      const from = group.position.clone(); const d = from.distanceTo(pos);
      if (d < 0.01) { api.place(pos); return api; }
      S.move = { from, to: pos.clone(), dur: duration || clamp(d / 2.2, 0.5, 2.6), el: 0, face, hop, steps: Math.max(2, Math.round(d / 0.55)) };
      return api;
    },
    isMoving() { return !!S.move; },
    // bubble + voice + talk animation
    say(text, { speak = true, hold, mood = 'talk' } = {}) {
      api.setMood(mood);
      const words = text.split(/\s+/).length; const ms = hold ?? clamp(1400 + words * 330, 2200, 9000);
      S.talkUntil = S.t + ms / 1000;
      if (bubble) bubble.show(text, ms);
      if (speak) voice.speak(text, { onend: () => { if (S.mood === 'talk' && !voice.enabled) return; S.talkUntil = Math.min(S.talkUntil, S.t + 0.4); } });
      return api;
    },
    hush() { S.talkUntil = 0; if (bubble) bubble.hide(); voice.stop(); if (S.mood === 'talk') api.setMood('idle'); return api; },
    attachBubble(camera, opts) { bubble = createBubble(api, camera, opts); return bubble; },
    update(dt, camera) {
      dt = Math.min(dt, 0.05); S.t += dt; S.moodT += dt; const t = S.t;
      // --- locomotion ---
      let swing = 0, bob = 0;
      if (S.move) {
        const mv = S.move; mv.el += dt; const k = clamp(mv.el / mv.dur, 0, 1), e = smooth(k);
        group.position.lerpVectors(mv.from, mv.to, e);
        bob = Math.abs(Math.sin(k * Math.PI * mv.steps)) * mv.hop; group.position.y = mv.to.y * e + mv.from.y * (1 - e) + bob;
        swing = Math.sin(k * Math.PI * mv.steps * 2) * 0.7 * (1 - Math.pow(2 * k - 1, 8));
        tmp.subVectors(mv.to, mv.from); const yaw = Math.atan2(tmp.x, tmp.z); body.rotation.y = damp(body.rotation.y, lerpAngle(body.rotation.y, yaw), 10, dt);
        if (k >= 1) { S.baseY = mv.to.y; S.move = null; S.faceAfter = mv.face || 'camera'; }
      } else {
        group.position.y = S.baseY + Math.sin(t * 2.1) * 0.022;
        if (S.faceAfter) { // turn to face the camera (or a point) after arriving
          const target = S.faceAfter === 'camera' ? camera.position : S.faceAfter; tmp.copy(target).sub(group.position); const yaw = Math.atan2(tmp.x, tmp.z);
          body.rotation.y = lerpAngle(body.rotation.y, yaw, 1 - Math.exp(-6 * dt)); if (Math.abs(angleDiff(body.rotation.y, yaw)) < 0.02) S.faceAfter = null;
        }
      }
      legR.rotation.x = damp(legR.rotation.x, swing, 14, dt); legL.rotation.x = damp(legL.rotation.x, -swing, 14, dt);
      torso.scale.y = 1 + Math.sin(t * 2.1) * 0.015; body.rotation.z = Math.sin(t * 1.3) * 0.015;
      // --- blink ---
      if (t > S.blinkAt) { S.blink = 0.14; S.blinkAt = t + 2.2 + Math.random() * 3; }
      if (S.blink > 0) { S.blink -= dt; const o = S.blink > 0.07 ? 1 - (0.14 - S.blink) / 0.07 : S.blink / 0.07; eyes.forEach((e) => e.scale.y = Math.max(0.08, o)); } else eyes.forEach((e) => e.scale.y = 1);
      // --- head look (toward camera unless told otherwise) ---
      const lookT = S.look || camera.position; neck.worldToLocal(tmp.copy(lookT));
      const yaw = clamp(Math.atan2(tmp.x, tmp.z), -1.0, 1.0), pitch = clamp(Math.atan2(tmp.y - 0.4, Math.hypot(tmp.x, tmp.z)), -0.35, 0.45);
      head.rotation.y = damp(head.rotation.y, yaw, 6, dt); head.rotation.x = damp(head.rotation.x, -pitch, 6, dt);
      // --- moods ---
      const talking = t < S.talkUntil; if (!talking && S.mood === 'talk') api.setMood('idle');
      let aR = { x: 0, z: 0.18 }, aL = { x: 0, z: -0.18 }, nod = 0, padI = 0.9, hopY = 0;
      const m = S.mood, mt = S.moodT;
      if (m === 'wave') { aR = { x: 0.1, z: 2.5 + Math.sin(t * 9) * 0.3 }; nod = Math.sin(t * 2) * 0.03; }
      else if (m === 'talk' || talking) { aR = { x: -0.6 + Math.sin(t * 4.2) * 0.3, z: 0.5 }; aL = { x: -0.3 + Math.sin(t * 3.1 + 1) * 0.2, z: -0.4 }; nod = Math.sin(t * 5) * 0.035; padI = 1.2 + Math.abs(Math.sin(t * 7)) * 1.1; }
      else if (m === 'cheer') { aR = { x: 0.2, z: 2.9 }; aL = { x: 0.2, z: -2.9 }; hopY = Math.abs(Math.sin(t * 6)) * 0.09; }
      else if (m === 'point' && S.point) {
        armR.getWorldPosition(tmp); tmp2.copy(S.point).sub(tmp); body.worldToLocal(tmp2.add(tmp)).sub(armR.position); // target in body space relative to shoulder
        const dir = tmp2.normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
        armR.quaternion.slerp(q, 1 - Math.exp(-8 * dt)); aR = null; padI = 1.3; nod = 0;
      }
      if (aR) { armR.rotation.x = damp(armR.rotation.x, aR.x, 8, dt); armR.rotation.z = damp(armR.rotation.z, aR.z, 8, dt); armR.rotation.y = damp(armR.rotation.y, 0, 8, dt); }
      armL.rotation.x = damp(armL.rotation.x, aL.x, 8, dt); armL.rotation.z = damp(armL.rotation.z, aL.z, 8, dt);
      head.rotation.x += nod; group.position.y += hopY;
      const mouthY = talking ? 0.5 + Math.abs(Math.sin(t * 13.5)) * 1.3 : 0.5; mouth.scale.y = damp(mouth.scale.y, mouthY, 25, dt); mouth.scale.x = talking ? 0.8 : 1;
      padM.emissiveIntensity = damp(padM.emissiveIntensity, padI, 10, dt);
      if (rim) rim.intensity = 5 + (padI - 0.9) * 1.5;
      if (bubble) bubble.update();
    },
  };
  let bubble = null;
  return api;
}
function angleDiff(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function lerpAngle(a, b, k = 1) { return a + angleDiff(a, b) * k; }

// ---------- speech bubble (HTML, follows the head) ----------
export function createBubble(bot, camera, { name = bot.name, offsetX = 18, offsetY = -6 } = {}) {
  const el = document.createElement('div'); el.className = 'sb-bubble'; el.innerHTML = `<b>${name.toUpperCase()}</b><span class="txt"></span>`; document.body.appendChild(el);
  const txt = el.querySelector('.txt'); const v = new THREE.Vector3(); let hideAt = 0, typing = null, visible = false;
  const b = {
    el,
    show(text, ms = 4000) {
      clearInterval(typing); txt.innerHTML = ''; const chars = [...text].map((c) => { const s = document.createElement('span'); s.className = 'c'; s.textContent = c; txt.appendChild(s); return s; });
      let i = 0; const step = Math.max(8, Math.min(28, 900 / chars.length)); typing = setInterval(() => { for (let k = 0; k < 2 && i < chars.length; k++) chars[i++].classList.add('v'); if (i >= chars.length) clearInterval(typing); }, step);
      el.classList.add('on'); visible = true; hideAt = performance.now() + ms;
    },
    hide() { el.classList.remove('on'); visible = false; clearInterval(typing); },
    update() {
      if (!visible) return; if (performance.now() > hideAt) return b.hide();
      bot.anchor(v).project(camera);
      if (v.z > 1) { el.style.opacity = 0; return; } el.style.opacity = '';
      const sx = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight + offsetY;
      const left = sx > innerWidth * 0.55; const x = left ? sx - offsetX - el.offsetWidth : sx + offsetX;
      el.style.borderRadius = left ? '12px 12px 3px 12px' : '12px 12px 12px 3px';
      el.style.transform = `translate(${Math.round(clamp(x, 12, innerWidth - el.offsetWidth - 12))}px, ${Math.round(clamp(y, el.offsetHeight + 12, innerHeight - 12))}px) translateY(-100%)`;
    },
  };
  return b;
}
