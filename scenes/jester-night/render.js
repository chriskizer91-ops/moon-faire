// Puts one frame of the film together: render(g, t, width, height).

function render(g, t, ow, oh) {
  const cam = camera(t), k = ow / cam.vw;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  g.fillStyle = "#000"; g.fillRect(0, 0, ow, oh);
  g.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";

  // stage
  g.drawImage(BACKDROP, 0, 0, W, H);
  drawMoon(g, t);
  drawAirship(g, t);
  drawLanternCovers(g, t);
  drawDarkness(g, t);
  drawLanternGlows(g, t);
  drawFog(g, t, false);
  drawRipples(g, t);
  drawCrack(g, t);
  drawWave(g, t);

  // actors, back to front; shades go through the pixel layer
  const js = jesterAt(t);
  const size = Math.max(2, Math.round(2.6 * k));
  const glows = [];
  const behind = [], front = [];
  for (const sh of SHADES) {
    const st = shadeState(sh, t);
    if (!st) continue;
    (js && st.y > js.y ? front : behind).push(sh);
  }
  if (behind.length) {
    const p = pixelLayer(ow, oh, cam, size);
    behind.forEach(sh => drawShade(p, sh, t, glows));
    blitPixels(g, ow, oh);
  }
  // Curtain Call: the stage goes dark, the moon goes new, and the curtains
  // close behind her, so she takes her call in front of them.
  const th = env(t, ENV.theatre);
  if (th > 0.01) {
    theatre(g, t, js, cam, ow, oh, th);
    g.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
    drawMoon(g, t, th);
    g.setTransform(1, 0, 0, 1, 0, 0);
    drawCurtains(g, t, ow, oh, 73.9, 75.0, CC);
    g.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
  }
  if (js) { drawJester(g, js); drawJesterGlow(g, js, t > curtain.t0 && t < curtain.t1 ? 1.3 : 1); }
  if (front.length) {
    const p = pixelLayer(ow, oh, cam, size);
    front.forEach(sh => drawShade(p, sh, t, glows));
    blitPixels(g, ow, oh);
  }
  g.save(); g.globalCompositeOperation = "lighter";
  for (const [x, y, r, rgb, a] of glows) glow(g, x, y, r, rgb, a);
  g.restore();

  // spells
  fxRebuke(g, t, js);
  fxHush(g, t);
  fxGravity(g, t);
  fxSeal(g, t);
  fxOdds(g, t, js);
  drawFog(g, t, true);
  drawFireflies(g, t);
  fxCurtain(g, t, js);
  drawDoom(g, t);
  post(g, t, ow, oh);
}
