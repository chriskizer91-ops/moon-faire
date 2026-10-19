// Cut-outs standing in the 3D square: the Jester's real frames and Envoi's foe
// sprites, each on a card that turns about its upright to face the camera.
// Her card takes the light (lamps, spells, the moon's shadow); the foes glow
// by themselves. The moths they become are sprites flying to the moon.

const A3 = { herTex: [], glowTex: [], foeTex: {} };

function imgTex(im) {
  const tx = new THREE.Texture(im);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; tx.needsUpdate = true;
  return tx;
}
const herTex = i => A3.herTex[i] || (A3.herTex[i] = imgTex(IMGS[i]));
const herGlowTex = i => A3.glowTex[i] || (A3.glowTex[i] = imgTex(GLOWS[i]));
const foeTex = k => A3.foeTex[k] || (A3.foeTex[k] = imgTex(ART[k]));

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
// Position along keyed points [[t, x, y, z], ...], eased between keys.
function path3(t, keys) {
  if (t <= keys[0][0]) return v3(keys[0][1], keys[0][2], keys[0][3]);
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const a = keys[i - 1], b = keys[i], k = easeInOut((t - a[0]) / (b[0] - a[0]));
    return v3(lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k));
  }
  const z = keys[keys.length - 1];
  return v3(z[1], z[2], z[3]);
}

function card(mat) { return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); }
const facing = (p, cam) => Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
const rightOf = a => v3(Math.cos(a), 0, -Math.sin(a));     // a card's screen-right, turned by a
const frontOf = a => v3(Math.sin(a), 0, Math.cos(a));      // and its face, toward the camera
// Size a card from its picture (w x h px) at mpp metres per pixel, with the
// picture's point (ax, ay) on the group's origin.
function fitCard(c, w, h, ax, ay, mpp, flip) {
  const s = flip ? -1 : 1;
  c.scale.set(w * mpp * s, h * mpp, 1);
  c.position.x = (w / 2 - ax) * mpp * s; c.position.y = (ay - h / 2) * mpp;
}
function paintBlob(g, w) {
  const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  gr.addColorStop(0, "rgba(0,0,0,0.75)"); gr.addColorStop(0.5, "rgba(0,0,0,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, w);
}
function blob(scene, r) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: A3.blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.015; m.scale.set(r * 2, r * 1.4, 1); m.renderOrder = 1;
  scene.add(m);
  return m;
}

// ---------- the Jester ----------
// A point on her (from HAND, frame pixels from her soles) in the square.
function hand3(js, key) {
  const [dx, dy] = HAND[key];
  return v3(js.x, -dy * JESTER_M, js.y).addScaledVector(rightOf(A3.her.rotation.y), dx * JESTER_M * (js.flip ? -1 : 1));
}
const herAt = t => { const js = jesterAt(t); return js ? v3(js.x, 0, js.y) : null; };

// ---------- the foes ----------
const FOE_REF = { wisp: "wisp_idle", wraith: "wraith_idle", great: "great_front" };   // the pose its height h is measured on
const FOE_GLOW = { wisp: "140,255,180", wraith: "110,255,170", great: "255,160,70" };
const foe = id => FOES.find(f => f.id === id);
const foeRelease = f => (f.release != null ? f.release : RELEASE_ALL);
function foePose(f, t) {
  let p = f.poses[0][1];
  for (const [tt, name] of f.poses) if (t >= tt) p = name;
  return p;
}

function foeState(f, t) {
  if (t < f.rise) return null;
  const rel = foeRelease(f);
  if (t > rel + 1.8) return null;    // gone; its moth carries on
  const wisp = f.kind === "wisp", p = path3(t, f.path);
  const pose = t >= rel ? (f.kind === "wraith" ? "kneel" : "released") : foePose(f, t);
  const key = `${f.kind}_${pose}`, meta = DATA.meta.foes[key];
  const mpp = f.h / DATA.meta.foes[FOE_REF[f.kind]].h;
  const appear = easeOut(clamp((t - f.rise) / (wisp ? 1.2 : 1.8)));
  const fade = t > rel ? 1 - clamp((t - rel - 0.5) / 1.2) : 1;
  if (wisp) p.y += Math.sin(t * 2.1 + f.seed) * 0.07 + noise1(t * 0.8, f.seed) * 0.05;
  else p.y -= (1 - appear) * f.h * 0.75;    // wraiths climb up out of the ground
  if (f.hit && t > f.hit) {                 // knocked back by the flail
    const her = herAt(f.hit), away = v3(p.x - her.x, 0, p.z - her.z).normalize();
    p.addScaledVector(away, 0.45 * Math.sin(Math.PI * clamp((t - f.hit) / 0.35)));
  }
  // the great wraith breathes toward her: its breath picture faces right, so turn it when she's to its left
  let flip = false;
  if (f.kind === "great" && pose === "breath" && camera3) {
    const her = herAt(t);
    if (her) flip = rightOf(facing(p, camera3)).dot(her.sub(p)) < 0;
  }
  return { p, key, meta, mpp, wisp, pose, flip, alpha: appear * fade, flash: f.hit ? decay(t, f.hit, 0.16) : 0,
    hushed: f.hushed != null && t >= f.hushed && t < rel };
}

