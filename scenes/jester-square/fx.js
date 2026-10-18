// This film's spells and the great wraith's stolen fire, timed off script.js.

const foe = id => FOES.find(f => f.id === id);
const sigilR = f => (f.kind === "great" ? 30 : f.kind === "wraith" ? 22 : 16);

function doomNumber(t) {
  let n = 3;
  for (const [tt, v] of DOOM_TICKS) if (t >= tt) n = v;
  return n;
}
function drawDoom(g, t) {
  if (t < SEAL_LAND[0] || t > CC + 0.6) return;
  for (const f of FOES) {
    if (f.seal == null || t < f.seal) continue;
    const hd = foeHead(f, t);
    if (!hd) continue;
    let pulse = decay(t, f.seal, 0.35);
    for (const [tt] of DOOM_TICKS) pulse = Math.max(pulse, decay(t, tt, 0.3));
    const a = ramp(t, f.seal, 0.15) * (t > CC ? 1 - clamp((t - CC) / 0.35) : 1);
    const r = sigilR(f);
    drawSigil(g, hd[0], hd[1] - r - 10, r, doomNumber(t), t, pulse, a);
  }
}

const her = () => ({ x: P2[0], y: P2[1], s: depthScale(P2[1]) });

function fxRebuke(g, t) {
  if (t < HIT - 0.1 || t > HIT + 1.6) return;
  const at = handPoint(her(), "flail");
  g.save(); g.globalCompositeOperation = "lighter";
  glow(g, at[0] + 20, at[1], 90, GOLD, 0.7 * decay(t, HIT, 0.18));
  ring(g, at[0] + 25, at[1], 15 + (t - HIT) * 260, GOLD, 0.8 * decay(t, HIT, 0.15), 3, 0.8);
  burst(g, t, HIT, { x: at[0] + 25, y: at[1], n: 30, seed: 5, speed: 300, life: 0.9, grav: 240, colors: [GOLD, "255,240,190"], size: 3 });
  g.restore();
}

function fxHush(g, t) {
  if (t < hush.release - 0.1 || t > HUSH_LAND[1] + 1.2) return;
  const p0 = handPoint(her(), "hush");
  g.save(); g.globalCompositeOperation = "lighter";
  [foe("w1"), foe("w2")].forEach((f, i) => {
    const land = HUSH_LAND[i], st = foeState(f, land);
    if (!st) return;
    const b = foeBox(st), to = [b.x + b.w * 0.5, b.y + b.h * 0.47];
    if (t < land) {
      const [x, y] = flight(t, hush.release, land, p0, to, 40 + 30 * i);
      ring(g, x, y, 9, VIOLET, 0.95, 2, 0.55 + 0.4 * Math.sin(t * 20));
      glow(g, x, y, 26, VIOLET, 0.5);
      trail(g, t, hush.release, land, p0, to, 40 + 30 * i, VIOLET, 2.5, 9 + i);
    }
    burst(g, t, land, { x: to[0], y: to[1], n: 12, seed: 30 + i, speed: 100, life: 0.6, colors: [VIOLET, SILVER], size: 2 });
  });
  g.restore();
}

