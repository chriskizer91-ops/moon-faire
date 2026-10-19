// Grab stills from a film at chosen times, to look at before rendering.
//   SCENE_HTML=dist/jester-square.html node tools/scene_stills.mjs <out_dir> 13 30.06 47.2
import fs from "node:fs";
import path from "node:path";
import { openScene } from "./scene_page.mjs";

const [outDir, ...times] = process.argv.slice(2);
const scene = await openScene(path.resolve(process.env.SCENE_HTML || "dist/jester-night.html"), outDir);
console.log("frames loaded:", scene.ok);
for (const t of times) {
  const data = await scene.page.evaluate(t => window.MF.frame(Number(t), 1280, 720, 0.9), t);
  fs.writeFileSync(path.join(outDir, `t${String(t).padStart(6, "0")}.jpg`), Buffer.from(data.split(",")[1], "base64"));
}
console.log("errors:", scene.errors.length ? scene.errors : "none");
await scene.close();
