// Puts one frame of the film together: render(g, t, width, height).

function render(g, t, ow, oh) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  g.fillStyle = "#000"; g.fillRect(0, 0, ow, oh);
  if (env(t, ENV.still) > 0.5) { drawStill(g, t, ow, oh); post(g, t, ow, oh); return; }

  const cam = camera(t), k = ow / cam.vw;
  const world = () => g.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  world();
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";

  // the square
  g.drawImage(BACKDROP, 0, 0, W, H);
  drawMoon(g, t);
  stageOverlay(g, t);
  drawFog(g, t, false);
  drawCrack(g, t);

  // foes, the Jester and the cut-outs, back to front
  const js = jesterAt(t), glows = [];
  const th = env(t, ENV.theatre);
  const items = OCC.map(o => ({ d: occDepth(o), draw: () => drawOccluder(g, t, o) }));
  for (const f of FOES) {
    const st = foeState(f, t);
    if (st) items.push({ d: st.depth, draw: () => drawFoe(g, f, t, glows) });
  }
  const drawHer = () => { drawJester(g, js); drawJesterGlow(g, js, t > curtain.t0 && t < curtain.t1 ? 1.3 : 1); };
  if (js && th <= 0.01) items.push({ d: js.y, draw: drawHer });
  items.sort((a, b) => a.d - b.d).forEach(it => it.draw());
  g.save(); g.globalCompositeOperation = "lighter";
  for (const [x, y, r, rgb, a] of glows) glow(g, x, y, r, rgb, a);
  g.restore();

  // Curtain Call: the square goes dark and the curtains close behind her
  if (th > 0.01) {
    theatre(g, t, js, cam, ow, oh, th);
    world(); drawMoon(g, t, th);
    g.setTransform(1, 0, 0, 1, 0, 0); drawCurtains(g, t, ow, oh, 78.9, 80.0, CC);
    world();
    if (js) drawHer();
  }

  drawLampGlows(g, t);
  fxFlames(g, t);
  fxBreath(g, t, js);
  fxRebuke(g, t);
  fxHush(g, t);
  fxGravity(g, t);
  fxSeal(g, t);
  fxOdds(g, t, js);
  drawFog(g, t, true);
  drawFireflies(g, t);
  drawBellRings(g, t);
  fxCurtain(g, t, js);
  drawDoom(g, t);
  drawMoths(g, t);
  post(g, t, ow, oh);
}
