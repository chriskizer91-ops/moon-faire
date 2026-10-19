// The night square, generated in code: every texture is painted on a canvas
// here, every building is boxes and prisms. buildWorld() makes it once;
// updateWorld(t) moves what moves (lamp light, the bell, the moon, fog).

const W3 = {};   // handles to things that change over time

function canvasTex(w, h, paint, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  paint(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  if (repeat) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeat[0], repeat[1]); }
  return tx;
}
function greyTex(w, h, paint, repeat) {
  const tx = canvasTex(w, h, paint, repeat);
  tx.colorSpace = THREE.NoColorSpace;
  return tx;
}

// ---------- painted textures ----------
function paintCobbles(g, w, h, bump) {
  const r = rng(21);
  g.fillStyle = bump ? "#000" : "#141017"; g.fillRect(0, 0, w, h);
  const n = 46, cw = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = (i + (j % 2) * 0.5) * cw + (r() - 0.5) * cw * 0.3, y = (j + 0.5) * cw + (r() - 0.5) * cw * 0.3;
    const rx = cw * (0.36 + r() * 0.12), ry = cw * (0.3 + r() * 0.12);
    // drawn the same for both maps, so the bumps sit on the stones
    const v = 52 + r() * 50, warm = r() * 14, turn = r() * TAU, lean = 0.75 + r() * 0.5;
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
      const cx = x + dx, cy = y + dy;
      if (cx < -cw || cx > w + cw || cy < -cw || cy > h + cw) continue;
      const gr = g.createRadialGradient(cx - rx * 0.25, cy - ry * 0.3, 0, cx, cy, rx * 1.05);
      if (bump) { gr.addColorStop(0, "#fff"); gr.addColorStop(0.6, "#aaa"); gr.addColorStop(1, "#222"); }
      else { gr.addColorStop(0, `rgb(${v + warm + 6},${v + 3},${v + 5})`); gr.addColorStop(0.7, `rgb(${v * 0.9 + warm},${v * 0.86},${v * 0.9})`); gr.addColorStop(1, `rgb(${v * 0.55 + warm},${v * 0.5},${v * 0.55})`); }
      g.fillStyle = gr;
      g.beginPath();
      for (let k = 0; k < 7; k++) {   // a rough, worn stone, not a perfect oval
        const a = turn + (k / 7) * TAU, rr = (k % 2 ? 1 : lean) * (0.88 + 0.12 * Math.sin(k * 2.3 + v));
        g.lineTo(cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr);
      }
      g.closePath(); g.fill();
    }
  }
  if (!bump) {   // moss and grime between the stones
    for (let k = 0; k < 1400; k++) { g.fillStyle = `rgba(${r() < 0.5 ? "50,70,36" : "20,16,22"},${0.18 * r()})`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 3); }
  }
}
function paintPlaster(g, w, h, seed) {
  const r = rng(seed);
  g.fillStyle = "#b8a99a"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2500; k++) { g.fillStyle = `rgba(${90 + r() * 60},${80 + r() * 50},${80 + r() * 50},0.08)`; g.fillRect(r() * w, r() * h, 3 + r() * 12, 2 + r() * 8); }
  g.fillStyle = "#3a2618";
  const beam = w * 0.035;
  g.fillRect(0, 0, w, beam); g.fillRect(0, h - beam, w, beam); g.fillRect(0, h * 0.48, w, beam);
  for (let x = 0; x <= w; x += w / 4) g.fillRect(x - beam / 2, 0, beam, h);
  g.lineWidth = beam * 0.8; g.strokeStyle = "#3a2618";
  for (let x = 0; x < w; x += w / 4) {
    g.beginPath(); g.moveTo(x, h * 0.5); g.lineTo(x + w / 8, h); g.moveTo(x + w / 4, h * 0.5); g.lineTo(x + w / 8, h); g.stroke();
  }
}
function paintStone(g, w, h, seed, base = [92, 86, 96]) {
  const r = rng(seed);
  g.fillStyle = "#2a2430"; g.fillRect(0, 0, w, h);
  const rows = 10, rh = h / rows;
  for (let j = 0; j < rows; j++) {
    let x = -(j % 2) * rh;
    while (x < w) {
      const bw = rh * (1.4 + r() * 1.2), v = 0.75 + r() * 0.4;
      g.fillStyle = `rgb(${base[0] * v | 0},${base[1] * v | 0},${base[2] * v | 0})`;
      g.fillRect(x + 2, j * rh + 2, bw - 4, rh - 4);
      x += bw;
    }
  }
}
function paintRoof(g, w, h, seed) {
  const r = rng(seed);
  g.fillStyle = "#1c0f18"; g.fillRect(0, 0, w, h);
  const rows = 16, rh = h / rows, tw = w / 12;
  for (let j = 0; j < rows; j++) for (let i = -1; i < 13; i++) {
    const x = i * tw + (j % 2) * tw / 2, v = 0.7 + r() * 0.5;
    g.fillStyle = `rgb(${92 * v | 0},${38 * v | 0},${58 * v | 0})`;
    g.beginPath(); g.moveTo(x + 1, j * rh); g.lineTo(x + tw - 1, j * rh); g.lineTo(x + tw - 2, j * rh + rh - 2);
    g.quadraticCurveTo(x + tw / 2, j * rh + rh + 3, x + 2, j * rh + rh - 2); g.fill();
  }
}
function paintWindow(g, w, h, lit) {
  g.fillStyle = "#2a1a10"; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h);
  if (lit) { gr.addColorStop(0, "#ffd890"); gr.addColorStop(1, "#ff9a40"); } else { gr.addColorStop(0, "#1a1828"); gr.addColorStop(1, "#0c0a14"); }
  g.fillStyle = gr; g.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84);
  g.fillStyle = "#2a1a10"; g.fillRect(w * 0.47, 0, w * 0.06, h); g.fillRect(0, h * 0.47, w, h * 0.06);
}
function paintStripes(g, w, h) {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#e8dcc6" : "#6b2a5c"; g.fillRect((i * w) / 8, 0, w / 8 + 1, h); }
  g.fillStyle = "#d6a84e"; g.fillRect(0, h - 6, w, 6);
}
function paintMoon(g, w, h) {
  const r = rng(5), cx = w / 2;
  const gr = g.createRadialGradient(cx * 0.85, cx * 0.85, cx * 0.1, cx, cx, cx * 0.98);
  gr.addColorStop(0, "#fff8e8"); gr.addColorStop(0.8, "#efe0c0"); gr.addColorStop(1, "#d8c8a8");
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cx, cx * 0.98, 0, TAU); g.fill();
  for (let k = 0; k < 26; k++) {
    const a = r() * TAU, d = Math.sqrt(r()) * cx * 0.8, rr = cx * (0.04 + r() * 0.12);
    g.fillStyle = `rgba(150,130,120,${0.15 + r() * 0.2})`;
    g.beginPath(); g.arc(cx + Math.cos(a) * d, cx + Math.sin(a) * d, rr, 0, TAU); g.fill();
  }
}
function paintGlow(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function paintSky(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#05030c"); gr.addColorStop(0.35, "#120a26"); gr.addColorStop(0.5, "#2a1c48"); gr.addColorStop(0.56, "#3c2858"); gr.addColorStop(1, "#140c1c");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

// ---------- shapes ----------
function lambert(o) { return new THREE.MeshLambertMaterial(o); }
function prismRoof(w, d, rise, mat) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(0, rise); s.lineTo(w / 2, 0); s.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  return m;
}
function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
}