// A point on a foe's picture, (u, v) from its top left in 0..1, held still from its release.
function foeAt(f, t, u, v) {
  const st = foeState(f, Math.min(t, foeRelease(f) - 0.01));
  if (!st) return null;
  const m = st.meta, ax = m.gx, ay = st.wisp ? m.h / 2 : m.gy;
  const dx = (u * m.w - ax) * st.mpp * (st.flip ? -1 : 1), dy = (ay - v * m.h) * st.mpp;
  const p = st.p.clone().addScaledVector(rightOf(facing(st.p, camera3)), dx);
  p.y = st.p.y + dy;
  return p;
}
const foeHead = (f, t) => foeAt(f, t, f.kind === "wisp" ? 0.5 : 0.48, f.kind === "wisp" ? 0.08 : 0.1);
const foeMiddle = (f, t) => foeAt(f, t, 0.5, f.kind === "wisp" ? 0.45 : 0.4);
const foeMouth = f => (f.kind === "wisp" ? [0.5, 0.47] : [0.78, 0.22]);

function paintHushMark(g, w, h) {
  g.strokeStyle = "#d090ff"; g.lineWidth = w * 0.07; g.shadowColor = "#a050ff"; g.shadowBlur = w * 0.12;
  g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.3, h * 0.22, 0, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(w * 0.3, h / 2); g.lineTo(w * 0.7, h / 2); g.stroke();
}

