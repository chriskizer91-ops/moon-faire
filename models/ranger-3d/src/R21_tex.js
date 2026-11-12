
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

  // loose curls: fine strands in her three hair colours, running along the lock
  function lockTexR(cols) {
    const W = 256, H = 256, c = cvs(W, H), g = c.getContext('2d'); let sd = 733; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#463434'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 420; i++) { const x = r() * W, k = r(); g.strokeStyle = rgba(k < 0.30 ? cols[0] : k < 0.62 ? cols[1] : k < 0.90 ? cols[2] : '#cdc0c4', 0.35 + 0.5 * r()); g.lineWidth = 0.6 + 1.6 * r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6 * (r() - 0.5), H * 0.33, x + 6 * (r() - 0.5), H * 0.66, x + 4 * (r() - 0.5), H); g.stroke(); }
    const t = ctex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  // the turquoise: blue-green stone with darker veins and a few pale clouds
  function gemTexR() {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'); let sd = 9157; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#1a86ad'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, q = 14 + 44 * r(), gr = g.createRadialGradient(x, y, 0, x, y, q), col = r() < 0.5 ? '#35b3cf' : r() < 0.6 ? '#0d5f86' : '#1c9bb8'; gr.addColorStop(0, rgba(col, 0.55)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - q, y - q, 2 * q, 2 * q); }
    g.strokeStyle = 'rgba(9,52,78,0.55)'; g.lineWidth = 1.1;
    for (let i = 0; i < 9; i++) { let x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += 26 * (r() - 0.5); y += 26 * (r() - 0.5); g.lineTo(x, y); } g.stroke(); }
    return ctex(c);
  }

  // where a lock has hair: separate strands of different lengths, so its edges and its tip are wispy (root at the bottom of the picture)
  function lockAlphaR() {
    const W = 256, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 4409; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 64; i++) { const x = r() * W, top = H * (1 - (0.55 + 0.45 * r())); g.lineWidth = 2.2 + 3.2 * r(); g.beginPath(); g.moveTo(x, H); g.bezierCurveTo(x + 10 * (r() - 0.5), H * 0.66, x + 10 * (r() - 0.5), H * 0.4, x + 12 * (r() - 0.5), top); g.stroke(); }
    const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.encoding = THREE.LinearEncoding; return t;
  }