function house(scene, o) {
  const grp = new THREE.Group();
  const wallTex = canvasTex(512, 512, (g, w, h) => paintPlaster(g, w, h, o.seed), [o.w / 4, o.h / 4]);
  const stoneTex = canvasTex(256, 256, (g, w, h) => paintStone(g, w, h, o.seed + 1), [o.w / 3, 0.4]);
  const roofTex = canvasTex(512, 512, (g, w, h) => paintRoof(g, w, h, o.seed + 2), [1.5, 1.5]);
  grp.add(box(o.w, 1.0, o.d, lambert({ map: stoneTex }), 0, 0.5, 0));
  grp.add(box(o.w, o.h - 1, o.d, lambert({ map: wallTex }), 0, 1 + (o.h - 1) / 2, 0));
  const roof = prismRoof(o.w + 0.8, o.d + 0.8, o.w * 0.45, lambert({ map: roofTex }));
  roof.position.y = o.h; grp.add(roof);
  grp.add(box(0.8, 2.2, 0.8, lambert({ map: stoneTex }), o.w * 0.28, o.h + o.w * 0.3, -o.d * 0.15));
  const front = o.d / 2 + 0.02;
  const lit = canvasTex(64, 96, (g, w, h) => paintWindow(g, w, h, true));
  const dark = canvasTex(64, 96, (g, w, h) => paintWindow(g, w, h, false));
  const r = rng(o.seed + 3);
  for (const [wx, wy] of [[-o.w * 0.3, 2.0], [o.w * 0.3, 2.0], [-o.w * 0.3, 3.7], [o.w * 0.3, 3.7], [0, 3.7]]) {
    const on = r() < 0.6;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.15), new THREE.MeshBasicMaterial({ map: on ? lit : dark, toneMapped: !on }));
    m.position.set(wx, wy, front); grp.add(m);
  }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.1), lambert({ color: 0x2a1810 }));
  door.position.set(0, 1.05, front); grp.add(door);
  grp.position.set(o.x, 0, o.z); grp.rotation.y = o.rot || 0;
  scene.add(grp);
  return grp;
}

