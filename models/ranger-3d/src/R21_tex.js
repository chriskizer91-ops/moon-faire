
  // ---------- the Ranger's own code-drawn textures ----------
  function sockTexR() {                              // thick grey knit, as in E1 and E8: soft upright ribs, a little heather, a faint mauve cast
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 44, seed0 = seed; seed = 7301;
    g.fillStyle = '#878175'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(40,34,36,0.42)'; g.fillRect(x - w * 0.5, 0, w * 0.26, H); g.fillStyle = 'rgba(236,230,232,0.22)'; g.fillRect(x - w * 0.08, 0, w * 0.36, H); }
    for (let j = 0; j < 52; j++) { g.fillStyle = 'rgba(36,30,34,0.20)'; g.fillRect(0, (j + 0.5) / 52 * H, W, 1.3 * TEXS); }          // the rows of the knit
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.55 ? '244,240,242' : '52,44,48') + ',' + rr(0.05, 0.17) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 5) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
  function leatherTexR() {                           // worn charcoal-brown leather, as in E1: matte, mottled, rubbed paler where it wears
    const S = Math.round(512 * TEXS), c = cvs(S, S), g = c.getContext('2d'), seed0 = seed; seed = 7302;
    g.fillStyle = '#453d38'; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 240, ['#4f463f'], S * 0.03, S * 0.12, 0.06, 0.22);
    blobs(g, S, S, 210, ['#1f1a18'], S * 0.03, S * 0.15, 0.08, 0.27);
    blobs(g, S, S, 130, ['#877868'], S * 0.010, S * 0.06, 0.06, 0.22);
    for (let i = 0; i < 700; i++) { g.strokeStyle = 'rgba(' + (rnd() < 0.55 ? '26,20,18' : '150,128,112') + ',' + rr(0.04, 0.13) + ')'; g.lineWidth = rr(0.5, 1.3) * TEXS; const x = rnd() * S, y = rnd() * S, a = rnd() * TAU, l = rr(3, 18) * TEXS; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    seed = seed0; return ctex(c, 2, 2);
  }
  function soleTexR() {                              // the sole in E1: dark warm grey, built up in level layers
    const W = Math.round(256 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), seed0 = seed; seed = 7303;
    g.fillStyle = '#443d3a'; g.fillRect(0, 0, W, H);
    for (let j = 0; j < 30; j++) { const y = rnd() * H; g.fillStyle = 'rgba(' + (rnd() < 0.6 ? '22,18,18' : '112,102,96') + ',' + rr(0.08, 0.24) + ')'; g.fillRect(0, y, W, rr(1, 3.5) * TEXS); }
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '18,15,15' : '120,110,104') + ',' + rr(0.05, 0.14) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(2, 14) * TEXS, rr(1, 2) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
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
