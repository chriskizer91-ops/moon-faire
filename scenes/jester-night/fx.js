// This film's spells, timed off script.js.

// ---------- Doom ----------
function doomNumber(t) {
  let n = 3;
  for (const [tt, v] of DOOM_TICKS) if (t >= tt) n = v;
  return n;
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