function lampPost(scene, L) {
  const iron = lambert({ color: 0x1a1620 });
  const [x, y, z] = L.at;
  if (!L.small && !L.forge) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, y - 0.2, 8), iron);
    post.position.set(x, (y - 0.2) / 2, z); post.castShadow = true; scene.add(post);
    scene.add(box(0.5, 0.06, 0.06, iron, x, y - 0.35, z));
  }
  let glass = null;
  if (!L.forge) {
    const cage = box(0.32, 0.46, 0.32, iron, x, y, z); cage.material = new THREE.MeshLambertMaterial({ color: 0x1a1620, transparent: true, opacity: 0.35 });
    scene.add(cage);
    glass = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.22), new THREE.MeshBasicMaterial({ color: 0xffc070 }));
    glass.position.set(x, y, z); scene.add(glass);
    scene.add(box(0.4, 0.08, 0.4, iron, x, y + 0.27, z));
  }
  const light = new THREE.PointLight(L.forge ? 0xff7a30 : 0xffb45a, 0, L.forge ? 14 : 13, 2);
  light.position.set(x, y + (L.forge ? 0.4 : -0.05), z);
  scene.add(light);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.glowTex, color: L.forge ? 0xff8040 : 0xffb060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.position.set(x, y, z); halo.scale.setScalar(L.forge ? 2.2 : 1.6); scene.add(halo);
  return { L, light, glass, halo };
}

