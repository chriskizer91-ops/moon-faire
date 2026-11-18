// square.js: the night square of the Moon Faire, built in code: flagstones round a new-moon medallion, lantern posts strung with
// bunting, striped tents beyond, stars, the new moon as a dark disc with a burning rim, and fireflies.
// Brought over from the not-HD model's training square (branch claude/jester-not-hd-3d-model, viewer/world.js) and rewritten for
// three.js r128. It is built into stage.world, which is drawn before her and lit by its own lights, so her own look does not change.
// The square is turned half round from the not-HD one: the big tents and the moon are behind her as she faces the audience.
function buildSquare(stage, o) {
  'use strict';
  o = o || {};
  const world = stage.world, sq = new THREE.Group(); sq.rotation.y = Math.PI; world.add(sq);
  const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  const L = (h) => new THREE.Color(h).convertSRGBToLinear();           // r128 takes colours as linear values
  const hdr = (r, g, b) => new THREE.Color(r, g, b);                    // brighter than white on purpose: the glow pass makes it shine
  const OUT = ' gl_FragColor = linearToOutputTexel(gl_FragColor); }';
  world.fog = new THREE.FogExp2(L(0x171122).getHex(), 0.026); world.fog.color.copy(L(0x171122));
  const R = 9;                                                          // the paved circle, in meters
  const lights = [];
  {
    // paving: rings of flagstones round a new-moon medallion
    const S = o.small ? 1024 : 2048, ppm = S / 32, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    g.fillStyle = '#17131c'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (30 + rnd() * 26) + ',' + (34 + rnd() * 26) + ',' + (30 + rnd() * 20) + ',.5)'; const a = rnd() * 7, r = (R + 0.3 + rnd() * 7) * ppm; g.beginPath(); g.ellipse(S / 2 + r * Math.cos(a), S / 2 + r * Math.sin(a), (6 + rnd() * 16) * S / 2048, (3 + rnd() * 6) * S / 2048, rnd() * 3, 0, 7); g.fill(); }
    let r0 = 1.25;
    for (let ring = 0; r0 < R; ring++) {
      const w = 0.5 + 0.22 * ((ring * 7) % 3), r1 = Math.min(R, r0 + w), n = Math.max(8, Math.round(2 * Math.PI * (r0 + r1) / 2 / (0.75 + 0.2 * (ring % 2)))), off = rnd() * 6;
      for (let k = 0; k < n; k++) {
        const a0 = off + k / n * 2 * Math.PI, a1 = off + (k + 1) / n * 2 * Math.PI, v = 44 + rnd() * 26, band = ring % 4 === 3;
        g.fillStyle = band ? 'rgb(' + (v + 30) + ',' + (v + 4) + ',' + (v + 22) + ')' : 'rgb(' + v + ',' + (v - 4) + ',' + (v + 12) + ')';
        g.beginPath(); g.arc(S / 2, S / 2, r1 * ppm - 1.5, a0 + 0.012, a1 - 0.012); g.arc(S / 2, S / 2, r0 * ppm + 1.5, a1 - 0.012, a0 + 0.012, true); g.closePath(); g.fill();
        for (let s = 0; s < 3; s++) { g.fillStyle = 'rgba(0,0,0,' + (0.05 + rnd() * 0.08) + ')'; const a = a0 + rnd() * (a1 - a0), rr = (r0 + rnd() * (r1 - r0)) * ppm; g.beginPath(); g.arc(S / 2 + rr * Math.cos(a), S / 2 + rr * Math.sin(a), (3 + rnd() * 9) * S / 2048, 0, 7); g.fill(); }
      }
      r0 = r1 + 0.03;
    }
    g.fillStyle = '#2a2233'; g.beginPath(); g.arc(S / 2, S / 2, 1.22 * ppm, 0, 7); g.fill();
    g.strokeStyle = '#b98b3c'; g.lineWidth = 5 * S / 2048; g.beginPath(); g.arc(S / 2, S / 2, 1.16 * ppm, 0, 7); g.stroke();
    g.lineWidth = 3 * S / 2048; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(S / 2 + 0.55 * ppm * Math.cos(a), S / 2 + 0.55 * ppm * Math.sin(a)); g.lineTo(S / 2 + (k % 2 ? 0.85 : 1.1) * ppm * Math.cos(a), S / 2 + (k % 2 ? 0.85 : 1.1) * ppm * Math.sin(a)); g.stroke(); }
    g.fillStyle = '#0d0a12'; g.beginPath(); g.arc(S / 2, S / 2, 0.5 * ppm, 0, 7); g.fill(); g.lineWidth = 4 * S / 2048; g.stroke();   // the new moon
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 96), new THREE.MeshStandardMaterial({ map: t, roughness: 0.93, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2; sq.add(ground);
    const kerb = new THREE.Mesh(new THREE.TorusGeometry(R + 0.05, 0.11, 8, 96), new THREE.MeshStandardMaterial({ color: L(0x4a4052), roughness: 0.9 }));
    kerb.rotation.x = -Math.PI / 2; kerb.position.y = 0.03; sq.add(kerb);

    // lantern posts with bunting strung between them
    const wood = new THREE.MeshStandardMaterial({ color: L(0x3a2c2a), roughness: 0.85 }), iron = new THREE.MeshStandardMaterial({ color: L(0x1c181e), roughness: 0.6 });
    const lamp = new THREE.MeshBasicMaterial({ color: hdr(2.3, 1.4, 0.55), fog: false });
    const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const tops = [];
    for (let k = 0; k < 8; k++) {
      const a = (k + 0.5) / 8 * 2 * Math.PI, x = (R - 0.55) * Math.sin(a), z = (R - 0.55) * Math.cos(a), p = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 3.3, 10), wood); post.position.y = 1.65; p.add(post);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.22, 10), wood); foot.position.y = 0.11; p.add(foot);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 6), iron); arm.rotation.x = Math.PI / 2; arm.position.set(0, 3.05, -0.27); p.add(arm);
      const lan = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.27, 6), lamp); lan.position.set(0, 2.78, -0.5); p.add(lan);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.14, 6), iron); cap.position.set(0, 2.98, -0.5); p.add(cap);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: hdr(0.9, 0.5, 0.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); halo.scale.setScalar(1.6); halo.position.set(0, 2.78, -0.5); p.add(halo);
      p.position.set(x, 0, z); p.rotation.y = a; sq.add(p);
      tops.push(new THREE.Vector3(x, 3.25, z));
      if (k % 3 === 0) { const l = new THREE.PointLight(L(0xffa850), 3.2, 15, 4.1); l.position.set(x * 0.93, 2.7, z * 0.93); sq.add(l); lights.push({ l, base: 3.2 }); }
    }
    const pos = [], col = [], FLAG = [[0.52, 0.11, 0.24], [0.80, 0.56, 0.16], [0.36, 0.30, 0.18], [0.42, 0.22, 0.56], [0.16, 0.12, 0.16]];
    for (let k = 0; k < 8; k++) {
      const A = tops[k], B = tops[(k + 1) % 8], n = 15, d = B.clone().sub(A);
      for (let i = 0; i < n; i++) {
        const u0 = (i + 0.12) / n, u1 = (i + 0.88) / n, sag = (u) => 0.55 * Math.sin(Math.PI * u);
        const p0 = A.clone().addScaledVector(d, u0), p1 = A.clone().addScaledVector(d, u1); p0.y -= sag(u0); p1.y -= sag(u1);
        const tip = p0.clone().add(p1).multiplyScalar(0.5); tip.y -= 0.34;
        pos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, tip.x, tip.y, tip.z);
        const c = FLAG[(i + k * 2) % 5]; for (let v = 0; v < 3; v++) col.push(c[0], c[1], c[2]);
      }
    }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); bg.computeVertexNormals();
    sq.add(new THREE.Mesh(bg, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));

    // striped tents beyond the square
    const stripe = (a, b) => { const c = document.createElement('canvas'); c.width = 256; c.height = 8; const g = c.getContext('2d'); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, 8); } const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
    const TENT = [stripe('#5a1730', '#b7a58c'), stripe('#3b2a5c', '#b7a58c'), stripe('#4c4424', '#b7a58c')];
    [[-0.9, 13.2, 2.6], [-0.3, 14.6, 3.3], [0.35, 13.6, 2.4], [0.95, 14.4, 2.9], [1.75, 13.4, 2.3], [-1.7, 13.8, 2.5], [2.6, 14.2, 2.7], [-2.6, 14.0, 2.2]].forEach(([a, r, s], k) => {
      const m = new THREE.MeshLambertMaterial({ map: TENT[k % 3] }), t = new THREE.Group();
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(s, s, s * 0.7, 14, 1, true), m); wall.position.y = s * 0.35; t.add(wall);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 1.12, s * 0.95, 14), m); roof.position.y = s * 0.7 + s * 0.475; t.add(roof);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), iron); pole.position.y = s * 1.65 + 0.4; t.add(pole);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.26), new THREE.MeshBasicMaterial({ color: L(k % 2 ? 0x9a2a4c : 0xc89430), side: THREE.DoubleSide })); fl.position.set(0.27, s * 1.65 + 0.7, 0); t.add(fl);
      t.position.set(r * Math.sin(a), 0, r * Math.cos(a)); sq.add(t);
    });

    // sky: a deep dusk, stars, and the new moon as a dark disc with a burning rim
    const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = mix(vec3(0.060, 0.030, 0.085), vec3(0.008, 0.008, 0.028), smoothstep(-0.05, 0.6, h)); c += vec3(0.05, 0.015, 0.05) * exp(-abs(h) * 9.0); gl_FragColor = vec4(c, 1.0);' + OUT }));
    sky.renderOrder = -10; sq.add(sky);
    const sp = [], N = 900; for (let i = 0; i < N; i++) { const a = rnd() * 6.283, y = 0.06 + rnd() * 0.94, r = Math.sqrt(1 - y * y); sp.push(110 * r * Math.cos(a), 110 * y, 110 * r * Math.sin(a)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    sq.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: hdr(1.5, 1.5, 2.0), size: o.small ? 2.4 : 1.9, sizeAttenuation: false, fog: false, depthWrite: false })));
    // the moon hangs lower than in the not-HD square, so her long lens can find it over the tents
    const md = new THREE.Vector3(-0.40, 0.27, 0.875).normalize(), moon = new THREE.Group();
    moon.add(new THREE.Mesh(new THREE.CircleGeometry(4.0, 48), new THREE.MeshBasicMaterial({ color: L(0x05040a), fog: false })));
    moon.add(new THREE.Mesh(new THREE.RingGeometry(4.0, 4.16, 64), new THREE.MeshBasicMaterial({ color: hdr(2.6, 2.3, 3.4), fog: false })));
    const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: hdr(0.55, 0.4, 0.9), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); corona.scale.setScalar(26); corona.position.z = -0.5; moon.add(corona);
    moon.position.copy(md).multiplyScalar(70); moon.lookAt(0, 0, 0); sq.add(moon);
    // light: three.js r128 counts light differently from the newer three.js the not-HD square was tuned in (these are about those values over pi, a little up)
    const hemi = new THREE.HemisphereLight(L(0x8a84d0), L(0x3a2c40), 0.58), moonL = new THREE.DirectionalLight(L(0xa9b0ff), 0.66), fill = new THREE.DirectionalLight(L(0xffc890), 0.34);
    moonL.position.copy(md).multiplyScalar(10); fill.position.set(0.5, 1.2, -1);
    for (const l of [hemi, moonL, fill]) sq.add(l);
    lights.push({ l: hemi, base: 0.58 }, { l: moonL, base: 0.66 }, { l: fill, base: 0.34 });
  }
  // the light her spells throw on the ground (her own spell light is in her scene; the page copies it here each frame)
  const spell = new THREE.PointLight(0xb060ff, 0, 7.5, 2.2); world.add(spell);
  // fireflies drifting over the square
  const flies = (() => {
    const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
    const n = 140, p = new Float32Array(n * 3), seed = [];
    for (let i = 0; i < n; i++) seed.push([rnd() * 6.28, 1 + rnd() * 9, 0.4 + rnd() * 3.2, rnd() * 6.28, 0.2 + rnd() * 0.5]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ map: dot, color: hdr(2.4, 1.9, 0.7), size: 0.11, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.frustumCulled = false; sq.add(m);
    return (t) => { for (let i = 0; i < n; i++) { const a = seed[i][0], r = seed[i][1], y = seed[i][2], ph = seed[i][3], sp = seed[i][4], aa = a + t * sp * 0.12; p[i * 3] = r * Math.cos(aa) + 0.3 * Math.sin(t * sp + ph); p[i * 3 + 1] = y + 0.35 * Math.sin(t * sp * 1.7 + ph); p[i * 3 + 2] = r * Math.sin(aa) + 0.3 * Math.cos(t * sp * 1.3 + ph); } g.attributes.position.needsUpdate = true; };
  })();
  // dim: 0 to 1, how far a spell has lowered the lamps (they only go part of the way down; the stage's 'dark' does the rest)
  stage.worldLight = (dim, dark) => { const k = 1 - 0.6 * Math.max(dim || 0, dark || 0); for (const e of lights) e.l.intensity = e.base * k; };
  return { R, flies, spell, group: sq };
}
