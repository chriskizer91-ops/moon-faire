// Grab stills from the scene at chosen times, to look at before rendering.
//   node tools/scene_stills.mjs <out_dir> 13 30.06 47.2 75.2
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [outDir, ...times] = process.argv.slice(2);
const html = path.resolve("dist/jester-night.html");
const wrapped = path.join(outDir, "_page.html");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>' + fs.readFileSync(html, "utf8") + "</body></html>");

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => m.type() === "error" && errors.push(m.text()));
await page.goto("file://" + wrapped);
const ok = await page.evaluate(() => window.MF.ready);
console.log("frames loaded:", ok);
for (const t of times) {
  const data = await page.evaluate(t => window.MF.frame(Number(t), 1280, 720, 0.9), t);
  fs.writeFileSync(path.join(outDir, `t${String(t).padStart(6, "0")}.jpg`), Buffer.from(data.split(",")[1], "base64"));
}
if (process.argv.includes("--page")) await page.screenshot({ path: path.join(outDir, "page.png"), fullPage: true });
console.log("errors:", errors.length ? errors : "none");
await browser.close();
