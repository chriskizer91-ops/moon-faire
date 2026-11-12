
  // ---------- the Ranger's own code-drawn textures ----------
  function sockTexR() {                              // thick grey knit: soft upright ribs, a little heather
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 40, seed0 = seed; seed = 7301;
    g.fillStyle = '#6b6569'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(38,34,42,0.38)'; g.fillRect(x - w * 0.5, 0, w * 0.26, H); g.fillStyle = 'rgba(226,222,230,0.20)'; g.fillRect(x - w * 0.06, 0, w * 0.34, H); }
    for (let j = 0; j < 46; j++) { g.fillStyle = 'rgba(30,26,36,0.10)'; g.fillRect(0, (j + 0.5) / 46 * H, W, 1.2 * TEXS); }          // the rows of the knit
    for (let i = 0; i < 1600; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '240,236,246' : '54,48,60') + ',' + rr(0.04, 0.12) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 5) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
  function leatherTexR() {                           // worn brown-charcoal leather: mottled, scuffed pale at the wear points
    const S = Math.round(512 * TEXS), c = cvs(S, S), g = c.getContext('2d'), seed0 = seed; seed = 7302;
    g.fillStyle = '#463a33'; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 240, ['#4a3c34'], S * 0.03, S * 0.12, 0.06, 0.20);
    blobs(g, S, S, 200, ['#221b19'], S * 0.03, S * 0.14, 0.08, 0.24);
    blobs(g, S, S, 70, ['#6a5648'], S * 0.01, S * 0.05, 0.05, 0.16);
    for (let i = 0; i < 900; i++) { g.strokeStyle = 'rgba(' + (rnd() < 0.6 ? '20,15,13' : '120,100,86') + ',' + rr(0.05, 0.16) + ')'; g.lineWidth = rr(0.5, 1.4) * TEXS; const x = rnd() * S, y = rnd() * S, a = rnd() * TAU, l = rr(4, 26) * TEXS; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    seed = seed0; return ctex(c, 2, 2);
  }
  function soleTexR() {                              // dark rubber with fine level grooves
    const t = soleTex(); return t;
  }