function fxGravity(g, t) {
  const f = foe("wr");
  if (t < gravity.release - 0.05 || t > GRAV_HIT + 3) return;
  const p0 = handPoint(her(), "orb");
  const st = foeState(f, Math.min(t, GRAV_HIT - 0.01));
  if (!st) return;
  const b = foeBox(st), target = [b.gx, b.y + b.h * 0.4], tArrive = gravity.release + 0.3;
  if (t < tArrive) {
    const [x, y] = flight(t, gravity.release, tArrive, p0, target, 30);
    g.save(); g.globalCompositeOperation = "lighter"; glow(g, x, y, 40, VIOLET, 0.6); g.restore();
    disc(g, x, y, 8, "#06020c");
    ring(g, x, y, 9, VIOLET, 0.9, 2);
  }
  // the new-moon disc presses down from above
  const R = b.h * 0.22;
  if (t > tArrive - 0.1 && t < GRAV_HIT + 1.6) {
    const k = clamp((t - (tArrive - 0.1)) / (GRAV_HIT - tArrive + 0.1));
    const dy = lerp(b.y - 240, b.y + b.h * 0.2, easeIn(k)) + (t > GRAV_HIT ? b.h * 0.28 * ramp(t, GRAV_HIT, 0.15) : 0);
    const a = t < GRAV_HIT ? ramp(t, tArrive - 0.1, 0.12) : 1 - clamp((t - GRAV_HIT - 0.5) / 1.1);
    g.save(); g.translate(b.gx, dy); g.scale(1, 0.6); g.globalAlpha = a;
    g.globalCompositeOperation = "lighter"; glow(g, 0, 0, R * 1.7, VIOLET, 0.45);
    g.globalCompositeOperation = "source-over";
    disc(g, 0, 0, R, "#06020c");
    g.strokeStyle = "rgba(200,130,255,0.95)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    g.restore();
  }
  if (t >= GRAV_HIT) {
    g.save(); g.globalCompositeOperation = "lighter";
    ring(g, b.gx, b.gy, 25 + (t - GRAV_HIT) * 330, VIOLET, 0.8 * decay(t, GRAV_HIT, 0.25), 4, 0.3);
    burst(g, t, GRAV_HIT, { x: b.gx, y: b.gy - 6, n: 26, seed: 41, speed: 230, life: 1.0, grav: 320, dir: -Math.PI / 2, spread: 2.6, colors: ["150,135,120", "120,110,100", VIOLET], size: 2.5 });
    g.restore();
  }
}

// The cracked ring Gravity leaves in the cobbles.
let CRACKS = null;
function drawCrack(g, t) {
  if (t < GRAV_HIT || t > RELEASE_ALL + 6) return;
  const [x, y] = path(GRAV_HIT, foe("wr").path);
  if (!CRACKS) {
    const r = rng(77); CRACKS = [];
    for (let i = 0; i < 14; i++) {
      const an = (i / 14) * TAU + r() * 0.3, pts = [];
      let rad = 18 + r() * 12;
      for (let k = 0; k < 5; k++) { rad += 11 + r() * 18; pts.push([Math.cos(an + (r() - 0.5) * 0.35) * rad, Math.sin(an + (r() - 0.5) * 0.35) * rad]); }
      CRACKS.push(pts);
    }
  }
  const grow = clamp((t - GRAV_HIT) / 0.25), fade = t > RELEASE_ALL ? 1 - clamp((t - RELEASE_ALL - 2) / 4) : 1;
  g.save(); g.translate(x, y); g.scale(1, 0.4); g.lineCap = "round";
  for (const pass of [0, 1]) {
    if (pass) g.globalCompositeOperation = "lighter";
    for (const pts of CRACKS) {
      const n = Math.max(1, Math.round(pts.length * grow));
      g.strokeStyle = pass ? `rgba(${VIOLET},${0.5 * fade * (0.5 + 0.5 * decay(t, GRAV_HIT, 1.5))})` : `rgba(10,4,16,${0.9 * fade})`;
      g.lineWidth = pass ? 1.5 : 4.5;
      g.beginPath(); g.moveTo(pts[0][0] * 0.4, pts[0][1] * 0.4);
      for (let k = 0; k < n; k++) g.lineTo(pts[k][0], pts[k][1]);
      g.stroke();
    }
  }
  g.restore();
}

function fxSeal(g, t) {
  if (t < seal.t0 || t > SEAL_LAND[2] + 1) return;
  const js = her();
  const pen = handPoint(js, "pendant");
  g.save(); g.globalCompositeOperation = "lighter";
  glow(g, pen[0], pen[1], 30, "90,240,220", 0.6 * bump(t, seal.t0 + 0.2, 2.6));   // her pendant of secrets wakes
  const p0 = handPoint(js, "sigil");
  [foe("gw"), foe("wr"), foe("w2")].forEach((f, i) => {
    const land = SEAL_LAND[i], hd = foeHead(f, land);
    if (!hd) return;
    const r = sigilR(f), to = [hd[0], hd[1] - r - 10];
    if (t >= seal.release && t < land) {
      const [x, y] = flight(t, seal.release, land, p0, to, 110 + i * 30);
      glow(g, x, y, 34, MAGENTA, 0.6);
      ring(g, x, y, 8, MAGENTA, 0.9, 2);
      trail(g, t, seal.release, land, p0, to, 110 + i * 30, MAGENTA, 3, 50 + i);
    }
    burst(g, t, land, { x: to[0], y: to[1], n: 16, seed: 60 + i, speed: 130, life: 0.7, colors: [MAGENTA, VIOLET, SILVER], size: 2.5 });
  });
  g.restore();
}

