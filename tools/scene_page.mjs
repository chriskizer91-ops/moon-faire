// Open a built film page in headless Chromium for the scene tools (stills,
// soundtrack, video). Pages that load three.js from the jsDelivr CDN get it
// from node_modules instead, so everything works offline.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const THREE_CDN = /^https:\/\/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/(.*)$/;

export async function openScene(htmlFile, workDir, viewport = { width: 1280, height: 900 }) {
  fs.mkdirSync(workDir, { recursive: true });
  const wrapped = path.join(workDir, "_page.html");
  fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>' +
    fs.readFileSync(htmlFile, "utf8") + "</body></html>");
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
    .catch(() => chromium.launch());
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.route(THREE_CDN, route => {
    const local = path.resolve("node_modules/three", route.request().url().match(THREE_CDN)[1]);
    route.fulfill({ path: local, contentType: "text/javascript" });
  });
  await page.goto("file://" + wrapped);
  await page.waitForFunction(() => window.MF, null, { timeout: 60000 });
  const ok = await page.evaluate(() => window.MF.ready);
  return { browser, page, errors, ok, close: async () => { await browser.close(); fs.rmSync(wrapped, { force: true }); } };
}
