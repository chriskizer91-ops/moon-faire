// Envoi's foes, drawn from their cut sprites (art/foes/), and the moths they become.

const WISP_LIFT = 120;   // a wisp is sized and sorted as if its ground point were this far below it

const foeRelease = f => (f.release != null ? f.release : RELEASE_ALL);
function foePose(f, t) {
  let p = f.poses[0][1];
  for (const [tt, name] of f.poses) if (t >= tt) p = name;
  return p;
}

function foeState(f, t) {
  if (t < f.rise) return null;
  const rel = foeRelease(f);
  if (t > rel + 1.8) return null;   // gone; its moth carries on
  const wisp = f.kind === "wisp";
  let [x, y] = path(t, f.path);
  const depth = wisp ? y + WISP_LIFT : y;
  const pose = t >= rel ? (f.kind === "wraith" ? "kneel" : "released") : foePose(f, t);
  const key = `${f.kind}_${pose}`, meta = DATA.meta.foes[key];
  const sc = (metre(depth) / meta.px_per_m) * (f.scale || 1);
  const appear = easeOut(clamp((t - f.rise) / (wisp ? 1.2 : 1.8)));
  const fade = t > rel ? 1 - clamp((t - rel - 0.5) / 1.2) : 1;
  const bob = wisp ? Math.sin(t * 2.1 + f.seed) * 5 + noise1(t * 0.8, f.seed) * 4 : Math.sin(t * 1.3 + f.seed) * 1.5;
  if (!wisp) y += (1 - appear) * 40;   // wraiths rise up out of the dark
  let kick = 0;
  if (f.hit) kick = 30 * Math.sin(Math.PI * clamp((t - f.hit) / 0.35)) * (t > f.hit ? 1 : 0);
  return {
    x: x + kick, y: y + bob, depth, sc, key, meta, wisp, pose,
    alpha: appear * fade, flash: f.hit ? decay(t, f.hit, 0.16) : 0,
    flip: f.kind === "great" && pose === "breath",   // breathes toward her, on its left
    hushed: f.hushed != null && t >= f.hushed && t < rel,
  };
}

// Where the foe's sprite sits: top-left, size, and the ground point.
function foeBox(st) {
  const { meta, sc } = st, w = meta.w * sc, h = meta.h * sc;
  const gx = st.x, gy = st.wisp ? st.y + h * 0.5 : st.y;
  let ax = meta.gx * sc;
  if (st.flip) ax = w - ax;
  return { x: gx - ax, y: gy - meta.gy * sc, w, h, gx, gy };
}
function foeHead(f, t) {
  const st = foeState(f, Math.min(t, foeRelease(f) - 0.01));
  if (!st) return null;
  const b = foeBox(st);
  return [b.x + b.w * (st.wisp ? 0.5 : 0.48), b.y + b.h * (st.wisp ? 0.08 : 0.1), b.h];
}

function drawFoe(g, f, t, glowsOut) {
  const st = foeState(f, t);
  if (!st || st.alpha <= 0.01) return;
  const im = ART[st.key];
  if (!im) return;
  const b = foeBox(st);
  g.save();
  g.globalAlpha = st.alpha;
  if (st.flip) { g.translate(b.x + b.w / 2, 0); g.scale(-1, 1); g.translate(-(b.x + b.w / 2), 0); }
  g.drawImage(im, b.x, b.y, b.w, b.h);
  if (st.flash > 0.02) {
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = st.alpha * st.flash * 0.7;
    g.drawImage(im, b.x, b.y, b.w, b.h);
  }
  g.restore();
  const m = metre(st.depth);
  if (st.wisp) {
    glowsOut.push([b.gx, b.y + b.h * 0.35, m * 1.1, "140,255,180", 0.3 * st.alpha]);
    if (st.hushed) {
      // her silence mark, sealed over its mouth
      const mx = b.x + b.w * 0.5, my = b.y + b.h * 0.47;
      g.save(); g.globalAlpha = st.alpha;
      g.strokeStyle = "#c070ff"; g.lineWidth = Math.max(1.5, m * 0.03);
      g.beginPath(); g.ellipse(mx, my, m * 0.11, m * 0.07, 0, 0, TAU); g.stroke();
      g.beginPath(); g.moveTo(mx - m * 0.07, my); g.lineTo(mx + m * 0.07, my); g.stroke();
      g.restore();
      glowsOut.push([mx, my, m * 0.25, "190,110,255", 0.5 * st.alpha]);
    }
  } else if (f.kind === "wraith") {
    glowsOut.push([b.gx, b.y + b.h * 0.35, m * 0.9, "110,255,170", 0.28 * st.alpha]);
  } else {
    const holding = t > 52.6 && t < RELEASE_ALL;
    glowsOut.push([b.gx, b.y + b.h * 0.45, m * 1.8, "255,160,70", (holding ? 0.38 : 0.18) * st.alpha]);
  }
}

// ---------- moths: the souls going home ----------
function drawMoths(g, t) {
  const im = ART.wisp_moth;
  if (!im) return;
  g.save(); g.globalCompositeOperation = "lighter";
  FOES.forEach((f, i) => {
    const rel = foeRelease(f), age = t - rel - 0.4;
    if (age < 0 || age > 11) return;
    const st = foeState(f, rel - 0.01);
    if (!st) return;
    const b = foeBox(st), big = f.kind === "great" ? 1.8 : f.kind === "wraith" ? 1.3 : 1;
    const x0 = b.gx, y0 = b.y + b.h * 0.4;
    // up and toward the moon, fluttering
    const k = age / 11;
    const x = lerp(x0, MOON.x + 60 * (i - 2), easeInOut(k)) + Math.sin(age * 2.2 + i) * 26;
    const y = lerp(y0, MOON.y + 40, easeOut(k)) + Math.sin(age * 3.1 + i * 2) * 10;
    const m = metre(560) * 0.55 * big * (1 - 0.4 * k);
    const flap = 0.25 + 0.75 * Math.abs(Math.cos(age * 7 + i));
    const a = clamp(age / 0.5) * (1 - clamp((age - 8) / 3));
    glow(g, x, y, m * 1.6, "210,255,230", 0.35 * a);
    g.globalAlpha = a;
    g.save(); g.translate(x, y); g.scale(flap, 1);
    g.drawImage(im, -m / 2, -m / 2, m, m * (im.height / im.width));
    g.restore();
    g.globalAlpha = 1;
  });
  g.restore();
}
