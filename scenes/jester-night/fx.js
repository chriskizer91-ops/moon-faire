// Spell effects, in her colours: violet and magenta sigils, ink black,
// gold from her bells. Everything is computed from t, nothing is stored.

const VIOLET = "190,110,255", MAGENTA = "235,110,215", GOLD = "255,205,110", SILVER = "225,220,255";

// A four-point sparkle, the same shape the sprites use.
function spark(g, x, y, s, rgb, a) {
  if (a <= 0.01) return;
  g.fillStyle = `rgba(${rgb},${a})`;
  g.fillRect(x - s * 2, y - s * 0.22, s * 4, s * 0.44);
  g.fillRect(x - s * 0.22, y - s * 2, s * 0.44, s * 4);
  g.fillStyle = `rgba(255,255,255,${a})`;
  g.fillRect(x - s * 0.4, y - s * 0.4, s * 0.8, s * 0.8);
}

// A burst of sparks from (x, y) at t0. Closed form, so any t can be drawn.
function burst(g, t, t0, o) {
  const age0 = t - t0;
  if (age0 < 0 || age0 > o.life * 1.7) return;
  for (let i = 0; i < o.n; i++) {
    const r1 = hash2(i, o.seed), r2 = hash2(i, o.seed + 1), r3 = hash2(i, o.seed + 2);
    const life = o.life * (0.5 + 0.5 * r3), age = age0 - r1 * (o.delay || 0);
    if (age < 0 || age > life) continue;
    const ang = (o.dir || 0) + (r2 - 0.5) * (o.spread == null ? TAU : o.spread) + r1;
    const sp = o.speed * (0.3 + 0.7 * r2), drag = o.drag || 3;
    const d = (sp * (1 - Math.exp(-age * drag))) / drag;
    const px = o.x + Math.cos(ang) * d, py = o.y + Math.sin(ang) * d * (o.flat || 1) + 0.5 * (o.grav || 0) * age * age;
    const k = 1 - age / life;
    spark(g, px, py, o.size * (0.6 + 0.8 * r3) * (0.4 + 0.6 * k), o.colors[i % o.colors.length], k);
  }
}

function ring(g, x, y, r, rgb, a, w, flat = 1) {
  if (a <= 0.01 || r <= 0) return;
  g.save(); g.translate(x, y); g.scale(1, flat);
  g.strokeStyle = `rgba(${rgb},${a})`; g.lineWidth = w / flat;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.restore();
}

// Flight from a to b over [t0, t1], arcing up by lift.
function flight(t, t0, t1, a, b, lift) {
  const k = clamp((t - t0) / (t1 - t0)), e = easeInOut(k);
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(Math.PI * k) * lift, k];
}

function trail(g, t, t0, t1, a, b, lift, rgb, size, seed) {
  if (t < t0 || t > t1 + 0.3) return;
  for (let i = 0; i < 9; i++) {
    const tt = t - i * 0.025;
    if (tt < t0 || tt > t1) continue;
    const [x, y] = flight(tt, t0, t1, a, b, lift);
    spark(g, x + (hash2(i, seed) - 0.5) * 8, y + (hash2(i, seed + 1) - 0.5) * 8, size * (1 - i / 10), rgb, 1 - i / 9);
  }
}

