// Effects every scene shares, in the Jester's colours: violet and magenta
// sigils, ink black, gold from her bells. All closed-form in t, nothing stored.

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

// Sheer veil curtains sweep in from both sides from tIn, meet at tShut, and
// fly open at tOpen (the release). Drawn in screen space, behind her.
function drawCurtains(g, t, ow, oh, tIn, tShut, tOpen) {
  const close = env(t, [[tIn, 0], [tShut, 1], [tOpen, 1], [tOpen + 0.35, 0]]);
  const a = t < tOpen ? ramp(t, tIn, 0.3) : 1 - clamp((t - tOpen) / 0.7);
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
