// The spells and the great wraith's stolen fire, in 3D. Sparks are one big
// point cloud; glows, rings, flames and lights come from pools and are claimed
// fresh every frame, so every picture is still a pure function of t.

const FX = { n: 0, claims: [] };
const MAXP = 6000, NLIGHT = 7;
const LIN = {};
// "r,g,b" (sRGB 0-255) to a linear colour, cached
function lin(rgb) {
  if (!LIN[rgb]) { const [r, g, b] = rgb.split(",").map(Number); LIN[rgb] = new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace); }
  return LIN[rgb];
}

// ---------- painted pieces ----------
function paintSpark(g, w) {
  const c = w / 2;
  const gr = g.createRadialGradient(c, c, 0, c, c, c);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.18, "rgba(255,255,255,0.7)"); gr.addColorStop(0.45, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, w);
  g.fillStyle = "rgba(255,255,255,0.85)";        // the four-point sparkle the sprites use
  g.beginPath(); g.moveTo(0, c); g.quadraticCurveTo(c, c, c, 0); g.quadraticCurveTo(c, c, w, c); g.quadraticCurveTo(c, c, c, w); g.quadraticCurveTo(c, c, 0, c); g.fill();
}
function paintRing(g, w, thick) {
  const c = w / 2, r = c * 0.9;
  const gr = g.createRadialGradient(c, c, r * (1 - thick * 2), c, c, r * (1 + thick * 0.6));
  gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.75, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.beginPath(); g.arc(c, c, r * (1 + thick * 0.6), 0, TAU); g.fill();
}
function paintFlame(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.55, w * 0.55);
  gr.addColorStop(0, "rgba(255,250,225,1)"); gr.addColorStop(0.45, "rgba(255,190,80,0.9)"); gr.addColorStop(1, "rgba(255,110,30,0)");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(w / 2, h * 0.04);
  g.quadraticCurveTo(w * 0.98, h * 0.52, w / 2, h * 0.96); g.quadraticCurveTo(w * 0.02, h * 0.52, w / 2, h * 0.04); g.fill();
}
function paintOddsRing(g, w) {
  const c = w / 2, R = c * 0.82;
  g.strokeStyle = "#ffd890"; g.lineWidth = w * 0.012; g.shadowColor = "#ffb040"; g.shadowBlur = w * 0.02;
  g.beginPath(); g.arc(c, c, R, 0, TAU); g.stroke();
  for (let i = 0; i < 16; i++) {
    const an = (i / 16) * TAU;
    g.beginPath(); g.moveTo(c + Math.cos(an) * R * 0.88, c + Math.sin(an) * R * 0.88); g.lineTo(c + Math.cos(an) * R * 1.1, c + Math.sin(an) * R * 1.1); g.stroke();
  }
  g.lineWidth = w * 0.006; g.beginPath(); g.arc(c, c, R * 0.72, 0, TAU); g.stroke();
}
// The cracked ring Gravity leaves in the cobbles: dark cracks, or their violet glow.
function paintCracks(g, w, lit) {
  const r = rng(77), c = w / 2, k = w / 380;
  g.lineCap = "round";
  g.strokeStyle = lit ? `rgba(${VIOLET},0.9)` : "rgba(10,4,16,0.92)"; g.lineWidth = (lit ? 2 : 6) * k;
  if (lit) { g.shadowColor = `rgb(${VIOLET})`; g.shadowBlur = 6 * k; }
  for (let i = 0; i < 14; i++) {
    const an = (i / 14) * TAU + r() * 0.3;
    let rad = 18 + r() * 12;
    g.beginPath(); g.moveTo(c + Math.cos(an) * rad * 0.4 * k, c + Math.sin(an) * rad * 0.4 * k);
    for (let j = 0; j < 5; j++) { rad += 11 + r() * 18; const a2 = an + (r() - 0.5) * 0.35; g.lineTo(c + Math.cos(a2) * rad * k, c + Math.sin(a2) * rad * k); }
    g.stroke();
  }
}
function paintCurtain(g, w, h) {
  const folds = 5, fw = w / folds;
  for (let i = 0; i < folds; i++) {
    const gr = g.createLinearGradient(i * fw, 0, (i + 1) * fw, 0);
    gr.addColorStop(0, "rgba(150,40,120,0.2)"); gr.addColorStop(0.4, "rgba(255,150,225,0.34)");
    gr.addColorStop(0.55, "rgba(255,190,240,0.4)"); gr.addColorStop(1, "rgba(120,30,100,0.22)");
    g.fillStyle = gr; g.fillRect(i * fw, 0, fw + 1, h);
  }
  g.fillStyle = `rgba(${GOLD},0.85)`;
  for (let x = 0; x < w; x += 2) g.fillRect(x, h * 0.9 + Math.sin(x * 0.05) * h * 0.01, 2, h * 0.012);
}
function paintMist(g, w, h) {
  const r = rng(7);
  for (let i = 0; i < 70; i++) {
    const x = w * (0.18 + r() * 0.64), y = h * (0.4 + r() * 0.2), rad = h * (0.12 + r() * 0.2), a = 0.05 + r() * 0.08;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(200,185,235,${a})`); gr.addColorStop(1, "rgba(200,185,235,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}
function paintValance(g, w, h) {
  g.fillStyle = "rgba(40,10,38,0.92)";
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0);
  for (let x = w; x >= 0; x -= w / 64) g.lineTo(x, h * 0.55 + Math.abs(Math.sin((x / w) * Math.PI * 8)) * h * 0.4);
  g.closePath(); g.fill();
  g.strokeStyle = `rgba(${GOLD},0.8)`; g.lineWidth = h * 0.04;
  g.beginPath();
  for (let x = 0; x <= w; x += w / 64) g.lineTo(x, h * 0.55 + Math.abs(Math.sin((x / w) * Math.PI * 8)) * h * 0.4);
  g.stroke();
}

// ---------- pools ----------
function makePool(scene, n, make) {
  const items = [];
  for (let i = 0; i < n; i++) { const o = make(); o.visible = false; scene.add(o); items.push(o); }
  return { items, i: 0 };
}
function take(P) {
  if (P.i >= P.items.length) return null;
  const o = P.items[P.i++]; o.visible = true; return o;
}
function clearPool(P) { for (const o of P.items) o.visible = false; P.i = 0; }

const SPARK_VS = `attribute float size; attribute vec3 tint; varying vec3 vTint; uniform float scale;
void main() { vTint = tint; vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(size * scale / -mv.z, 1.5, 160.0); gl_Position = projectionMatrix * mv; }`;
const SPARK_FS = `uniform sampler2D map; varying vec3 vTint;
void main() { float a = texture2D(map, gl_PointCoord).a; gl_FragColor = vec4(vTint * a, a); }`;

function buildFx(scene) {
  FX.tex = {
    spark: canvasTex(64, 64, paintSpark), ring: canvasTex(256, 256, (g, w) => paintRing(g, w, 0.035)),
    thick: canvasTex(256, 256, (g, w) => paintRing(g, w, 0.1)), flame: canvasTex(64, 128, paintFlame),
  };
  // sparks: one point cloud, refilled every frame
  const geo = new THREE.BufferGeometry();
  FX.pos = new Float32Array(MAXP * 3); FX.tint = new Float32Array(MAXP * 3); FX.size = new Float32Array(MAXP);
  geo.setAttribute("position", new THREE.BufferAttribute(FX.pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("tint", new THREE.BufferAttribute(FX.tint, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("size", new THREE.BufferAttribute(FX.size, 1).setUsage(THREE.DynamicDrawUsage));
  FX.sparkMat = new THREE.ShaderMaterial({ uniforms: { map: { value: FX.tex.spark }, scale: { value: 400 } }, vertexShader: SPARK_VS, fragmentShader: SPARK_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  FX.points = new THREE.Points(geo, FX.sparkMat); FX.points.frustumCulled = false; FX.points.renderOrder = 6;
  scene.add(FX.points);
  const add = (map, o = {}) => Object.assign({ map, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }, o);
  FX.glows = makePool(scene, 64, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(add(W3.glowTex))); s.renderOrder = 4; return s; });
  FX.rings = makePool(scene, 18, () => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial(add(FX.tex.ring, { side: THREE.DoubleSide }))));
  FX.thick = makePool(scene, 8, () => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial(add(FX.tex.thick, { side: THREE.DoubleSide }))));
  FX.flames = makePool(scene, 64, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial(add(FX.tex.flame))); s.renderOrder = 5; return s; });
  FX.orbs = makePool(scene, 4, () => new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0x06020c })));
  FX.lights = [...Array(NLIGHT)].map(() => { const l = new THREE.PointLight(0xffffff, 0, 8, 2); scene.add(l); return l; });

  // the doom sigils over the sealed, one canvas each
  FX.sigils = FOES.filter(f => f.seal != null).map(f => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, fog: false }));
    s.visible = false; s.renderOrder = 7; scene.add(s);
    return { f, cv, tx, s };
  });
  // Gravity: the new-moon disc, and the cracks it leaves
  FX.gdisc = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x06020c, side: THREE.DoubleSide, transparent: true }));
  FX.gdisc.rotation.x = -Math.PI / 2; FX.gdisc.visible = false; scene.add(FX.gdisc);
  const decal = (lit) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, (g, w) => paintCracks(g, w, lit)), transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -3, blending: lit ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !lit }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.visible = false; m.renderOrder = 1; scene.add(m);
    return m;
  };
  FX.crack = decal(false); FX.crackGlow = decal(true);
  // Against All Odds: the gold ring at her feet
  FX.odds = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial(add(canvasTex(512, 512, paintOddsRing), { side: THREE.DoubleSide, fog: true })));
  FX.odds.rotation.x = -Math.PI / 2; FX.odds.position.y = 0.03; FX.odds.visible = false; scene.add(FX.odds);
  // Curtain Call: the beam to the moon
  FX.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.03, 1, 10, 1, true), new THREE.MeshBasicMaterial({ color: lin(VIOLET).clone().multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }));
  FX.beam.visible = false; scene.add(FX.beam);
  // the curtains ride with the camera, just behind her
  const ctex = canvasTex(512, 256, paintCurtain);
  FX.curtains = [-1, 1].map(side => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 20, 10), new THREE.MeshBasicMaterial({ map: ctex, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.userData.base = m.geometry.attributes.position.array.slice(); m.userData.side = side;
    m.visible = false; camera3.add(m);
    return m;
  });
  FX.valance = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 128, paintValance), transparent: true, depthWrite: false, fog: false }));
  FX.valance.visible = false; camera3.add(FX.valance);
  // a low mist that drifts across the cobbles
  const mistTex = canvasTex(512, 128, paintMist);
  const mr = rng(91);
  FX.mist = [...Array(12)].map((_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, depthWrite: false, color: 0x9a88c8 }));
    s.userData = { x: -16 + mr() * 32, z: -12 + mr() * 24, sp: 0.12 + mr() * 0.15, ph: mr() * 50 };
    s.scale.set(14, 3.2, 1); s.renderOrder = 2; scene.add(s);
    return s;
  });
}

// ---------- claiming, per frame ----------
function spark3(p, size, rgb, a) {
  if (a <= 0.01 || FX.n >= MAXP) return;
  const i = FX.n++, c = lin(rgb);
  FX.pos[i * 3] = p.x; FX.pos[i * 3 + 1] = p.y; FX.pos[i * 3 + 2] = p.z;
  FX.tint[i * 3] = c.r * a; FX.tint[i * 3 + 1] = c.g * a; FX.tint[i * 3 + 2] = c.b * a;
  FX.size[i] = size;
}
function glow3(p, size, rgb, a) {
  if (a <= 0.004) return;
  const s = take(FX.glows);
  if (!s) return;
  s.position.copy(p); s.scale.setScalar(size * 2);
  s.material.color.copy(lin(rgb)); s.material.opacity = Math.min(1, a);
}
// A ring of radius r: "flat" on the ground (or any level), or facing the camera.
function ring3(p, r, rgb, a, flat, thick) {
  if (a <= 0.01 || r <= 0) return;
  const m = take(thick ? FX.thick : FX.rings);
  if (!m) return;
  m.position.copy(p); m.scale.setScalar(r / 0.9);
  if (flat) m.rotation.set(-Math.PI / 2, 0, 0); else m.quaternion.copy(camera3.quaternion);
  m.material.color.copy(lin(rgb)); m.material.opacity = Math.min(1, a);
  return m;
}
function flame3(p, s, a, halo = true) {
  if (a <= 0.01) return;
  const f = take(FX.flames);
  if (f) { f.position.copy(p); f.scale.set(s * 0.6, s * 1.2, 1); f.material.opacity = Math.min(1, a); }
  if (halo) glow3(p, s * 2.4, "255,150,60", 0.4 * a);
}
function orb3(p, r) { const o = take(FX.orbs); if (o) { o.position.copy(p); o.scale.setScalar(r); } }
function light3(p, rgb, intensity, dist) { if (intensity > 0.05) FX.claims.push([p.clone(), rgb, intensity, dist]); }

function fxBegin() {
  FX.n = 0; FX.claims.length = 0;
  for (const P of [FX.glows, FX.rings, FX.thick, FX.flames, FX.orbs]) clearPool(P);
}
function fxEnd(viewH) {
  const g = FX.points.geometry;
  g.setDrawRange(0, FX.n);
  for (const k of ["position", "tint", "size"]) { g.attributes[k].needsUpdate = true; g.attributes[k].clearUpdateRanges(); g.attributes[k].addUpdateRange(0, FX.n * (k === "size" ? 1 : 3)); }
  FX.sparkMat.uniforms.scale.value = viewH / (2 * Math.tan((camera3.fov * Math.PI) / 360));
  // the brightest claims get the lights
  FX.claims.sort((a, b) => b[2] - a[2]);
  FX.lights.forEach((l, i) => {
    const c = FX.claims[i];
    if (!c) { l.intensity = 0; return; }
    l.position.copy(c[0]); l.color.copy(lin(c[1])); l.intensity = c[2]; l.distance = c[3];
  });
}

// ---------- motion ----------
// Flight from a to b over [t0, t1], arcing up by lift metres.
function flight3(t, t0, t1, a, b, lift) {
  const k = clamp((t - t0) / (t1 - t0)), p = a.clone().lerp(b, easeInOut(k));
  p.y += Math.sin(Math.PI * k) * lift;
  return p;
}
function trail3(t, t0, t1, a, b, lift, rgb, size, seed) {
  if (t < t0 || t > t1 + 0.3) return;
  for (let i = 0; i < 12; i++) {
    const tt = t - i * 0.02;
    if (tt < t0 || tt > t1) continue;
    const p = flight3(tt, t0, t1, a, b, lift);
    p.x += (hash2(i, seed) - 0.5) * 0.08; p.y += (hash2(i, seed + 1) - 0.5) * 0.08; p.z += (hash2(i, seed + 2) - 0.5) * 0.08;
    spark3(p, size * (1 - i / 13), rgb, 1 - i / 12);
  }
}
// A burst of sparks from p at t0, closed form. Speeds in m/s, grav in m/s² (down).
function burst3(t, t0, o) {
  const age0 = t - t0;
  if (age0 < 0 || age0 > o.life * 1.7) return;
  for (let i = 0; i < o.n; i++) {
    const r1 = hash2(i, o.seed), r2 = hash2(i, o.seed + 1), r3 = hash2(i, o.seed + 2), r4 = hash2(i, o.seed + 3);
    const life = o.life * (0.5 + 0.5 * r3), age = age0;
    if (age > life) continue;
    // a direction on the sphere, squeezed toward up if asked
    const yaw = r1 * TAU, up = o.up == null ? r2 * 2 - 1 : lerp(o.up, 1, r2);
    const ring = Math.sqrt(Math.max(0, 1 - up * up));
    const sp = o.speed * (0.3 + 0.7 * r4), drag = o.drag || 3, d = (sp * (1 - Math.exp(-age * drag))) / drag;
    const p = v3(o.p.x + Math.cos(yaw) * ring * d, o.p.y + up * d - 0.5 * (o.grav || 0) * age * age, o.p.z + Math.sin(yaw) * ring * d);
    if (p.y < 0.02) p.y = 0.02;
    const k = 1 - age / life;
    spark3(p, o.size * (0.6 + 0.8 * r3) * (0.4 + 0.6 * k), o.colors[i % o.colors.length], k);
  }
}

// ---------- the spells ----------
const sigilM = f => (f.kind === "great" ? 0.5 : f.kind === "wraith" ? 0.32 : 0.22);
function doomNumber(t) {
  let n = 3;
  for (const [tt, v] of DOOM_TICKS) if (t >= tt) n = v;
  return n;
}
function fxDoom(t) {
  for (const S of FX.sigils) {
    const f = S.f;
    S.s.visible = false;
    if (t < f.seal || t > CC + 0.6) continue;
    const hd = foeHead(f, t);
    if (!hd) continue;
    let pulse = decay(t, f.seal, 0.35);
    for (const [tt] of DOOM_TICKS) pulse = Math.max(pulse, decay(t, tt, 0.3));
    const a = ramp(t, f.seal, 0.15) * (t > CC ? 1 - clamp((t - CC) / 0.35) : 1);
    if (a <= 0.01) continue;
    const r = sigilM(f), g = S.cv.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 256, 256);
    drawSigil(g, 128, 128, 50, doomNumber(t), t, pulse, a);
    S.tx.needsUpdate = true;
    S.s.visible = true;
    S.s.position.copy(hd); S.s.position.y += r * 1.4;
    S.s.scale.setScalar(r * 5.12);
    light3(S.s.position, MAGENTA, 2.5 * a * (1 + pulse), 5);
  }
}

function fxRebuke(t, js) {
  if (t < HIT - 0.1 || t > HIT + 1.6 || !js) return;
  const at = hand3(js, "flail").lerp(foeMiddle(foe("w3"), HIT) || hand3(js, "flail"), 0.3);
  const d = decay(t, HIT, 0.18);
  glow3(at, 0.7, GOLD, 0.55 * d);
  ring3(at, 0.1 + (t - HIT) * 2.6, GOLD, 0.85 * decay(t, HIT, 0.15), false, true);
  burst3(t, HIT, { p: at, n: 40, seed: 5, speed: 3.4, life: 0.9, grav: 3, colors: [GOLD, "255,240,190"], size: 0.05 });
  light3(at, GOLD, 30 * d, 8);
}

function fxHush(t, js) {
  if (t < hush.release - 0.1 || t > HUSH_LAND[1] + 1.2 || !js) return;
  const p0 = hand3(js, "hush");
  [foe("w1"), foe("w2")].forEach((f, i) => {
    const land = HUSH_LAND[i], [u, v] = foeMouth(f), to = foeAt(f, land, u, v);
    if (!to) return;
    if (t < land) {
      const p = flight3(t, hush.release, land, p0, to, 0.5 + 0.3 * i);
      ring3(p, 0.09, VIOLET, 0.95, false);
      glow3(p, 0.32, VIOLET, 0.6);
      trail3(t, hush.release, land, p0, to, 0.5 + 0.3 * i, VIOLET, 0.05, 9 + i);
      light3(p, VIOLET, 6, 5);
    }
    burst3(t, land, { p: to, n: 18, seed: 30 + i, speed: 1.2, life: 0.6, colors: [VIOLET, SILVER], size: 0.035 });
    glow3(to, 0.6, VIOLET, 0.7 * decay(t, land, 0.2));
  });
}

function fxGravity(t, js) {
  FX.gdisc.visible = false;
  const f = foe("wr");
  if (t < gravity.release - 0.05 || t > GRAV_HIT + 3 || !js) return;
  const p0 = hand3(js, "orb"), tArrive = gravity.release + 0.3;
  const mid = foeMiddle(f, Math.min(t, GRAV_HIT - 0.01)), st = foeState(f, Math.min(t, GRAV_HIT - 0.01));
  if (!mid || !st) return;
  const h = st.meta.gy * st.mpp, foot = st.p.clone();
  if (t < tArrive) {
    const p = flight3(t, gravity.release, tArrive, p0, mid, 0.3);
    orb3(p, 0.08); ring3(p, 0.1, VIOLET, 0.9, false); glow3(p, 0.45, VIOLET, 0.6);
    light3(p, VIOLET, 8, 5);
  }
  // the new-moon disc presses down from above
  const R = h * 0.22;
  if (t > tArrive - 0.1 && t < GRAV_HIT + 1.6) {
    const k = clamp((t - (tArrive - 0.1)) / (GRAV_HIT - tArrive + 0.1));
    const y = lerp(foot.y + h + 2.6, foot.y + h * 0.8, easeIn(k)) - (t > GRAV_HIT ? h * 0.28 * ramp(t, GRAV_HIT, 0.15) : 0);
    const a = t < GRAV_HIT ? ramp(t, tArrive - 0.1, 0.12) : 1 - clamp((t - GRAV_HIT - 0.5) / 1.1);
    const c = v3(foot.x, y, foot.z);
    FX.gdisc.visible = a > 0.01; FX.gdisc.position.copy(c); FX.gdisc.scale.setScalar(R); FX.gdisc.material.opacity = a;
    FX.gdisc.lookAt(camera3.position.x, camera3.position.y + 7, camera3.position.z);   // seen from a little above, like the painted one
    for (const k of [0.02, -0.02]) {
      const m = ring3(c.clone().addScaledVector(v3(0, 0, 1).applyQuaternion(FX.gdisc.quaternion), k), R * 1.04, VIOLET, 0.95 * a, false, true);
      if (m) m.quaternion.copy(FX.gdisc.quaternion);
    }
    glow3(c, R * 2.2, VIOLET, 0.45 * a);
    light3(c, VIOLET, 10 * a, 6);
  }
  if (t >= GRAV_HIT) {
    const g0 = foot.clone().setY(0.06);
    ring3(g0, 0.25 + (t - GRAV_HIT) * 3.3, VIOLET, 0.85 * decay(t, GRAV_HIT, 0.25), true, true);
    burst3(t, GRAV_HIT, { p: g0, n: 34, seed: 41, speed: 2.6, life: 1.0, grav: 6, up: 0.3, colors: ["150,135,120", "120,110,100", VIOLET], size: 0.04 });
    light3(g0.clone().setY(0.6), VIOLET, 40 * decay(t, GRAV_HIT, 0.3), 9);
  }
}
function fxCrack(t) {
  const on = t >= GRAV_HIT && t < RELEASE_ALL + 6;
  FX.crack.visible = FX.crackGlow.visible = on;
  if (!on) return;
  const p = path3(GRAV_HIT, foe("wr").path), grow = 0.35 + 0.65 * easeOut(clamp((t - GRAV_HIT) / 0.25));
  const fade = t > RELEASE_ALL ? 1 - clamp((t - RELEASE_ALL - 2) / 4) : 1, size = 3.4 * grow;
  for (const m of [FX.crack, FX.crackGlow]) { m.position.x = p.x; m.position.z = p.z; m.scale.set(size, size, 1); }
  FX.crack.material.opacity = fade;
  FX.crackGlow.material.opacity = fade * (0.35 + 0.65 * decay(t, GRAV_HIT, 1.5));
}

function fxSeal(t, js) {
  if (t < seal.t0 || t > SEAL_LAND[2] + 1 || !js) return;
  const pen = hand3(js, "pendant"), pg = bump(t, seal.t0 + 0.2, 2.6);
  glow3(pen, 0.3, "90,240,220", 0.7 * pg);      // her pendant of secrets wakes
  light3(pen, "90,240,220", 4 * pg, 4);
  const p0 = hand3(js, "sigil");
  [foe("gw"), foe("wr"), foe("w2")].forEach((f, i) => {
    const land = SEAL_LAND[i], hd = foeHead(f, land);
    if (!hd) return;
    const to = hd.clone(); to.y += sigilM(f) * 1.4;
    if (t >= seal.release && t < land) {
      const p = flight3(t, seal.release, land, p0, to, 1.1 + i * 0.3);
      glow3(p, 0.35, MAGENTA, 0.65); ring3(p, 0.08, MAGENTA, 0.9, false);
      trail3(t, seal.release, land, p0, to, 1.1 + i * 0.3, MAGENTA, 0.06, 50 + i);
      light3(p, MAGENTA, 5, 5);
    }
    burst3(t, land, { p: to, n: 22, seed: 60 + i, speed: 1.4, life: 0.7, colors: [MAGENTA, VIOLET, SILVER], size: 0.045 });
  });
}

function fxOdds(t, js) {
  FX.odds.visible = false;
  if (t < odds.t0 || t > odds.t1 + 3.5 || !js) return;
  const live = clamp((t - odds.release) / 0.4) * (1 - clamp((t - odds.t1 - 1.5) / 2));
  const c = v3(js.x, 0, js.y);
  glow3(c.clone().setY(1.1), 2.6, GOLD, 0.18 * live);
  light3(c.clone().setY(2.2), GOLD, 14 * live, 7);
  for (let i = 0; i < 90; i++) {
    const t0 = odds.release + hash2(i, 3) * 6.2, age = t - t0, life = 1.4 + hash2(i, 4) * 0.8;
    if (age < 0 || age > life) continue;
    const an = hash2(i, 5) * TAU, rad = 0.3 + Math.sqrt(hash2(i, 7)) * 1.5;
    const p = v3(js.x + Math.cos(an) * rad + Math.sin(age * 3 + i) * 0.04, 3.2 - age * 1.75, js.y + Math.sin(an) * rad);
    if (p.y < 0.03) continue;
    const tw = 0.5 + 0.5 * Math.sin(t * 14 + i);
    spark3(p, 0.03 + 0.03 * hash2(i, 6), i % 2 ? GOLD : VIOLET, (1 - age / life) * (0.5 + 0.5 * tw));
  }
  if (live > 0) {
    FX.odds.visible = true;
    FX.odds.position.set(js.x, 0.03, js.y); FX.odds.scale.setScalar(1.95 * (1 + 0.04 * Math.sin(t * 3)));
    FX.odds.rotation.set(-Math.PI / 2, 0, (t - odds.release) * 0.5);
    FX.odds.material.opacity = 0.9 * live;
  }
}

// ---------- the stolen fire ----------
// Each lamp's flame flies into the great wraith's ribs, then home again on release.
function fxFlames(t) {
  if (t < LAMPS[0].gone - 0.3 || t > LAMPS[LAMPS.length - 1].back + 0.5) return;
  const ribs = foeAt(foe("gw"), Math.min(t, 60), 0.5, 0.42);
  if (!ribs) return;
  LAMPS.forEach((L, i) => {
    const at = v3(...L.at), t0 = L.gone - 0.25, t1 = L.gone + 0.45;
    if (t > t0 && t < t1 + 0.2) {
      const k = clamp((t - t0) / (t1 - t0)), p = flight3(Math.min(t, t1), t0, t1, at, ribs, 1.0);
      const a = 1 - clamp((t - t1) / 0.2);
      flame3(p, 0.32 - 0.14 * k, a);
      light3(p, "255,170,80", 6 * a, 6);
    }
    const b0 = L.back - 0.7, b1 = L.back;
    if (t > b0 && t < b1) {
      const p = flight3(t, b0, b1, ribs, at, 1.4 + 0.3 * i);
      flame3(p, 0.28, 1);
      trail3(t, b0, b1, ribs, at, 1.4 + 0.3 * i, "255,190,90", 0.06, 200 + i);
      light3(p, "255,170,80", 6, 6);
    }
  });
}
// It breathes the stolen fire at her; her ward breaks it.
function fxBreath(t, js) {
  if (t < BREATH[0] || t > BREATH[1] + 1.2 || !js) return;
  const g = foe("gw"), st = foeState(g, t);
  if (!st) return;
  const mouth = foeAt(g, t, 0.78, 0.22);
  const her = v3(js.x, 1.1, js.y), dir = mouth.clone().sub(her).setY(0).normalize();
  const stop = her.clone().addScaledVector(dir, 0.85);      // where her light holds it
  const side = rightOf(facing(stop, camera3));
  const live = t < BREATH[1] ? ramp(t, BREATH[0], 0.3) : 1 - clamp((t - BREATH[1]) / 0.5);
  if (live > 0.01) {
    const FIRE = ["255,245,200", "255,200,90", "255,140,50", "220,70,30"];
    for (let i = 0; i < 260; i++) {
      const ph = (t * 1.4 + hash2(i, 300)) % 1, spread = 0.1 + 0.55 * ph;
      const p = mouth.clone().lerp(stop, ph);
      p.y += Math.sin(ph * 9 + i + t * 6) * 0.12 * ph + (hash2(i, 301) - 0.5) * spread;
      p.addScaledVector(side, (hash2(i, 302) - 0.5) * spread);
      spark3(p, 0.07 + 0.16 * ph * hash2(i, 303), FIRE[Math.min(3, (ph * 3.2 + hash2(i, 304) * 0.8) | 0)], live * (1 - ph * 0.4) * (0.6 + 0.4 * hash2(i, 305)));
    }
    for (let i = 0; i < 14; i++) {
      const ph = (t * 1.1 + i / 14) % 1, p = mouth.clone().lerp(stop, ph);
      p.y += Math.sin(ph * 7 + i) * 0.15;
      flame3(p, 0.3 + 0.4 * ph, 0.55 * live * (1 - ph * 0.5), false);
    }
    // where it meets her ward: a bright, spraying front
    for (let i = 0; i < 40; i++) {
      const age = (t * 2 + hash2(i, 310)) % 1, an = hash2(i, 311) * TAU;
      const p = stop.clone().addScaledVector(side, Math.cos(an) * age * 0.7).addScaledVector(dir, 0.1 * age);
      p.y += Math.sin(an) * age * 0.7;
      spark3(p, 0.05, i % 3 ? "255,200,110" : MAGENTA, live * (1 - age));
    }
    glow3(mouth, 0.7, "255,170,80", 0.4 * live);
    glow3(stop, 0.9, "255,190,110", 0.4 * live);
    const ward = ring3(stop, 0.55, MAGENTA, 0.35 * live * (0.75 + 0.25 * Math.sin(t * 20)), false, true);   // her ward
    if (ward) ward.lookAt(mouth);
    light3(stop, "255,170,80", 22 * live, 9);
  }
  burst3(t, BREATH[1], { p: stop, n: 60, seed: 310, speed: 3.6, life: 1.0, colors: ["255,190,90", GOLD, VIOLET], size: 0.06 });
}

// ---------- Curtain Call ----------
function fxCurtain(t, js) {
  FX.beam.visible = false;
  if (t < curtain.t0 || t > CC + 9 || !js) return;
  const up = frameAt("curtain_call", curtain.t0, 18), beam = bump(t, up, 1.6);
  const chest = v3(js.x, 0.85, js.y);
  if (beam > 0.01) {
    const sky = hand3(js, "sky"), moon = v3(MOON3.x, MOON3.y, MOON3.z), d = moon.clone().sub(sky), L = d.length();
    FX.beam.visible = true;
    FX.beam.position.copy(sky).addScaledVector(d, 0.5);
    FX.beam.quaternion.setFromUnitVectors(v3(0, 1, 0), d.clone().normalize());
    FX.beam.scale.set(1, L, 1);
    FX.beam.material.opacity = 0.75 * beam;
    glow3(sky, 0.5, VIOLET, 0.8 * beam);
    light3(sky, VIOLET, 12 * beam, 6);
    for (let i = 0; i < 24; i++) {
      const k = ((t - up) * 0.25 + hash2(i, 71)) % 1;
      const p = sky.clone().addScaledVector(d, k * k * 0.15);
      spark3(p, 0.05 * (1 + k * 6), i % 2 ? MAGENTA : SILVER, beam * (1 - k));
    }
  }
  if (t >= CC) {
    const age = t - CC, c = v3(js.x, 0.85, js.y);
    ring3(c, 0.3 + age * 7, MAGENTA, 0.9 * decay(t, CC, 0.35), true, true);
    ring3(c, 0.2 + age * 4.3, GOLD, 0.7 * decay(t, CC, 0.3), true);
    ring3(c, 0.2 + age * 5, MAGENTA, 0.6 * decay(t, CC, 0.3), false, true);
    light3(c, MAGENTA, 60 * decay(t, CC, 0.4), 22);
    FOES.forEach((f, i) => {
      if (f.release != null) return;
      const m = foeMiddle(f, CC - 0.01);
      if (!m) return;
      const big = f.kind === "great";
      burst3(t, RELEASE_ALL, { p: m, n: big ? 110 : 60, seed: 120 + i, speed: big ? 4.4 : 2.8, life: 1.6, grav: -0.6, colors: [GOLD, VIOLET, "190,255,210", SILVER], size: big ? 0.08 : 0.06, drag: 2 });
      glow3(m, big ? 4 : 2, "220,255,230", 0.6 * decay(t, RELEASE_ALL, 0.4));
    });
    const w = env(t, ENV.ward);
    if (w > 0.01) {
      for (let i = 0; i < 36; i++) {
        const an = (i / 36) * TAU + age * 0.7, R = 0.95 * (1 + 0.6 * decay(t, CC, 0.5));
        const y = lerp(0.87, 0.2, clamp(age / 3));
        spark3(v3(js.x + Math.cos(an) * R, y + Math.sin(an * 3 + age) * 0.05, js.y + Math.sin(an) * R), 0.045, i % 3 ? MAGENTA : GOLD, w * (0.6 + 0.4 * Math.sin(t * 8 + i)));
      }
    }
  }
}

// Sheer veil curtains close behind her (78.9-80.0) and fly open on the release.
function fxCurtains(t, js) {
  const tIn = 78.9, tShut = 80.0, tOpen = CC;
  const close = env(t, [[tIn, 0], [tShut, 1], [tOpen, 1], [tOpen + 0.35, 0]]);
  const a = t < tOpen ? ramp(t, tIn, 0.3) : 1 - clamp((t - tOpen) / 0.7);
  const on = close > 0.005 && a > 0.01;
  FX.valance.visible = on;
  for (const m of FX.curtains) m.visible = on;
  if (!on) return;
  const herD = js ? camera3.position.distanceTo(v3(js.x, 1, js.y)) : 5;
  const D = Math.max(1.5, herD + 0.9), hv = 2 * D * Math.tan((camera3.fov * Math.PI) / 360), wv = hv * camera3.aspect;
  for (const m of FX.curtains) {
    const side = m.userData.side, w = Math.max(0.001, close * wv * 0.52);
    m.position.set(side < 0 ? -wv / 2 + w / 2 : wv / 2 - w / 2, 0, -D);
    m.scale.set(w, hv * 1.04, 1);
    m.material.opacity = a;
    const pos = m.geometry.attributes.position, base = m.userData.base;
    for (let i = 0; i < pos.count; i++) {
      const y = base[i * 3 + 1], x = base[i * 3];
      pos.array[i * 3] = x + Math.sin(t * 2.2 + y * 6 + x * 9) * 0.012 * (0.5 - y) * (hv / w);
      pos.array[i * 3 + 2] = Math.sin(x * 18 + t * 1.5) * 0.03;
    }
    pos.needsUpdate = true;
  }
  FX.valance.position.set(0, hv / 2 - hv * 0.05, -D + 0.01);
  FX.valance.scale.set(wv, hv * 0.11, 1);
  FX.valance.material.opacity = a * close;
}

// ---------- the square's own life ----------
function fxBells(t) {
  const at = v3(BELL3.x, BELL3.y, BELL3.z + 2);
  for (const tt of BELL_TOLLS) {
    if (t < tt || t > tt + 3) continue;
    const age = t - tt;
    ring3(at, 0.6 + age * 3, GOLD, 0.16 * decay(t, tt, 0.6), false);
    glow3(at, 2.2, GOLD, 0.3 * decay(t, tt, 0.5));
  }
}
function fxFlies(t) {
  const a = env(t, ENV.flies);
  if (a <= 0.01) return;
  for (let i = 0; i < 46; i++) {
    const x = -10 + hash2(i, 1) * 20 + noise1(t * 0.13, i) * 2.5, z = -9 + hash2(i, 2) * 20 + noise1(t * 0.11, i + 50) * 2.5;
    const y = 0.4 + hash2(i, 3) * 2.6 + noise1(t * 0.3, i + 99) * 0.4;
    const blink = clamp(Math.sin(t * (0.7 + hash2(i, 4)) + i * 3) * 2 - 0.6);
    spark3(v3(x, y, z), 0.035, "220,255,140", a * blink);
  }
}
function fxMist(t) {
  const fog = env(t, ENV.fog), th = env(t, ENV.theatre);
  for (const s of FX.mist) {
    const u = s.userData, x = ((u.x + t * u.sp + 20) % 40) - 20;
    s.position.set(x, 0.55 + Math.sin(t * 0.2 + u.ph) * 0.15, u.z);
    s.material.opacity = clamp(fog * 40) * 0.3 * (1 - th) * Math.min(1, (20 - Math.abs(x)) / 4);
  }
}

function updateFx(t, cam) {
  const js = jesterAt(t);
  fxDoom(t);
  fxRebuke(t, js);
  fxHush(t, js);
  fxGravity(t, js);
  fxCrack(t);
  fxSeal(t, js);
  fxOdds(t, js);
  fxFlames(t);
  fxBreath(t, js);
  fxCurtain(t, js);
  fxCurtains(t, js);
  fxBells(t);
  fxFlies(t);
  fxMist(t);
}
