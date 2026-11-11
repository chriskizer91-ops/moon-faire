
  // ---------- textures painted in code, in her palette ----------
  const hex = (c) => { const v = parseInt(c.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
  // ---------- the painted references, baked: window.JESTER_TEX (or opts.textures) holds them as images ----------
  const BAKED = (opts.textures !== undefined ? opts.textures : (typeof window !== 'undefined' ? window.JESTER_TEX : null)) || null;
  const UPK = opts.upperScale || 0.97;             // scale of everything above the waist (applied to the first spine bone after the bind)
  const bakedImgs = {}, SKIN = (BAKED && BAKED.skin) || null;
  if (SKIN) PAL.skin = '#' + hex(SKIN).map((v) => Math.min(255, Math.round(v * 1.14)).toString(16).padStart(2, '0')).join('');   // lit cloth-side skin (the open neckline) is painted a little lighter than the self-lit face
  function onBaked(key, cb, url) {                 // cb(image) once it has decoded; false when nothing is baked under that name
    url = url || (BAKED && key && BAKED[key]);
    if (!BAKED || !url || typeof url !== 'string') return false;
    let e = bakedImgs[key];
    if (!e) { e = bakedImgs[key] = { img: new Image(), cbs: [], ok: false }; e.img.onload = () => { e.ok = true; const l = e.cbs; e.cbs = []; l.forEach((f) => f(e.img)); }; e.img.src = url; }
    if (e.ok) cb(e.img); else e.cbs.push(cb);
    return true;
  }
  function soleTex() {                               // a lugged rubber sole: welt stitching along the top, deep treads below
    const W = Math.round(512 * TEXS), H = Math.round(64 * TEXS), c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = '#1c161a'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 28; i++) { const x = (i + 0.5) / 28 * W; g.fillStyle = '#060406'; g.fillRect(x - W / 28 * 0.17, H * 0.42, W / 28 * 0.34, H * 0.58); g.fillStyle = 'rgba(90,76,84,0.5)'; g.fillRect(x + W / 28 * 0.17, H * 0.44, W / 28 * 0.08, H * 0.56); }
    g.fillStyle = '#3a2c2c'; g.fillRect(0, H * 0.16, W, H * 0.16); g.fillStyle = '#b8a890';
    for (let i = 0; i < 90; i++) g.fillRect((i + 0.2) / 90 * W, H * 0.215, W / 90 * 0.55, Math.max(1, H * 0.05));
    return ctex(c);
  }
  function bakedTex(key, W, H, fill) {             // a canvas that becomes the baked image once it has decoded
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g = c.getContext('2d'); g.fillStyle = fill; g.fillRect(0, 0, W, H);
    const t = ctex(c); onBaked(key, (im) => { g.drawImage(im, 0, 0, W, H); t.needsUpdate = true; }); return t;
  }
  function tileBaked(g, im, W, H, nx, ny) {        // mirrored tiles, so a painted swatch repeats without a seam
    const tw = W / nx, th = H / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      g.save(); g.translate(i * tw + (i % 2 ? tw : 0), j * th + (j % 2 ? th : 0)); g.scale(i % 2 ? -1 : 1, j % 2 ? -1 : 1);
      g.drawImage(im, 0, 0, tw + 0.6, th + 0.6); g.restore();
    }
  }
  function blobs(g, W, H, n, cols, rmin, rmax, amin, amax, mode) {
    g.save(); if (mode) g.globalCompositeOperation = mode;
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H, r = rr(rmin, rmax), c = cols[(rnd() * cols.length) | 0], a = rr(amin, amax);
      for (const dx of [0, -W, W]) {
        if (x + dx + r < 0 || x + dx - r > W) continue;
        const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(x + dx - r, y - r, r * 2, r * 2);
      }
    }
    g.restore();
  }
  function dot(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  function star4(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y - r);
    g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r);
    g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  // woven fabric with a soft nap: used for velvet and plain cloth
  function fabricTex(S, base, hi, lo, rep, streak, bake, tiles, wash) {
    if (bake && BAKED && BAKED[bake]) S = Math.max(S, 512);
    S = Math.round(S * TEXS); const c = cvs(S, S), g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 260, [hi], S * 0.02, S * 0.09, 0.03, 0.10);
    blobs(g, S, S, 200, [lo], S * 0.02, S * 0.10, 0.05, 0.16);
    g.globalAlpha = 0.07;
    for (let i = 0; i < S * 5; i++) { g.fillStyle = rnd() < 0.5 ? hi : lo; const x = rnd() * S, y = rnd() * S; g.fillRect(x, y, streak ? 1 : rr(1, 3), streak ? rr(4, S * 0.06) : 1); }
    g.globalAlpha = 1;
    const t = ctex(c, rep || 1, rep || 1);
    onBaked(bake, (im) => { tileBaked(g, im, S, S, tiles || 2, tiles || 2); if (wash) { g.fillStyle = wash; g.fillRect(0, 0, S, S); } t.needsUpdate = true; });
    return t;
  }
  // sheer veil: color and alpha canvases. o: { top, bottom, stripes, stripeCols, trim, a0, sequins, center, motif }
  function veilTex(W, H, o) {
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g0 = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d'); let g = g0;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, o.top); gr.addColorStop(0.55, o.mid || o.bottom); gr.addColorStop(1, o.bottom);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 220, o.mottle || [o.top, o.bottom], W * 0.03, W * 0.12, 0.05, 0.22);
    blobs(g, W, H, 60, [o.glow || o.top], W * 0.02, W * 0.07, 0.08, 0.25, 'lighter');
    // long soft streaks that follow the fall of the cloth
    for (let i = 0; i < 160; i++) {
      const x = rnd() * W, w = rr(1, W * 0.012), y0 = rnd() * H * 0.8, l = rr(H * 0.1, H * 0.5);
      const sg = g.createLinearGradient(0, y0, 0, y0 + l), col = rnd() < 0.5 ? (o.glow || o.top) : o.dark || o.bottom;
      sg.addColorStop(0, rgba(col, 0)); sg.addColorStop(0.5, rgba(col, rr(0.08, 0.25))); sg.addColorStop(1, rgba(col, 0));
      g.fillStyle = sg; g.fillRect(x, y0, w, l);
    }
    const folds = (g, kf) => {                    // soft dark valleys between the gold lines, as cloth gathers
      const nf = o.stripes || 12;
      for (let i = 0; i < nf; i++) { const x0 = (i / nf) * W, fg = g.createLinearGradient(x0, 0, x0 + W / nf, 0); fg.addColorStop(0, rgba(o.glow || o.top, 0.16 * kf)); fg.addColorStop(0.5, rgba(o.dark || '#000000', 0.55 * kf)); fg.addColorStop(1, rgba(o.glow || o.top, 0.16 * kf)); g.fillStyle = fg; g.fillRect(x0, 0, W / nf + 1, H); }
    };
    if (o.folds) folds(g, o.folds);
    const cd = cvs(W, H); g = cd.getContext('2d');   // the gold work is painted on its own layer
    const a0 = Math.round(255 * o.a0);
    ga.fillStyle = 'rgb(' + a0 + ',' + a0 + ',' + a0 + ')'; ga.fillRect(0, 0, W, H);
    blobs(ga, W, H, 160, ['#ffffff'], W * 0.02, W * 0.1, 0.03, 0.14);
    blobs(ga, W, H, 160, ['#000000'], W * 0.02, W * 0.1, 0.03, 0.16);
    const both = (fn) => { fn(g, false); fn(ga, true); };
    const gold = [PAL.gold, PAL.goldHi, PAL.orange];
    if (o.motif) {                                // faint brocade diamonds
      g.strokeStyle = rgba(o.motif, 0.35); g.lineWidth = Math.max(1, W / 512);
      const st = W / 14;
      for (let y = -st; y < H + st; y += st) for (let x = -st; x < W + st; x += st) {
        const ox = (Math.round(y / st) % 2) * st / 2;
        g.beginPath(); g.moveTo(x + ox, y - st * 0.3); g.lineTo(x + ox + st * 0.22, y); g.lineTo(x + ox, y + st * 0.3); g.lineTo(x + ox - st * 0.22, y); g.closePath(); g.stroke();
        dot(g, x + ox, y, W / 420, rgba(o.motif, 0.6));
      }
    }
    // dotted gold lines running down the cloth
    const ns = o.stripes || 0;
    for (let i = 0; i <= ns; i++) {
      const x = (i / ns) * W, heavy = o.center && i === ns / 2, col = gold[i % 3];
      const lines = heavy ? [-W * 0.018, -W * 0.006, W * 0.006, W * 0.018] : (i % 2 ? [0] : [-W * 0.004, W * 0.004]);
      for (const dx of lines) {
        const step = heavy ? H / 150 : H / (110 + (i % 3) * 20), r = (heavy ? W / 330 : W / 480) * (o.dotScale || 1);
        for (let y = rnd() * step; y < H; y += step) {
          const jx = (rnd() - 0.5) * r * 0.6, rr2 = r * rr(0.7, 1.25);
          both((q, al) => dot(q, x + dx + jx, y, rr2, al ? '#fff' : (rnd() < 0.25 ? PAL.goldHi : col)));
        }
      }
      if (heavy) {                                // little diamonds down the middle
        for (let y = H * 0.02; y < H; y += H / 28) both((q, al) => { q.fillStyle = al ? '#fff' : PAL.goldHi; star4(q, x, y, W / 110); });
      }
    }
    // scattered sequins
    for (let i = 0; i < (o.sequins || 0); i++) {
      const x = rnd() * W, y = rnd() * H, r = rr(W / 900, W / 420), col = gold[(rnd() * 3) | 0];
      both((q, al) => dot(q, x, y, r, al ? '#eee' : col));
    }
    // hem and side trims: a solid cord, a row of beads, and small scallops
    const tw = H * (o.trim || 0.02);
    both((q, al) => {
      q.fillStyle = al ? '#fff' : PAL.gold; q.fillRect(0, H - tw * 0.35, W, tw * 0.35);
      for (let x = 0; x < W; x += tw * 0.7) { dot(q, x, H - tw * 0.72, tw * 0.22, al ? '#fff' : PAL.goldHi); }
      q.fillStyle = al ? '#fff' : PAL.orange; q.fillRect(0, H - tw * 1.15, W, tw * 0.12);
      const sw = W * (o.sideTrim || 0.008);
      for (const x0 of [0, W - sw]) { q.fillStyle = al ? '#fff' : PAL.gold; q.fillRect(x0, 0, sw, H); }
      for (let y = 0; y < H; y += sw * 1.8) { dot(q, sw * 1.9, y, sw * 0.5, al ? '#fff' : PAL.goldHi); dot(q, W - sw * 1.9, y, sw * 0.5, al ? '#fff' : PAL.goldHi); }
    });
    g0.drawImage(cd, 0, 0);
    const map = ctex(c), alpha = ctex(ca, 0, 0, false);
    if (o.whole) onBaked(o.whole, (im) => onBaked(o.whole + 'A', (ia) => {       // a whole painted cloth: its colours, its gold, its cut hem
      g0.drawImage(im, 0, 0, W, H); ga.drawImage(ia, 0, 0, W, H);
      if (o.wash) { g0.save(); g0.globalCompositeOperation = 'multiply'; g0.fillStyle = o.wash; g0.fillRect(0, 0, W, H); g0.restore(); }
      map.needsUpdate = alpha.needsUpdate = true;
    }));
    else if (o.bake) onBaked(o.bake, (im) => {                                   // a painted swatch under the gold work
      const n = o.bakeTiles || [4, 2]; tileBaked(g0, im, W, H, n[0], n[1]);
      const sh = g0.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, rgba(o.dark || '#000000', 0.45)); sh.addColorStop(0.5, rgba(o.dark || '#000000', 0.12)); sh.addColorStop(1, rgba(o.dark || '#000000', 0)); g0.fillStyle = sh; g0.fillRect(0, 0, W, H);
      if (o.folds) folds(g0, o.folds * 0.7); g0.drawImage(cd, 0, 0); map.needsUpdate = true;
    });
    return { map, alpha };
  }
  // ragged black cloth for the skirt: color and a cut-out alpha with a torn hem and worn holes
  function raggedTex(W, H, base, hi, lo, bake) {
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 200, [hi], W * 0.02, W * 0.08, 0.04, 0.14);
    blobs(g, W, H, 200, [lo], W * 0.02, W * 0.1, 0.1, 0.3);
    for (let i = 0; i < 420; i++) {                // gathers
      const x = rnd() * W, y0 = rnd() * H * 0.6, l = rr(H * 0.2, H * 0.8), col = rnd() < 0.45 ? hi : lo;
      const sg = g.createLinearGradient(0, y0, 0, y0 + l); sg.addColorStop(0, rgba(col, 0)); sg.addColorStop(0.5, rgba(col, rr(0.1, 0.3))); sg.addColorStop(1, rgba(col, 0));
      g.fillStyle = sg; g.fillRect(x, y0, rr(1, W * 0.008), l);
    }
    const eg = g.createLinearGradient(0, H * 0.8, 0, H); eg.addColorStop(0, rgba(hi, 0)); eg.addColorStop(1, rgba(hi, 0.35)); g.fillStyle = eg; g.fillRect(0, H * 0.8, W, H * 0.2);
    ga.fillStyle = '#fff'; ga.fillRect(0, 0, W, H); ga.fillStyle = '#000';
    for (let x = 0; x < W;) {                      // torn notches along the hem
      const w = rr(W * 0.006, W * 0.03), d = rr(H * 0.01, H * 0.07);
      ga.beginPath(); ga.moveTo(x, H); ga.lineTo(x + w * rr(0.3, 0.7), H - d); ga.lineTo(x + w, H); ga.closePath(); ga.fill(); x += w * rr(0.6, 1.3);
    }
    for (let i = 0; i < 90; i++) { const x = rnd() * W, y = H * rr(0.72, 0.98); ga.beginPath(); ga.ellipse(x, y, rr(1, W * 0.006), rr(2, H * 0.02), rr(-0.3, 0.3), 0, TAU); ga.fill(); }
    const map = ctex(c);
    onBaked(bake, (im) => { tileBaked(g, im, W, H, 6, 2); g.fillStyle = eg; g.fillRect(0, H * 0.8, W, H * 0.2); map.needsUpdate = true; });
    return { map, alpha: ctex(ca, 0, 0, false) };
  }
  // purple leggings with a black flocked floral pattern; the white striped sock band sits at the boot top
  function leggingsTex() {
    const W = Math.round(512 * TEXS), H = Math.round(1024 * TEXS), c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = PAL.purple; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 140, [PAL.purpleHi], W * 0.04, W * 0.16, 0.08, 0.25);
    blobs(g, W, H, 100, [PAL.purpleDk], W * 0.04, W * 0.14, 0.08, 0.22);
    const ink = '#150c1c';
    for (let i = 0; i < 230; i++) {
      const x = rnd() * W, y = rnd() * H * 0.80, s = rr(W * 0.024, W * 0.056), rot = rnd() * TAU, k = rnd();
      for (const dx of [0, -W, W]) {
        g.save(); g.translate(x + dx, y); g.rotate(rot); g.fillStyle = ink;
        if (k < 0.55) { for (let p = 0; p < 4; p++) { g.rotate(TAU / 4); g.beginPath(); g.ellipse(0, s * 0.62, s * 0.3, s * 0.52, 0, 0, TAU); g.fill(); } dot(g, 0, 0, s * 0.22, ink); }
        else if (k < 0.8) { g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.8, 0, 0, s); g.quadraticCurveTo(-s * 0.8, 0, 0, -s); g.fill(); }
        else { for (let p = 0; p < 5; p++) dot(g, rr(-s, s), rr(-s, s), s * rr(0.1, 0.25), ink); }
        g.restore();
      }
    }
    for (let i = 0; i < 500; i++) dot(g, rnd() * W, rnd() * H * 0.80, rr(0.8, 2.4) * TEXS, ink);
    const y0 = H * 0.800, y1 = H * 0.885;             // sock band
    g.fillStyle = '#ded9e6'; g.fillRect(0, y0, W, y1 - y0);
    g.fillStyle = '#6d6580'; g.fillRect(0, y0 + (y1 - y0) * 0.28, W, (y1 - y0) * 0.14); g.fillRect(0, y0 + (y1 - y0) * 0.6, W, (y1 - y0) * 0.14);
    g.fillStyle = '#0d0a10'; g.fillRect(0, y1, W, H - y1);
    const t = ctex(c);
    onBaked('leggings', (im) => { g.save(); g.beginPath(); g.rect(0, 0, W, y0); g.clip(); tileBaked(g, im, W, y0, 2, 4); g.restore(); t.needsUpdate = true; });
    return t;
  }
  // black ruffle lace: opaque cloth that breaks into a scalloped lace edge (v = 1 is the edge)
  function laceTex() {
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d');
    g.fillStyle = '#2a2127'; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 120, ['#463a42'], W * 0.02, W * 0.08, 0.08, 0.3);
    for (let i = 0; i < 200; i++) { g.fillStyle = rgba(rnd() < 0.5 ? '#40344a' : '#000000', 0.25); g.fillRect(rnd() * W, 0, rr(1, 3), H); }
    const eg = g.createLinearGradient(0, H * 0.6, 0, H); eg.addColorStop(0, 'rgba(70,58,82,0)'); eg.addColorStop(1, 'rgba(92,78,104,0.55)'); g.fillStyle = eg; g.fillRect(0, H * 0.6, W, H * 0.4);
    ga.fillStyle = '#fff'; ga.fillRect(0, 0, W, H); ga.fillStyle = '#000';
    const n = 16, sw = W / n;
    for (let i = 0; i < n; i++) {
      ga.beginPath(); ga.moveTo(i * sw, H); ga.quadraticCurveTo(i * sw, H * 0.86, i * sw + sw * 0.08, H * 0.86); ga.lineTo(i * sw - sw * 0.08, H * 0.86); ga.closePath(); ga.fill();
      ga.beginPath(); ga.moveTo(i * sw - sw * 0.2, H); ga.quadraticCurveTo(i * sw, H * 0.8, i * sw + sw * 0.2, H); ga.fill();
      for (let k = 0; k < 3; k++) dot(ga, i * sw + sw * (0.3 + 0.2 * k), H * 0.82, sw * 0.055, '#000');
      dot(ga, i * sw + sw * 0.5, H * 0.68, sw * 0.07, '#000');
    }
    const map = ctex(c);
    onBaked('ruffle', (im) => { tileBaked(g, im, W, H, 2, 1); const e2 = g.createLinearGradient(0, H * 0.45, 0, H); e2.addColorStop(0, 'rgba(104,92,112,0)'); e2.addColorStop(1, 'rgba(112,98,120,0.34)'); g.fillStyle = e2; g.fillRect(0, H * 0.45, W, H * 0.55);
      const e3 = g.createLinearGradient(0, 0, 0, H * 0.5); e3.addColorStop(0, 'rgba(0,0,0,0.5)'); e3.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = e3; g.fillRect(0, 0, W, H * 0.5); map.needsUpdate = true; });
    return { map, alpha: ctex(ca, 0, 0, false) };
  }

  // ---------- material helpers ----------
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();     // r128 takes material colours as linear values
  function sheen(mat, col, pw, k) {                  // a soft rim, the way velvet and sheer cloth catch light at a glancing angle
    mat.userData.sheen = { c: lin(col), p: pw, k: k };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uSheenC = { value: mat.userData.sheen.c }; sh.uniforms.uSheenP = { value: mat.userData.sheen.p }; sh.uniforms.uSheenK = { value: mat.userData.sheen.k };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSheenC; uniform float uSheenP; uniform float uSheenK;')
        .replace('#include <tonemapping_fragment>', 'float sFr = pow(1.0 - saturate(abs(dot(normalize(vViewPosition), normal))), uSheenP);\n gl_FragColor.rgb += uSheenC * (sFr * uSheenK * (0.35 + 0.65 * saturate(normal.y * 0.5 + 0.5)));\n#include <tonemapping_fragment>');
    };
    return mat;
  }
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ skinning: true }, o));
  const phys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ skinning: true }, o));