// ---------- Doom ----------
function doomNumber(t) {
  let n = 3;
  for (const [tt, v] of DOOM_TICKS) if (t >= tt) n = v;
  return n;
}
function drawSigil(g, x, y, r, n, t, pulse, a) {
  if (a <= 0.01) return;
  g.save(); g.translate(x, y);
  g.globalCompositeOperation = "lighter";
  glow(g, 0, 0, r * 2.4, MAGENTA, (0.35 + 0.5 * pulse) * a);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = a;
  g.save(); g.rotate(t * 0.6);
  g.strokeStyle = "rgba(214,130,255,0.95)"; g.lineWidth = r * 0.08;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) {
    const an = (i / 12) * TAU;
    g.beginPath(); g.moveTo(Math.cos(an) * r * 0.86, Math.sin(an) * r * 0.86); g.lineTo(Math.cos(an) * r * 1.12, Math.sin(an) * r * 1.12); g.stroke();
  }
  g.restore();
  g.save(); g.rotate(-t * 1.1);
  g.strokeStyle = "rgba(240,160,230,0.9)"; g.lineWidth = r * 0.05;
  g.beginPath(); g.arc(0, 0, r * 0.7, 0, TAU); g.stroke();
  g.fillStyle = "rgba(240,160,230,0.95)";
  for (let i = 0; i < 4; i++) {          // playing-card diamonds at the four points
    const an = (i / 4) * TAU, dx = Math.cos(an) * r * 0.7, dy = Math.sin(an) * r * 0.7, d = r * 0.13;
    g.beginPath(); g.moveTo(dx, dy - d); g.lineTo(dx + d * 0.7, dy); g.lineTo(dx, dy + d); g.lineTo(dx - d * 0.7, dy); g.closePath(); g.fill();
  }
  g.restore();
  const sc = 1 + 0.35 * pulse;
  g.scale(sc, sc);
  g.font = `${Math.round(r * 1.05)}px "Jacquard 24", Georgia, serif`;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(235,110,215,0.9)"; g.shadowBlur = r * 0.5;
  g.fillStyle = "#fbe6ff";
  g.fillText(String(n), 0, r * 0.06);
  g.restore();
}

function drawDoom(g, t) {
  if (t < SEAL_LAND[0] || t > CC + 0.6) return;
  SHADES.forEach(sh => {
    if (t < sh.seal) return;
    const hd = shadeHead(sh, t);
    if (!hd) return;
    const r = (sh.big ? 44 : 30) * depthScale(Math.max(path(t, sh.path)[1], 560)) / 0.75;
    let pulse = decay(t, sh.seal, 0.35);
    for (const [tt] of DOOM_TICKS) pulse = Math.max(pulse, decay(t, tt, 0.3));
    const a = ramp(t, sh.seal, 0.15) * (t > CC ? 1 - clamp((t - CC) / 0.35) : 1);
    drawSigil(g, hd[0], hd[1] - hd[2] * (sh.big ? 1.6 : 2.6) - r, r, doomNumber(t), t, pulse, a);
  });
}

// ---------- spells ----------
function fxRebuke(g, t, js) {
  if (!js) return;
  const at = [P1[0] + HAND.flail[0] * depthScale(P1[1]), P1[1] + HAND.flail[1] * depthScale(P1[1])];
  g.save(); g.globalCompositeOperation = "lighter";
  const k = decay(t, HIT_A, 0.18);
  glow(g, at[0] + 30, at[1], 160, GOLD, 0.7 * k);
  ring(g, at[0] + 40, at[1], 30 + (t - HIT_A) * 420, GOLD, 0.8 * decay(t, HIT_A, 0.15), 4, 0.8);
  burst(g, t, HIT_A, { x: at[0] + 40, y: at[1], n: 34, seed: 5, speed: 520, life: 0.9, grav: 380, colors: [GOLD, "255,240,190"], size: 5 });
  g.restore();
}

function fxHush(g, t) {
  if (t < hush.release - 0.1 || t > HUSH_LAND[1] + 1.2) return;
  const p0 = [P1[0] + HAND.hush[0] * depthScale(P1[1]), P1[1] + HAND.hush[1] * depthScale(P1[1])];
  g.save(); g.globalCompositeOperation = "lighter";
  SHADES.slice(0, 2).forEach((sh, i) => {
    const land = HUSH_LAND[i], hd = shadeHead(sh, land);
    if (!hd) return;
    const to = [hd[0], hd[1] + hd[2] * 0.5];
    if (t < land) {
      const [x, y] = flight(t, hush.release, land, p0, to, 40 + 30 * i);
      ring(g, x, y, 16, VIOLET, 0.95, 3, 0.55 + 0.4 * Math.sin(t * 20));
      glow(g, x, y, 40, VIOLET, 0.5);
      trail(g, t, hush.release, land, p0, to, 40 + 30 * i, VIOLET, 4, 9 + i);
    }
    burst(g, t, land, { x: to[0], y: to[1], n: 14, seed: 30 + i, speed: 160, life: 0.6, colors: [VIOLET, SILVER], size: 3 });
    ring(g, to[0], to[1], 40 * (1 - clamp((t - land) / 0.25)), VIOLET, (t > land ? 0.9 : 0) * (1 - clamp((t - land) / 0.3)), 3, 0.6);
  });
  g.restore();
}

