
  // ---------- Io's own code-drawn textures ----------
  function sockTexIo() {                             // a short black knit cuff: soft upright ribs
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 44, seed0 = seed; seed = 8301;
    g.fillStyle = '#1b181b'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x - w * 0.5, 0, w * 0.28, H); g.fillStyle = 'rgba(120,112,124,0.22)'; g.fillRect(x - w * 0.06, 0, w * 0.34, H); }
    for (let j = 0; j < 46; j++) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, (j + 0.5) / 46 * H, W, 1.2 * TEXS); }
    for (let i = 0; i < 1200; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '150,142,156' : '0,0,0') + ',' + rr(0.04, 0.12) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 5) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }

  // the hat's brim, unrolled: round it from left to right, from the crown (bottom of the picture) to the edge (top). The felt of F9
  // is laid in mirrored tiles, then the gold embroidery of C5 and C16 is drawn near the edge: a scrolling line with small leaves.
  function brimTexIo() {
    const W = 2048, H = 256, c = cvs(W, H), g = c.getContext('2d'), t = ctex(c), NT = 10;
    const trim = () => {
      g.strokeStyle = 'rgba(214,170,84,0.92)'; g.fillStyle = 'rgba(224,182,96,0.95)'; g.lineWidth = 2.2; g.lineCap = 'round';
      const N = 44, y0 = H * 0.105, amp = H * 0.036;
      g.beginPath(); for (let x = 0; x <= W; x += 2) { const y = y0 + amp * Math.sin((x / W) * TAU * N); if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
      for (let k = 0; k < N * 2; k++) { const x = (k + 0.5) / (N * 2) * W, up = k % 2 ? 1 : -1; g.beginPath(); g.ellipse(x, y0 + up * amp * 1.9, 2.4, 4.6, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + W / (N * 8), y0 + up * amp * 0.2, 1.6, 0, TAU); g.fill(); }
      g.lineWidth = 1.4; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(0, H * 0.030); g.lineTo(W, H * 0.030); g.stroke(); g.setLineDash([]);
    };
    g.fillStyle = (BAKED && BAKED.feltCol) || '#481324'; g.fillRect(0, 0, W, H); trim();
    onBaked('felt', (im) => { const tw = W / NT, th = tw; for (let i = 0; i < NT; i++) { g.save(); if (i % 2) { g.translate((i + 1) * tw, 0); g.scale(-1, 1); } else g.translate(i * tw, 0); g.drawImage(im, 0, 0, tw, th); g.drawImage(im, 0, th, tw, th); g.restore(); } trim(); t.needsUpdate = true; });
    t.wrapS = THREE.RepeatWrapping; return t;
  }

  // her hair's strands, running up the picture, in her five hair colours (dark to light, from C13). Across the picture the mix drifts
  // from mostly dark to mostly light and back, so a tress that takes one narrow strip of it is a dark tress or a sun-lightened one.
  function hairTexIo(cols, bump) {
    const W = 2048, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 5519; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = bump ? '#606060' : cols[0]; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 5200; i++) {
      const x = r() * W, u = x / W, lightness = Math.pow(0.5 + 0.5 * Math.sin(u * TAU * 4 + 0.7 + 0.9 * Math.sin(u * TAU * 3)), 1.5), k = r() * 0.50 + lightness * 0.85, ci = k < 0.30 ? 0 : k < 0.56 ? 1 : k < 0.84 ? 2 : k < 1.08 ? 3 : 4, a = 0.40 + 0.5 * r();
      g.strokeStyle = bump ? 'rgba(' + (r() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.25 + 0.4 * r()) + ')' : rgba(cols[ci], a); g.lineWidth = 0.8 + 2.4 * r();
      const wob = 6 * (r() - 0.5); g.beginPath(); g.moveTo(x, -4); g.bezierCurveTo(x + wob, H * 0.33, x - wob, H * 0.66, x, H + 4); g.stroke();
    }
    const t = ctex(c, 0, 0, !bump); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  // where a tress has hair: all of it for most of its length (the bottom half of the picture), then strands that end at different lengths, so its tip is a wisp
  function hairAlphaIo() {
    const W = 2048, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 4409; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, H * 0.5, W, H * 0.5);
    for (let i = 0; i < 1000; i++) {                // each strand narrows to a point, so a tress ends in fine tips and not in a row of square teeth
      const x = r() * W, top = H * (1 - (0.56 + 0.44 * Math.pow(r(), 0.8))), w = 4 + 9 * r(), lean = 14 * (r() - 0.5), y0 = H * 0.52, ym = (y0 + top) / 2;
      g.beginPath(); g.moveTo(x - w / 2, y0); g.quadraticCurveTo(x - w * 0.42 + lean * 0.4, ym, x + lean, top); g.quadraticCurveTo(x + w * 0.42 + lean * 0.4, ym, x + w / 2, y0); g.closePath(); g.fill();
    }
    const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.encoding = THREE.LinearEncoding; return t;
  }
  // a wisp of fringe: separate strands with gaps between them, ending at different lengths (the root at the bottom of the picture)
  function wispAlphaIo() {
    const W = 2048, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 7717; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 560; i++) { const x = r() * W, top = H * (1 - (0.50 + 0.50 * Math.pow(r(), 0.7))); g.lineWidth = 2.2 + 4.2 * r(); g.beginPath(); g.moveTo(x, H); g.bezierCurveTo(x + 9 * (r() - 0.5), H * 0.66, x + 9 * (r() - 0.5), H * 0.4, x + 11 * (r() - 0.5), top); g.stroke(); }
    const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.encoding = THREE.LinearEncoding; return t;
  }

  // ---------- her cloak (stage four): sheer burgundy chiffon with small gold dots; the bottom tenth of the picture is the
  // gold-embroidered trim that runs along every hem (F6 shows the cloth, the trim and a hem point) ----------
  function robeTexIo() {
    const W = 512, H = 512, c = cvs(W, H), g = c.getContext('2d'), own = seed; seed = 5151;
    g.fillStyle = '#6e1e35'; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x++) { const v = fbm(x * 0.21, 7.3) - 0.47; g.fillStyle = v > 0 ? 'rgba(255,170,160,' + Math.min(0.09, v * 0.3) + ')' : 'rgba(30,0,12,' + Math.min(0.16, -v * 0.5) + ')'; g.fillRect(x, 0, 1, H); }      // the weave runs down the cloth
    for (let i = 0; i < 7; i++) { const x = (i + 0.5) * W / 7, gr = g.createLinearGradient(x - 30, 0, x + 30, 0); gr.addColorStop(0, 'rgba(30,0,10,0)'); gr.addColorStop(0.5, 'rgba(30,0,10,0.17)'); gr.addColorStop(1, 'rgba(30,0,10,0)'); g.fillStyle = gr; g.fillRect(x - 30, 0, 60, H); }   // soft folds
    g.fillStyle = '#e6b958'; for (let j = 0; j < 9; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(((i + (j % 2 ? 0.5 : 0)) * 64 + 16) % W, j * 50 + 22, 2.4, 0, TAU); g.fill(); }
    const y0 = H - 56; g.fillStyle = '#541426'; g.fillRect(0, y0, W, 56); g.strokeStyle = '#dcaa45'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(0, y0 + 4); g.lineTo(W, y0 + 4); g.moveTo(0, H - 5); g.lineTo(W, H - 5); g.stroke();
    const vine = (x) => y0 + 28 + 10 * Math.sin((x / W) * TAU * 4);
    g.lineWidth = 2.6; g.beginPath(); for (let x = 0; x <= W; x += 4) { if (x) g.lineTo(x, vine(x)); else g.moveTo(x, vine(x)); } g.stroke();
    g.fillStyle = '#ecc468'; for (let k = 0; k < 16; k++) { const x = (k + 0.5) * W / 16; g.beginPath(); g.ellipse(x, vine(x) + (k % 2 ? -8 : 8), 7.5, 3.4, k % 2 ? -0.7 : 0.7, 0, TAU); g.fill(); }
    seed = own; const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; return t;
  }
  // The moss Chris asked for (November 13): "a mossy green frill" along the cloak's hems. A strip of tufts with gaps between them.
  function mossTexIo() {
    const W = 512, H = 128, c = cvs(W, H), g = c.getContext('2d'), own = seed; seed = 7723;
    const cols = ['#2f3d16', '#44531a', '#5a6b1f', '#73822a', '#8d9440', '#3a4714'];
    for (let k = 0; k < 9; k++) { const cx = (k + 0.5 + (rnd() - 0.5) * 0.5) * W / 9, wide = 14 + rnd() * 22, tall = 0.55 + rnd() * 0.45; if (rnd() > 0.60) continue;       // it grows in patches, not all along
      for (let i = 0; i < 120; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()), x = cx + Math.cos(a) * r * wide, y = H * 0.56 + Math.sin(a) * r * H * 0.36 * tall, rr = 2.2 + rnd() * 4.2;
        g.fillStyle = cols[Math.floor(rnd() * cols.length)]; g.beginPath(); g.arc(((x % W) + W) % W, y, rr, 0, TAU); g.fill(); }
      for (let i = 0; i < 7; i++) { const x = cx + (rnd() - 0.5) * wide * 1.4, y = H * 0.74; g.strokeStyle = cols[1 + Math.floor(rnd() * 3)]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 6, y + 10 + rnd() * 20); g.stroke(); } }      // a few threads hang down
    seed = own; const t = ctex(c); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function fernTexIo() {                           // one small fern frond, its stem up the middle of the picture
    const W = 128, H = 256, c = cvs(W, H), g = c.getContext('2d');
    g.strokeStyle = '#4c6420'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H - 2); g.quadraticCurveTo(W / 2 + 6, H * 0.5, W / 2 - 2, 8); g.stroke();
    for (let i = 0; i < 15; i++) { const t = i / 14, y = H - 22 - t * (H - 40), len = (1 - t * 0.82) * 50, x = W / 2 + 6 * Math.sin(t * 2.4) - 2 * t;
      for (const sd of [-1, 1]) { g.fillStyle = i % 2 ? '#7d9a2f' : '#647f24'; g.beginPath(); g.ellipse(x + sd * len * 0.5, y - len * 0.16, len * 0.52, 5.2 - t * 2.4, -sd * 0.42, 0, TAU); g.fill(); } }
    return ctex(c);
  }
