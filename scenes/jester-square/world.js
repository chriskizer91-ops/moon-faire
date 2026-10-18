// The night square: the painting plus everything coded on top of it.
// Drawn in painting pixels; the camera transform is already set.

// The opening shot: the town under the moon (20-min's moonrise still), slowly pushed in.
function drawStill(g, t, ow, oh) {
  const im = ART.moonrise;
  if (!im) return;
  const k = 1 + 0.07 * clamp(t / 8.6);
  const s = Math.max(ow / im.width, oh / im.height) * k;
  const w = im.width * s, h = im.height * s;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(im, (ow - w) / 2 - ow * 0.03 * clamp(t / 8.6), (oh - h) / 2 + oh * 0.02 * clamp(t / 8.6), w, h);
  // a few lit windows breathing
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i++) {
    const x = ow * (0.12 + 0.07 * i + 0.02 * hash2(i, 1)), y = oh * (0.55 + 0.12 * hash2(i, 2));
    glow(g, x, y, oh * 0.03, "255,190,110", 0.12 * (0.5 + 0.5 * Math.sin(t * (1 + hash2(i, 3)) + i)));
  }
  g.restore();
}

function lampLevel(L, t) {
  let v = 1;
  if (L.gutter && t > L.gutter[0] && t < L.gutter[1]) v = 0.45 + 0.35 * noise1(t * 7, L.at[0] | 0);
  if (t >= L.gone - 0.2 && t < L.back) v = 1 - ramp(t, L.gone - 0.2, 0.45);
  if (t >= L.back) v = ramp(t, L.back, 0.2);
  // lamps shiver while the wisps wail
  if (t > 33.6 && t < HUSH_LAND[1]) v *= 0.75 + 0.25 * noise1(t * 11, L.at[1] | 0);
  return clamp(v * (0.94 + 0.06 * noise1(t * 6, L.at[0] | 0)));
}

function drawMoon(g, t, over = 0) {
  const { x, y, r } = MOON;
  const b = env(t, ENV.moon), nm = env(t, ENV.newMoon);
  if (over > 0) {
    g.save(); g.globalAlpha = over;
    g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.clip();
    g.drawImage(BACKDROP, 0, 0, W, H);
    g.restore();
  }
  if (b < 1 && !over) disc(g, x, y, r + 4, `rgba(24,16,44,${(1 - b) * 0.85})`);
  if (nm > 0) {
    // her signature: a black new-moon disc with a thin violet rim slides over the moon
    const off = (1 - nm) * r * 2.3;
    g.save();
    g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.clip();
    disc(g, x + off, y, r + 3, "#07030d");
    g.restore();
    g.save(); g.globalCompositeOperation = "lighter";
    glow(g, x, y, r * 2.6, "150,70,230", 0.35 * nm * nm);
    g.restore();
    if (nm > 0.85) {
      g.strokeStyle = `rgba(190,120,255,${(nm - 0.85) / 0.15})`; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.stroke();
    }
  }
  if (b > 1 && !over) {
    g.save(); g.globalCompositeOperation = "lighter";
    glow(g, x, y, r * 3, "255,236,200", (b - 1) * 0.9);
    g.restore();
  }
}

function drawDarkness(g, t) {
  const d = env(t, ENV.dark);
  if (d <= 0.005) return;
  g.fillStyle = `rgba(8,4,18,${d})`;
  g.fillRect(-50, -50, W + 100, H + 100);
}

// Painted flames that are out get a dark cover; so do their warm pools on the cobbles.
function drawLampCovers(g, t) {
  for (const L of LAMPS) {
    const off = 1 - lampLevel(L, t);
    if (off <= 0.01) continue;
    glow(g, L.at[0], L.at[1], L.forge ? 60 : 30, "14,8,24", 0.95 * off);
    g.save(); g.translate(L.base[0], L.base[1] - 6); g.scale(1, 0.42);
    glow(g, 0, 0, L.forge ? 120 : 95, "20,12,28", 0.7 * off);
    g.restore();
  }
}

