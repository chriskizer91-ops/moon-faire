// The Jester: her real frames, drawn on their anchors, plus her spell-light bloom.
// Each scene supplies J (her actions), CLIPS, HAND and depthScale.

// The Jester (her real frames, on their anchors) and the shades (coded).

function jesterAt(t) {
  if (t < J[0].t0) return null;
  let a = J[J.length - 1];
  for (const b of J) if (t >= b.t0 && t < b.t1) { a = b; break; }
  const c = CLIPS[a.clip], local = t - a.t0;
  let f = Math.floor(local * c.fps + 1e-6);
  f = a.loop ? f % c.n : Math.min(f, c.n - 1);
  if (a.hold != null) f = a.hold;
  const k = clamp(local / (a.t1 - a.t0));
  const x = lerp(a.from[0], a.to[0], k), y = lerp(a.from[1], a.to[1], k);
  return { a, clip: a.clip, f, x, y, s: depthScale(y), flip: c.flipX, frame: c.frames[f] };
}

// A point on her (from HAND) in painting pixels.
function handPoint(js, key) {
  const [dx, dy] = HAND[key];
  return [js.x + dx * js.s * (js.flip ? -1 : 1), js.y + dy * js.s];
}

// frame = [img, w, h, anchorX, anchorY, glowImg, glowPower]
function drawJester(g, js) {
  const fr = js.frame, im = IMGS[fr[0]];
  if (!im) return;
  g.save();
  if (js.flip) { g.translate(js.x, 0); g.scale(-1, 1); g.translate(-js.x, 0); }
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(im, js.x - fr[3] * js.s, js.y - fr[4] * js.s, fr[1] * js.s, fr[2] * js.s);
  g.restore();
}

// Bloom from her spell light: a blurred bright-pass of the same frame.
function drawJesterGlow(g, js, boost = 1) {
  const fr = js.frame, gl = GLOWS[fr[5]];
  if (!gl || fr[6] < 0.02) return;
  g.save();
  g.globalCompositeOperation = "lighter";
  if (js.flip) { g.translate(js.x, 0); g.scale(-1, 1); g.translate(-js.x, 0); }
  g.globalAlpha = clamp(0.9 * boost);
  g.drawImage(gl, js.x - fr[3] * js.s, js.y - fr[4] * js.s, fr[1] * js.s, fr[2] * js.s);
  g.restore();
  // the light she gives off pools on the deck around her
  g.save();
  g.globalCompositeOperation = "lighter";
  g.translate(js.x, js.y); g.scale(1, 0.3);
  glow(g, 0, 0, 300 * js.s, "185,90,255", 0.32 * fr[6] * boost);
  g.restore();
}