function fxGravity(g, t) {
  const sh = SHADES[2];
  if (t < gravity.release - 0.05 || t > GRAV_HIT + 3) return;
  const js = { x: P2[0], y: P2[1], s: depthScale(P2[1]) };
  const p0 = handPoint(js, "orb");
  const st = shadeState(sh, t);
  if (!st) return;
  const target = [st.x, st.y - st.h * st.squash * 0.55];
  const tArrive = gravity.release + 0.3;
  if (t < tArrive) {
    const [x, y] = flight(t, gravity.release, tArrive, p0, target, 30);
    g.save(); g.globalCompositeOperation = "lighter"; glow(g, x, y, 60, VIOLET, 0.6); g.restore();
    disc(g, x, y, 13, "#06020c");
    ring(g, x, y, 14, VIOLET, 0.9, 2.5);
  }
  // the new-moon disc presses down from above
  const top = st.y - st.h * st.squash;
  if (t > tArrive - 0.1 && t < GRAV_HIT + 1.6) {
    const k = clamp((t - (tArrive - 0.1)) / (GRAV_HIT - tArrive + 0.1));
    const R = st.h * 0.3;
    const dy = lerp(top - 380, top - R * 0.45, easeIn(k));
    const a = t < GRAV_HIT ? ramp(t, tArrive - 0.1, 0.12) : 1 - clamp((t - GRAV_HIT - 0.5) / 1.1);
    g.save(); g.translate(st.x, dy); g.scale(1, 0.62);
    g.globalAlpha = a;
    g.globalCompositeOperation = "lighter"; glow(g, 0, 0, R * 1.7, VIOLET, 0.45);
    g.globalCompositeOperation = "source-over";
    disc(g, 0, 0, R, "#06020c");
    g.strokeStyle = "rgba(200,130,255,0.95)"; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    g.restore();
  }
  if (t >= GRAV_HIT) {
    g.save(); g.globalCompositeOperation = "lighter";
    ring(g, st.x, st.y, 40 + (t - GRAV_HIT) * 520, VIOLET, 0.8 * decay(t, GRAV_HIT, 0.25), 6, 0.25);
    burst(g, t, GRAV_HIT, { x: st.x, y: st.y - 10, n: 30, seed: 41, speed: 380, life: 1.0, grav: 500, dir: -Math.PI / 2, spread: 2.6, colors: ["150,125,110", "120,100,95", VIOLET], size: 4 });
    g.restore();
  }
}