function buildWorld(scene) {
  W3.glowTex = canvasTex(128, 128, paintGlow);
  // sky, stars, moon
  const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.MeshBasicMaterial({ map: canvasTex(8, 256, paintSky), side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(sky);
  const starPos = [], r = rng(9);
  for (let i = 0; i < 1600; i++) {
    const a = r() * TAU, e = 0.05 + Math.pow(r(), 0.6) * 1.4;
    starPos.push(Math.cos(a) * Math.cos(e) * 380, Math.sin(e) * 380, Math.sin(a) * Math.cos(e) * 380);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  W3.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdcd8ff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }));
  scene.add(W3.stars);
  W3.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, paintMoon), fog: false, toneMapped: false }));
  W3.moon.position.set(MOON3.x, MOON3.y, MOON3.z); W3.moon.scale.setScalar(MOON3.r * 2); scene.add(W3.moon);
  W3.moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.glowTex, color: 0xffe8c8, blending: THREE.AdditiveBlending, fog: false, transparent: true, opacity: 0.5, depthWrite: false }));
  W3.moonGlow.position.copy(W3.moon.position); W3.moonGlow.scale.setScalar(MOON3.r * 7); scene.add(W3.moonGlow);
  W3.eclipse = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x07030d, fog: false, map: canvasTex(128, 128, (g, w) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 1, 0, TAU); g.fill(); }), transparent: true }));
  W3.eclipse.scale.setScalar(MOON3.r * 2.06); scene.add(W3.eclipse);
  W3.eclipseRim = new THREE.Sprite(new THREE.SpriteMaterial({ fog: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    map: canvasTex(256, 256, (g, w) => { g.strokeStyle = "#c890ff"; g.lineWidth = 5; g.shadowColor = "#a060ff"; g.shadowBlur = 18; g.beginPath(); g.arc(w / 2, w / 2, w * 0.4, 0, TAU); g.stroke(); }) }));
  W3.eclipseRim.position.copy(W3.moon.position); W3.eclipseRim.scale.setScalar(MOON3.r * 2.5); scene.add(W3.eclipseRim);

  // light
  W3.ambient = new THREE.HemisphereLight(0x7a70b0, 0x241a2a, 0.8); scene.add(W3.ambient);
  W3.moonLight = new THREE.DirectionalLight(0xbab4ff, 0.9);
  W3.moonLight.position.set(MOON3.x * 0.12, MOON3.y * 0.12, MOON3.z * 0.12);
  W3.moonLight.castShadow = true;
  const sc = W3.moonLight.shadow.camera; sc.left = -24; sc.right = 24; sc.top = 24; sc.bottom = -24; sc.near = 1; sc.far = 90;
  W3.moonLight.shadow.mapSize.set(2048, 2048); W3.moonLight.shadow.bias = -0.0006; W3.moonLight.shadow.normalBias = 0.03;
  scene.add(W3.moonLight); scene.add(W3.moonLight.target);
  W3.spot = new THREE.SpotLight(0xf0e0ff, 0, 18, 0.32, 0.6, 1.5);   // the Curtain Call spotlight
  scene.add(W3.spot); scene.add(W3.spot.target);

  // the cobbled square and the ground beyond it
  const cob = canvasTex(1024, 1024, (g, w, h) => paintCobbles(g, w, h, false), [10, 10]);
  const cobBump = greyTex(1024, 1024, (g, w, h) => paintCobbles(g, w, h, true), [10, 10]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshLambertMaterial({ map: cob, bumpMap: cobBump, bumpScale: 0.9 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const grass = new THREE.Mesh(new THREE.RingGeometry(34, 400, 48), lambert({ color: 0x0e0b14 }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = 0.01; scene.add(grass);

  // the well
  const stone = (seed, rep) => canvasTex(256, 256, (g, w, h) => paintStone(g, w, h, seed), rep);
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 0.95, 28, 1, true), lambert({ map: stone(31, [6, 1]), side: THREE.DoubleSide }));
  well.position.y = 0.47; well.castShadow = well.receiveShadow = true; scene.add(well);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 8, 32), lambert({ color: 0x5a5260 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.95; scene.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshPhongMaterial({ color: 0x0a0814, shininess: 90, specular: 0x6050a0 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 0.55; scene.add(water);
  const wood = lambert({ color: 0x3a2618 });
  scene.add(box(0.16, 2.3, 0.16, wood, -1.25, 1.15, 0)); scene.add(box(0.16, 2.3, 0.16, wood, 1.25, 1.15, 0));
  scene.add(box(2.7, 0.14, 0.14, wood, 0, 2.25, 0));
  const wroof = prismRoof(3.1, 1.2, 0.7, lambert({ map: canvasTex(256, 256, (g, w, h) => paintRoof(g, w, h, 33), [1, 1]) })); wroof.position.y = 2.35; scene.add(wroof);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 3.4, 40), new THREE.MeshPhongMaterial({ color: 0x3a3040, shininess: 10 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; ring.receiveShadow = true; scene.add(ring);

  // lamps
  W3.lamps = LAMPS.map(L => lampPost(scene, L));

  // houses round the square (east, west, south), the smithy, the chapel and graveyard
  [
    { x: 16.5, z: -0.5, w: 7, d: 6, h: 6.2, rot: -Math.PI / 2, seed: 41 }, { x: 16.5, z: 8.5, w: 7, d: 6, h: 5.6, rot: -Math.PI / 2, seed: 43 },
    { x: -15, z: 5, w: 8, d: 6, h: 6.6, rot: Math.PI / 2, seed: 45 }, { x: -6, z: 17, w: 8, d: 6, h: 6, rot: Math.PI, seed: 47 },
    { x: 6, z: 17, w: 9, d: 6, h: 6.4, rot: Math.PI, seed: 49 }, { x: -10, z: -15, w: 7, d: 6, h: 6.2, rot: 0, seed: 51 },
    { x: -17, z: -15.5, w: 6, d: 6, h: 5.4, rot: 0, seed: 53 },
  ].forEach(o => house(scene, o));
  const smithy = house(scene, { x: -15, z: -6.4, w: 7, d: 6, h: 5.4, rot: Math.PI / 2, seed: 55 });
  const forge = box(1.6, 1.0, 1.2, lambert({ map: stone(57, [2, 1]) }), -12.6, 0.5, -6.2); scene.add(forge);
  const coals = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), new THREE.MeshBasicMaterial({ color: 0xff6a20, toneMapped: false }));
  coals.rotation.x = -Math.PI / 2; coals.position.set(-12.6, 1.02, -6.2); scene.add(coals); W3.coals = coals;
  scene.add(box(0.5, 0.5, 0.9, lambert({ color: 0x2a2a32 }), -11.2, 0.45, -4.8));                       // anvil

  const paleStone = (seed, rep) => canvasTex(256, 256, (g, w, h) => paintStone(g, w, h, seed, [128, 120, 132]), rep);
  const chapelStone = paleStone(61, [3, 2]);
  const nave = box(9, 7, 11, lambert({ map: chapelStone }), CHAPEL.x, 3.5, CHAPEL.z); scene.add(nave);
  const naveRoof = prismRoof(9.8, 11.6, 4.2, lambert({ map: canvasTex(512, 512, (g, w, h) => paintRoof(g, w, h, 63), [2, 2]) }));
  naveRoof.rotation.y = 0; naveRoof.position.set(CHAPEL.x, 7, CHAPEL.z); scene.add(naveRoof);
  const tower = box(3.8, 13, 3.8, lambert({ map: paleStone(65, [1.5, 5]) }), BELL3.x, 6.5, BELL3.z); scene.add(tower);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(3.1, 5.5, 4), lambert({ map: canvasTex(256, 256, (g, w, h) => paintRoof(g, w, h, 67), [1, 1]) }));
  spire.rotation.y = Math.PI / 4; spire.position.set(BELL3.x, 15.7, BELL3.z); spire.castShadow = true; scene.add(spire);
  scene.add(box(0.12, 1.4, 0.12, lambert({ color: 0x8a8070 }), BELL3.x, 19.1, BELL3.z)); scene.add(box(0.7, 0.12, 0.12, lambert({ color: 0x8a8070 }), BELL3.x, 19.3, BELL3.z));
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.6), new THREE.MeshBasicMaterial({ color: 0x4a2c14 }));   // a lantern in the belfry
  opening.position.set(BELL3.x, BELL3.y + 0.2, BELL3.z + 1.92); scene.add(opening);
  const bellPts = [[0, 0.9], [0.18, 0.88], [0.3, 0.7], [0.36, 0.35], [0.5, 0.06], [0.6, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const bell = new THREE.Mesh(new THREE.LatheGeometry(bellPts, 24), new THREE.MeshPhongMaterial({ color: 0xb88a3a, shininess: 70, specular: 0x886633, side: THREE.DoubleSide }));
  const bellPivot = new THREE.Group(); bellPivot.position.set(BELL3.x, BELL3.y + 0.9, BELL3.z + 1.2);
  bell.position.y = -0.9; bellPivot.add(bell); scene.add(bellPivot); W3.bell = bellPivot;
  const rose = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), new THREE.MeshBasicMaterial({
    map: canvasTex(128, 128, (g, w) => {
      const c = w / 2; g.fillStyle = "#1a1014"; g.fillRect(0, 0, w, w);
      for (let i = 0; i < 12; i++) { g.fillStyle = ["#6a1830", "#203a78", "#7a5a18"][i % 3]; g.beginPath(); g.moveTo(c, c); g.arc(c, c, c - 8, (i / 12) * TAU, ((i + 1) / 12) * TAU); g.fill(); }
      g.strokeStyle = "#140c10"; g.lineWidth = 3;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); g.stroke(); }
      for (const rr of [c * 0.35, c * 0.68, c - 8]) { g.beginPath(); g.arc(c, c, rr, 0, TAU); g.stroke(); }
      g.fillStyle = "#a07828"; g.beginPath(); g.arc(c, c, c * 0.18, 0, TAU); g.fill();
    }) }));
  rose.position.set(CHAPEL.x, 5.0, CHAPEL.z + 5.52); scene.add(rose);
  const cdoor = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), lambert({ color: 0x2a1810 })); cdoor.position.set(CHAPEL.x, 1.4, CHAPEL.z + 5.52); scene.add(cdoor);
  for (let i = 0; i < 4; i++) scene.add(box(4 - i * 0.4, 0.22, 0.6, lambert({ map: chapelStone }), CHAPEL.x, 0.11 + i * 0.22, CHAPEL.z + 7.4 - i * 0.6));
  for (const sx of [-1.4, 1.4]) {   // the door lamps
    const dl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xffc070 }));
    dl.position.set(CHAPEL.x + sx, 2.6, CHAPEL.z + 5.65); scene.add(dl);
  }
  const doorLight = new THREE.PointLight(0xffb060, 7, 11, 2); doorLight.position.set(CHAPEL.x, 2.8, CHAPEL.z + 6.4); scene.add(doorLight);
  // graveyard: a low wall, headstones, an iron gate
  const gy = { x: 9.5, z: -16.5 };   // beside the chapel, toward the moon
  const wallMat = lambert({ map: stone(71, [4, 0.5]) });
  scene.add(box(9, 0.9, 0.5, wallMat, gy.x, 0.45, gy.z + 4)); scene.add(box(0.5, 0.9, 8, wallMat, gy.x + 4.5, 0.45, gy.z)); scene.add(box(0.5, 0.9, 8, wallMat, gy.x - 4.4, 0.45, gy.z));
  const gr = rng(73);
  for (let i = 0; i < 16; i++) {
    const hs = box(0.6 + gr() * 0.3, 0.8 + gr() * 0.6, 0.18, lambert({ color: 0x55505c }), gy.x - 3.5 + (i % 4) * 2.1 + gr() * 0.5, 0.45, gy.z - 3 + Math.floor(i / 4) * 1.8);
    hs.rotation.z = (gr() - 0.5) * 0.2; hs.rotation.y = (gr() - 0.5) * 0.3; scene.add(hs);
  }

  // the Faire's stall, shut for the night
  const st = { x: 9.4, z: 3.4 };
  for (const [dx, dz] of [[-1.4, -0.8], [1.4, -0.8], [-1.4, 0.8], [1.4, 0.8]]) scene.add(box(0.12, 2.4, 0.12, wood, st.x + dx, 1.2, st.z + dz));
  scene.add(box(3, 1.0, 1.4, lambert({ map: canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#3a2618"; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = "#2a1810"; g.fillRect(0, i * 16, w, 2); } }) }), st.x, 0.5, st.z));
  const awning = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), lambert({ map: canvasTex(256, 128, paintStripes), side: THREE.DoubleSide }));
  awning.position.set(st.x + 0.4, 2.5, st.z); awning.rotation.set(-Math.PI / 2 + 0.35, 0, Math.PI / 2); awning.castShadow = true; scene.add(awning);
  for (let i = 0; i < 4; i++) scene.add(box(0.6, 0.5, 0.6, wood, st.x - 1 + i * 0.7, 0.25, st.z + 1.4 + (i % 2) * 0.3));

  // pines all round, thick along the road east; hills far off
  const pine = new THREE.ConeGeometry(1, 1, 7);
  const pineMat = new THREE.MeshBasicMaterial({ color: 0x08100f });   // far and dark: unlit, which keeps the render quick
  const pr = rng(81), spots = [];
  for (let i = 0; i < 260; i++) {
    const a = pr() * TAU, d = 26 + pr() * 34;
    spots.push([Math.cos(a) * d, Math.sin(a) * d, 5 + pr() * 7]);
  }
  for (let i = 0; i < 90; i++) spots.push([20 + pr() * 30, -14 + pr() * 4 - (pr() < 0.5 ? 0 : -12), 5 + pr() * 6]);
  const inst = new THREE.InstancedMesh(pine, pineMat, spots.length * 3);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion();
  let k = 0;
  for (const [x, z, hgt] of spots) for (let j = 0; j < 3; j++) {
    const s = hgt * (0.55 - j * 0.12);
    mtx.compose(new THREE.Vector3(x, hgt * (0.3 + j * 0.25), z), q, new THREE.Vector3(s * 0.55, hgt * 0.45, s * 0.55));
    inst.setMatrixAt(k++, mtx);
  }
  inst.castShadow = true; scene.add(inst);
  const hillMat = new THREE.MeshBasicMaterial({ color: 0x0c0914 });
  for (let i = 0; i < 9; i++) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(60 + i * 7, 26 + (i % 3) * 10, 6), hillMat);
    const a = -2.2 + i * 0.55; hill.position.set(Math.cos(a) * 170, 4, Math.sin(a) * 170); scene.add(hill);
  }
  scene.fog = new THREE.FogExp2(0x1c1430, 0.02);
}

