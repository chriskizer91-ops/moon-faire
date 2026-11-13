
  // ---------- Io's own code-drawn textures ----------
  function sockTexIo() {                             // a short black knit cuff: soft upright ribs
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 44, seed0 = seed; seed = 8301;
    g.fillStyle = '#1b181b'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x - w * 0.5, 0, w * 0.28, H); g.fillStyle = 'rgba(120,112,124,0.22)'; g.fillRect(x - w * 0.06, 0, w * 0.34, H); }
    for (let j = 0; j < 46; j++) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, (j + 0.5) / 46 * H, W, 1.2 * TEXS); }
    for (let i = 0; i < 1200; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '150,142,156' : '0,0,0') + ',' + rr(0.04, 0.12) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 5) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
