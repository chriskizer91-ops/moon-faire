// Render the scene to an MP4, frame by frame, with its soundtrack.
//   SCENE_HTML=dist/jester-square-3d.html node tools/render_video.mjs dist/jester-square-3d.mp4 [fps] [width] [height]
// The film is rendered in 10-second pieces kept in <out>_render/, so a long
// render (the 3D film takes about 1.75 s a frame without a GPU) picks up where
// it stopped if it's run again. The pieces are joined and the folder removed at the end.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { openScene } from "./scene_page.mjs";

const outFile = path.resolve(process.argv[2] || "dist/jester-night.mp4");
const fps = Number(process.argv[3] || 30), w = Number(process.argv[4] || 1280), h = Number(process.argv[5] || 720);
const work = outFile.replace(/\.mp4$/, "") + "_render";
const scene = await openScene(path.resolve(process.env.SCENE_HTML || "dist/jester-night.html"), work);
const { page, errors } = scene;
const DUR = await page.evaluate(() => window.MF.DUR);
const run = (args, opts = {}) => new Promise((ok, bad) => {
  const p = spawn("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: [opts.stdin ? "pipe" : "ignore", "inherit", "inherit"] });
  p.on("close", c => (c === 0 ? ok() : bad(new Error("ffmpeg failed: " + c))));
  if (opts.stdin) opts.stdin(p.stdin);
});

// soundtrack
const wavFile = path.join(work, "sound.wav");
if (!fs.existsSync(wavFile)) {
  const n = await page.evaluate(() => window.MF.renderAudio());
  const size = 4 << 20, parts = [];
  for (let i = 0; i * size < n; i++) parts.push(Buffer.from(await page.evaluate(([i, s]) => window.MF.audioChunk(i, s), [i, size]), "base64"));
  fs.writeFileSync(wavFile + ".part", Buffer.concat(parts));
  fs.renameSync(wavFile + ".part", wavFile);
}
console.log("soundtrack done");

// pictures, in pieces of 10 seconds
const total = Math.round(DUR * fps), per = fps * 10, t0 = Date.now(), pieces = [];
for (let s = 0; s * per < total; s++) {
  const piece = path.join(work, `piece-${String(s).padStart(3, "0")}.mp4`);
  pieces.push(piece);
  if (fs.existsSync(piece)) continue;
  await run(["-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", piece + ".part.mp4"], {
    stdin: async pipe => {
      for (let i = s * per; i < Math.min(total, (s + 1) * per); i++) {
        const url = await page.evaluate(([t, w, h]) => window.MF.frame(t, w, h, 0.93), [i / fps, w, h]);
        if (!pipe.write(Buffer.from(url.slice(url.indexOf(",") + 1), "base64"))) await new Promise(r => pipe.once("drain", r));
      }
      pipe.end();
    },
  });
  fs.renameSync(piece + ".part.mp4", piece);
  console.log(`${Math.min(total, (s + 1) * per)}/${total} frames  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await scene.close();

// join the pieces and add the sound
const list = path.join(work, "pieces.txt");
fs.writeFileSync(list, pieces.map(p => `file '${p}'`).join("\n"));
await run(["-f", "concat", "-safe", "0", "-i", list, "-i", wavFile, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outFile]);
fs.rmSync(work, { recursive: true, force: true });
console.log(`wrote ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)} s; errors: ${errors.length ? errors.join(" | ") : "none"}`);
