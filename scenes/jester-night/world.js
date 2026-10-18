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

function glow(g, x, y, r, rgb, a) {
  if (a <= 0.003 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${rgb},${a})`);
  gr.addColorStop(0.4, `rgba(${rgb},${a * 0.35})`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

function disc(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}

function lanternLevel(L, t) {
  let v = 1;
  if (t >= L.out && t < L.on) v = 1 - ramp(t, L.out, 0.7);
  if (t >= L.on) v = ramp(t, L.on, 0.25);
  // gutter before going out, and shake while the shades keen
  const gutter = bump(t, L.out - 1.1, 1.4);
  let shake = 0;
  for (const [a, b] of FLICKER) if (t > a && t < b) shake = 0.5;
  const fl = 1 - (0.08 + 0.5 * gutter + shake) * (0.5 + 0.5 * noise1(t * 9, L.x | 0));
  return clamp(v * fl);
}

function drawMoon(g, t, over = 0) {
  const { x, y, r } = MOON;
  const b = env(t, ENV.moon), nm = env(t, ENV.newMoon);
  if (over > 0) {
    // the moon stays lit above the theatre dark, so the eclipse can be seen
    g.save(); g.globalAlpha = over;
    g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.clip();
    g.drawImage(BACKDROP, 0, 0, W, H);
    g.restore();
  }
  if (b < 1 && !over) {
    disc(g, x, y, r + 4, `rgba(24,16,44,${(1 - b) * 0.85})`);
    // the moon's path on the water dims with it
    const gr = g.createLinearGradient(0, 290, 0, 540);
    gr.addColorStop(0, `rgba(20,12,36,${(1 - b) * 0.7})`);
    gr.addColorStop(1, "rgba(20,12,36,0)");
    g.fillStyle = gr;
    g.fillRect(900, 290, 140, 250);
  }
  if (nm > 0) {
    // her signature: a black new-moon disc with a thin violet rim slides over the moon
    const off = (1 - nm) * r * 2.3;
    g.save();
    g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.clip();
    disc(g, x - off, y, r + 3, "#07030d");
    g.restore();
    g.save();
    g.globalCompositeOperation = "lighter";
    glow(g, x, y, r * 2.6, "150,70,230", 0.35 * nm * nm);
    g.restore();
    if (nm > 0.85) {
      g.strokeStyle = `rgba(190,120,255,${(nm - 0.85) / 0.15})`;
      g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.stroke();
    }
  }
  if (b > 1 && !over) {
    g.save(); g.globalCompositeOperation = "lighter";
    glow(g, x, y, r * 3, "255,236,200", (b - 1) * 0.9);
    g.restore();
  }
}

function drawAirship(g, t) {
  const a = env(t, ENV.shipA);
  if (a <= 0.01) return;
  const [x, y] = path(t, SHIP_PATH);
  const s = 0.62;
  g.save();
  g.translate(x, y + Math.sin(t * 0.8) * 3);
  g.scale(s, s);
  g.globalAlpha = a;
  // sunstone lift: an amber glow under the hull
  g.globalCompositeOperation = "lighter";
  glow(g, 0, 58, 60, "255,170,70", 0.5 + 0.1 * Math.sin(t * 2.3));
  g.globalCompositeOperation = "source-over";
  // envelope
  const eg = g.createLinearGradient(0, -40, 0, 26);
  eg.addColorStop(0, "#4b3f6e"); eg.addColorStop(0.45, "#221a38"); eg.addColorStop(1, "#140f22");
  g.fillStyle = eg;
  g.beginPath(); g.ellipse(0, 0, 92, 30, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(80, -6); g.lineTo(112, -24); g.lineTo(108, 6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(84, 6); g.lineTo(110, 22); g.lineTo(96, 8); g.closePath(); g.fill();
  // rigging
  g.strokeStyle = "rgba(40,30,60,0.9)"; g.lineWidth = 1.4;
  for (const k of [-50, -20, 20, 50]) { g.beginPath(); g.moveTo(k, 24); g.lineTo(k * 0.7, 42); g.stroke(); }
  // hull
  g.fillStyle = "#130d1d";
  g.beginPath(); g.moveTo(-58, 42); g.quadraticCurveTo(0, 66, 62, 42); g.lineTo(54, 38); g.lineTo(-52, 38); g.closePath(); g.fill();
  // festival lanterns strung along the envelope, and lit windows
  const cols = ["255,120,210", "255,200,110", "120,230,220"];
  for (let i = 0; i < 11; i++) {
    const k = i / 10, lx = -86 + k * 172, ly = 22 + Math.sin(k * Math.PI) * 10;
    const tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.9);
    g.globalCompositeOperation = "lighter";
    glow(g, lx, ly, 7, cols[i % 3], 0.9 * tw);
    g.globalCompositeOperation = "source-over";
  }
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) glow(g, -36 + i * 18, 45, 4, "255,190,110", 0.9);
  g.restore();
}

function drawLanternCovers(g, t) {
  // Painted lanterns that have gone out get a dark cover over their glow.
  for (const L of LANTERNS) {
    const off = 1 - lanternLevel(L, t);
    if (off <= 0.01) continue;
    glow(g, L.x, L.y, 52 * L.r, "16,9,28", 0.95 * off);
    if (L.refl) {
      g.save(); g.translate(L.refl[0], L.refl[1]); g.scale(1, 0.45);
      glow(g, 0, 0, 110, "24,13,30", 0.75 * off);
      g.restore();
    }
    if (L.water) glow(g, L.water[0], L.water[1], 26, "18,10,30", 0.85 * off);
  }
}

function drawLanternGlows(g, t) {
  g.save(); g.globalCompositeOperation = "lighter";
  for (const L of LANTERNS) {
    const v = lanternLevel(L, t);
    if (v > 0.01) {
      glow(g, L.x, L.y, 120 * L.r, "255,110,215", 0.22 * v);
      glow(g, L.x, L.y, 26 * L.r, "255,200,240", 0.35 * v);
    }
    // relight flare
    const f = decay(t, L.on, 0.5);
    if (f > 0.01) glow(g, L.x, L.y, 200 * L.r, "255,170,235", 0.55 * f);
  }
  g.restore();
}

function drawDarkness(g, t, extra = 0) {
  const d = clamp(env(t, ENV.dark) + extra);
  if (d <= 0.005) return;
  g.fillStyle = `rgba(8,4,18,${d})`;
  g.fillRect(-50, -50, W + 100, H + 100);
}

function drawFog(g, t, front) {
  const a = env(t, ENV.fog);
  if (a <= 0.01) return;
  FOG = FOG || makeFog();
  const layers = front
    ? [[880, 0.55, -14, 2.2]]                         // low mist over the deck front
    : [[440, 1.0, 9, 1.4], [600, 0.8, -6, 1.8]];       // over the water and the back of the deck
  g.save();
  for (const [y, k, speed, sc] of layers) {
    g.globalAlpha = a * k;
    const w = 1024 * sc, h = 256 * sc * 0.55;
    let ox = ((t * speed) % w + w) % w;
    for (let x = -ox - w; x < W + w; x += w) g.drawImage(FOG, x, y - h / 2, w, h);
  }
  g.restore();
}

function drawFireflies(g, t) {
  const a = env(t, ENV.flies);
  if (a <= 0.01) return;
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 34; i++) {
    const bx = 80 + hash2(i, 1) * 1290, by = 330 + hash2(i, 2) * 470;
    const x = bx + 38 * Math.sin(t * (0.21 + 0.2 * hash2(i, 3)) + i) + 14 * Math.sin(t * 0.83 + i * 2);
    const y = by + 22 * Math.sin(t * (0.27 + 0.2 * hash2(i, 4)) + i * 3);
    const blink = Math.pow(Math.max(0, Math.sin(t * (0.9 + hash2(i, 5)) + i * 7)), 3);
    const c = i % 3 ? "225,255,160" : "255,215,140";
    glow(g, x, y, 13, c, 0.55 * blink * a);
    glow(g, x, y, 2.5, "255,255,220", 0.9 * blink * a);
  }
  g.restore();
}

// Rings on the water where a shade rises.
function drawRipples(g, t) {
  for (const sh of SHADES) {
    const age = t - sh.rise;
    if (age < 0 || age > 3.2) continue;
    const [x, y] = sh.path[0];
    g.save(); g.translate(x, y); g.scale(1, 0.28);
    for (let k = 0; k < 3; k++) {
      const a2 = age - k * 0.45;
      if (a2 < 0) continue;
      const r = 20 + a2 * (sh.big ? 110 : 70);
      g.strokeStyle = `rgba(190,170,240,${0.35 * Math.max(0, 1 - a2 / 2.6)})`;
      g.lineWidth = 3;
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    }
    g.restore();
  }
}
