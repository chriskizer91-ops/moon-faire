
  // ---------- round 3, the last three: Same Cloth, Slip Stitch and Crazy Quilt ----------
  // New spells from her lore (no flipbook clips, so the timing is ours). Paintings H9 to H13, and her magic set: I4 (thread and stitches),
  // I6 (the cut in the air), I7 (patches of other places), I8 (the ghost double).
  // What this file adds for any spell to use: RIB (glowing thread), the place patches, SLIT (a cut in the air with other places behind it and a
  // needle to sew it shut), EGHOST (a ghost copy of whatever she is aiming at), QUILT (a quilt of light), and tipOf (any fingertip).
  let foxAway = false, foxAwayAsk = false, tgtObj = null;          // away: she has gone through a cut and is not to be drawn (a spell asks each frame; animate, 90_api.js)

  // any fingertip: S 'R' or 'L', i 0 thumb, 1 first finger ... 4 little finger
  const tipOf = (function () {
    const rest = { R: [], L: [] }, td = V3(THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize(), TLEN = THUMB.len[0] + THUMB.len[1] + THUMB.len[2];
    for (const S of ['R', 'L']) { const s = S === 'R' ? -1 : 1;
      rest[S].push(['thb2' + S, handPt(s, THUMB.base[0] + td.x * TLEN, THUMB.base[1] + td.y * TLEN, THUMB.base[2] + td.z * TLEN)]);
      for (const F of FINGERS) rest[S].push([F[0] + '2' + S, handPt(s, 0, F[2] - F[3], F[1] + F[3] * Math.sin(F[5]))]); }
    return (S, i, out) => { const e = rest[S][i], B = SK[e[0]], r = B.userData.rest; return out.set(e[1].x - r.x, e[1].y - r.y, e[1].z - r.z).applyMatrix4(B.matrixWorld); };
  })();

  // Her thread (painting I4): a ribbon of light that always faces the eye, its colour running blue, teal, violet, rose, gold along its length.
  // All the threads of a frame are one mesh. A spell calls RIB.begin() once a frame, then RIB.path(...) for each thread it wants that frame.
  const RIB = (function () {
    const MAXR = 26, NS = 20, NP = NS + 1, NV = MAXR * NP * 2, pos = new Float32Array(NV * 3), dir = new Float32Array(NV * 3), sw = new Float32Array(NV * 2), col = new Float32Array(NV * 4), idx = [];
    for (let r = 0; r < MAXR; r++) for (let i = 0; i < NS; i++) { const a = (r * NP + i) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry(), A = (arr, n) => { const b = new THREE.BufferAttribute(arr, n); b.setUsage(THREE.DynamicDrawUsage); return b; };
    geo.setAttribute('position', A(pos, 3)); geo.setAttribute('aDir', A(dir, 3)); geo.setAttribute('aSW', A(sw, 2)); geo.setAttribute('aCol', A(col, 4)); geo.setIndex(idx); geo.setDrawRange(0, 0);
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uVH: { value: 800 } },
      vertexShader: `attribute vec3 aDir; attribute vec2 aSW; attribute vec4 aCol; uniform float uVH; varying vec4 vC; varying float vS;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 d = normalize((modelViewMatrix * vec4(aDir, 0.0)).xyz); vec3 n = cross(d, normalize(mv.xyz)); float l = length(n); n = l > 1e-4 ? n / l : vec3(1.0, 0.0, 0.0);
  float px = -mv.z * 2.0 / (projectionMatrix[1][1] * uVH); float w = max(aSW.y, 0.75 * px); mv.xyz += n * aSW.x * w; gl_Position = projectionMatrix * mv; vC = aCol; vC.a *= min(1.0, aSW.y / (0.75 * px) + 0.35); vS = aSW.x; }`,
      fragmentShader: `varying vec4 vC; varying float vS;
void main() { float c = 1.0 - abs(vS); vec3 k = mix(vC.rgb, vec3(1.0), 0.4 * c * c); gl_FragColor = vec4(k * vC.a * (0.22 + 0.78 * c), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 29; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _d2 = new THREE.Vector2();
    const eye = V3(); let seen = false;             // where the picture was last taken from: a spell may turn a flat thing to face whoever is looking
    mesh.onBeforeRender = (r, sc, cam) => { const rt = r.getRenderTarget(); if (rt) mat.uniforms.uVH.value = rt.height; else { r.getDrawingBufferSize(_d2); mat.uniforms.uVH.value = _d2.y; } mat.uniformsNeedUpdate = true; if (cam) { eye.setFromMatrixPosition(cam.matrixWorld); seen = true; } };
    const TH = [[0.25, 0.62, 1.0], [0.20, 0.90, 0.85], [0.62, 0.42, 1.0], [1.0, 0.45, 0.72], [1.0, 0.80, 0.38]], pts = [], _t = V3(), c3 = [0, 0, 0]; for (let i = 0; i < NP; i++) pts.push(V3());
    const thCol = (u, out) => { const x = (((u % 1) + 1) % 1) * 5, i = Math.floor(x) % 5, f = x - Math.floor(x), a = TH[i], b = TH[(i + 1) % 5]; out[0] = lerp(a[0], b[0], f); out[1] = lerp(a[1], b[1], f); out[2] = lerp(a[2], b[2], f); return out; };
    let n = 0;
    return { thCol, eye, get seen() { return seen; },
      begin() { n = 0; geo.setDrawRange(0, 0); },
      // fn(u, out) gives the thread's path for u from 0 to 1. width in metres. hue: where on her colours it starts; span: how much of them it runs through.
      // ends: 0 as it is, 1 both ends fade and thin, 2 its start fades (a tail), 3 its end fades
      path(fn, width, alpha, hue, span, ends) {
        if (n >= MAXR || alpha <= 0.004) return; const r = n++;
        for (let i = 0; i < NP; i++) fn(i / NS, pts[i]);
        for (let i = 0; i < NP; i++) {
          _t.subVectors(pts[Math.min(NS, i + 1)], pts[Math.max(0, i - 1)]); if (_t.lengthSq() < 1e-12) _t.set(0, 1, 0); else _t.normalize();
          const u = i / NS, k = ends === 1 ? Math.sin(PI * u) : ends === 2 ? u : ends === 3 ? 1 - u : 1, ak = alpha * (ends ? Math.pow(k, 0.6) : 1), p = pts[i]; thCol((hue || 0) + (span === undefined ? 1 : span) * u, c3);
          for (let s = 0; s < 2; s++) { const v = (r * NP + i) * 2 + s; pos[v * 3] = p.x; pos[v * 3 + 1] = p.y; pos[v * 3 + 2] = p.z; dir[v * 3] = _t.x; dir[v * 3 + 1] = _t.y; dir[v * 3 + 2] = _t.z;
            sw[v * 2] = s ? 1 : -1; sw[v * 2 + 1] = width * (ends ? 0.45 + 0.55 * k : 1); col[v * 4] = c3[0]; col[v * 4 + 1] = c3[1]; col[v * 4 + 2] = c3[2]; col[v * 4 + 3] = ak; }
        }
        for (const a of ['position', 'aDir', 'aSW', 'aCol']) geo.attributes[a].needsUpdate = true;
        geo.setDrawRange(0, n * NS * 6); mesh.visible = true;
      } };
  })();

  // The patches of other places (painting I7): six squares in one small picture, three across and two down. Until it has loaded (or if her
  // paintings were not given), each place is a plain colour. placeCol picks a place and a turn for each square of a grid.
  const PLACES = (function () {
    const blank = new THREE.DataTexture(new Uint8Array([40, 60, 140, 255]), 1, 1, THREE.RGBAFormat); blank.needsUpdate = true;
    const u = { tP: { value: blank }, uHas: { value: 0 } };
    onBaked('places', (img) => { const t = new THREE.Texture(img); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; u.tP.value = t; u.uHas.value = 1; });
    const glsl = `uniform sampler2D tP; uniform float uHas; uniform float uOrd; uniform float uDash; uniform float uSeam;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 placeCol(vec2 q, float sh, out float seam) {
  vec2 id = floor(q), f = fract(q); float h = h21(id + sh * 7.13), k = floor(h21(id * 1.7 + 3.1 + sh * 3.7) * 5.999), r = floor(h * 3.999);
  vec2 g = f - 0.5; if (r > 2.5) g = vec2(-g.y, g.x); else if (r > 1.5) g = -g; else if (r > 0.5) g = vec2(g.y, -g.x); g = g * 0.96 + 0.5;
  k = mix(k, mod(id.x + 3.0 * mod(id.y, 2.0), 6.0), uOrd * step(sh, 0.5));
  vec2 cell = vec2(mod(k, 3.0), floor(k / 3.0));
  vec3 c = texture2D(tP, vec2((cell.x + g.x) / 3.0, (1.0 - cell.y + g.y) / 2.0)).rgb;
  vec3 pc = 0.55 + 0.45 * cos(6.2832 * (k / 6.0 + vec3(0.0, 0.33, 0.67))); pc *= 0.75 + 0.25 * step(0.5, fract((g.x + g.y) * 4.0));
  c = mix(pc, c, uHas);
  float ex = min(f.x, 1.0 - f.x), ey = min(f.y, 1.0 - f.y), al = ex < ey ? f.y : f.x;
  seam = smoothstep(uSeam, uSeam * 0.4, min(ex, ey)) * step(0.4, fract(al * uDash));
  return c; }
`;
    return { u, glsl };
  })();

  // The cut in the air (painting I6). A tall slit standing in the world: a line of light while it is being cut, a pointed opening with patches
  // of other places behind it once an edge is lifted, and big even stitches where a needle has sewn it shut again, from the top down.
  // The patches are a solid surface, so whoever steps in behind the lifted edge is hidden by it, as behind a tent flap.
  const SLIT = (function () {
    const NR = 56, H = 1.94, Y0 = 0.02, W = 0.38, BW = 0.07, g = new THREE.Group(); g.visible = false; fx.add(g); fxAuto.push(g);
    const U = { uOpen: { value: 0 }, uFlap: { value: 0 }, uSew: { value: 0 }, uCut: { value: 0 }, uH: { value: H }, uW: { value: W }, uBW: { value: BW }, uOp: { value: 1 }, uT: { value: 0 }, uFv: { value: 0.6 }, tP: PLACES.u.tP, uHas: PLACES.u.uHas, uOrd: { value: 0 }, uDash: { value: 9 }, uSeam: { value: 0.034 } };
    const SHAPE = `uniform float uOpen; uniform float uFlap; uniform float uSew; uniform float uH; uniform float uW; uniform float uFv;
float halfW(float v, float s) { float top = max(1.0 - uSew, 0.001), x = clamp(v / top, 0.0, 1.0);
  float w = uW * uOpen * sqrt(top) * pow(max(sin(3.14159 * x), 0.0), 0.30) * step(v, top);
  if (s < 0.0) w *= 1.0 + uFlap * exp(-pow((v - uFv) / 0.22, 2.0));
  return w; }
`;
    const lp = [], li = [], bp = [], bi = [];
    for (let r = 0; r <= NR; r++) { lp.push(-1, r / NR, 0, 1, r / NR, 0); if (r < NR) { const a = r * 2; li.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    for (const s of [-1, 1]) { const o = bp.length / 3; for (let r = 0; r <= NR; r++) { bp.push(s, r / NR, 0, s, r / NR, 1); if (r < NR) { const a = o + r * 2; bi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } } }
    const mk = (p, i) => { const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); q.setIndex(i); return q; };
    const leaf = new THREE.Mesh(mk(lp, li), new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: U,
      vertexShader: SHAPE + `varying vec2 vQ; varying float vS;
void main() { float w = halfW(position.y, position.x); vec3 p = vec3(position.x * w, position.y * uH, 0.0); vQ = p.xy; vS = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: PLACES.glsl + `varying vec2 vQ; varying float vS;
void main() { float seam; vec2 q = mat2(0.98, -0.2, 0.2, 0.98) * vQ / 0.36 + vec2(3.3, 1.7); vec3 c = placeCol(q, 0.0, seam); c = mix(c, vec3(1.0, 0.93, 0.72), seam * 0.9); c *= 0.70 + 0.30 * (1.0 - vS * vS); gl_FragColor = vec4(c, 1.0); }` }));
    const band = new THREE.Mesh(mk(bp, bi), glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: U,
      vertexShader: SHAPE + `uniform float uBW; varying float vV; varying float vO; varying float vS;
void main() { float v = position.y, s = position.x, w = halfW(v, s), bw = uBW * (v > 1.0 - uSew ? 1.3 : 0.45 + 0.55 * uOpen); vec3 p = vec3(s * (w + (position.z * 1.4 - 0.4) * bw), v * uH, 0.004); vV = v; vO = position.z; vS = s; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `uniform float uCut; uniform float uSew; uniform float uT; uniform float uOp; uniform float uH; varying float vV; varying float vO; varying float vS;
void main() { if (vV < 1.0 - uCut) discard;
  float d = abs(vO - 0.2857) / 0.7143, fray = 0.5 + 0.5 * sin(vV * uH * 90.0 + vS * 2.0 + uT * 3.0) * sin(vV * uH * 37.0 - uT * 5.0);
  float a = pow(1.0 - clamp(d, 0.0, 1.0), 1.2 + 7.0 * (1.0 - fray));
  vec3 c = mix(vec3(0.22, 0.52, 1.0), vec3(0.92, 0.97, 1.0), a * a), tipc = 0.6 + 0.4 * cos(6.2832 * (fract(vV * 3.0 + uT * 0.2) + vec3(0.0, 0.33, 0.67)));
  c = mix(tipc, c, smoothstep(0.0, 0.5, a));
  float sewn = step(1.0 - uSew, vV), st = step(0.5, fract(vV * uH / 0.12)); a *= mix(1.0, 0.18 + 0.82 * st, sewn);
  float head = exp(-pow((vV - (1.0 - uCut)) * uH / 0.10, 2.0)), ends = smoothstep(0.0, 0.03, vV) * smoothstep(1.0, 0.97, vV);
  gl_FragColor = vec4(c * a * uOp * ends * (1.0 + 1.5 * head), 1.0); }` }), true));
    leaf.frustumCulled = band.frustumCulled = false; leaf.renderOrder = 5; band.renderOrder = 28; g.add(leaf, band);
    // the needle (painting I4): a sliver of white light with an eye
    const nd = new THREE.Group(), nm = glowOnly(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 1 }));
    { const a = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.13, 8), nm); a.position.y = 0.065; const b = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.05, 8), nm); b.rotation.x = PI; b.position.y = -0.025; const e = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.003, 6, 14), nm); e.position.y = -0.045; nd.add(a, b, e); }
    nd.visible = false; nd.renderOrder = 29; fx.add(nd); fxAuto.push(nd);
    const _x = V3(), _y = V3(0, 1, 0), _z = V3(), _m = new THREE.Matrix4(), _n = V3(), S = { cut: 0, open: 0, flap: 0, sew: 0, fv: 0.6 };
    const hw = (v, s) => { const top = Math.max(1 - S.sew, 0.001), x = cl(v / top, 0, 1); let w = v <= top ? W * S.open * Math.sqrt(top) * Math.pow(Math.max(Math.sin(PI * x), 0), 0.30) : 0; if (s < 0) w *= 1 + S.flap * Math.exp(-Math.pow((v - S.fv) / 0.22, 2)); return w; };
    return { H, Y0, W, group: g, S,
      // stand it at foot (a point on the ground, world), its face turned to n, its width running along r
      place(foot, r, n) { _x.copy(r).normalize(); _z.copy(n).normalize(); g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); g.position.copy(foot); g.position.y += Y0; g.updateMatrixWorld(true); },
      // cut: how much of its height is cut, from the top down; open: how far it gapes; flap: how much further its near edge is lifted; sew: how much is sewn shut, from the top down
      show(cut, open, flap, sew, op, t) { S.cut = cut; S.open = open; S.flap = flap; S.sew = sew; U.uCut.value = cut; U.uOpen.value = open; U.uFlap.value = flap; U.uSew.value = sew; U.uOp.value = op; U.uT.value = t; g.visible = op > 0.004 && cut > 0.001; leaf.visible = open > 0.004; },
      // a point of it in the world: v its height (0 foot, 1 top), s -1 its near edge, 1 its far edge, 0 the line between
      pt(v, s, out) { return out.set(s * hw(v, s), v * H, 0.004).applyMatrix4(g.matrixWorld); },
      // how far the near edge must be lifted for it to pass through a point (world) at its own height: for a hand that holds it
      flapFor(p) { _n.copy(p); g.worldToLocal(_n); const v = cl(_n.y / H, 0.05, 0.95), w0 = hw(v, 1); S.fv = v; U.uFv.value = v; return w0 > 0.01 ? cl(-_n.x / w0 - 1, 0, 1.6) : 0; },
      needle(p, d, op) { nd.visible = op > 0.01; if (!nd.visible) return; nm.opacity = op; nd.position.copy(p); nd.quaternion.setFromUnitVectors(_y, _n.copy(d).normalize()); } };
  })();

  // A ghost copy of an enemy (painting I8, and the lore: "a ghost 3D copy of any character in the game"). The host hands her what she is aiming
  // at (fox.target = an Object3D); its meshes are drawn a second time in see-through blue with seams of light. If it gave her nothing, a plain
  // cloth doll on a post stands in. It can be unravelled from the top down.
  const EGHOST = (function () {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; fx.add(g); fxAuto.push(g);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: true, side: THREE.DoubleSide,
      uniforms: { cA: { value: new THREE.Color(0.10, 0.30, 0.85) }, cB: { value: new THREE.Color(0.70, 0.92, 1.0) }, uOp: { value: 0 }, uTop: { value: 99 }, uT: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vL;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 cA; uniform vec3 cB; uniform float uOp; uniform float uTop; uniform float uT; varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vL;
void main() { float n = sin(vW.x * 53.0 + uT * 7.0) * sin(vW.z * 47.0 - uT * 5.0) * 0.04; if (vW.y > uTop + n) discard;
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float seam = smoothstep(0.014, 0.005, abs(fract(vW.y / 0.31 + 0.5) - 0.5) * 0.31) * step(0.5, fract(atan(vL.x, vL.z) * 3.8));
  float edge = smoothstep(0.06, 0.0, uTop + n - vW.y); float k = max(f, max(seam * 0.9, edge));
  gl_FragColor = vec4(mix(cA, cB, k) + vec3(0.5, 0.7, 0.9) * edge, uOp * (0.34 + 0.6 * k)); }` });
    const box = new THREE.Box3(), _s = V3(), _s2 = V3(), _iv = new THREE.Matrix4(), NBIN = 44, MARG = 0.11, raw = new Float32Array(NBIN), prof = new Float32Array(NBIN); let yLo = -MARG, yHi = 1.8;
    const wAt = (y) => { const f = cl((y - yLo) / (yHi - yLo), 0, 1) * (NBIN - 1), i = Math.floor(f); return lerp(prof[i], prof[Math.min(NBIN - 1, i + 1)], f - i); };
    // How wide it is at each height, as seen from any side (its widest reach from its own middle), a hand's breadth added: the line she cuts round it.
    // Read off its triangles, a few thousand at most, walking down their edges so that a tall plain post still counts all the way up.
    function measure() {
      raw.fill(0); yHi = api.h + MARG; _iv.copy(inner.matrixWorld).invert(); const put = (p) => { const b = Math.floor((p.y - yLo) / (yHi - yLo) * NBIN); if (b >= 0 && b < NBIN) raw[b] = Math.max(raw[b], Math.hypot(p.x, p.z)); }, tri = [V3(), V3(), V3()];
      inner.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position, ix = o.geometry.index, nt = Math.floor((ix ? ix.count : pa.count) / 3), st = Math.max(1, Math.floor(nt / 2500));
        for (let t = 0; t < nt; t += st) { for (let k = 0; k < 3; k++) tri[k].fromBufferAttribute(pa, ix ? ix.getX(t * 3 + k) : t * 3 + k).applyMatrix4(o.matrixWorld).applyMatrix4(_iv);
          for (let k = 0; k < 3; k++) { const a = tri[k], b = tri[(k + 1) % 3], n = Math.min(24, 1 + Math.ceil(Math.abs(a.y - b.y) / (yHi - yLo) * NBIN)); for (let i = 0; i <= n; i++) put(_s2.lerpVectors(a, b, i / n)); } } });
      const bh = (yHi - yLo) / (NBIN - 1), R = Math.ceil(MARG / bh);
      for (let i = 0; i < NBIN; i++) { let m = 0; for (let j = Math.max(0, i - R); j <= Math.min(NBIN - 1, i + R); j++) if (raw[j] > 0) { const dy = (i - j) * bh; if (Math.abs(dy) <= MARG) m = Math.max(m, raw[j] + Math.sqrt(MARG * MARG - dy * dy)); } prof[i] = m; }
      for (let pass = 0; pass < 2; pass++) { let prev = prof[0]; for (let i = 1; i < NBIN - 1; i++) { const c = prof[i]; prof[i] = 0.25 * prev + 0.5 * c + 0.25 * prof[i + 1]; prev = c; } }
    }
    const api = { group: g, mat, h: 1.65, w: 0.4, src: null, made: null,
      // its cut-out edge: u from 0 to 1 goes once round, from the top down one side, along the ground and up the other; gives [how far across, how high]
      edge(u, out) { u = ((u % 1) + 1) % 1; const side = u < 0.5 ? 1 : -1, v = u < 0.5 ? u * 2 : (1 - u) * 2, y = lerp(yHi, 0.012, v); out[0] = side * wAt(y); out[1] = y; return out; },
      // make it from what she aims at, or the stand-in
      from(obj) {
        if (api.made === (obj || 'doll')) return; api.made = obj || 'doll'; while (inner.children.length) inner.remove(inner.children[0]);
        let c;
        if (obj) { c = obj.clone(true); c.position.set(0, 0, 0); c.quaternion.identity(); c.scale.set(1, 1, 1); c.visible = true; c.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh) { o.material = mat; o.visible = true; o.castShadow = false; o.receiveShadow = false; o.renderOrder = 6; } else if (o.isMesh || o.isLine || o.isPoints || o.isSprite || o.isLight) o.visible = false; }); }
        else { c = new THREE.Group(); const add = (geo, x, y, z, sx, sy, sz, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); if (rz) m.rotation.z = rz; m.renderOrder = 6; c.add(m); }, sph = new THREE.SphereGeometry(1, 20, 14), cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
          add(cyl, 0, 0.035, 0, 0.26, 0.07, 0.26); add(cyl, 0, 0.45, 0, 0.04, 0.80, 0.04); add(sph, 0, 1.10, 0, 0.19, 0.30, 0.15); add(cyl, 0, 1.27, 0, 0.06, 0.80, 0.06, PI / 2); add(sph, 0, 1.53, 0, 0.115, 0.125, 0.115); }
        inner.add(c); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.updateMatrixWorld(true); box.setFromObject(inner); _s.copy(box.max).applyMatrix4(_iv.copy(inner.matrixWorld).invert()); api.h = Math.max(0.5, _s.y); box.getSize(_s); api.w = Math.max(0.2, Math.max(_s.x, _s.z) * 0.5); measure();
      },
      // p: where its foot is (world); yaw: its own turn; tiltX, tiltZ: its lean; top: everything above this height (world) has unravelled
      show(op, p, yaw, tiltX, tiltZ, top, t) { g.visible = op > 0.004; if (!g.visible) return; mat.uniforms.uOp.value = op; mat.uniforms.uTop.value = top === undefined ? 99 : top; mat.uniforms.uT.value = t || 0; g.position.copy(p); g.rotation.set(tiltX || 0, yaw || 0, tiltZ || 0, 'YXZ'); g.updateMatrixWorld(true); } };
    return api;
  })();

  // A quilt of light (paintings H13 and I7): big squares of other places joined by bright stitches, some sewn in sideways or upside down.
  // It is cloth worked out afresh each frame: it leaves her two hands far end first, billows, and when she lets go it settles over her target.
  const QUILT = (function () {
    const NA = 30, NB = 18, NV = (NA + 1) * (NB + 1), pos = new Float32Array(NV * 3), uv = new Float32Array(NV * 2), idx = [];
    for (let i = 0; i <= NA; i++) for (let j = 0; j <= NB; j++) { const v = i * (NB + 1) + j; uv[v * 2] = i / NA; uv[v * 2 + 1] = j / NB * 2 - 1; if (i < NA && j < NB) idx.push(v, v + NB + 1, v + 1, v + 1, v + NB + 1, v + NB + 2); }
    const geo = new THREE.BufferGeometry(), pa = new THREE.BufferAttribute(pos, 3); pa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('position', pa); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const U = { uOp: { value: 0 }, uT: { value: 0 }, uCrazy: { value: 0 }, uL: { value: 3 }, uWd: { value: 2.1 }, tP: PLACES.u.tP, uHas: PLACES.u.uHas, uOrd: { value: 1 }, uDash: { value: 24 }, uSeam: { value: 0.016 } };      // uOrd: each of the six places once, in order, until the squares start changing places
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: U,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: PLACES.glsl + `uniform float uOp; uniform float uT; uniform float uCrazy; uniform float uL; uniform float uWd; varying vec2 vUv;
void main() { vec2 m = vec2(vUv.x * uL, (vUv.y * 0.5 + 0.5) * uWd), q = m / 1.05; float sh = uCrazy * floor(uT * 2.4 + h21(floor(q) + 9.0) * 4.0), seam; vec3 c = placeCol(q, sh, seam);
  float rim = min(min(vUv.x, 1.0 - vUv.x) * uL, (1.0 - abs(vUv.y)) * uWd * 0.5);
  vec3 rc = 0.6 + 0.4 * cos(6.2832 * (vUv.x * 2.0 + vUv.y * 0.7 + uT * 0.15 + vec3(0.0, 0.33, 0.67)));
  c = mix(c * 0.92, vec3(1.0, 0.93, 0.72), seam); c = mix(rc * 1.15, c, smoothstep(0.015, 0.075, rim));
  gl_FragColor = vec4(c * uOp * smoothstep(0.0, 0.03, rim), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 27; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _p = V3(), _c = V3();
    return { mesh, U, NA, NB,
      // o: the ground under her hands (world); X: the way it is thrown; Z: across it; hR, hL: her two hands (world); L, Wd: its length and width.
      // unf: how much of it has left her hands; rel: 0 held, 1 let go; settle: 0 flying, 1 lying over the target; sink: how far it has sunk after that; bil: how hard it billows;
      // bank: how much its far side is lifted and its near side dropped while it flies, so whoever stands on the Z side sees its face and not its edge (H13)
      shape(o, X, Z, hR, hL, L, Wd, unf, rel, settle, sink, bil, t, bank) {
        const yH = (hR.y + hL.y) * 0.5 - o.y, hw0 = 0.5 * hR.distanceTo(hL);
        for (let i = 0; i <= NA; i++) { const a = i / NA, d = Math.max(0, a - 1 + unf), u = unf > 0.001 ? d / unf : 0;
          for (let j = 0; j <= NB; j++) { const b = j / NB * 2 - 1, v = i * (NB + 1) + j;
            const wide = lerp(lerp(hw0, Wd * 0.5, sm(0, 0.18, d)), Wd * 0.5, rel), s = d * L + rel * 0.45 * (1 - 0.6 * d);
            let y = lerp(yH, 1.25, Math.pow(d, 1.15)) + 0.45 * Math.sin(PI * Math.min(1, d * 1.05)) * bil * (0.55 + 0.45 * (1 - b * b)) + 0.09 * Math.sin(9 * d - 10 * t + b * 1.3) * d * (1 - 0.6 * settle) + 0.05 * Math.sin(5 * b + 7 * t) * d * (1 - b * b);
            const e = 2 * a - 1, dome = 0.10 + (1.22 - sink) * Math.pow(Math.max(0, 1 - e * e), 0.6) * Math.pow(Math.max(0, 1 - b * b), 0.5) + 0.03 * Math.sin(8 * a + 6 * b - 5 * t);
            y -= b * (bank || 0) * wide * 0.62 * sm(0, 0.25, d); y = lerp(Math.max(0.05, y), Math.max(0.03, dome), settle);
            _p.copy(o).addScaledVector(X, s).addScaledVector(Z, b * wide); _p.y = o.y + y;
            if (rel < 1) { const hk = (1 - rel) * Math.pow(1 - Math.min(1, d * 3.2), 2); if (hk > 0) { _c.lerpVectors(hL, hR, (b + 1) * 0.5); _p.lerp(_c, hk); } }       // its near edge is in her two hands
            pos[v * 3] = _p.x; pos[v * 3 + 1] = _p.y; pos[v * 3 + 2] = _p.z; } }
        pa.needsUpdate = true; U.uL.value = L; U.uWd.value = Wd;
      },
      show(op, crazy, t) { mesh.visible = op > 0.004; U.uOp.value = op; U.uCrazy.value = crazy; U.uT.value = t; },
      // a point of it (world), for sparks: a 0 to 1 along, b -1 to 1 across
      pt(a, b, out) { const i = Math.round(cl(a, 0, 1) * NA), j = Math.round((cl(b, -1, 1) + 1) * 0.5 * NB), v = i * (NB + 1) + j; return out.set(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); } };
  })();

  (function foxSpells3() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), UPV = V3(0, 1, 0), _q3 = Qt();
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), _e = V3(), _f = V3(), _g = V3(), c3 = [0, 0, 0];
    const K = (t, ...o) => Object.assign({ t }, ...o), add3 = (h, d) => [h[0] + d[0], h[1] + d[1], h[2] + d[2]];
    const GRIP0 = [-0.216, 1.015, 0.123], gripAt = (hip) => arm('R', add3(GRIP0, hip || [0, 0, 0]), [-1, 0.2, -0.6], FP.grip, 0.2, [0.3, 0]);       // her right palm on the ring of the sheathed shears, wherever her hips are
    const restArm = (S) => ({ ['h' + S]: 'rest', ['e' + S]: 'rest', ['f' + S]: 'rest', ['tw' + S]: 'rest', ['wr' + S]: 'rest' });
    const stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
    const stride = { hip: [0, -0.03, 0.06], ftL: [0.02, 0, 0.22, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.04, 0, -0.10, -0.5, 0], knR: [-0.4, 0, 1] };
    const PUP = [0.20, 0.22, 0.20, 0.26, 0.32, 1.0];                                                    // a puppeteer's hand: fingers spread and hanging a little
    // The stage as she found it, whatever turn the move has given her since: X the way her spells go (her left), Z toward whoever is watching, O the ground under her.
    const FR = { X: V3(), Z: V3(), O: V3() }; let spinWas = 0;
    const frame = () => { root.getWorldQuaternion(_q3); FR.X.set(1, 0, 0).applyQuaternion(_q3).applyAxisAngle(UPV, -spinWas); FR.Z.set(0, 0, 1).applyQuaternion(_q3).applyAxisAngle(UPV, -spinWas); root.getWorldPosition(FR.O); spinWas = spinNow; };
    // a spark in one of her thread's colours
    const tspark = (p, spread, speed, life, size, up) => { RIB.thCol(Math.random(), c3); emit(p.x + rs() * spread, p.y + rs() * spread, p.z + rs() * spread, rs() * speed, (up || 0) + rs() * speed, rs() * speed, life * (0.6 + 0.8 * Math.random()), size * (0.6 + 0.8 * Math.random()), c3, 0.15, 0.9); };
    const many = (n, dt, f) => { const x = n * dt; for (let i = 0; i < x || (i === 0 && Math.random() < x); i++) f(); };

    // Crazy Quilt (painting H13). She gathers it at her hip, swings it up over her head and shakes it out like a bedsheet: a quilt of light
    // unrolls from her hands across the field. A second flick sends a wave down it, she lets go, and it settles over her target, where its
    // squares keep changing places.
    (function () {
      const dur = 4.6, T_SH = 1.08, T_REL = 2.12, T_HIT = 3.0, T_END = 4.25, keys = [];
      const hi = (S, h, f, wr) => arm(S, h, [S === 'R' ? -0.8 : 0.8, -0.5, -0.3], f, 0.8, wr), lo = (S, h, f, wr) => arm(S, h, [S === 'R' ? -0.9 : 0.9, -0.2, -0.4], f, 0.8, wr);
      const crouch = { hip: [0, -0.10, 0], ftL: [0.02, 0, 0.10, 0.1, 0], ftR: [-0.04, 0, -0.08, -0.4, 0], knL: [0.3, 0, 1], knR: [-0.4, 0, 1] }, toes = { hip: [0, 0.03, 0.02], ftL: [0.02, 0.05, 0.10, 0.1, 0.5], ftR: [-0.04, 0.05, -0.10, -0.4, 0.5], knL: [0.2, 0, 1], knR: [-0.4, 0, 1] };
      const gather = K(0, { sp: [-0.30, 0.16, 0], hd: [0.2, 0.1, 0], mouth: 0 }, arm('R', [-0.24, 0.96, 0.10], [-1, -0.2, -0.5], FP.grip, 0.6, [0, 0]), arm('L', [-0.04, 0.98, 0.24], [0.8, -0.6, -0.2], FP.grip, 0.6, [0, 0]), crouch);
      const over = K(0, { sp: [0, -0.12, 0], hd: [0, -0.2, 0], mouth: 1 }, arm('R', [-0.20, 1.74, 0.02], [-1, 0.2, 0.5], FP.grip, 0.6, [0, 0]), arm('L', [0.18, 1.76, 0.03], [1, 0.2, 0.5], FP.grip, 0.6, [0, 0]), toes);
      keys.push(Object.assign({}, gather, { t: 0.50 }), Object.assign({}, gather, { t: 0.60 }));
      keys.push(Object.assign({}, over, { t: 0.98 }), Object.assign({}, over, { t: 1.04 }));
      keys.push(K(1.32, { sp: [0, 0.16, 0], hd: [0, -0.1, 0.06], mouth: 2 }, hi('R', [-0.24, 1.38, 0.46], FP.grip, [0.2, 0]), hi('L', [0.22, 1.52, 0.44], FP.grip, [0.2, 0]), stride));                       // the shake: out it goes
      keys.push(K(1.60, { sp: [0, 0.22, 0], hd: [0, -0.12, 0.06] }, lo('R', [-0.24, 1.12, 0.42], FP.grip, [-0.2, 0]), lo('L', [0.22, 1.18, 0.42], FP.grip, [-0.2, 0]), stride));
      keys.push(K(1.90, { sp: [0, 0.08, 0], hd: [0, -0.14, 0.06] }, hi('R', [-0.26, 1.44, 0.40], FP.grip, [0.3, 0]), hi('L', [0.24, 1.54, 0.38], FP.grip, [0.3, 0]), stride));                                 // a second flick
      keys.push(K(2.14, { sp: [0, 0.20, 0], hd: [0, -0.08, 0.08] }, lo('R', [-0.28, 1.20, 0.44], FP.open, [-0.1, 0]), lo('L', [0.26, 1.26, 0.44], FP.open, [-0.1, 0]), stride));                                // and she lets it go
      keys.push(K(2.34, { sp: [0, 0.20, 0], hd: [0, -0.08, 0.08] }, lo('R', [-0.28, 1.18, 0.44], FP.open, [-0.1, 0]), lo('L', [0.26, 1.24, 0.44], FP.open, [-0.1, 0]), stride));
      const idle = [arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]), arm('L', [0.20, 0.99, 0.19], [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0])];
      keys.push(K(2.95, { sp: [0, -0.05, 0], hd: [0, -0.16, 0.08], mouth: 2, sh: [0, 0] }, idle[0], idle[1], stand));                                                                                      // she watches it land, and laughs
      for (let i = 0; i < 3; i++) { keys.push(K(3.08 + i * 0.24, { sh: [0.5, 0.5], hd: [0, -0.20, 0.08] })); keys.push(K(3.20 + i * 0.24, { sh: [0, 0], hd: [0, -0.13, 0.08] })); }
      keys.push(K(3.90, { sp: [0, 0, 0], hd: [0, 0, 0.05], sh: [0, 0], mouth: 2 }, idle[0], idle[1], stand));
      const spin = [[0, 0], [0.10, 0], [0.62, PI / 2], [3.55, PI / 2], [4.25, 0], [dur, 0]];
      const o0 = V3(), X0 = V3(), Z0 = V3(), tg = V3(); let L = 3, froze = false;
      defAction('crazy_quilt', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [T_SH / dur, T_REL / dur], impact: 0.35,
        start() { froze = false; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          const hR = anchor('handR', _a), hL = anchor('handL', _b);
          if (T > 0.3 && T < T_SH + 0.2) { const k = win(T, 0.3, T_SH + 0.2, 0.2); many(26 * k, dt, () => tspark(Math.random() < 0.5 ? hR : hL, 0.05, 0.12, 0.4, 0.03, 0.1)); light(hR, 0.6 * k, 0xa8c8ff); }      // it gathers in her hands
          if (T < T_SH) return;
          if (!froze) { o0.addVectors(hR, hL).multiplyScalar(0.5); o0.y = FR.O.y; X0.copy(FR.X); Z0.copy(FR.Z); L = cl(2 * (2.6 * tgtK - 0.85), 2.2, 3.4); tg.copy(o0).addScaledVector(X0, L * 0.5 + 0.3); if (T >= T_REL) froze = true; }
          const unf = sm(T_SH, T_SH + 0.55, T), rel = sm(T_REL, T_REL + 0.45, T), settle = sm(T_REL + 0.12, T_HIT, T), sink = 0.8 * sm(T_HIT + 0.3, T_END, T);
          const bil = Math.exp(-Math.max(0, T - 1.3) * 1.6) + 0.55 * win(T, 1.72, 2.3, 0.22), op = sm(T_SH, T_SH + 0.18, T) * (1 - sm(T_END - 0.7, T_END, T)) * (0.92 - 0.42 * settle);
          QUILT.shape(o0, X0, Z0, hR, hL, L, 2.1, unf, rel, settle, sink, bil, t, 1 - settle); QUILT.show(op, sm(T_HIT - 0.1, T_HIT + 0.1, T), t);
          if (op > 0.05) { many(30 * (1 - 0.6 * settle), dt, () => tspark(QUILT.pt(Math.random() < 0.5 ? 1 : Math.random(), Math.random() < 0.5 ? rs() : (Math.random() < 0.5 ? -1 : 1), _c), 0.03, 0.15, 0.5, 0.035, 0.05)); light(QUILT.pt(0.6, 0, _c), 1.0 * op, 0xc8b8ff); }
          fxHitP.copy(tg); fxHitP.y += 1.1 * FOX_K;
          if (cue(a, 'land', T_HIT)) { _c.copy(tg); shock(_c, 0.3, 1.5, 0.7, [0.75, 0.8, 1.0], true); for (let i = 0; i < 70; i++) { _d.copy(tg); _d.y += 0.3 + Math.random() * 1.0; tspark(_d, 0.5, 0.9, 0.8, 0.045, 0.3); } }
          if (T > T_HIT && T < T_END) { const k = win(T, T_HIT, T_END, 0.25); for (let i = 0; i < 5; i++) { const an = t * 5.5 + i * 1.2566; RIB.thCol(i / 5 + t * 0.2, c3); if (Math.random() < 30 * dt * k) emit(tg.x + 0.30 * Math.cos(an), tg.y + (1.78 + 0.05 * Math.sin(an * 2)) * FOX_K, tg.z + 0.30 * Math.sin(an), 0, 0, 0, 0.22, 0.06, c3, 0, 0.5); } }      // which way was I facing? stars go round its head
        } });
    })();

    // Slip Stitch (paintings H11, H12, I6). Up on her toes she puts the point of her shears as high as she can reach and drags it straight
    // down: the air is left cut behind it. She puts the shears away, takes the near edge and lifts it like the flap of a tent (other places
    // show through), waves, and steps in behind it. A needle of light sews the cut shut from the top. Nobody is left standing there.
    // On her own page she then has to come back, so she pops out where she began; in the game the move would end with her gone.
    (function () {
      const dur = 6.6, TC = 1.40, TS = 0.30, T_C0 = 1.00, T_C1 = 1.68, T_OP0 = 2.62, T_OP1 = 3.05, T_STEP = 3.30, T_GONE = 4.02, T_SEW0 = 3.86, T_SEW1 = 5.05, T_FADE = 5.42, T_BACK = 5.80, keys = [];
      const spin = [[0, 0], [0.12, 0], [0.72, TC], [1.80, TC], [2.35, TS], [4.40, TS], [5.30, 0], [dur, 0]], spinT = { ts: spin.map((e) => e[0]), vs: spin.map((e) => e[1]) };
      // a spot on the stage (metres to her left, metres toward the viewer, from where she began) as offsets in her own turned space at time t
      const w2r = (t, X, Z) => { const th = evalTrack(spinT, t), c = Math.cos(th), s = Math.sin(th); return [X * c - Z * s, X * s + Z * c]; };
      const hipAt = (t, P, y) => { const r = w2r(t, P[0], P[1]); return [r[0], y || 0, r[1]]; }, footAt = (t, P, y, yaw, pitch) => { const r = w2r(t, P[0], P[1]); return [r[0], y || 0, r[1], yaw || 0, pitch || 0]; };
      const handAt = (t, X, Z, y) => { const r = w2r(t, X, Z); return [r[0], y, r[1]]; };
      const lungeF = { ftL: [0.03, 0, 0.42, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.03, 0.03, -0.02, -0.3, 0.35], knR: [-0.3, 0, 1] }, backL = arm('L', [0.26, 1.02, 0.0], [0.6, -0.2, -1], FP.soft, 0.2, [0.1, 0]);
      // the cut: the point of her shears on one straight line, from 1.96 m down to 0.56 (poses.py with bench/stroke.poses.js)
      const ST = [[1.00, [-0.193, 1.631, 0.540], -1.6, [0, 0.2], [0, 0.03, 0.22], [0, 0.02, 0], [-0.5, -0.5, 0.4], -0.28], [1.17, [-0.282, 1.296, 0.576], -0.8, [0, 0.2], [0, 0, 0.22], [0, 0.06, 0], [-0.5, -0.8, 0.1], -0.12],
        [1.34, [-0.284, 1.025, 0.520], -0.4, [0, 0.2], [0, -0.07, 0.22], [0, 0.12, 0], [-0.5, -1, -0.2], 0.02], [1.51, [-0.295, 0.868, 0.420], -0.6, [0, 0.2], [0, -0.15, 0.22], [0, 0.20, 0], [-0.6, -0.8, -0.4], 0.14], [1.68, [-0.292, 0.812, 0.489], -1.4, [0.3, 0.2], [0, -0.24, 0.22], [0, 0.30, 0], [-0.7, -0.3, -0.6], 0.22]];
      const stk = (i, t) => { const s = ST[i]; return K(t === undefined ? s[0] : t, { shr: 1, shs: 0, sho: 0, shl: s[2], hip: s[4], sp: s[5], hd: [0, s[7], 0], mouth: 0 }, arm('R', s[1], s[6], FP.grip, 0, s[3]), lungeF, backL); };
      keys.push(K(0.30, { hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, gripAt(), restArm('L'), stand)); keys.push(K(0.42, { shr: 0 }, gripAt()));
      keys.push(stk(0, 0.86)); for (let i = 0; i < 5; i++) keys.push(stk(i)); keys.push(stk(4, 1.80));
      const B = [0.10, 0.03], B1 = [0.26, 0.04], E0 = [0.73, 0.27], E1 = [0.42, 0.28], FL = [0.36, 0.05];              // B1: the step she takes toward the cut to reach it; FL: where her left foot goes for it              // B: where the cut leaves her standing. E0, E1: where her left hand takes the near edge of the cut, and where it lifts it to
      keys.push(K(2.06, { hip: hipAt(2.06, [0.16, 0.035], -0.08), sp: [0, 0.10, 0], hd: [0.1, 0.1, 0], shr: 1, shl: -0.6, ftR: footAt(2.06, B), ftL: footAt(2.06, [0.24, 0.07], 0.05), knR: 'rest', knL: 'rest' }, arm('R', add3([-0.26, 1.08, 0.22], hipAt(2.06, [0.16, 0.035])), [-0.8, -0.4, -0.5], FP.grip, 0.2, [0.2, 0])));
      const g1 = hipAt(2.30, B), g2 = hipAt(2.44, B);
      keys.push(K(2.30, { hip: g1, sp: [0.04, 0.04, 0], hd: [0.3, 0.05, 0], shr: 1, shl: 0.44, ftR: footAt(2.30, B), ftL: footAt(2.30, B, 0.04) }, gripAt(g1), backL));
      keys.push(K(2.44, { hip: g2, shr: 0, ftR: footAt(2.44, B), ftL: footAt(2.44, B) }, gripAt(g2)));
      const hold = (t, E, y, Bp, o) => K(t, { hip: hipAt(t, Bp, -0.02), ftR: footAt(t, B), ftL: footAt(t, FL) }, arm('L', handAt(t, E[0], E[1], y), [0.9, -0.5, -0.2], FP.cup, 0.9, [0.1, 0]), o);
      keys.push(K(2.52, { ftL: footAt(2.52, [0.24, 0.05], 0.04) }));
      keys.push(hold(T_OP0, E0, 1.27, B1, { sp: [0.14, 0.08, -0.06], hd: [0.35, 0.02, 0], mouth: 0 })); keys.push(hold(T_OP0 + 0.08, E0, 1.27, B1, { sp: [0.14, 0.08, -0.06], hd: [0.35, 0.02, 0] }));      // she steps in and takes hold of the cut
      keys.push(hold(T_OP1, E1, 1.42, [0.13, 0.03], { sp: [0.02, 0.0, -0.04], hd: [-0.30, 0.0, 0.08], mouth: 2 })); keys.push(hold(T_STEP - 0.02, E1, 1.42, [0.13, 0.03], { sp: [0.02, 0.0, -0.04], hd: [-0.30, 0, 0.08], mouth: 2 }));      // and draws its edge back and up, like a curtain
      // her right hand, free again, waves goodbye
      const wave = (t, d, hip) => arm('R', add3([-0.30, 1.42, 0.14], [hip[0], 0, hip[2]]), [-0.8, -0.8, 0.1], FP.open, 1.3, [0.1, d]);
      keys.push(K(2.70, {}, arm('R', add3([-0.26, 1.02, 0.14], g2), [-0.6, -0.2, -0.8], FP.relax, 0.2, [0.1, 0])));
      // she steps in behind the lifted edge, sideways, waving: left foot out, right foot joins it, twice
      const HX = [[3.30, 0.13], [3.44, 0.30], [3.58, 0.44], [3.72, 0.58], [3.86, 0.70], [4.00, 0.76]], FTL = [[0.36, 0], [0.36, 0], [0.48, 0.05], [0.62, 0], [0.72, 0.05], [0.84, 0]], FTR = [[0.10, 0], [0.20, 0.05], [0.30, 0], [0.42, 0.05], [0.56, 0], [0.68, 0.04]];
      keys.push(K(3.16, {}, wave(3.16, 0.3, hipAt(3.16, [0.13, 0.03]))));
      for (let i = 0; i < HX.length; i++) { const t = HX[i][0], hp = hipAt(t, [HX[i][1], 0.03 * (1 - i / 5)], i % 2 ? -0.03 : -0.015);
        keys.push(K(t, { hip: hp, ftL: footAt(t, [FTL[i][0], 0.03 * (1 - i / 5)], FTL[i][1]), ftR: footAt(t, [FTR[i][0], 0.03 * (1 - i / 5)], FTR[i][1]), sp: [0.03, 0, i % 2 ? 0.05 : -0.05], hd: [-0.30, 0, i % 2 ? -0.06 : 0.08] }, wave(t, i % 2 ? 0.35 : -0.35, hp),
          i >= 1 ? arm('L', add3([0.14, 1.12, 0.22], [hp[0], 0, hp[2]]), [0.9, -0.6, -0.2], FP.soft, 0.4, [0.2, 0]) : null)); }
      keys.push(K(4.30, { hip: hipAt(4.30, [0.76, 0]), ftL: footAt(4.30, [0.84, 0]), ftR: footAt(4.30, [0.70, 0]) }));
      // unseen, she comes back to where she began; then, on her own page, she is simply there again
      const tada = K(0, { hip: [0, -0.10, 0], sp: [0, 0.04, 0], hd: [0, -0.05, 0.06], mouth: 2, ftR: 'rest', ftL: 'rest', knR: [-0.4, 0, 1], knL: [0.4, 0, 1] }, arm('R', [-0.42, 1.02, 0.12], [-0.6, -0.8, -0.3], FP.open, 1.2, [0.2, 0]), arm('L', [0.42, 1.02, 0.12], [0.6, -0.8, -0.3], FP.open, 1.2, [0.2, 0]));
      keys.push(Object.assign({}, tada, { t: 5.40 }), Object.assign({}, tada, { t: T_BACK + 0.12 }));
      keys.push(K(6.25, { sp: [0, 0, 0], hd: [0, 0, 0.05], mouth: 2 }, stand, restArm('R'), restArm('L')));
      const foot = V3(), X0 = V3(), Z0 = V3(), nd = V3(), nd2 = V3(); let placed = false, cutMax = 0, flap = 0, topY = 0;
      const NST = Math.round(SLIT.H / 0.12), needleAt = (u, out) => { const ph = u * NST * PI; return out.set(0.085 * Math.cos(ph), (1 - u) * SLIT.H + 0.03 * Math.sin(ph * 2), 0.03 + 0.03 * Math.sin(ph)).applyMatrix4(SLIT.group.matrixWorld); };
      defAction('slip_stitch', dur, keys, { outro: 0.3, stand: true, spin, cues: [T_C0 / dur, T_OP1 / dur, T_GONE / dur, T_SEW1 / dur, T_BACK / dur],
        start() { placed = false; cutMax = 0; flap = 0; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          if (T > T_GONE && T < T_BACK) foxAwayAsk = true;
          const tip = anchor('bladeA', _a);
          if (T > 0.6 && T < 2.3) { if (Math.random() < 4 * dt) emit(tip.x, tip.y, tip.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8); }
          if (cue(a, 'place', T_C0 - 0.03)) { foot.set(tip.x, FR.O.y, tip.z); X0.copy(FR.X); Z0.copy(FR.Z); SLIT.place(foot, X0, Z0); topY = foot.y + SLIT.Y0 + SLIT.H; placed = true; burst(tip, 18, 0.7, 0.4, 0.03, COL.foxPale, 0.2, 1.2, 0.2); }
          if (!placed) return;
          if (T < T_C1) cutMax = Math.max(cutMax, cl((topY - tip.y) / SLIT.H, 0, 1)); else cutMax = Math.max(cutMax, lerp(cutMax, 1, sm(T_C1, T_C1 + 0.25, T)));
          const open = 0.7 * sm(T_OP0, T_OP1, T) + 0.3 * sm(T_STEP, T_STEP + 0.4, T), sew = cl((T - T_SEW0) / (T_SEW1 - T_SEW0), 0, 1), flash = win(T, T_SEW1 - 0.05, T_SEW1 + 0.3, 0.1), op = (1 - sm(T_SEW1 + 0.08, T_FADE, T)) * (1 + 1.2 * flash);
          SLIT.show(cutMax, open, flap, sew, op, t);
          if (T >= T_OP0 && T < T_STEP) { tipOf('L', 1, _b); tipOf('L', 2, _c); _b.add(_c).multiplyScalar(0.5); const f = SLIT.flapFor(_b); flap += (f - flap) * Math.min(1, dt * 14); }                 // the near edge is in her fingers
          else if (T >= T_GONE - 0.15) flap *= Math.exp(-dt * 5);
          if (T < T_C1 + 0.25) { const p = SLIT.pt(1 - cutMax, 0, _b); many(70, dt, () => tspark(p, 0.02, 0.35, 0.35, 0.035, 0.1)); light(p, 1.3, 0x9fd0ff); }                                         // the cut's leading end
          else if (op > 0.05) { many(10 * op, dt, () => { const v = Math.random() * (1 - sew); tspark(SLIT.pt(v, Math.random() < 0.5 ? -1 : 1, _b), 0.02, 0.12, 0.5, 0.028, 0.06); }); light(SLIT.pt(0.5, 0, _b), 0.7 * op * (0.5 + open), 0xb8c8ff); }
          if (sew > 0 && sew < 1) {                                                                                                                                                              // the needle, and the thread it pulls
            needleAt(sew, nd); needleAt(Math.min(1, sew + 0.004), nd2); SLIT.needle(nd, _b.subVectors(nd2, nd), 1);
            RIB.path((u, o) => needleAt(Math.max(0, sew - 0.11 * (1 - u)), o), 0.007, 1, t * 0.6, 0.6, 2);
            many(24, dt, () => tspark(nd, 0.015, 0.2, 0.3, 0.03, 0.05)); light(nd, 0.9, 0xffffff);
          }
          if (cue(a, 'in', T_GONE)) { const c = anchor('chest', _b); for (let i = 0; i < 30; i++) tspark(c, 0.3, 0.5, 0.5, 0.04, 0.2); for (let i = 0; i < 26; i++) tspark(SLIT.pt(0.2 + 0.6 * Math.random(), rs(), _c), 0.03, 0.4, 0.5, 0.035, 0.1); }
          if (cue(a, 'sewn', T_SEW1)) { for (let i = 0; i < 60; i++) tspark(SLIT.pt(Math.random(), 0, _c), 0.02, 0.5, 0.6, 0.04, 0.15); shock(SLIT.pt(0.5, 0, _b), 0.05, 0.5, 0.4, COL.foxPale); }
          fxHitP.copy(SLIT.pt(0.55, 0, _b));
          if (cue(a, 'back', T_BACK)) { const c = anchor('chest', _b); burst(c, 70, 2.0, 0.6, 0.045, COL.foxPale, 0.3, 1.3, 0.4); for (let i = 0; i < 40; i++) tspark(c, 0.25, 0.8, 0.7, 0.04, 0.3); _c.copy(FR.O); shock(_c, 0.15, 0.9, 0.5, COL.fox, true); }
          const bl = win(T, T_BACK - 0.03, T_BACK + 0.35, 0.05); if (bl > 0.01) light(anchor('chest', _b), 1.8 * bl, 0xcfe8ff);
        } });
    })();
    // Same Cloth (paintings H9, H10, I8). She draws her shears, points them at her enemy and snips round its outline from where she stands: a
    // ghost copy of it peels away like a shape cut from cloth. Shears away, both hands up, a thread from every fingertip: she works the copy
    // like a puppet, draws it back, and throws it at the thing it was cut from. She laughs, takes the shears again, snips the threads, and the
    // copy unravels from the top. The copy is made from whatever the host says she is aiming at (fox.target); with nothing given, a cloth doll.
    (function () {
      const dur = 6.7, T_C0 = 0.86, SEG = 0.175, T_C1 = T_C0 + 8 * SEG, T_TL = 2.84, T_TR = 3.30, T_W0 = 3.42, T_W1 = 3.92, T_HIT = 4.20, T_GIVE = 4.95, T_SNIP = 5.70, keys = [], HS = stride.hip;
      const C = [-0.15, 1.30, 0.43], RAD = 0.075, cutArm = (ph) => arm('R', [C[0] - RAD * Math.cos(ph), C[1] + RAD * Math.sin(ph), C[2]], [-0.6, -1, -0.2], FP.grip, 0, [0, 0.3]);
      const trailL = arm('L', [0.30, 0.97, -0.10], [0.6, -0.2, -1], FP.soft, 0.2, [0.1, 0]), LH = [0.13, 1.44, 0.34];
      const pupL = (h, w) => arm('L', h, [0.9, 0.15, -0.3], PUP, 0.8, [w === undefined ? 0.25 : w, 0]), pupR = (h, w) => arm('R', h, [-0.9, 0.15, -0.3], PUP, 0.8, [w === undefined ? 0.25 : w, 0]);
      keys.push(K(0.30, { hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0, mouth: 0 }, gripAt(), restArm('L'), stand)); keys.push(K(0.42, { shr: 0 }, gripAt()));
      keys.push(K(0.80, { shr: 1, shs: 0, sho: 0.5, shl: -1.55, sp: [0, 0.08, 0], hd: [0, 0.02, 0.05] }, cutArm(PI / 2), trailL, stride));
      for (let k = 0; k <= 8; k++) keys.push(K(T_C0 + k * SEG, { sho: k % 2 ? 0.06 : 0.55, shl: -1.55, sp: [0, 0.08, 0], hd: [0.05 * Math.cos(PI / 2 - k * PI / 4), 0.02 - 0.04 * Math.sin(PI / 2 - k * PI / 4), 0.05] }, cutArm(PI / 2 - k * PI / 4)));      // round the outline: snip, snip, snip, snip
      keys.push(K(T_C1 - 0.10, {}, trailL)); keys.push(K(T_C1 + 0.10, { sho: 0, shr: 1 }, cutArm(PI / 2)));
      keys.push(K(2.72, { shr: 1, shl: 0.44, sho: 0, sp: [-0.04, 0.06, 0], hd: [0, -0.02, 0.05], mouth: 2 }, gripAt(HS)));                                    // shears away; her left hand is already up
      keys.push(K(2.86, { shr: 0 }, gripAt(HS), pupL([0.13, 1.46, 0.38])));
      const both = (t, sp, hd, hl, hr, w, o) => K(t, { sp, hd, mouth: 2 }, pupL(hl, w), pupR(hr, w), stride, o);
      keys.push(both(3.26, [0, 0.12, 0], [0, -0.06, 0.05], [0.13, 1.46, 0.38], [-0.19, 1.24, 0.42]));                                                                                    // a puppeteer's two hands (H10)
      keys.push(both(T_W0, [0, 0.12, 0], [0, -0.06, 0.05], [0.13, 1.46, 0.38], [-0.19, 1.24, 0.42]));
      keys.push(both(T_W1, [-0.22, 0.08, 0], [0.15, -0.04, 0.05], [0.02, 1.50, 0.32], [-0.30, 1.30, 0.30]));                                                                             // she draws it back
      keys.push(both(T_W1 + 0.07, [-0.23, 0.08, 0], [0.15, -0.04, 0.05], [0.02, 1.50, 0.32], [-0.30, 1.30, 0.30]));
      keys.push(both(T_HIT, [0.20, 0.16, 0], [-0.12, -0.02, 0.05], [0.22, 1.36, 0.42], [-0.08, 1.16, 0.46], 0.05));                                                                      // and throws it at the thing it was cut from
      keys.push(both(T_HIT + 0.12, [0.21, 0.16, 0], [-0.12, -0.02, 0.05], [0.22, 1.36, 0.42], [-0.08, 1.16, 0.46], 0.05));
      keys.push(both(4.55, [0.05, -0.02, 0], [0, -0.20, 0.08], [0.16, 1.48, 0.36], [-0.16, 1.28, 0.38], 0.25, { sh: [0, 0] }));                                                          // she laughs
      for (let i = 0; i < 2; i++) { keys.push(K(4.63 + i * 0.16, { sh: [0.5, 0.5] })); keys.push(K(4.71 + i * 0.16, { sh: [0, 0] })); }
      keys.push(both(T_GIVE, [0.05, 0.06, 0], [0, -0.06, 0.05], LH, [-0.10, 1.34, 0.38], 0.25, { sh: [0, 0] }));                                                                         // her right hand gives its threads to her left
      keys.push(K(5.22, { shr: 0, sp: [0.02, 0.08, 0], hd: [-0.15, 0.10, 0.03] }, gripAt(HS), pupL(LH)));
      keys.push(K(5.30, { shr: 0 }, gripAt(HS)));
      const snipArm = arm('R', [-0.257, 1.315, 0.369], [-0.8, -0.8, -0.2], FP.grip, -1, [0, 0]), snipB = { sp: [0.05, 0.10, 0], hd: [0.05, 0.03, 0.05] };
      keys.push(K(5.58, { shr: 1, shs: 0, shl: -0.5, sho: 0.55, mouth: 2 }, snipB, snipArm, pupL(LH)));
      keys.push(K(5.66, { sho: 0.55 }, snipArm)); keys.push(K(T_SNIP + 0.02, { sho: 0 }, snipArm)); keys.push(K(5.86, { sho: 0, shl: -0.5 }, snipB, snipArm, pupL(LH)));                 // snip
      keys.push(K(6.22, { shr: 1, shl: 0.44, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, gripAt(HS), arm('L', [0.22, 1.05, 0.20], [1, -0.4, -0.3], FP.soft, 0.2, [0.2, 0]), stride));
      keys.push(K(6.34, { shr: 0 }, gripAt(HS)));
      keys.push(K(6.52, { shr: 0, hd: [0, 0, 0.05], sp: [0, 0, 0], mouth: 2 }, gripAt(), stand, restArm('L')));
      const spin = [[0, 0], [0.15, 0], [0.72, PI / 2], [5.95, PI / 2], [6.52, 0], [dur, 0]];
      const tp = V3(), X0 = V3(), Z0 = V3(), AX = V3(), VW = V3(), gp = V3(), hitP = V3(), tq = Qt(), AT = []; let yaw0 = 0, delta = 0, has = false, peelD = 0.8, nearD = 0.5;
      // where each thread is tied to the copy: her left hand has its head and arms, her right its body
      const ATT = [[0, 0.99, 0], [0.9, 0.77, 0], [-0.9, 0.77, 0], [0.45, 0.77, 0], [-0.45, 0.77, 0], [0, 0.86, 0], [0.3, 0.62, 0], [-0.3, 0.62, 0], [0.2, 0.36, 0], [-0.2, 0.36, 0]]; for (let i = 0; i < 10; i++) AT.push(V3());
      // the outline she cuts: a rounded shape a hand's breadth outside the enemy. An outline is what the eye sees, so it stands facing whoever is looking (AX runs across their view)
      const e2 = [0, 0], outl = (u, o) => { EGHOST.edge(u, e2); o.copy(tp).addScaledVector(AX, e2[0]).addScaledVector(VW, -0.06); o.y = tp.y + e2[1]; return o; };
      defAction('same_cloth', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [T_C0 / dur, T_C1 / dur, T_SNIP / dur], impact: 0.75,
        start() { has = false; spinWas = 0; EGHOST.from(tgtObj); },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          if (!has || T < T_C0) {                                                                    // where her enemy is: what the host gave her, or the usual distance to her left
            if (tgtObj) { tgtObj.updateWorldMatrix(true, false); tgtObj.getWorldPosition(tp); tgtObj.getWorldQuaternion(tq); _a.set(1, 0, 0).applyQuaternion(tq); yaw0 = Math.atan2(-_a.z, _a.x); X0.subVectors(tp, FR.O); X0.y = 0; if (X0.lengthSq() < 0.01) X0.copy(FR.X); X0.normalize(); }
            else { tp.copy(FR.O).addScaledVector(FR.X, 2.6 * tgtK); X0.copy(FR.X); yaw0 = Math.atan2(-X0.z, X0.x); }
            Z0.set(-X0.z, 0, X0.x); const yh = Math.atan2(-X0.z, X0.x), D = Math.hypot(tp.x - FR.O.x, tp.z - FR.O.z); delta = (((yh - yaw0) % (2 * PI)) + 2 * PI) % (2 * PI); if (delta < PI) delta += 2 * PI;
            nearD = EGHOST.w + 0.10; peelD = cl(D - 1.15, nearD + 0.25, 0.85); has = true;
          }
          AX.copy(X0); VW.copy(Z0).negate(); if (RIB.seen) { _b.subVectors(tp, RIB.eye); _b.y = 0; if (_b.lengthSq() > 0.04) { VW.copy(_b).normalize(); AX.set(VW.z, 0, -VW.x); if (AX.dot(X0) < 0) AX.negate(); } }
          const tipB = anchor('bladeA', _a);
          if (T > 0.6 && T < 2.7 && Math.random() < 5 * dt) emit(tipB.x, tipB.y, tipB.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8);
          // the outline, drawn as she snips
          const uo = cl((T - T_C0) / (T_C1 - T_C0), 0, 1), oa = sm(T_C0, T_C0 + 0.05, T) * (1 - sm(T_C1 + 0.45, T_C1 + 1.0, T));
          if (oa > 0.01 && uo > 0.001) {
            for (let j = 0; j < 6; j++) { const u0 = j / 6 * uo, u1 = (j + 1) / 6 * uo; RIB.path((u, o) => outl(lerp(u0, u1, u), o), 0.016, oa, u0 * 2 + t * 0.3, (u1 - u0) * 2, 0); }
            if (T < T_C1) { outl(uo, _b); many(70, dt, () => tspark(_b, 0.02, 0.4, 0.4, 0.035, 0.05)); light(_b, 1.2, 0xa8d0ff); }
            else many(40 * oa, dt, () => tspark(outl(Math.random(), _b), 0.02, 0.25, 0.5, 0.03, 0.05));
          }
          if (cue(a, 'cut', T_C1)) { for (let i = 0; i < 50; i++) tspark(outl(Math.random(), _b), 0.03, 0.6, 0.6, 0.04, 0.1); }
          hitP.copy(tp).addScaledVector(X0, -0.14); hitP.y += EGHOST.h * 0.77; fxHitP.copy(hitP);
          if (T >= T_C1 && T < T_SNIP + 0.95) {
            // the copy: it peels away toward her, turns on its enemy, is drawn back, and whirls in
            const pk = sm(T_C1 + 0.05, T_C1 + 0.75, T), wh = cl((T - T_W1) / (T_HIT - T_W1), 0, 1), after = Math.max(0, T - T_HIT);
            const E = T < T_W1 ? 0.22 * sm(T_W0 - 0.5, T_W0 + 0.2, T) - 0.08 * sm(T_W0 + 0.2, T_W1, T) : lerp(0.14, 1, Math.pow(wh, 1.8));
            let dist = peelD * pk + 0.10 * sm(T_W0 + 0.2, T_W1, T) - (peelD + 0.10 - nearD) * wh * wh; if (T > T_HIT) dist = nearD + 0.24 * (1 - Math.exp(-after * 6));
            const yaw = yaw0 + delta * E + (T > T_HIT ? 0.30 * Math.exp(-after * 3) * Math.sin(after * 15) : 0), tilt = T > T_HIT ? 0.10 * Math.exp(-after * 3.5) * Math.sin(after * 13) : 0.05 * Math.sin(pk * PI);
            gp.copy(tp).addScaledVector(X0, -dist); gp.y += 0.03 * Math.sin(pk * PI);
            const un = sm(T_SNIP + 0.05, T_SNIP + 0.85, T), top = T < T_SNIP ? 99 : tp.y + EGHOST.h * 1.08 * (1 - un) - 0.06, op = 0.95 * sm(T_C1, T_C1 + 0.3, T);
            EGHOST.show(op, gp, yaw, tilt, 0, top, t); _b.copy(gp); _b.y += EGHOST.h * 0.6; light(_b, 0.9 * op * (1 - un), 0x66a8ff);
            for (let i = 0; i < 10; i++) { const q = ATT[i]; AT[i].set(q[0] * EGHOST.w, q[1] * EGHOST.h, q[2]); EGHOST.group.localToWorld(AT[i]); }
            if (T < T_C1 + 0.8) many(30, dt, () => { _b.copy(gp); _b.y += Math.random() * EGHOST.h; tspark(_b, EGHOST.w * 0.6, 0.2, 0.5, 0.03, 0.05); });
            if (T > T_SNIP && un < 1) many(120, dt, () => { _b.copy(gp); _b.y = top; _b.x += rs() * EGHOST.w * 0.7; _b.z += rs() * EGHOST.w * 0.7; tspark(_b, 0.03, 0.3, 0.7, 0.035, -0.15); });      // it comes apart into thread
            // her threads
            const give = sm(T_GIVE - 0.14, T_GIVE + 0.14, T), cutT = T - T_SNIP;
            for (let i = 0; i < 10; i++) {
              const S = i < 5 ? 'L' : 'R', f = i % 5, on = sm((i < 5 ? T_TL : T_TR) + f * 0.03, (i < 5 ? T_TL : T_TR) + 0.2 + f * 0.03, T); if (on <= 0.001) continue;
              tipOf(S, f, _c); if (i >= 5 && give > 0) _c.lerp(tipOf('L', f, _d), give);
              const A = AT[i], taut = T > T_W1 && T < T_HIT + 0.1 ? 1 : 0, sag = 0.07 - 0.04 * taut + 0.02 * Math.sin(t * 3 + i);
              if (cutT < 0) RIB.path((u, o) => { o.lerpVectors(_c, A, u * on); o.y -= sag * Math.sin(PI * u * on); }, 0.0055, 0.95, i * 0.11, 0.9, 0);
              else if (cutT < 0.7) {                                                                // cut: the long end falls away from the copy, the short end hangs from her fingers
                const k = 0.16, fall = 1.6 * cutT * cutT, fade = 1 - cutT / 0.7; _e.lerpVectors(_c, A, k); _f.copy(_e); _f.y -= fall; _f.addScaledVector(X0, 0.25 * cutT);
                RIB.path((u, o) => { o.lerpVectors(_f, A, u); o.y -= (sag + 0.5 * cutT) * Math.sin(PI * u); if (A.y > top) o.y = Math.min(o.y, lerp(_f.y, top, u)); }, 0.0055, 0.95 * fade, i * 0.11, 0.9, 0);
                _g.copy(_e); _g.y -= 0.9 * cutT * cutT + 0.06 * cutT; RIB.path((u, o) => { o.lerpVectors(_c, _g, u); }, 0.0055, 0.95 * fade, i * 0.11, 0.2, 0);
              }
            }
            if (cue(a, 'tl', T_TL + 0.1)) burst(tipOf('L', 2, _b), 14, 0.6, 0.35, 0.025, COL.foxPale, 0.2, 1.2, 0.2);
            if (cue(a, 'tr', T_TR + 0.1)) burst(tipOf('R', 2, _b), 14, 0.6, 0.35, 0.025, COL.foxPale, 0.2, 1.2, 0.2);
          }
          if (cue(a, 'hit', T_HIT)) { burst(hitP, 90, 2.6, 0.6, 0.05, COL.fox, 0.5, 1.4, 0.4); for (let i = 0; i < 40; i++) tspark(hitP, 0.05, 1.4, 0.7, 0.045, 0.3); shock(hitP, 0.06, 0.6, 0.35, COL.foxPale); }
          const fl = win(T, T_HIT - 0.02, T_HIT + 0.35, 0.05); if (fl > 0.01) light(hitP, 1.8 * fl, 0x8fd8ff);
          if (cue(a, 'snip', T_SNIP)) { const p = anchor('bladeAm', _b); burst(p, 22, 0.8, 0.4, 0.03, COL.foxPale, 0.3, 1.2, 0.2); }
        } });
    })();
  })();
