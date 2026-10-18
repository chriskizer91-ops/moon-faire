// Render the scene's soundtrack offline to a WAV.
//   node tools/scene_audio.mjs out.wav
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outFile = process.argv[2];
const dir = path.dirname(path.resolve(outFile));
const wrapped = path.join(dir, "_audio_page.html");
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(process.env.SCENE_HTML || "dist/jester-night.html", "utf8") + "</body></html>");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto("file://" + wrapped);
await page.evaluate(() => window.MF.ready);
const t0 = Date.now();
const n = await page.evaluate(() => window.MF.renderAudio());
const size = 4 << 20, parts = [];
for (let i = 0; i * size < n; i++) parts.push(Buffer.from(await page.evaluate(([i, s]) => window.MF.audioChunk(i, s), [i, size]), "base64"));
fs.writeFileSync(outFile, Buffer.concat(parts));
fs.unlinkSync(wrapped);
console.log(`wrote ${outFile}: ${(n / 1e6).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(1)} s; errors: ${errors.length ? errors.join(" | ") : "none"}`);
await browser.close();