// The cracked ring the disc leaves in the planks.
let CRACKS = null;
function drawCrack(g, t) {
  if (t < GRAV_HIT || t > CC + 6) return;
  const sh = SHADES[2], [x, y] = path(GRAV_HIT, sh.path);
  if (!CRACKS) {
    const r = rng(77); CRACKS = [];
    for (let i = 0; i < 16; i++) {
      const an = (i / 16) * TAU + r() * 0.3, pts = [];
      let rad = 30 + r() * 20;
      for (let k = 0; k < 6; k++) { rad += 18 + r() * 30; pts.push([Math.cos(an + (r() - 0.5) * 0.35) * rad, Math.sin(an + (r() - 0.5) * 0.35) * rad]); }
      CRACKS.push(pts);
    }
  }
  const grow = clamp((t - GRAV_HIT) / 0.25), fade = t > CC ? 1 - clamp((t - CC - 2) / 4) : 1;
  g.save(); g.translate(x, y); g.scale(1, 0.26);
  g.lineCap = "round";
  for (const pts of CRACKS) {
    const n = Math.max(1, Math.round(pts.length * grow));
    g.strokeStyle = `rgba(10,4,16,${0.9 * fade})`; g.lineWidth = 7;
    g.beginPath(); g.moveTo(pts[0][0] * 0.4, pts[0][1] * 0.4);
    for (let k = 0; k < n; k++) g.lineTo(pts[k][0], pts[k][1]);
    g.stroke();
  }
  g.globalCompositeOperation = "lighter";
  for (const pts of CRACKS) {
    const n = Math.max(1, Math.round(pts.length * grow));
    g.strokeStyle = `rgba(${VIOLET},${0.55 * fade * (0.5 + 0.5 * decay(t, GRAV_HIT, 1.5))})`; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(pts[0][0] * 0.4, pts[0][1] * 0.4);
    for (let k = 0; k < n; k++) g.lineTo(pts[k][0], pts[k][1]);
    g.stroke();
  }
  g.restore();
}

function fxSeal(g, t) {
  if (t < seal.t0 || t > SEAL_LAND[2] + 1) return;
  const js = { x: P2[0], y: P2[1], s: depthScale(P2[1]) };
  // her pendant holds the secrets she has been told; it wakes as she listens
  const pen = handPoint(js, "pendant");
  g.save(); g.globalCompositeOperation = "lighter";
  glow(g, pen[0], pen[1], 50, "90,240,220", 0.55 * bump(t, seal.t0 + 0.2, 2.6));
  const p0 = handPoint(js, "sigil");
  [SHADES[2], SHADES[0], SHADES[1]].forEach((sh, i) => {
    const land = SEAL_LAND[i], hd = shadeHead(sh, land);
    if (!hd) return;
    const r = (sh.big ? 44 : 30) * depthScale(Math.max(path(land, sh.path)[1], 560)) / 0.75;
    const to = [hd[0], hd[1] - hd[2] * (sh.big ? 1.6 : 2.6) - r];
    if (t >= seal.release && t < land) {
      const [x, y] = flight(t, seal.release, land, p0, to, 120 + i * 40);
      glow(g, x, y, 50, MAGENTA, 0.6);
      ring(g, x, y, 12, MAGENTA, 0.9, 3);
      trail(g, t, seal.release, land, p0, to, 120 + i * 40, MAGENTA, 5, 50 + i);
    }
    burst(g, t, land, { x: to[0], y: to[1], n: 18, seed: 60 + i, speed: 200, life: 0.7, colors: [MAGENTA, VIOLET, SILVER], size: 4 });
  });
  g.restore();
}

