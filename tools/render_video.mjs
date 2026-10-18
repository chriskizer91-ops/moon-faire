// Render the scene to an MP4, frame by frame, with its soundtrack.
//   node tools/render_video.mjs dist/jester-night.mp4 [fps] [width] [height]
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const outFile = path.resolve(process.argv[2] || "dist/jester-night.mp4");
const fps = Number(process.argv[3] || 30), w = Number(process.argv[4] || 1280), h = Number(process.argv[5] || 720);
const work = path.join(path.dirname(outFile), "_render");
fs.mkdirSync(work, { recursive: true });
const wrapped = path.join(work, "page.html");
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(process.env.SCENE_HTML || "dist/jester-night.html", "utf8") + "</body></html>");

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto("file://" + wrapped);
await page.evaluate(() => window.MF.ready);
const DUR = await page.evaluate(() => window.MF.DUR);

// soundtrack
const wavFile = path.join(work, "sound.wav");
const n = await page.evaluate(() => window.MF.renderAudio());
const size = 4 << 20, parts = [];
for (let i = 0; i * size < n; i++) parts.push(Buffer.from(await page.evaluate(([i, s]) => window.MF.audioChunk(i, s), [i, size]), "base64"));
fs.writeFileSync(wavFile, Buffer.concat(parts));
console.log("soundtrack done");

// pictures, piped straight into the encoder
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
  "-i", wavFile, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outFile], { stdio: ["pipe", "inherit", "inherit"] });
const total = Math.round(DUR * fps), t0 = Date.now();
for (let i = 0; i < total; i++) {
  const url = await page.evaluate(([t, w, h]) => window.MF.frame(t, w, h, 0.93), [i / fps, w, h]);
  const buf = Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  if (i % 300 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
fs.rmSync(work, { recursive: true, force: true });
console.log(`wrote ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)} s; errors: ${errors.length ? errors.join(" | ") : "none"}`);
