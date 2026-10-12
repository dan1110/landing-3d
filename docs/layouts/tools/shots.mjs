// Headless QA for the layout mockups. Run from docs/layouts with the static server up on :4190:
//   node tools/shots.mjs option-3-black-box            → shots/<name>-<section>.jpg per section + fps + errors
//   node tools/shots.mjs option-3-black-box --hover    → also probes the pointer over the scene; saves <name>-<section>-hover.jpg when something lights up
//   node tools/shots.mjs option-3-black-box --click    → like --hover, then clicks the hovered thing and saves <name>-<section>-click.jpg
import { chromium } from '/Users/dorisdt/Projects/SolidBytes/web-solidbytes/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const [,, name, ...flags] = process.argv;
const HOVER = flags.includes('--hover') || flags.includes('--click'), CLICK = flags.includes('--click');
const url = `http://127.0.0.1:4190/${name}.html`;
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('requestfailed', (r) => errs.push('REQ FAILED ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(5000);
const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); })(); }));
const ids = await page.evaluate(() => [...document.querySelectorAll('main section[id]')].map((s) => s.id));
const out = { name, fps, sections: ids, hovers: [], clicks: [] };
for (const id of ids) {
  await page.evaluate((id) => window.scrollTo(0, document.getElementById(id).offsetTop), id);
  await page.waitForTimeout(4500);
  await page.mouse.move(5, 5);
  await page.screenshot({ path: `shots/${name}-${id}.jpg`, type: 'jpeg', quality: 72 });
  if (!HOVER) continue;
  // probe a grid of points; stop at the first one that turns on body.sb-hover
  let hit = null;
  outer: for (const fy of [0.5, 0.42, 0.58, 0.34, 0.66, 0.74]) for (const fx of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82]) {
    await page.mouse.move(1600 * fx, 900 * fy); await page.waitForTimeout(90);
    if (await page.evaluate(() => document.body.classList.contains('sb-hover'))) { hit = [Math.round(1600 * fx), Math.round(900 * fy)]; break outer; }
  }
  if (hit) {
    await page.waitForTimeout(400); await page.screenshot({ path: `shots/${name}-${id}-hover.jpg`, type: 'jpeg', quality: 72 }); out.hovers.push({ id, at: hit });
    if (CLICK) { await page.mouse.click(hit[0], hit[1]); await page.waitForTimeout(700); await page.screenshot({ path: `shots/${name}-${id}-click.jpg`, type: 'jpeg', quality: 72 }); out.clicks.push(id); await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  }
}
out.errs = errs.filter((e) => !/favicon|^Failed to load resource/.test(e)).slice(0, 8);
console.log(JSON.stringify(out));
await browser.close();
