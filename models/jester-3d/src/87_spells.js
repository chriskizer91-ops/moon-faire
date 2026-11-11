  // ---------- four more of her spells, from the move sheet (assets/design/moves_v03.json): Ill Omen, Stop, Royal Reversal, The Last Toll ----------
  FP.two = [0.62, 0.02, 0.05, 0.90, 0.93, 0.15]; FP.pinch = [0.52, 0.40, 0.44, 0.20, 0.12, 0.6]; FP.loose = FP.relax.map((v, i) => lerp(v, FP.fist[i], 0.55));
  COL.silver = [0.84, 0.88, 1.0]; COL.dusk = [0.36, 0.12, 0.70];
  const spriteN = (tex, order) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true, opacity: 0 })); s.visible = false; s.renderOrder = order || 27; fx.add(s); fxAuto.push(s); return s; };
  const showN = (s, p, size, op, rot) => { if (op <= 0.003) { s.visible = false; return; } s.visible = true; s.position.copy(p); s.scale.set(size, size, 1); s.material.opacity = Math.min(1, op); if (rot != null) s.material.rotation = rot; };
  const spriteA = (tex, col, order) => { const s = sprite(tex, col, order); fxAuto.push(s); return s; };
  // a crooked star: black at heart, violet at the rim
  const omenPath = (g, m, k) => { const R = [1.0, 0.34, 0.62, 0.26, 0.96, 0.42, 0.52, 0.30, 0.80, 0.30], A = [0.03, 0.12, 0.19, 0.30, 0.44, 0.50, 0.63, 0.72, 0.78, 0.92]; g.beginPath(); for (let i = 0; i < 10; i++) { const a = A[i] * TAU - PI / 2, r = R[i] * m * k; if (i) g.lineTo(r * Math.cos(a), r * Math.sin(a)); else g.moveTo(r * Math.cos(a), r * Math.sin(a)); } g.closePath(); };
  const omenTex = (function () {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m);
    g.shadowColor = 'rgba(150,70,255,0.9)'; g.shadowBlur = 22; omenPath(g, m, 0.80); g.fillStyle = 'rgba(40,10,80,1)'; g.fill(); g.fill();
    g.shadowBlur = 0; const gr = g.createRadialGradient(0, 0, 0, 0, 0, m * 0.8); gr.addColorStop(0, 'rgba(4,0,10,1)'); gr.addColorStop(0.55, 'rgba(14,2,34,1)'); gr.addColorStop(1, 'rgba(70,22,130,1)'); omenPath(g, m, 0.80); g.fillStyle = gr; g.fill();
    g.lineJoin = 'round'; g.lineWidth = 3.2; g.strokeStyle = 'rgba(206,150,255,0.95)'; g.stroke();
    return ctex(c, 0, 0, true);
  })();
  const omenGlowTex = (function () { const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.shadowColor = '#fff'; g.shadowBlur = 18; g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = '#fff'; omenPath(g, m, 0.80); g.stroke(); return ctex(c, 0, 0, false); })();
  // a clock without numerals: a ring, a finer ring, twelve spokes
  const clockTex = (function () {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round'; g.shadowColor = '#fff'; g.shadowBlur = 12;
    g.lineWidth = 8; g.beginPath(); g.arc(0, 0, m * 0.88, 0, TAU); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, m * 0.78, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, m * 0.20, 0, TAU); g.stroke();
    for (let k = 0; k < 12; k++) { g.lineWidth = k % 3 === 0 ? 4.5 : 2; g.beginPath(); g.moveTo(0, -m * (k % 3 === 0 ? 0.22 : 0.44)); g.lineTo(0, -m * 0.76); g.stroke(); g.rotate(TAU / 12); }
    for (let k = 0; k < 60; k++) { g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -m * 0.80); g.lineTo(0, -m * 0.86); g.stroke(); g.rotate(TAU / 60); }
    g.beginPath(); g.arc(0, 0, m * 0.045, 0, TAU); g.fill();
    return ctex(c, 0, 0, false);
  })();
  // a dark halo: night inside, a violet rim
  const haloTex = (function () {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, 'rgba(6,0,14,0.94)'); gr.addColorStop(0.58, 'rgba(10,2,26,0.90)'); gr.addColorStop(0.74, 'rgba(60,20,120,0.92)'); gr.addColorStop(0.80, 'rgba(170,96,255,0.95)'); gr.addColorStop(0.87, 'rgba(90,34,190,0.40)'); gr.addColorStop(1, 'rgba(60,20,140,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return ctex(c, 0, 0, true);
  })();
  const omenDark = spriteN(omenTex, 28), omenGlow = spriteA(omenGlowTex, [0.72, 0.36, 1.0], 29), clock = spriteA(clockTex, [0.74, 0.40, 1.0], 29), clock2 = spriteA(clockTex, [0.95, 0.80, 1.0], 29), halo = spriteN(haloTex, 26);
  const gX1 = spriteA(glowTex, COL.violet), gX2 = spriteA(glowTex, COL.pale), gX3 = spriteA(glowTex, COL.dusk);
  const ease = (u) => u * u * (3 - 2 * u);
  const _rx = V3(1, 0, 0), _fwd = V3(0, 0, 1);

  // Ill Omen (cast 1 s, recovery 1 s; one enemy): two fingers to her pendant, a black-violet spark that curls into a crooked star, flicked at the target
  const OMEN_TOUCH = [-0.061, 1.178, 0.153];
  defAction('ill_omen', 2.0, [
    { t: 0.10, hd: [0.06, -0.03, 0.05], eyes: 0.2 },
    { t: 0.27, hR: OMEN_TOUCH, eR: [-1, -1, 0], fR: FP.two, twR: 0.3, wrR: [0.3, -0.8], hd: [0.04, 0.07, 0.04], eyes: 0.2 },
    { t: 0.42, hR: OMEN_TOUCH },
    { t: 0.62, hR: [-0.19, 1.27, 0.25], twR: 1.0, wrR: [-0.25, 0], eR: [-0.6, -1, -0.2], hd: [-0.08, 0.02, 0.04], eyes: 0.45 },
    { t: 0.82, hR: [-0.23, 1.31, 0.21], sp: [-0.10, 0, 0], hd: [0.22, 0, 0.03], eyes: 0.3 },
    { t: 0.93, hR: [-0.27, 1.36, 0.14], sp: [-0.18, -0.02, 0], wrR: [0.3, 0] },
    { t: 1.03, hR: [0.37, 1.31, 0.21], eR: [0, -1, -0.2], twR: -0.2, wrR: [-0.55, 0], fR: FP.open, sp: [0.50, 0.05, 0], hipR: [0.16, 0, 0], hd: [0.34, 0, 0], eyes: 0, mouth: 2 },
    { t: 1.28, hR: [0.34, 1.28, 0.21] },
    { t: 1.58, hR: [0.12, 1.10, 0.20], fR: FP.loose, twR: 0.3, wrR: [0.1, 0], sp: [0.14, 0, 0], hipR: [0, 0, 0], hd: [0.14, 0, 0] },
    { t: 1.82, mouth: 0 }
  ], { hits: [1.0 / 2.0], cues: [0.27 / 2.0], outro: 0.3, fx(a, t, dt) {
    const T = a.t, tip = anchor('tipR', _h1), pen = anchor('pendant', _h2);
    dim(0.3 * win(T, 0.3, 1.5, 0.3));
    const glint = win(T, 0.24, 0.52, 0.08);                                          // the pendant answers her touch
    if (glint > 0.01) { show(gX2, pen, 0.10 + 0.05 * glint, glint); show(gX1, pen, 0.30, 0.6 * glint); light(pen, 0.5 * glint, 0x60e0d0); }
    if (cue(a, 'touch', 0.27)) { shock(pen, 0.02, 0.16, 0.35, COL.pale); burst(pen, 14, 0.4, 0.5, 0.03, COL.violet, 0, 2); }
    const held = win(T, 0.36, 1.02, 0.06);
    if (held > 0.01) {                                                                // the spark, then the star, riding above her fingertips
      const k = sm(0.44, 0.66, T), p = above(_c1, tip, 0.02 + 0.07 * k), size = lerp(0.03, 0.135, ease(k)) * (1 + 0.05 * Math.sin(T * 11)), rot = 4.2 * Math.pow(1 - k, 2) + 0.12 * Math.sin(T * 3.1);
      showN(omenDark, p, size, held * sm(0.40, 0.52, T), rot); show(omenGlow, p, size * 1.12, 0.9 * held * k, rot); show(gX3, p, size * 3.2, 0.8 * held); show(gX2, p, 0.05 * (1 - k) + 0.012, held * (1 - 0.7 * k)); light(p, 0.6 * held);
      if (Math.random() < 30 * dt) { const an = Math.random() * TAU, r = size * 0.9; kindNext = 1; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z, -Math.sin(an) * 0.3 - Math.cos(an) * 0.25, Math.cos(an) * 0.3 - Math.sin(an) * 0.25, 0, 0.5, 0.03, Math.random() < 0.6 ? COL.dusk : COL.violet, 0, 0.6); kindNext = 0; }
      a.from = (a.from || V3()).copy(p);
    }
    if (cue(a, 'release', 1.0)) { toward(fxHitP, anchor('chest', _c2), 2.6); fxHitP.y += 0.12; shock(a.from || tip, 0.03, 0.3, 0.3, COL.violet); }
    const fly = win(T, 1.0, 1.9, 0.04);
    if (fly > 0.01 && a.from) {                                                       // it crosses to the target and hangs over them
      const u = sm(1.0, 1.3, T), p = _c1.copy(a.from).lerp(fxHitP, u); p.y += 0.16 * Math.sin(u * PI);
      const hang = 1 - sm(1.55, 1.9, T), size = 0.135 + 0.16 * sm(1.28, 1.42, T);
      showN(omenDark, p, size, fly * hang, -T * 3.5 * (1 - u) + 0.3 * Math.sin(T * 2)); show(omenGlow, p, size * 1.12, 0.9 * fly * hang, omenDark.material.rotation); show(gX3, p, size * 3.4, 0.8 * fly * hang); light(p, 0.7 * fly * hang);
      if (u < 1) for (let i = 0; i < 3; i++) emit(p.x + rs() * 0.03, p.y + rs() * 0.03, p.z + rs() * 0.03, rs() * 0.1, rs() * 0.1, rs() * 0.1, 0.45, 0.04, Math.random() < 0.5 ? COL.dusk : COL.violet, 0, 1);
      else if (Math.random() < 18 * dt) motes(p, 1, 0.12, 0.8, 0.045, COL.dusk, -0.25);
      if (cue(a, 'land', 1.3)) { shock(p, 0.7, 0.10, 0.4, COL.violet); shock(p, 0.08, 0.55, 0.5, COL.dusk); burst(p, 46, 1.0, 0.7, 0.045, COL.violet, 0.4, 1.8); }
    }
  } });

  // Stop (cast 3 s, recovery 1 s): her palm comes up, a clock-ring turns before it, slows, stills, then locks round the target and breaks into hanging points
  defAction('stop', 4.0, [
    { t: 0.22, hL: [0.33, 1.14, 0.22], eL: [1, -0.8, -0.3], fL: FP.soft, twL: 0.6, hd: [0.2, 0.05, 0], sp: [0.12, 0, 0] },
    { t: 0.50, hL: [0.50, 1.38, 0.15], eL: [0.3, -1, -0.4], fL: FP.open, twL: -0.4, wrL: [-0.95, 0], sp: [0.36, 0, 0], hipR: [0.12, 0, 0], hd: [0.42, 0, 0], hR: [-0.27, 0.90, 0.02] },
    { t: 2.50, hL: [0.50, 1.38, 0.15] },
    { t: 2.62, hL: [0.44, 1.37, 0.16], sp: [0.32, 0, 0] },
    { t: 2.80, hL: [0.60, 1.40, 0.13], sp: [0.44, 0.02, 0] },
    { t: 3.00, hL: [0.55, 1.39, 0.14], fL: FP.grip, wrL: [-0.5, 0] },
    { t: 3.50, hL: [0.48, 1.33, 0.15] },
    { t: 3.78, hL: [0.31, 0.95, 0.10], fL: FP.relax, wrL: [0.1, 0], twL: 0, sp: [0, 0, 0], hipR: [0, 0, 0], hd: [0, 0, 0], eL: 'rest', hR: 'rest' }
  ], { hits: [3.0 / 4.0], cues: [0.5 / 4.0, 2.0 / 4.0], outro: 0.22, start(a) { a.rot = 0; }, fx(a, t, dt) {
    const T = a.t, palm = anchor('handL', _h1);
    dim(0.45 * win(T, 0.5, 3.3, 0.4));
    const w = 5.2 * (1 - sm(1.3, 2.05, T)); a.rot -= w * dt;                           // it turns, slower and slower, and is still by two seconds
    const k = sm(0.45, 0.55, T) * (1 - sm(3.05, 3.10, T));
    if (k > 0.01) {
      const go = ease(sm(2.5, 2.98, T)), near = toward(_c1, palm, 0.17); if (T < 2.5 || !a.near) a.near = (a.near || V3()).copy(near);
      if (go > 0 && !a.fired.aim) { a.fired.aim = true; toward(fxHitP, anchor('chest', _c2), 2.6); }
      const p = go > 0 ? _c1.copy(a.near).lerp(fxHitP, go) : near, grow = sm(0.45, 0.85, T), size = lerp(0.34 * grow, 1.0, go) * (1 - 0.10 * sm(2.98, 3.06, T));
      const still = sm(2.0, 2.1, T) * (1 - sm(2.5, 2.6, T));
      show(clock, p, size, k, a.rot); show(clock2, p, size * 0.46, 0.7 * k * (1 - still * 0.5), -a.rot * 0.5); show(gX1, p, size * 1.6, 0.45 * k); light(p, 0.8 * k);
      if (w > 0.4 && Math.random() < 6 * w * dt) { const an = Math.random() * TAU, r = size * 0.44; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z, Math.sin(an) * 0.08 * w, -Math.cos(an) * 0.08 * w, 0, 0.5, 0.03, Math.random() < 0.5 ? COL.pale : COL.violet, 0, 0.8); }
      a.at = (a.at || V3()).copy(p); a.size = size;
    }
    if (cue(a, 'still', 2.05)) shock(a.at || palm, 0.30, 0.05, 0.35, COL.pale);
    if (cue(a, 'lock', 3.0)) { const p = fxHitP; shock(p, 0.95, 0.42, 0.22, COL.pale); shock(p, 0.2, 0.9, 0.5, COL.violet); }
    if (cue(a, 'break', 3.08)) {                                                       // the ring comes apart into points that hang where they were
      const p = fxHitP, R = 0.44; _rx.set(1, 0, 0).applyQuaternion(_rq);
      for (let i = 0; i < 72; i++) { const an = i / 72 * TAU; emit(p.x + R * Math.cos(an) * _rx.x, p.y + R * Math.sin(an), p.z + R * Math.cos(an) * _rx.z, 0, 0, 0, 0.75 + 0.35 * Math.random(), 0.045 + 0.02 * Math.random(), i % 3 ? COL.violet : COL.pale, 0, 0); }
      for (let k2 = 0; k2 < 12; k2++) for (let j = 0; j < 4; j++) { const an = k2 / 12 * TAU, r = R * (0.30 + 0.17 * j); emit(p.x + r * Math.cos(an) * _rx.x, p.y + r * Math.sin(an), p.z + r * Math.cos(an) * _rx.z, 0, 0, 0, 0.55 + 0.4 * Math.random(), 0.035, COL.pale, 0, 0); }
    }
    const hang = win(T, 3.0, 3.8, 0.2); if (hang > 0.01) { show(gX1, fxHitP, 1.3, 0.35 * hang); light(fxHitP, 0.5 * hang); }
  } });

  // Royal Reversal (cast 2 s, recovery 1 s; one ally): she lifts an edge of her veil, bows, and a small mirror forms, turns its dark face out, lights, and goes to stand by her ally
  const mirror = new THREE.Group(), mirrorSpin = new THREE.Group(); mirror.add(mirrorSpin); mirror.visible = false; fx.add(mirror); fxAuto.push(mirror);
  const crescM = new THREE.MeshStandardMaterial({ color: lin(0x5a4a70), roughness: 0.35, metalness: 0.7, emissive: lin(0xd9b8ff), emissiveIntensity: 0 });
  (function () {
    const RX = 0.074, RY = 0.094, disc = new THREE.CircleGeometry(1, Q(48, 24));
    const silver = new THREE.MeshStandardMaterial({ color: lin(0xdcd4f4), roughness: 0.10, metalness: 1, envMapIntensity: 2.2, emissive: lin(0x7a5ac8), emissiveIntensity: 0.30 });
    const dark = new THREE.MeshStandardMaterial({ color: lin(0x0a0612), roughness: 0.22, metalness: 0.7, envMapIntensity: 0.7, emissive: lin(0x2a0a50), emissiveIntensity: 0.25 });
    const frameM = new THREE.MeshStandardMaterial({ color: lin(0xcac6dc), roughness: 0.26, metalness: 1, envMapIntensity: 1.7 });
    const f = new THREE.Mesh(disc, silver); f.scale.set(RX, RY, 1); f.position.z = 0.003; const b = new THREE.Mesh(disc, dark); b.scale.set(RX, RY, 1); b.rotation.y = PI; b.position.z = -0.003;
    const fr = new THREE.Mesh(new THREE.TorusGeometry(1, 0.085, 10, Q(56, 28)), frameM); fr.scale.set(RX, RY, 0.09);
    const R = 0.034, r = 0.0300, d = 0.0165, y0 = (r * r - R * R - d * d) / (2 * d), x0 = Math.sqrt(R * R - y0 * y0), a0 = Math.atan2(y0, x0), b0 = Math.atan2(y0 + d, x0), pts = [];
    for (let i = 0; i <= 24; i++) { const an = a0 + (PI - 2 * a0) * i / 24; pts.push(new THREE.Vector2(R * Math.cos(an), R * Math.sin(an))); }
    for (let i = 1; i < 24; i++) { const an = PI - b0 - (PI - 2 * b0) * i / 24; pts.push(new THREE.Vector2(r * Math.cos(an), r * Math.sin(an) - d)); }
    const cr = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.005, bevelEnabled: false }), crescM); cr.position.set(0, RY + 0.016, -0.0025);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.05, 8), frameM); stem.position.y = -RY - 0.022; const knob = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), frameM); knob.position.y = -RY - 0.05;
    for (const m of [f, b, fr, cr, stem, knob]) { m.castShadow = true; mirrorSpin.add(m); }
  })();
  defAction('royal_reversal', 3.0, [
    { t: 0.22, hL: [0.215, 1.02, 0.21], eL: [1, -0.6, -0.4], fL: FP.soft, twL: 0.3, hd: [0.12, 0.10, 0] },
    { t: 0.36, hL: [0.22, 1.00, 0.20], fL: FP.pinch },
    { t: 0.72, hL: [0.41, 1.13, 0.14], eL: [0.6, -1, -0.3], sp: [0, 0.24, 0], hd: [0, 0.16, 0], hip: [0, -0.03, -0.03], ftR: [-0.03, 0.012, -0.16, -0.25, 0.35], hR: [-0.24, 1.02, 0.26], eR: [-0.6, -1, -0.3], twR: 1.35, fR: FP.cup, wrR: [-0.2, 0], eyes: 0.7 },
    { t: 1.10, hR: [-0.25, 1.06, 0.27], sp: [0, 0.22, 0], hd: [-0.12, 0.10, 0], eyes: 0.2 },
    { t: 1.50, hR: [-0.26, 1.08, 0.27] },
    { t: 1.90, hR: [-0.30, 1.14, 0.24], hd: [-0.24, 0.04, 0], hL: [0.41, 1.13, 0.14] },
    { t: 2.12, hR: [-0.47, 1.23, 0.16], fR: FP.open, sp: [-0.10, 0.14, 0] },
    { t: 2.55, hL: [0.30, 0.95, 0.10], fL: FP.soft, eL: 'rest', twL: 0, hR: [-0.34, 0.98, 0.10], twR: 0.4, fR: FP.soft, wrR: 'rest', eR: 'rest', sp: [0, 0, 0], hd: [-0.06, 0, 0.03], hip: [0, 0, 0], ftR: 'rest', mouth: 2, eyes: 0 },
    { t: 2.85, mouth: 2 }
  ], { hits: [2.0 / 3.0], cues: [0.36 / 3.0, 1.125 / 3.0], outro: 0.3, grabs: true, fx(a, t, dt) {
    const T = a.t, palm = anchor('handR', _h1), tip = anchor('tipL', _h2);
    if (cue(a, 'take', 0.36)) a.held = grabCloth(tip, 0.16, 0.07, 9);                 // two fingers take the veil's edge
    if (grabbed) { if (T > 2.2) releaseGrab(); else { grabbed.grabP.copy(tip); grabbed.grabP.y -= 0.012; } }
    dim(0.3 * win(T, 0.7, 2.4, 0.3));
    const k = win(T, 0.72, 2.92, 0.12);
    if (k > 0.01) {
      const form = ease(sm(0.75, 1.12, T)), go = ease(sm(1.9, 2.4, T)), hov = above(_c1, palm, 0.20 + 0.012 * Math.sin(T * 3)); if (T < 1.9 || !a.hov) a.hov = (a.hov || V3()).copy(hov);
      if (!a.fired.aim) { a.fired.aim = true; toward(fxHitP, anchor('chest', _c2), -1.45); fxHitP.y += 0.10; fxHitP.addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), 0.25); }
      const p = go > 0 ? _c1.copy(a.hov).lerp(fxHitP, go) : hov; if (go > 0) p.y += 0.14 * Math.sin(go * PI);
      const turn = ease(sm(1.125, 1.5, T)) * PI, lit = sm(1.5, 1.72, T), out = 1 - sm(2.7, 2.92, T), sc = form * (1 + 0.9 * go) * out * (1 + 0.16 * Math.sin(PI * sm(0.75, 1.12, T)) * (1 - form));
      mirror.visible = sc > 0.01; mirror.position.copy(p); mirror.quaternion.copy(_rq); mirror.scale.setScalar(Math.max(0.001, sc)); mirrorSpin.rotation.set(0.10 * Math.sin(T * 2.1), turn + 0.12 * Math.sin(T * 1.7), 0);
      crescM.emissiveIntensity = 2.6 * lit * (0.85 + 0.15 * Math.sin(T * 9));
      show(gX1, p, 0.34 * sc, 0.6 * k * form); light(p, 0.5 * k + 0.5 * lit * out, 0xc8b0ff);
      if (lit > 0.01) { _c3.copy(p); _c3.y += 0.118 * sc; show(gX2, _c3, 0.15 * sc * (0.9 + 0.1 * Math.sin(T * 9)), 0.42 * lit * out); }
      if (form < 1 && Math.random() < 60 * dt) { const an = Math.random() * TAU, r = 0.16; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z + rs() * 0.03, -Math.cos(an) * 0.45, -Math.sin(an) * 0.45, 0, 0.32, 0.03, Math.random() < 0.5 ? COL.silver : COL.violet, 0, 0.4); }
      if (cue(a, 'formed', 1.12)) shock(p, 0.03, 0.19, 0.35, COL.silver);
      if (cue(a, 'lit', 1.5)) { shock(p, 0.04, 0.25, 0.45, COL.pale); burst(_c3.copy(p).setY(p.y + 0.118), 24, 0.5, 0.7, 0.03, COL.silver, 0.3, 1.6, 0.4); }
      if (go > 0 && go < 1 && Math.random() < 40 * dt) emit(p.x + rs() * 0.05, p.y + rs() * 0.07, p.z + rs() * 0.03, rs() * 0.05, -0.05, rs() * 0.05, 0.7, 0.035, Math.random() < 0.6 ? COL.silver : COL.violet, 0.2, 0.8);
      if (cue(a, 'placed', 2.4)) { shock(p, 0.1, 0.7, 0.6, COL.silver); shock(p, 0.6, 0.15, 0.45, COL.violet); burst(p, 30, 0.6, 0.9, 0.035, COL.silver, 0.2, 1.5); }
      if (T > 2.4 && Math.random() < 14 * dt * out) motes(p, 1, 0.16, 0.9, 0.04, COL.silver, 0.08);
    }
  } });

  // The Last Toll (cast 4 s, recovery 1 s): one hip bell lifted on its chain, violet circles gathering, the bell still in a dark halo, then one swing and a heavy pulse
  defAction('last_toll', 5.0, [
    { t: 0.40, hR: [0.045, 0.975, 0.215], eR: [-1, -0.5, -0.5], fR: FP.open, twR: 0.2, hip: [-0.02, -0.03, 0], sp: [0.20, 0.09, 0], hd: [0.26, 0.10, 0] },
    { t: 0.58, fR: FP.grip },
    { t: 1.20, hR: [-0.11, 1.45, 0.30], eR: [-1, -0.6, -0.2], twR: 0.3, sp: [0, 0, 0], hip: [0, 0, 0], hd: [0, -0.03, 0] },
    { t: 1.85, hR: [-0.11, 1.45, 0.30], hd: [0, 0, 0], eyes: 0.5 },
    { t: 2.45, hR: [-0.25, 1.52, 0.13], eR: [-1, -0.3, -0.5], sp: [-0.18, -0.03, 0], hd: [0.10, 0, -0.05], eyes: 1 },
    { t: 3.25, hR: [-0.25, 1.52, 0.13], eyes: 1 },
    { t: 3.60, hR: [-0.31, 1.61, 0.04], sp: [-0.26, -0.05, 0], eyes: 0 },
    { t: 3.86, hR: [0.06, 1.36, 0.36], eR: [-0.6, -1, -0.2], sp: [0.24, 0.10, 0], hd: [0.10, 0.08, 0], mouth: 1 },
    { t: 4.25, hR: [0.04, 1.34, 0.34], mouth: 0 },
    { t: 4.62, hR: [0.03, 1.00, 0.215], sp: [0.12, 0.05, 0], hd: [0.2, 0.08, 0] },
    { t: 4.86, fR: FP.soft }
  ], { hits: [3.9 / 5.0], cues: [0.58 / 5.0, 2.45 / 5.0], outro: 0.14, oneBell: true, fx(a, t, dt) {
    const T = a.t; if (T < 0.5 || T > 4.84) return;
    const hand = anchor('handR', _h1), len = lerp(0.10, 0.30, sm(0.6, 1.2, T)) * (1 - 0.72 * sm(4.3, 4.75, T));
    const still = win(T, 2.5, 3.5, 0.2), strike = win(T, 3.66, 3.96, 0.05); let w = 0; const drive = _c1;
    if (strike > 0.01) { drive.copy(hand).addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), len * 0.85); drive.y -= len * 0.35; w = 0.35 * strike; }
    else if (still > 0.01) { drive.copy(hand); drive.y -= len; w = 0.22 * still; }
    flail.visible = true; stepFlail(dt, hand, len, w > 0 ? drive : null, w);
    const bell = flP[FL_N - 1];
    dim(0.7 * win(T, 1.2, 4.3, 0.5));
    for (let i = 0; i < 4; i++) if (cue(a, 'c' + i, 1.25 + i * 0.3)) shock(bell, 0.62 - 0.06 * i, 0.07, 0.62, i % 2 ? COL.pale : COL.violet);      // violet circles gather round the bell
    const gather = win(T, 1.2, 3.9, 0.3);
    if (gather > 0.01) { show(gX1, bell, 0.36 + 0.06 * Math.sin(T * 5), 0.7 * gather); light(bell, 0.5 * gather); if (Math.random() < 30 * dt) { const d = _c3.set(rs(), rs(), rs()).normalize(); kindNext = 1; emit(bell.x + d.x * 0.34, bell.y + d.y * 0.34, bell.z + d.z * 0.34, -d.x * 0.6, -d.y * 0.6, -d.z * 0.6, 0.5, 0.035, COL.violet, 0, 0.2); kindNext = 0; } }
    const dk = win(T, 2.35, 3.93, 0.25);                                              // the dark halo, the bell hanging still at its heart
    if (dk > 0.01) { _c2.copy(bell).addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), -0.03); showN(halo, _c2, (0.62 + 0.03 * Math.sin(T * 2.2)) * (0.7 + 0.3 * dk), dk); }
    if (cue(a, 'toll', 3.9)) {                                                         // one swing: the toll
      const ft = anchor('feet', _c3); anchor('chest', fxHitP); _rx.set(1, 0, 0).applyQuaternion(_rq);
      shock(bell, 0.08, 3.0, 1.3, COL.pale); shock(bell, 0.05, 1.3, 0.6, COL.gold); shock(ft, 0.3, 3.6, 1.5, COL.violet, true);
      burst(bell, 40, 1.6, 0.6, 0.05, COL.gold, 0.4, 2);
      for (let i = 0; i < 150; i++) { const an = Math.random() * TAU, r = 0.31 * Math.sqrt(Math.random()); emit(bell.x + r * Math.cos(an) * _rx.x, bell.y + r * Math.sin(an), bell.z + r * Math.cos(an) * _rx.z, rs() * 0.25, 0.1 + rs() * 0.25, rs() * 0.15, 1.0 + 0.8 * Math.random(), 0.03 + 0.03 * Math.random(), Math.random() < 0.75 ? COL.silver : COL.pale, 1.5, 0.7); }   // the halo falls as silver dust
    }
    if (cue(a, 'toll2', 4.06)) { shock(bell, 0.08, 2.4, 1.3, COL.violet); shock(anchor('feet', _c3), 0.3, 2.8, 1.4, COL.pale, true); }
    if (cue(a, 'toll3', 4.24)) shock(bell, 0.08, 1.9, 1.3, COL.dusk);
    const ring = win(T, 3.88, 4.5, 0.04); if (ring > 0.01) { show(gGold, bell, 0.5 + 0.5 * ring, 0.8 * ring); light(bell, 1.6 * ring, 0xe0c0ff); }
    return 'flail';
  } });

  // ---------- Hover: she folds her legs under her and floats, a slow wheel of light on the floor beneath (a stance, so she can talk or cast from it) ----------
  defStance('hover', 2.0, [
    { t: 0.35, hip: [0, -0.07, 0], sp: [0, 0.08, 0], hR: [-0.34, 0.84, 0.10], hL: [0.34, 0.84, 0.10], twR: 0.9, twL: 0.9, fR: FP.open, fL: FP.open, ftR: [0, 0, 0, -0.10, 0], ftL: [0, 0, 0, 0.10, 0] },
    { t: 0.75, hip: [0, 0.10, 0], sp: [0, -0.03, 0], hd: [0, -0.10, 0], ftR: [0, 0.16, 0, -0.10, 0.75], ftL: [0, 0.14, 0, 0.10, 0.75], hR: [-0.40, 0.98, 0.10], hL: [0.40, 0.98, 0.10], knR: [-0.5, 0, 1], knL: [0.5, 0, 1] },
    { t: 1.25, hip: [0, -0.02, -0.04], hd: [0, 0, 0], ftR: [0.05, 0.42, 0.10, 0.5, 0.75, -0.4], ftL: [-0.07, 0.42, 0.16, -0.5, 0.75, 0.4], knR: [-1, 0.2, 0.5], knL: [1, 0.2, 0.5], hR: [-0.34, 0.92, 0.12], hL: [0.34, 0.92, 0.12] },
    { t: 2.0, hip: [0, -0.13, -0.06], sp: [0, 0.02, 0], ftR: [0.15, 0.565, 0.25, 1.15, 0.6, -0.9], ftL: [-0.17, 0.565, 0.32, -1.15, 0.6, 0.9], knR: [-1, 0.3, 0.3], knL: [1, 0.3, 0.3],
      hR: [-0.285, 0.885, 0.215], hL: [0.285, 0.885, 0.215], twR: 1.35, twL: 1.35, fR: FP.cup, fL: FP.cup, wrR: [-0.1, 0], wrL: [-0.1, 0], eR: [-1, -0.3, -0.4], eL: [1, -0.3, -0.4], eyes: 0.35 }
  ], { rise: 1.0, live(B, t, k) {
    const up = sm(0.3, 1, k), bob = up * (0.022 * Math.sin(t * 1.25) + 0.006 * Math.sin(t * 2.9));         // she rides the air: a slow rise and fall
    B.hip[1] += bob; B.ftR[1] += bob; B.ftL[1] += bob; B.hR[1] += bob * 0.9; B.hL[1] += bob * 0.9; B.hipR[2] += up * 0.012 * Math.sin(t * 0.8); B.sp[2] += up * 0.01 * Math.sin(t * 0.8 + 1);
  }, fx(s, t, dt) {
    const k = sm(0.2, 0.9, s.t / s.def.dur), ft = anchor('feet', _h4), hp = anchor('hips', _c1);
    floorSigil(ft, lerp(0.3, 0.62, k), 0.75 * k * (0.85 + 0.15 * Math.sin(t * 2.5)), t * 0.7, COL.violet);
    show(gX3, _c2.copy(hp).setY(hp.y - 0.22), 0.9, 0.35 * k); light(_c3.copy(ft).setY(0.25), 0.55 * k);
    if (k > 0.05 && Math.random() < 26 * dt * k) { const an = Math.random() * TAU, r = 0.12 + Math.random() * 0.42; _c3.set(ft.x + r * Math.cos(an), 0.03, ft.z + r * Math.sin(an)); motes(_c3, 1, 0.015, 1.5, 0.04, Math.random() < 0.3 ? COL.pale : COL.violet, 0.32); }
  } });