function buildActors(scene) {
  A3.blobTex = canvasTex(64, 64, paintBlob);
  // her card: lit by the square, with a floor of her own colour so the night never swallows her
  const her = new THREE.Group();
  const t0 = herTex(0);
  A3.herMat = new THREE.MeshLambertMaterial({ map: t0, emissiveMap: t0, emissive: 0xffffff, emissiveIntensity: 0.45, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide });
  A3.herCard = card(A3.herMat); A3.herCard.castShadow = true;
  A3.herDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t0, alphaTest: 0.5, side: THREE.DoubleSide });
  A3.herCard.customDepthMaterial = A3.herDepth;
  her.add(A3.herCard);
  A3.herGlowMat = new THREE.MeshBasicMaterial({ map: herGlowTex(0), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  A3.herGlow = card(A3.herGlowMat); A3.herGlow.renderOrder = 3; her.add(A3.herGlow);
  scene.add(her); A3.her = her;
  A3.herBlob = blob(scene, 0.55);
  A3.herLight = new THREE.PointLight(0xb46aff, 0, 7, 2); scene.add(A3.herLight);

  // the foes
  const hushTex = canvasTex(64, 48, paintHushMark);
  A3.foes = FOES.map(f => {
    const grp = new THREE.Group(), t0 = foeTex(FOE_REF[f.kind]);
    // the shades keep their own colour through the fog (dark on a dark night would vanish), lifted a little
    const lift = f.kind === "wisp" ? 1 : 1.35;
    const mat = new THREE.MeshBasicMaterial({ map: t0, color: new THREE.Color(lift, lift * 1.05, lift), transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, depthWrite: false, fog: false });
    const c = card(mat); grp.add(c);
    const flashMat = new THREE.MeshBasicMaterial({ map: t0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const flash = card(flashMat); flash.renderOrder = 2; grp.add(flash);
    grp.visible = false; scene.add(grp);
    const hush = new THREE.Sprite(new THREE.SpriteMaterial({ map: hushTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    hush.visible = false; scene.add(hush);
    const shadow = f.kind === "wisp" ? null : blob(scene, f.kind === "great" ? 1.6 : 0.8);
    return { f, grp, c, mat, flash, flashMat, hush, shadow };
  });
  // the moths: every soul goes home
  const mothTex = foeTex("wisp_moth");
  A3.moths = FOES.map(() => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mothTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.visible = false; scene.add(s);
    return s;
  });
}

function updateActors(t, cam) {
  // her
  const js = jesterAt(t), th = env(t, ENV.theatre);
  A3.her.visible = A3.herBlob.visible = !!js;
  A3.herLight.intensity = 0;
  if (js) {
    const fr = js.frame, tx = herTex(fr[0]);
    A3.herMat.map = A3.herMat.emissiveMap = A3.herDepth.map = tx;
    A3.her.position.set(js.x, 0, js.y);
    A3.her.rotation.y = facing(A3.her.position, cam);
    fitCard(A3.herCard, fr[1], fr[2], fr[3], fr[4], JESTER_M, js.flip);
    // in the Curtain Call dark she glows a little more, lit by the spotlight
    A3.herMat.emissiveIntensity = 0.45 + 0.25 * th;
    const boost = t > curtain.t0 && t < curtain.t1 ? 1.3 : 1;
    A3.herGlow.visible = fr[6] >= 0.02;
    if (A3.herGlow.visible) {
      A3.herGlowMat.map = herGlowTex(fr[5]);
      A3.herGlowMat.opacity = clamp(0.75 * boost);
      fitCard(A3.herGlow, fr[1], fr[2], fr[3], fr[4], JESTER_M, js.flip);
      A3.herGlow.position.z = 0.02;
    }
    // the light she gives off pools on the cobbles around her
    A3.herLight.position.copy(hand3(js, "chest")).addScaledVector(frontOf(A3.her.rotation.y), 0.35);
    A3.herLight.intensity = 9 * fr[6] * boost;
    A3.herBlob.position.x = js.x; A3.herBlob.position.z = js.y;
  }

  // the foes
  for (const F of A3.foes) {
    const st = foeState(F.f, t);
    const on = !!st && st.alpha > 0.01;
    F.grp.visible = on; F.hush.visible = on && st.hushed;
    if (F.shadow) F.shadow.visible = on;
    if (!on) continue;
    const tx = foeTex(st.key);
    F.mat.map = F.flashMat.map = tx;
    F.grp.position.copy(st.p);
    F.grp.rotation.y = facing(st.p, cam);
    const ay = st.wisp ? st.meta.h / 2 : st.meta.gy;
    fitCard(F.c, st.meta.w, st.meta.h, st.meta.gx, ay, st.mpp, st.flip);
    fitCard(F.flash, st.meta.w, st.meta.h, st.meta.gx, ay, st.mpp, st.flip);
    F.flash.position.z = 0.01;
    F.mat.opacity = st.alpha;
    F.flash.visible = st.flash > 0.02;
    F.flashMat.opacity = st.alpha * st.flash * 0.8;
    if (F.shadow) { F.shadow.position.x = st.p.x; F.shadow.position.z = st.p.z; F.shadow.material.opacity = st.alpha * clamp(1 + st.p.y); }
    // each glows in its own colour, and lights what's near it
    const k = F.f.kind, f = F.f, mid = foeMiddle(F.f, t);
    if (!mid) continue;
    // a pale aura just behind each shade, so it stands out against the dark
    const behind = mid.clone().addScaledVector(frontOf(facing(st.p, cam)), -0.3);
    if (k === "wisp") {
      glow3(mid, 0.8, FOE_GLOW.wisp, 0.2 * st.alpha);
      light3(mid, FOE_GLOW.wisp, 3.2 * st.alpha, 6);
    } else if (k === "wraith") {
      glow3(behind, 2.0, FOE_GLOW.wraith, 0.2 * st.alpha);
      light3(mid, FOE_GLOW.wraith, 2.2 * st.alpha, 6);
    } else {
      const holding = t > 52.6 && t < RELEASE_ALL;      // it holds every lamp's flame in its ribs
      const ribs = foeAt(F.f, t, 0.5, 0.42);
      glow3(behind.setY(st.p.y + f.h * 0.55), 4.2, "120,200,150", 0.22 * st.alpha);
      glow3(ribs, holding ? 1.6 : 1.1, FOE_GLOW.great, (holding ? 0.45 : 0.25) * st.alpha);
      light3(ribs, FOE_GLOW.great, (holding ? 26 : 6) * st.alpha * (0.85 + 0.15 * noise1(t * 9, 5)), 16);
    }
    if (st.hushed) {
      // her silence mark, sealed over its mouth
      const [u, v] = foeMouth(F.f), m = foeAt(F.f, t, u, v).addScaledVector(frontOf(facing(st.p, cam)), 0.06);
      F.hush.position.copy(m); F.hush.scale.set(0.3, 0.22, 1);
      F.hush.material.opacity = st.alpha;
      glow3(m, 0.5, VIOLET, 0.45 * st.alpha);
    }
  }

  // the moths, up and away toward the moon
  const moon = v3(MOON3.x, MOON3.y, MOON3.z);
  FOES.forEach((f, i) => {
    const s = A3.moths[i], rel = foeRelease(f), age = t - rel - 0.4;
    s.visible = age >= 0 && age <= 11;
    if (!s.visible) return;
    const p0 = foeMiddle(f, rel - 0.01);
    if (!p0) { s.visible = false; return; }
    const k = age / 11, dir = moon.clone().sub(p0).normalize();
    const p = p0.clone().addScaledVector(dir, 34 * easeInOut(k));
    p.y += 2.2 * easeOut(k);
    const side = rightOf(facing(p, cam));
    p.addScaledVector(side, Math.sin(age * 2.2 + i) * 0.45 + (i - 2) * 0.9 * k);
    p.y += Math.sin(age * 3.1 + i * 2) * 0.18;
    const big = f.kind === "great" ? 1.8 : f.kind === "wraith" ? 1.3 : 1;
    const m = 0.42 * big * (1 - 0.3 * k), flap = 0.25 + 0.75 * Math.abs(Math.cos(age * 7 + i));
    const a = clamp(age / 0.5) * (1 - clamp((age - 8) / 3));
    s.position.copy(p); s.scale.set(m * flap, m * (85 / 82), 1);
    s.material.opacity = a;
    glow3(p, m * 3.2, "210,255,230", 0.35 * a);
  });
}