function fxOdds(g, t, js) {
  if (t < odds.t0 || t > odds.t1 + 3.5 || !js) return;
  const s = js.s, x = js.x, y = js.y;
  const live = clamp((t - odds.release) / 0.4) * (1 - clamp((t - odds.t1 - 1.5) / 2));
  g.save(); g.globalCompositeOperation = "lighter";
  glow(g, x, y - 220 * s, 420 * s, GOLD, 0.16 * live);
  // violet and gold stars rain down around her
  for (let i = 0; i < 80; i++) {
    const t0 = odds.release + hash2(i, 3) * 6.2, age = t - t0, life = 1.4 + hash2(i, 4) * 0.8;
    if (age < 0 || age > life) continue;
    const sx = x + (hash2(i, 5) - 0.5) * 620 * s + Math.sin(age * 3 + i) * 10;
    const sy = y - 600 * s + age * 330 * s;
    const tw = 0.5 + 0.5 * Math.sin(t * 14 + i);
    spark(g, sx, sy, (3 + 3 * hash2(i, 6)) * s * 1.4, i % 2 ? GOLD : VIOLET, (1 - age / life) * (0.5 + 0.5 * tw));
  }
  // a thin gold ring at her feet, turning slowly
  if (live > 0) {
    g.save(); g.translate(x, y - 2); g.scale(1, 0.22);
    g.strokeStyle = `rgba(${GOLD},${0.85 * live})`; g.lineWidth = 3 / 0.22 * 0.5;
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

// The shades' surge: a wall of dark that breaks on her light.
function drawWave(g, t) {
  if (t < WAVE.t0 || t > WAVE.t1 + 1) return;
  const front = t < WAVE.hit
    ? lerp(WAVE.from, P3[0] + 150, easeIn(clamp((t - WAVE.t0) / (WAVE.hit - WAVE.t0))))
    : P3[0] + 150 + (t - WAVE.hit) * 240;
  const a = t < WAVE.hit ? ramp(t, WAVE.t0, 0.8) : 1 - clamp((t - WAVE.hit) / (WAVE.t1 - WAVE.hit + 0.6));
  if (a <= 0.01) return;
  for (let i = 0; i < 36; i++) {
    const u = hash2(i, 91), x = front + u * (W - front + 100) + noise1(t * 1.5 + i, 3) * 30;
    const y = 640 + hash2(i, 92) * 220 - Math.pow(hash2(i, 93), 2) * 260;
    const r = 60 + hash2(i, 94) * 110;
    glow(g, x, y, r, "6,2,12", 0.55 * a);
  }
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) spark(g, front + hash2(i, 95) * 40, 620 + hash2(i, 96) * 240, 3, VIOLET, 0.5 * a * (0.5 + 0.5 * Math.sin(t * 9 + i)));
  burst(g, t, WAVE.hit, { x: P3[0] + 150, y: 720, n: 40, seed: 97, speed: 420, life: 1.1, dir: 0, spread: 2.4, colors: [GOLD, VIOLET], size: 4 });
  g.restore();
}

// ---------- Curtain Call ----------
function fxCurtain(g, t, js) {
  if (t < curtain.t0 || t > CC + 9 || !js) return;
  const s = js.s;
  g.save(); g.globalCompositeOperation = "lighter";
  // frames 18-24: the sigil bursts skyward in a column toward the moon
  const sky = handPoint(js, "sky"), up = frameAt("curtain_call", curtain.t0, 18);
  const beam = bump(t, up, 1.6);
  if (beam > 0.01) {
    const gr = g.createLinearGradient(sky[0], sky[1], MOON.x, MOON.y);
    gr.addColorStop(0, `rgba(${VIOLET},${0.8 * beam})`); gr.addColorStop(1, `rgba(${VIOLET},${0.15 * beam})`);
    g.strokeStyle = gr; g.lineWidth = 7 * beam;
    g.beginPath(); g.moveTo(sky[0], sky[1]); g.lineTo(MOON.x, MOON.y); g.stroke();
    for (let i = 0; i < 16; i++) {
      const k = ((t - up) * 0.9 + hash2(i, 71)) % 1;
      spark(g, lerp(sky[0], MOON.x, k) + (hash2(i, 72) - 0.5) * 30, lerp(sky[1], MOON.y, k), 4, i % 2 ? MAGENTA : SILVER, beam);
    }
  }
  // release: every mark tolls, the shades break apart, a ring sweeps the deck
  if (t >= CC) {
    const age = t - CC;
    ring(g, js.x, js.y - 160 * s, 60 + age * 1500, MAGENTA, 0.9 * decay(t, CC, 0.35), 10, 0.3);
    ring(g, js.x, js.y - 160 * s, 40 + age * 900, GOLD, 0.7 * decay(t, CC, 0.3), 5, 0.3);
    SHADES.forEach((sh, i) => {
      const st = shadeState(sh, CC - 0.01);
      if (!st) return;
      burst(g, t, CC, { x: st.x, y: st.y - st.h * st.squash * 0.5, n: sh.big ? 90 : 55, seed: 120 + i, speed: sh.big ? 520 : 380, life: 1.6, grav: -60, colors: [GOLD, VIOLET, MAGENTA, SILVER], size: 5, drag: 2 });
      // motes drifting up long after
      for (let k = 0; k < 26; k++) {
        const a0 = age - hash2(k, 140 + i) * 0.8, life = 4 + 3 * hash2(k, 150 + i);
        if (a0 < 0 || a0 > life) continue;
        const mx = st.x + (hash2(k, 160 + i) - 0.5) * st.h * 0.7 + Math.sin(a0 * 1.3 + k) * 20;
        const my = st.y - st.h * st.squash * hash2(k, 170 + i) - a0 * 45;
        spark(g, mx, my, 3, k % 2 ? GOLD : VIOLET, (1 - a0 / life) * 0.8);
      }
    });
    // the ward ring settles over her and fades
    const w = env(t, ENV.ward);
    if (w > 0.01) {
      for (let i = 0; i < 30; i++) {
        const an = (i / 30) * TAU + age * 0.7;
        const R = 180 * s * (1 + 0.6 * decay(t, CC, 0.5));
        const wy = js.y - lerp(165, 40, clamp(age / 3)) * s;
        spark(g, js.x + Math.cos(an) * R, wy + Math.sin(an) * R * 0.25, 3.5, i % 3 ? MAGENTA : GOLD, w * (0.6 + 0.4 * Math.sin(t * 8 + i)));
      }
    }
  }
  g.restore();
}

// Sheer veil curtains sweep in from both sides and meet behind her.
function drawCurtains(g, t, ow, oh) {
  const close = env(t, [[73.9, 0], [75.0, 1], [CC, 1], [CC + 0.35, 0]]);
  const a = t < CC ? ramp(t, 73.9, 0.3) : 1 - clamp((t - CC) / 0.7);
  if (close <= 0.005 || a <= 0.01) return;
  for (const side of [-1, 1]) {
    const edge = side < 0 ? close * ow * 0.52 : ow - close * ow * 0.52;
    const x0 = side < 0 ? 0 : edge, x1 = side < 0 ? edge : ow;
    const folds = 9;
    for (let i = 0; i < folds; i++) {
      const k0 = i / folds, k1 = (i + 1) / folds;
      const fx0 = lerp(x0, x1, k0), fx1 = lerp(x0, x1, k1);
      const gr = g.createLinearGradient(fx0, 0, fx1, 0);
      gr.addColorStop(0, `rgba(150,40,120,${0.2 * a})`);
      gr.addColorStop(0.45, `rgba(255,150,225,${0.3 * a})`);
      gr.addColorStop(0.55, `rgba(255,190,240,${0.34 * a})`);
      gr.addColorStop(1, `rgba(120,30,100,${0.22 * a})`);
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(fx0, 0); g.lineTo(fx1, 0);
      for (let y = 0; y <= oh; y += oh / 12) g.lineTo(fx1 + Math.sin(t * 2.2 + y * 0.01 + i) * 10 * (y / oh), y);
      for (let y = oh; y >= 0; y -= oh / 12) g.lineTo(fx0 + Math.sin(t * 2.2 + y * 0.01 + i - 0.6) * 10 * (y / oh), y);
      g.closePath(); g.fill();
    }
    // gold trim along the hem and the leading edge
    g.strokeStyle = `rgba(${GOLD},${0.75 * a})`; g.lineWidth = Math.max(2, oh * 0.004);
    g.beginPath();
    for (let x = x0; x <= x1; x += 12) g.lineTo(x, oh * 0.9 + Math.sin(x * 0.05 + t * 3) * oh * 0.01);
    g.stroke();
    g.beginPath(); g.moveTo(edge, 0); g.lineTo(edge, oh); g.stroke();
  }
  // a velvet valance across the top
  g.fillStyle = `rgba(40,10,38,${0.85 * a * close})`;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(ow, 0);
  for (let x = ow; x >= 0; x -= ow / 16) g.lineTo(x, oh * 0.06 + Math.abs(Math.sin((x / ow) * Math.PI * 8)) * oh * 0.03);
  g.closePath(); g.fill();
}