function fxOdds(g, t, js) {
  if (t < odds.t0 || t > odds.t1 + 3.5 || !js) return;
  const s = js.s, x = js.x, y = js.y;
  const live = clamp((t - odds.release) / 0.4) * (1 - clamp((t - odds.t1 - 1.5) / 2));
  g.save(); g.globalCompositeOperation = "lighter";
  glow(g, x, y - 220 * s, 420 * s, GOLD, 0.16 * live);
  for (let i = 0; i < 70; i++) {
    const t0 = odds.release + hash2(i, 3) * 6.2, age = t - t0, life = 1.4 + hash2(i, 4) * 0.8;
    if (age < 0 || age > life) continue;
    const sx = x + (hash2(i, 5) - 0.5) * 620 * s + Math.sin(age * 3 + i) * 6;
    const sy = y - 600 * s + age * 330 * s;
    const tw = 0.5 + 0.5 * Math.sin(t * 14 + i);
    spark(g, sx, sy, (3 + 3 * hash2(i, 6)) * s * 1.6, i % 2 ? GOLD : VIOLET, (1 - age / life) * (0.5 + 0.5 * tw));
  }
  if (live > 0) {
    g.save(); g.translate(x, y - 2); g.scale(1, 0.32);
    g.strokeStyle = `rgba(${GOLD},${0.85 * live})`; g.lineWidth = 2 / 0.32 * 0.5;
    const R = 150 * s;
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    for (let i = 0; i < 16; i++) {
      const an = (i / 16) * TAU + (t - odds.release) * 0.5;
      g.beginPath(); g.moveTo(Math.cos(an) * R * 0.88, Math.sin(an) * R * 0.88); g.lineTo(Math.cos(an) * R * 1.1, Math.sin(an) * R * 1.1); g.stroke();
    }
    g.restore();
  }
  g.restore();
}

// ---------- the stolen fire ----------
function flame(g, x, y, s, a) {
  if (a <= 0.01) return;
  glow(g, x, y, s * 3.2, "255,150,60", 0.45 * a);
  const gr = g.createRadialGradient(x, y + s * 0.3, 0, x, y, s * 1.2);
  gr.addColorStop(0, `rgba(255,250,220,${a})`); gr.addColorStop(0.45, `rgba(255,190,80,${0.9 * a})`); gr.addColorStop(1, "rgba(255,110,30,0)");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(x, y - s * 1.6);
  g.quadraticCurveTo(x + s, y - s * 0.2, x, y + s); g.quadraticCurveTo(x - s, y - s * 0.2, x, y - s * 1.6);
  g.fill();
}
function ribs(t) {
  const st = foeState(foe("gw"), Math.min(t, RELEASE_ALL - 0.01));
  if (!st) return null;
  const b = foeBox(st);
  return [b.gx, b.y + b.h * 0.42];
}
// Each lamp's flame flies into the great wraith's ribs, then home again on release.
function fxFlames(g, t) {
  if (t < LAMPS[0].gone - 0.3 || t > LAMPS[LAMPS.length - 1].back + 0.5) return;
  const r = ribs(Math.min(t, 60));
  if (!r) return;
  g.save(); g.globalCompositeOperation = "lighter";
  LAMPS.forEach((L, i) => {
    const t0 = L.gone - 0.25, t1 = L.gone + 0.45;
    if (t > t0 && t < t1 + 0.2) {
      const [x, y, k] = flight(Math.min(t, t1), t0, t1, L.at, r, 60);
      flame(g, x, y, 7 - 3 * k, 1 - clamp((t - t1) / 0.2));
    }
    const b0 = L.back - 0.7, b1 = L.back;
    if (t > b0 && t < b1) {
      const [x, y] = flight(t, b0, b1, r, L.at, 90 + 20 * i);
      flame(g, x, y, 6, 1);
      trail(g, t, b0, b1, r, L.at, 90 + 20 * i, "255,190,90", 2.5, 200 + i);
    }
  });
  g.restore();
}
// It breathes the stolen fire at her; her ward breaks it.
function fxBreath(g, t, js) {
  if (t < BREATH[0] || t > BREATH[1] + 1.2 || !js) return;
  const st = foeState(foe("gw"), t);
  if (!st) return;
  const b = foeBox(st), mouth = [b.x + b.w * 0.78, b.y + b.h * 0.22];
  const stop = js.x + 150 * js.s;        // where her light holds it
  const live = t < BREATH[1] ? ramp(t, BREATH[0], 0.3) : 1 - clamp((t - BREATH[1]) / 0.5);
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 46; i++) {
    const ph = (t * 1.6 + hash2(i, 300)) % 1;
    const x = lerp(mouth[0], stop + 30 * hash2(i, 302), ph);
    const y = lerp(mouth[1], js.y - 150 * js.s, ph) + Math.sin(ph * 9 + i) * 18 * ph + (hash2(i, 301) - 0.5) * 50 * ph;
    flame(g, x, y, 4 + 7 * ph, live * (1 - ph * 0.3));
  }
  glow(g, stop, js.y - 140 * js.s, 120, "255,170,80", 0.4 * live);
  burst(g, t, BREATH[1], { x: stop, y: js.y - 140 * js.s, n: 40, seed: 310, speed: 320, life: 1.0, dir: 0, spread: 2.4, colors: ["255,190,90", GOLD, VIOLET], size: 3 });
  g.restore();
}

