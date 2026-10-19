// Render a film's soundtrack offline to a WAV.
//   SCENE_HTML=dist/jester-square.html node tools/scene_audio.mjs out.wav
import fs from "node:fs";
import path from "node:path";
import { openScene } from "./scene_page.mjs";

const outFile = process.argv[2];
const scene = await openScene(path.resolve(process.env.SCENE_HTML || "dist/jester-night.html"), path.dirname(path.resolve(outFile)));
const t0 = Date.now();
const n = await scene.page.evaluate(() => window.MF.renderAudio());
const size = 4 << 20, parts = [];
for (let i = 0; i * size < n; i++) parts.push(Buffer.from(await scene.page.evaluate(([i, s]) => window.MF.audioChunk(i, s), [i, size]), "base64"));
fs.writeFileSync(outFile, Buffer.concat(parts));
console.log(`wrote ${outFile}: ${(n / 1e6).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(1)} s; errors: ${scene.errors.length ? scene.errors.join(" | ") : "none"}`);
await scene.close();