// What every patch of the painting gets: the night's dark, and the dead lamps.
function stageOverlay(g, t) { drawDarkness(g, t); drawLampCovers(g, t); }

function drawLampGlows(g, t) {
  g.save(); g.globalCompositeOperation = "lighter";
  for (const L of LAMPS) {
    const v = lampLevel(L, t), c = L.forge ? "255,120,50" : "255,180,90";
    if (v > 0.01) {
      glow(g, L.at[0], L.at[1], L.forge ? 120 : 95, c, 0.24 * v);
      g.save(); g.translate(L.base[0], L.base[1] - 6); g.scale(1, 0.42);
      glow(g, 0, 0, L.forge ? 150 : 120, c, 0.16 * v);
      g.restore();
    }
    const f = decay(t, L.back, 0.45);
    if (f > 0.01) glow(g, L.at[0], L.at[1], 170, "255,200,120", 0.6 * f);
  }
  g.restore();
}

function drawFog(g, t, front) {
  const a = env(t, ENV.fog);
  if (a <= 0.01) return;
  FOG = FOG || makeFog();
  const layers = front ? [[860, 0.5, -10, 2.2]] : [[300, 0.9, 7, 1.6], [560, 0.6, -5, 1.8]];
  g.save();
  for (const [y, k, speed, sc] of layers) {
    g.globalAlpha = a * k;
    const w = 1024 * sc, h = 256 * sc * 0.55;
    const ox = ((t * speed) % w + w) % w;
    for (let x = -ox - w; x < W + w; x += w) g.drawImage(FOG, x, y - h / 2, w, h);
  }
  g.restore();
}

function drawFireflies(g, t) {
  const a = env(t, ENV.flies);
  if (a <= 0.01) return;
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 22; i++) {
    const bx = 60 + hash2(i, 1) * 1330, by = 560 + hash2(i, 2) * 420;
    const x = bx + 30 * Math.sin(t * (0.2 + 0.2 * hash2(i, 3)) + i) + 10 * Math.sin(t * 0.83 + i * 2);
    const y = by + 18 * Math.sin(t * (0.27 + 0.2 * hash2(i, 4)) + i * 3);
    const blink = Math.pow(Math.max(0, Math.sin(t * (0.9 + hash2(i, 5)) + i * 7)), 3);
    glow(g, x, y, 10, i % 3 ? "225,255,160" : "255,215,140", 0.5 * blink * a);
    glow(g, x, y, 2, "255,255,220", 0.9 * blink * a);
  }
  g.restore();
}

// The chapel bell: each toll sends rings out of the tower.
const BELL_TOLLS = [20.0, ...DOOM_TICKS.map(d => d[0])];
function drawBellRings(g, t) {
  g.save(); g.globalCompositeOperation = "lighter";
  for (const tt of BELL_TOLLS) {
    const age = t - tt;
    if (age < 0 || age > 3) continue;
    glow(g, CHAPEL_BELL.x, CHAPEL_BELL.y, 60, tt === CC ? "220,150,255" : "255,220,170", 0.5 * decay(t, tt, 0.6));
    for (let k = 0; k < 3; k++) {
      const a2 = age - k * 0.35;
      if (a2 < 0) continue;
      ring(g, CHAPEL_BELL.x, CHAPEL_BELL.y, 20 + a2 * 160, tt === CC ? MAGENTA : "255,215,150", 0.5 * Math.max(0, 1 - a2 / 2.4), 3, 0.7);
    }
  }
  g.restore();
}

// Redraw a cut-out (well, lamp post, wall) from the painting over anyone behind it.
function drawOccluder(g, t, o) {
  g.save();
  g.beginPath();
  for (const poly of o.polys) { g.moveTo(poly[0][0], poly[0][1]); for (const p of poly.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); }
  g.clip();
  g.drawImage(BACKDROP, 0, 0, W, H);
  stageOverlay(g, t);
  g.restore();
}
const occDepth = o => (o.base[0][1] + o.base[1][1]) / 2;
