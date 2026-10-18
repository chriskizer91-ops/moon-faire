// The shades: coded, drawn on the pixel layer so they match her pixel art.

// ---------- shades ----------
function shadeState(sh, t) {
  if (t < sh.rise || t > CC + 0.5) return null;
  let [x, y] = path(t, sh.path);
  const grow = easeOut(clamp((t - sh.rise) / 1.8));
  const s = depthScale(Math.max(y, 560));
  const h = sh.h * s * (0.2 + 0.8 * grow);
  let squash = sh.big ? env(t, SQUASH) : 1;
  let lean = 0;
  if (t > WAVE.t0 - 0.6 && t < WAVE.t1) lean = -0.18 * bump(t, WAVE.t0 - 0.6, WAVE.t1 - WAVE.t0 + 0.6);
  if (sh.hit) lean += 0.25 * decay(t, sh.hit, 0.25);   // knocked back, leaning away
  const bob = noise1(t * 0.6, sh.seed) * 9 + Math.sin(t * 1.7 + sh.seed) * 5;
  let open = 0;
  if (sh.keen && t > sh.keen[0] && t < sh.keen[1]) open = clamp(ramp(t, sh.keen[0], 0.8) * (0.65 + 0.35 * noise1(t * 5, sh.seed)));
  if (sh.hit) open = Math.max(open, bump(t, sh.hit, 0.6));
  const shatter = t > CC ? clamp((t - CC) / 0.3) : 0;
  return {
    x, y: y + bob * 0.3, h, s, squash, lean, bob, open,
    hushed: sh.hushed != null && t >= sh.hushed,
    flash: sh.hit ? decay(t, sh.hit, 0.16) : 0,
    alpha: grow * (1 - shatter),
    rise: grow,
  };
}

// Head position (for sigils, rings and the hush mark).
function shadeHead(sh, t) {
  const st = shadeState(sh, t) || shadeState(sh, Math.min(t, CC));
  if (!st) return null;
  const hh = st.h * st.squash;
  return [st.x + st.lean * st.h * 0.5, st.y - hh + st.h * 0.16 + st.bob, st.h * 0.13];
}

function shadePath(g, st, t, seed) {
  const { x, y, h, squash, lean, bob } = st;
  const hh = h * squash, w = h * 0.34 / Math.sqrt(squash);
  const top = y - hh + bob, rHead = h * 0.13, hx = x + lean * h * 0.5;
  const N = 12, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const v = i / N, yy = top + hh * 0.22 + v * hh * 0.7;
    const half = rHead * 0.95 + (w - rHead * 0.95) * Math.pow(v, 0.75);
    const sway = Math.sin(t * 1.6 + v * 3.2 + seed) * h * 0.035 * v + lean * h * 0.5 * (1 - v);
    L.push([x - half + sway, yy]); R.push([x + half + sway, yy]);
  }
  g.beginPath();
  g.moveTo(hx - rHead * 1.25, top + hh * 0.2);
  g.quadraticCurveTo(hx - rHead * 1.3, top - rHead * 0.2, hx + rHead * 0.2, top - rHead * 0.75);   // pointed hood
  g.quadraticCurveTo(hx + rHead * 1.3, top - rHead * 0.1, hx + rHead * 1.25, top + hh * 0.2);
  for (const p of R) g.lineTo(p[0], p[1]);
  const K = 9, bot = R[N][1];
  for (let j = K; j >= 0; j--) {
    const xx = lerp(L[N][0], R[N][0], j / K), len = 0.06 + 0.12 * hash2(j, seed);
    g.lineTo(xx + Math.sin(t * 2.4 + j) * h * 0.02, bot + h * len + h * 0.04 * Math.sin(t * 3 + j * 1.7 + seed));
    if (j > 0) g.lineTo(lerp(L[N][0], R[N][0], (j - 0.5) / K), bot - h * 0.03);
  }
  for (let i = N; i >= 0; i--) g.lineTo(L[i][0], L[i][1]);
  g.closePath();
  return { hx, headY: top + h * 0.16, rHead, top, hh };
}