// ---------- Curtain Call ----------
function fxCurtain(g, t, js) {
  if (t < curtain.t0 || t > CC + 9 || !js) return;
  const s = js.s;
  g.save(); g.globalCompositeOperation = "lighter";
  const sky = handPoint(js, "sky"), up = frameAt("curtain_call", curtain.t0, 18);
  const beam = bump(t, up, 1.6);
  if (beam > 0.01) {
    const gr = g.createLinearGradient(sky[0], sky[1], MOON.x, MOON.y);
    gr.addColorStop(0, `rgba(${VIOLET},${0.8 * beam})`); gr.addColorStop(1, `rgba(${VIOLET},${0.15 * beam})`);
    g.strokeStyle = gr; g.lineWidth = 5 * beam;
    g.beginPath(); g.moveTo(sky[0], sky[1]); g.lineTo(MOON.x, MOON.y); g.stroke();
    for (let i = 0; i < 16; i++) {
      const k = ((t - up) * 0.9 + hash2(i, 71)) % 1;
      spark(g, lerp(sky[0], MOON.x, k) + (hash2(i, 72) - 0.5) * 24, lerp(sky[1], MOON.y, k), 3, i % 2 ? MAGENTA : SILVER, beam);
    }
  }
  if (t >= CC) {
    const age = t - CC;
    ring(g, js.x, js.y - 160 * s, 50 + age * 1300, MAGENTA, 0.9 * decay(t, CC, 0.35), 7, 0.35);
    ring(g, js.x, js.y - 160 * s, 30 + age * 800, GOLD, 0.7 * decay(t, CC, 0.3), 4, 0.35);
    FOES.forEach((f, i) => {
      if (f.release != null) return;
      const st = foeState(f, CC - 0.01);
      if (!st) return;
      const b = foeBox(st);
      burst(g, t, RELEASE_ALL, { x: b.gx, y: b.y + b.h * 0.5, n: f.kind === "great" ? 70 : 40, seed: 120 + i, speed: f.kind === "great" ? 360 : 240, life: 1.6, grav: -50, colors: [GOLD, VIOLET, "190,255,210", SILVER], size: 3.5, drag: 2 });
    });
    const w = env(t, ENV.ward);
    if (w > 0.01) {
      for (let i = 0; i < 30; i++) {
        const an = (i / 30) * TAU + age * 0.7, R = 180 * s * (1 + 0.6 * decay(t, CC, 0.5));
        const wy = js.y - lerp(165, 40, clamp(age / 3)) * s;
        spark(g, js.x + Math.cos(an) * R, wy + Math.sin(an) * R * 0.3, 2.6, i % 3 ? MAGENTA : GOLD, w * (0.6 + 0.4 * Math.sin(t * 8 + i)));
      }
    }
  }
  g.restore();
}