// ---------- what changes over time ----------
function lampLevel(L, t) {
  let v = 1;
  if (L.gutter && t > L.gutter[0] && t < L.gutter[1]) v = 0.45 + 0.35 * noise1(t * 7, (L.at[0] * 10) | 0);
  if (t >= L.gone - 0.2 && t < L.back) v = 1 - ramp(t, L.gone - 0.2, 0.45);
  if (t >= L.back) v = ramp(t, L.back, 0.2);
  if (t > 33.6 && t < HUSH_LAND[1]) v *= 0.75 + 0.25 * noise1(t * 11, (L.at[2] * 10) | 0);
  return clamp(v * (0.93 + 0.07 * noise1(t * 6, (L.at[0] * 10) | 0)));
}
const BELL_TOLLS = [20.0, ...DOOM_TICKS.map(d => d[0])];

function updateWorld(t, cam) {
  const dark = env(t, ENV.dark), th = env(t, ENV.theatre), moonB = env(t, ENV.moon), nm = env(t, ENV.newMoon);
  for (const lp of W3.lamps) {
    const v = lampLevel(lp.L, t), flare = decay(t, lp.L.back, 0.45);
    lp.light.intensity = (lp.L.forge ? 22 : lp.L.small ? 10 : 16) * v + 40 * flare;
    if (lp.glass) lp.glass.material.color.setRGB(0.08 + 1.0 * v + flare, 0.06 + 0.7 * v + flare * 0.7, 0.04 + 0.4 * v);
    lp.halo.material.opacity = 0.55 * v + 0.6 * flare;
  }
  W3.coals.material.color.setRGB(0.15 + 0.85 * lampLevel(LAMPS[5], t), 0.08 + 0.35 * lampLevel(LAMPS[5], t), 0.05);
  const keep = 1 - 0.85 * th;
  W3.ambient.intensity = 0.8 * (1 - dark * 0.7) * keep * (0.6 + 0.4 * Math.min(1, moonB));
  W3.moonLight.intensity = 0.9 * Math.min(1.3, moonB) * (1 - 0.6 * nm) * keep;
  W3.moonGlow.material.opacity = 0.45 * Math.min(1.3, moonB) * (1 - nm);
  // the Curtain Call spotlight, from high in front of her
  const js = jesterAt(t);
  W3.spot.intensity = js ? 70 * th : 0;
  if (js && th > 0) {
    W3.spot.position.set(js.x + 1.5, 7.5, js.y + 4.5);
    W3.spot.target.position.set(js.x, 0.9, js.y); W3.spot.target.updateMatrixWorld();
  }
  scene3.fog.density = env(t, ENV.fog) * (1 + 0.3 * th);
  scene3.fog.color.setRGB(0.055 * keep, 0.04 * keep, 0.1 * keep);
  // the moon goes new: a black disc slides across it, then a violet rim
  const toCam = new THREE.Vector3().subVectors(cam.position, W3.moon.position).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toCam).normalize();
  W3.eclipse.position.copy(W3.moon.position).addScaledVector(toCam, 2).addScaledVector(right, (1 - nm) * MOON3.r * 2.3);
  W3.eclipse.visible = nm > 0.001;
  W3.eclipseRim.material.opacity = clamp((nm - 0.8) / 0.2);
  // the bell swings at every toll
  let swing = 0;
  for (const tt of BELL_TOLLS) if (t > tt) swing += 0.35 * Math.sin((t - tt) * 4.2) * Math.exp(-(t - tt) / 1.4);
  W3.bell.rotation.x = swing;
}
