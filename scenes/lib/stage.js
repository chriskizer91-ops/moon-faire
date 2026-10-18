// Camera, pixel layer, theatre dark and the finishing pass (flashes, vignette,
// spell banners, titles, fades). Each scene supplies W, H, CAM, SHAKES, FLASHES,
// BANNERS, TITLES and ENV.

// The stage: the painted boardwalk plus everything coded on top of it.
// Drawn in painting pixels; the camera transform is already set.

let FOG = null;

function makeFog() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 256;
  const g = c.getContext("2d"), r = rng(7);
  for (let i = 0; i < 140; i++) {
    const x = r() * 1024, y = 60 + r() * 140, rad = 30 + r() * 90, a = 0.05 + r() * 0.09;
    for (const dx of [-1024, 0, 1024]) {
      const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      gr.addColorStop(0, `rgba(200,185,235,${a})`);
      gr.addColorStop(1, "rgba(200,185,235,0)");
      g.fillStyle = gr;
      g.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
    }
  }
  return c;
}

function camera(t) {
  let i = 1;
  while (i < CAM.length - 1 && CAM[i][0] <= t) i++;
  const a = CAM[i - 1], b = CAM[i];
  const k = b[0] > a[0] ? easeInOut(clamp((t - a[0]) / (b[0] - a[0]))) : 1;
  let cx = lerp(a[1], b[1], k), cy = lerp(a[2], b[2], k);
  const zoom = lerp(a[3], b[3], k);
  for (let j = 0; j < SHAKES.length; j++) {
    const [ts, amp, dur] = SHAKES[j], d = decay(t, ts, dur / 3);
    if (d > 0.001) { cx += amp * d * noise1(t * 28, 300 + j); cy += amp * d * noise1(t * 31, 400 + j); }
  }
  const vw = W / zoom, vh = (vw * 9) / 16;
  cx = clamp(cx, vw / 2, W - vw / 2);
  cy = clamp(cy, vh / 2, H - vh / 2);
  return { x: cx - vw / 2, y: cy - vh / 2, vw, vh };
}

let PIX = null;

function pixelLayer(ow, oh, cam, size) {
  const pw = Math.ceil(ow / size), ph = Math.ceil(oh / size);
  if (!PIX || PIX.width !== pw || PIX.height !== ph) {
    PIX = document.createElement("canvas"); PIX.width = pw; PIX.height = ph;
  }
  const p = PIX.getContext("2d");
  p.setTransform(1, 0, 0, 1, 0, 0);
  p.clearRect(0, 0, pw, ph);
  const k = pw / cam.vw;
  p.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  return p;
}

function blitPixels(g, ow, oh) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(PIX, 0, 0, PIX.width * (ow / PIX.width), PIX.height * (oh / PIX.height));
  g.restore();
}

let SHADOW = null;

function theatre(g, t, js, cam, ow, oh, d) {
  if (!SHADOW || SHADOW.width !== ow || SHADOW.height !== oh) {
    SHADOW = document.createElement("canvas"); SHADOW.width = ow; SHADOW.height = oh;
  }
  const s = SHADOW.getContext("2d"), k = ow / cam.vw;
  s.globalCompositeOperation = "source-over";
  s.clearRect(0, 0, ow, oh);
  s.fillStyle = `rgba(4,2,10,${d})`;
  s.fillRect(0, 0, ow, oh);
  if (js) {
    // a spotlight on her
    s.globalCompositeOperation = "destination-out";
    const x = (js.x - cam.x) * k, y = (js.y - 170 * js.s - cam.y) * k, r = 300 * js.s * k;
    s.save(); s.translate(x, y); s.scale(1, 1.45);
    const gr = s.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    gr.addColorStop(0, "rgba(0,0,0,0.95)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    s.fillStyle = gr; s.fillRect(-r, -r, r * 2, r * 2);
    s.restore();
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(SHADOW, 0, 0); g.restore();
}

function post(g, t, ow, oh) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  // flashes
  let f = 0;
  for (const [ts, amp, dur] of FLASHES) f += amp * decay(t, ts, dur / 3);
  if (f > 0.01) {
    g.globalCompositeOperation = "lighter";
    g.fillStyle = `rgba(215,175,255,${clamp(f)})`; g.fillRect(0, 0, ow, oh);
    g.globalCompositeOperation = "source-over";
  }
  // vignette
  const vg = g.createRadialGradient(ow / 2, oh / 2, oh * 0.45, ow / 2, oh / 2, ow * 0.62);
  vg.addColorStop(0, "rgba(6,3,12,0)"); vg.addColorStop(1, "rgba(6,3,12,0.55)");
  g.fillStyle = vg; g.fillRect(0, 0, ow, oh);
  // letterbox bars for Curtain Call
  const bars = env(t, ENV.bars) * oh * 0.11;
  if (bars > 0.5) { g.fillStyle = "#050208"; g.fillRect(0, 0, ow, bars); g.fillRect(0, oh - bars, ow, bars); }
  // spell names along the top
  for (const [t0, text] of BANNERS) {
    const a = ramp(t, t0, 0.35) * (1 - ramp(t, t0 + 2.4, 0.5));
    if (a <= 0.01) continue;
    const fs = Math.round(oh * 0.06), y = oh * 0.1 + bars * 0.6 + (1 - a) * -10;
    g.font = `${fs}px "Jacquard 24", Georgia, serif`;
    const tw = g.measureText(text).width, pw = tw + fs * 2.2, ph = fs * 1.45;
    g.globalAlpha = a;
    g.fillStyle = "rgba(23,18,30,0.82)";
    g.fillRect(ow / 2 - pw / 2, y - ph / 2, pw, ph);
    g.strokeStyle = "rgba(214,168,78,0.9)"; g.lineWidth = Math.max(1, oh / 480);
    g.strokeRect(ow / 2 - pw / 2 + 3, y - ph / 2 + 3, pw - 6, ph - 6);
    g.fillStyle = "#e9c477"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, ow / 2, y + fs * 0.05);
    g.globalAlpha = 1;
  }
  // titles
  for (const T of TITLES) {
    const a = ramp(t, T.t0, 1.2) * (1 - ramp(t, T.t1 - 1.2, 1.2));
    if (a <= 0.01) continue;
    g.globalAlpha = a;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,0.8)"; g.shadowBlur = oh * 0.03;
    g.fillStyle = "#e3b862";
    g.font = `${Math.round(oh * 0.16)}px "Jacquard 24", Georgia, serif`;
    g.fillText(T.title, ow / 2, oh * 0.42);
    g.fillStyle = "#e9dff2";
    g.font = `${Math.round(oh * 0.045)}px "Jacquard 24", Georgia, serif`;
    g.fillText(T.sub, ow / 2, oh * 0.56);
    g.shadowBlur = 0; g.globalAlpha = 1;
  }
  // fade from and to black
  const fade = env(t, ENV.fade);
  if (fade > 0.002) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, ow, oh); }
  g.restore();
}