// Drawn on the low-resolution pixel layer, so it matches her pixel art.
function drawShade(g, sh, t, glowsOut) {
  const st = shadeState(sh, t);
  if (!st || st.alpha <= 0.01) return;
  const { x, y, h } = st;
  g.save();
  g.globalAlpha = st.alpha;
  // a pool of dark around it
  g.save(); g.translate(x, y - h * 0.45); g.scale(1, 1.2);
  glow(g, 0, 0, h * 0.75, "5,2,12", 0.5);
  g.restore();
  // arms for the great shade, reaching toward her in the surge
  if (sh.big) {
    const reach = 0.4 + 0.6 * bump(t, WAVE.t0 - 0.4, WAVE.t1 - WAVE.t0 + 1);
    g.strokeStyle = "#120a20"; g.lineCap = "round";
    for (const side of [-1, 1]) {
      const sx = x + side * h * 0.16, sy = y - h * st.squash * 0.66;
      const ex = sx + side * h * (0.18 + 0.1 * Math.sin(t * 1.3 + side)) - (side < 0 ? h * 0.3 * reach : 0);
      const ey = sy + h * (0.32 - 0.12 * reach);
      for (let k = 0; k < 3; k++) {
        g.lineWidth = h * (0.06 - k * 0.018);
        g.beginPath(); g.moveTo(sx, sy);
        g.quadraticCurveTo(sx + side * h * 0.2, sy - h * 0.05, ex + k * 6 * side, ey + k * 10);
        g.stroke();
      }
    }
  }
  // moonlit rim, then the body over it
  const p = shadePath(g, st, t, sh.seed);
  // moonlit outline, gold for a moment when struck
  const rim = g.createLinearGradient(0, p.top - p.rHead, 0, y);
  const rc = st.flash > 0.02 ? `255,214,130,${0.5 + 0.5 * st.flash}` : "140,110,205,0.5";
  rim.addColorStop(0, `rgba(${rc})`); rim.addColorStop(1, "rgba(140,110,205,0)");
  g.strokeStyle = rim; g.lineWidth = Math.max(3, h * 0.016); g.stroke();
  const gr = g.createLinearGradient(0, p.top - p.rHead, 0, y + h * 0.16);
  gr.addColorStop(0, "#1b1030"); gr.addColorStop(0.3, "#0e0719"); gr.addColorStop(0.72, "rgba(10,5,18,0.9)"); gr.addColorStop(1, "rgba(10,5,18,0)");
  g.fillStyle = gr; g.fill();
  // folds in the cloth
  g.save(); g.clip();
  g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = Math.max(2, h * 0.012);
  for (let i = -2; i <= 2; i++) {
    const fx = x + i * h * 0.07;
    g.beginPath(); g.moveTo(fx, p.top + p.hh * 0.35);
    g.quadraticCurveTo(fx + i * h * 0.03 + Math.sin(t * 1.4 + i) * 6, y - h * 0.3, fx + i * h * 0.06, y + h * 0.1);
    g.stroke();
  }
  if (st.flash > 0.02) { g.fillStyle = `rgba(255,220,150,${0.16 * st.flash})`; g.fillRect(x - h, y - h * 1.2, h * 2, h * 1.4); }
  g.restore();
  // face: a hollow in the hood, two cold eyes, and a mouth when it keens
  g.fillStyle = "#040108";
  g.beginPath(); g.ellipse(p.hx, p.headY + p.rHead * 0.15, p.rHead * 0.72, p.rHead * 0.82, 0, 0, TAU); g.fill();
  const blink = hash2(Math.floor(t * 0.7), sh.seed) > 0.85 && (t * 0.7) % 1 < 0.12 ? 0.15 : 1;
  for (const side of [-1, 1]) {
    const ex = p.hx + side * p.rHead * 0.32, ey = p.headY - p.rHead * 0.02;
    g.fillStyle = "#dcfff2";
    g.beginPath(); g.ellipse(ex, ey, p.rHead * 0.14, p.rHead * 0.1 * blink, 0, 0, TAU); g.fill();
    glowsOut.push([ex, ey, p.rHead * 0.7, "160,255,225", 0.5 * st.alpha]);
  }
  const my = p.headY + p.rHead * 0.5;
  if (st.open > 0.02 && !st.hushed) {
    g.fillStyle = "#000";
    g.beginPath(); g.ellipse(p.hx, my, p.rHead * 0.2, p.rHead * 0.32 * st.open, 0, 0, TAU); g.fill();
    glowsOut.push([p.hx, my, p.rHead * 0.5, "120,220,255", 0.25 * st.open * st.alpha]);
  }
  if (st.hushed) {
    // her silence mark: a thin violet ring sealed over the mouth
    g.strokeStyle = "#c070ff"; g.lineWidth = Math.max(2, p.rHead * 0.07);
    g.beginPath(); g.ellipse(p.hx, my, p.rHead * 0.4, p.rHead * 0.24, 0, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(p.hx - p.rHead * 0.22, my); g.lineTo(p.hx + p.rHead * 0.22, my); g.stroke();
    glowsOut.push([p.hx, my, p.rHead * 0.8, "190,110,255", 0.45 * st.alpha]);
  }
  // smoke curling off its shoulders
  g.fillStyle = "#170c29";
  for (let i = 0; i < 9; i++) {
    const ph = (t * 0.33 + hash2(i, sh.seed)) % 1;
    const sx = x + (hash2(i, sh.seed + 1) - 0.5) * h * 0.5 + Math.sin(t * 2 + i) * 6;
    const sy = y - h * st.squash * 0.62 - ph * h * 0.55;
    g.globalAlpha = st.alpha * (1 - ph) * 0.6;
    g.beginPath(); g.arc(sx, sy, h * 0.045 * (1 - ph * 0.5), 0, TAU); g.fill();
  }
  g.restore();
}
