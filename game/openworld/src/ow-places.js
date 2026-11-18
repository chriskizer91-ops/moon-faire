// ow-places.js: the seven painted places, built in 3D and skinned with Chris's paintings.
// Each place is built from the very shapes its painting was made from (game/pilot/greybox.js for the fair square, game/world/guide2.js
// for the others), set down where the painted map has it. Then its painting is laid back onto those shapes from the exact camera it was
// painted for: from that camera the place looks exactly like the painting, and from anywhere else each surface keeps the colour the
// painting gave it. Where the painting cannot see a surface (the back of a tent, the ground behind a stall), the colour comes from the
// side it can see, mirrored through the thing's middle, and failing that from the thing's own painted colour. A depth picture taken
// from the painting's camera tells which is which. The painted ground is laid on the land as a sheet that fades out at its edges.
(function (OW) {
  'use strict';
  const RAD = Math.PI / 180, FW = 1774, FH = 887;
  OW.makePlaces = function (renderer, scene, land, cast, paints) {
    const R = window.OW_DATA.R, U = OW.U, list = [], blockers = [], lamps = [], fires = [], people = [], bushes = [];
    const I = window.OW_DATA.img, rockTex = OW.tex(I.rock, { repeat: true });
    // Chris's Round 1 materials for the sides the paintings cannot see (wood planks, cream awning cloth, the red and cream striped canvas),
    // each with its average colour (worked out once it has loaded), shared by every place
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
    const MAT = {}; for (const k of ['wood', 'awning', 'stripe', 'dark', 'rub']) { const src = I[{ dark: 'tile_wooddark', rub: 'tile_rubble' }[k] || 'mat_' + k], t = src ? OW.tex(src, { repeat: true }) : white; MAT[k] = { t: { value: t }, m: { value: new THREE.Vector3(1, 1, 1) } }; if (src) t.ready.then(() => { MAT[k].m.value.copy(OW.meanOf(t.image)); }); }
    const matU = { tWood: MAT.wood.t, mWood: MAT.wood.m, tAwn: MAT.awning.t, mAwn: MAT.awning.m, tStripe: MAT.stripe.t, mStripe: MAT.stripe.m, tDarkW: MAT.dark.t, mDarkW: MAT.dark.m, tRub: MAT.rub.t, mRub: MAT.rub.m };
    // the fair's own pieces (ow-kit.js), in place of the grey shapes the paintings were laid on, in the three fair places
    const KIT = window.OW_DATA.kit && I.kit_atlas && OW.kit ? OW.kit : null; if (KIT) KIT.heightAt = (x, z) => land.height(x, z);
    const KIT_GAIN = { W1: [1.32, 1.36, 1.3], W2: [1.16, 1.26, 1.18], W3: [0.88, 0.82, 0.85] };      // by eye against each painting, from its own camera (check_kit.py)
    // the fair square's four tents, skinned with Chris's tent pictures: which tent is which, by where it stands, and which way its door
    // faces when that is not toward the square's middle (the painting shows the gold tent's door on its south side, and the green tent's turned to the south-west, toward the viewer)
    const TS = window.OW_DATA.tents || {}, SKINNED = { W1: [['red', -8.6, -12.0], ['gold', -12.6, -5.6, [0, 1]], ['star', 9.2, -12.0], ['green', 12.8, 5.8, [-0.55, 0.835]]] };
    const skinTex = I.tent_skin && Object.keys(TS).length ? OW.tex(I.tent_skin) : null, wrapTex = skinTex ? OW.tex(I.tent_wrap, { repeat: true }) : null;
    if (wrapTex) wrapTex.wrapT = THREE.ClampToEdgeWrapping;
    const tentMat = skinTex ? makeTentMat(skinTex, wrapTex) : null;
    const glowMat = OW.glowOnly(new THREE.SpriteMaterial({ map: OW.glowTex(), transparent: true, depthWrite: false, color: 0xffc888 }));
    for (const id of Object.keys(R.places)) list.push(build(R.places[id]));
    const kitAll = KIT ? KIT.merge(list.map((P) => P.kit), scene, { sat: 0.84 }) : null;          // every fair place's kit pieces: one draw, and one for their lamps' glow
    return { list, blockers, lamps, fires, people, bushes, kit: kitAll };

    function build(P) {
      const ox = P.at[0], oz = P.at[1], y0 = P.base, C = P.camera;
      // the painting's camera, in the world
      const d = (C.span / 2) / Math.tan(C.fov / 2 * RAD), T = C.target;
      const pcam = new THREE.PerspectiveCamera(C.fov, FW / FH, 1, 400);
      pcam.position.set(ox + T[0], y0 + T[1] + d * Math.sin(C.pitch * RAD), oz + T[2] + d * Math.cos(C.pitch * RAD)); pcam.lookAt(ox + T[0], y0 + T[1], oz + T[2]); pcam.updateMatrixWorld(); pcam.updateProjectionMatrix();
      const paint = paints[P.id];
      // the painting's pixels, to read colours from: where a thing's own colour is, and how tall the painting drew a standing stone
      const PW = 887, PH = 444, cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; const cg = cv.getContext('2d', { willReadFrequently: true }); cg.drawImage(paint.image, 0, 0, PW, PH); const px = cg.getImageData(0, 0, PW, PH).data;
      const pixAt = (x, y, z, r) => { const v = new THREE.Vector3(x + ox, y + y0, z + oz).applyMatrix4(pm); const u = Math.round((v.x * 0.5 + 0.5) * (PW - 1)), w = Math.round((0.5 - v.y * 0.5) * (PH - 1)); r = r || 2; if (u < r || u > PW - 1 - r || w < r || w > PH - 1 - r || v.z > 1) return null; let a = 0, b = 0, c = 0, n = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const i = ((w + dy) * PW + u + dx) * 4; a += px[i]; b += px[i + 1]; c += px[i + 2]; n++; } return [a / n / 255, b / n / 255, c / n / 255]; };
      const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
      // a standing stone the painting drew taller (or shorter) than its guide: follow its face up in the painting until it gives way to what is behind it
      function fitHeight(s) {
        const zf = s.z + (s.d || 0.6) / 2, L = []; for (let y = 0.3 * s.h; y <= 0.7 * s.h; y += 0.05) { const c = pixAt(s.x, y, zf, 1); if (c) L.push(lum(c)); }
        if (L.length < 3) return s.h; L.sort((a, b) => a - b); const ref = L[L.length >> 1]; let run = 0;
        for (let y = 0.7 * s.h; y <= 2.1 * s.h; y += 0.04) { const c = pixAt(s.x, y, zf, 1); if (!c) return y; if (lum(c) < ref * 0.6 || c[2] > c[0] * 1.3) { if (++run >= 3) return Math.max(0.8 * s.h, y - 0.08); } else run = 0; }
        return Math.min(2.0 * s.h, s.h * 1.5);
      }
      const depthRT = new THREE.WebGLRenderTarget(1024, 512, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
      const pm = new THREE.Matrix4().multiplyMatrices(pcam.projectionMatrix, pcam.matrixWorldInverse);
      const MN = P.moon || { u: 0.105, v: 0.072, d: 0.085 };
      const pu = { uMoon: { value: new THREE.Vector4(MN.u, 1 - MN.v, MN.d * 1.6 * FH / FW, MN.d * 1.6) }, uSkyTest: { value: P.zone === 1 ? 0 : 1 }, uBand: { value: 1 - P.skyBand }, tPaint: { value: paint }, tPDepth: { value: depthRT.texture }, uPM: { value: pm }, uPV: { value: pcam.matrixWorldInverse }, uPCam: { value: pcam.position }, uPNear: { value: 1 }, uPFar: { value: 400 } };

      // ---- the shapes, in the place's own metres, exactly as the guide drew them ----
      const parts = [], occl = [];
      const geo = (g, x, y, z, ry, o) => { g = g.index ? g.toNonIndexed() : g; const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(o && o.rx || 0, ry || 0, 0, 'YXZ')), new THREE.Vector3(o && o.sx || 1, o && o.sy || 1, o && o.sz || 1)); if (o && o.pre) m.multiply(o.pre); g.applyMatrix4(m); return g; };
      function add(g, tone, solid, o) { parts.push({ g, tone, cx: solid.x, cz: solid.z, mirror: !(o && o.noMirror), glow: o && o.glow, ex: o && o.ex, mat: (o && o.mat) || (tone === 'wood' ? 'wood' : tone === 'cloth' ? 'tent' : '') }); }
      const tent = { pos: [], nrm: [], uv: [], a: [], r: [], st: [], k: [] };                  // the skinned tents of this place, one mesh
      const skinOf = (s) => { if (!tentMat) return null; for (const [nm, x, z, door] of SKINNED[P.id] || []) if (TS[nm] && Math.hypot(s.x - x, s.z - z) < 0.5) return { info: TS[nm], door }; return null; };
      const lump = (g, k, seed) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = land.vn(x * 1.9 + seed, z * 1.9 - seed) * 0.6 + land.vn(y * 2.3 + seed, x * 2.1) * 0.4; p.setXYZ(i, x * (1 + n * k), y * (1 + n * k * 0.5), z * (1 + n * k)); } g.computeVertexNormals(); return g; };
      const lantern = (x, h, z, s) => { const b = geo(new THREE.BoxGeometry(s, s * 1.25, s), x, h - 0.25, z); parts.push({ g: b, tone: 'lamp', cx: x, cz: z, mirror: false, glow: true }); lamps.push({ x: ox + x, y: y0 + h - 0.25, z: oz + z, seed: Math.random() * 10, k: 1 }); const sp = new THREE.Sprite(glowMat); sp.position.set(ox + x, y0 + h - 0.25, oz + z); sp.scale.set(1.3, 1.3, 1); scene.add(sp); };
      const kb = KIT && P.zone === 1 ? KIT.batch({ place: P.id, gain: KIT_GAIN[P.id], sat: 0.84 }) : null;
      const block = (s, r) => blockers.push({ x: ox + s.x, z: oz + s.z, r: r, place: P.id });
      const blockBox = (s, w, dd, turn) => blockers.push({ x: ox + s.x, z: oz + s.z, w: w / 2, d: dd / 2, a: (turn || 0) * RAD, place: P.id });
      for (const s0 of P.solids) {
        const s = (P.zone !== 1 && s0.kind === 'box' && s0.h > 1.2 && /stone|leg/.test((s0.name || '').toLowerCase()) && !(s0.y > 0)) ? Object.assign({}, s0, { h: fitHeight(s0) }) : s0;
        if (s !== s0) (window.OW_FIT = window.OW_FIT || []).push(P.id + ' ' + s0.name + ' ' + s0.h + ' -> ' + s.h.toFixed(2));
        const k = s.kind, y = s.y || 0, nm = (s.name || '').toLowerCase();
        if (kb && kitPiece(P, s, kb, ox, oz, y0)) { occl.push(standInShape(s)); if (/tent/.test(s.kind)) occl.push(standInRoof(s)); continue; }
        if (k === 'well') { add(geo(new THREE.CylinderGeometry(s.r, s.r, 0.8, 24), s.x, 0.4, s.z), 'stone', s); add(geo(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), s.x - s.r + 0.1, 1.1, s.z), 'wood', s); add(geo(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), s.x + s.r - 0.1, 1.1, s.z), 'wood', s); add(geo(new THREE.BoxGeometry(s.r * 2 + 0.5, 0.1, 1.1), s.x, 2.25, s.z), 'wood', s); block(s, s.r + 0.15); }
        else if (k === 'post') { const h = s.h || 3.3; add(geo(new THREE.CylinderGeometry(0.05, 0.07, h, 8), s.x, h / 2, s.z), 'dark', s); lantern(s.x, h, s.z, s.pilot ? 0.24 : 0.26); block(s, 0.22); occl.push(geo(new THREE.CylinderGeometry(0.28, 0.3, h, 8), s.x, h / 2, s.z), geo(new THREE.BoxGeometry(0.7, 0.9, 0.7), s.x, h - 0.2, s.z)); }
        else if ((k === 'p-tent-round' || k === 'p-tent-square') && skinOf(s)) { skinTent(tent, s, skinOf(s).info, ox, y0, oz, skinOf(s).door); if (k === 'p-tent-round') block(s, s.r + 0.1); else blockBox(s, s.w + 0.2, s.d + 0.2, 0); }
        else if (k === 'p-tent-round' || k === 'tent-round') {
          const seg = k === 'p-tent-round' ? 28 : 24; add(geo(new THREE.CylinderGeometry(s.r, s.r, s.wall, seg, 2, true), s.x, s.wall / 2, s.z), 'cloth', s); add(geo(new THREE.ConeGeometry(s.r * 1.08, s.top - s.wall, seg), s.x, s.wall + (s.top - s.wall) / 2, s.z), 'cloth', s);
          if (k === 'p-tent-round') { const a = Math.atan2(-s.x, -s.z), dd = geo(new THREE.PlaneGeometry(1.2, 2.0), s.x + Math.sin(a) * (s.r + 0.02), 1.0, s.z + Math.cos(a) * (s.r + 0.02), a); add(dd, 'dark', s); }
          block(s, s.r + 0.1);
        } else if (k === 'p-tent-square') {
          add(geo(new THREE.BoxGeometry(s.w, s.wall, s.d), s.x, s.wall / 2, s.z), 'cloth', s); const mx = Math.max(s.w, s.d);
          add(geo(new THREE.ConeGeometry(mx * 0.76, s.top - s.wall, 4), s.x, s.wall + (s.top - s.wall) / 2, s.z, Math.PI / 4, { sx: s.w / mx, sz: s.d / mx }), 'cloth', s);
          blockBox(s, s.w + 0.2, s.d + 0.2, 0);
        } else if (k === 'tent-square') {
          add(geo(new THREE.BoxGeometry(s.w, s.wall, s.d), s.x, s.wall / 2, s.z, (s.turn || 0) * RAD), 'cloth', s); add(geo(new THREE.ConeGeometry(Math.max(s.w, s.d) * 0.74, s.top - s.wall, 4), s.x, s.wall + (s.top - s.wall) / 2, s.z, ((s.turn || 0) + 45) * RAD), 'cloth', s);
          blockBox(s, s.w + 0.2, s.d + 0.2, s.turn);
        } else if (k === 'p-stall') {
          const a = Math.atan2(-s.x, -s.z), m = new THREE.Matrix4().makeRotationY(a), P2 = (g, lx, ly, lz, o) => { g = g.index ? g.toNonIndexed() : g; const mm = new THREE.Matrix4().makeTranslation(lx, ly, lz); if (o && o.rx) mm.multiply(new THREE.Matrix4().makeRotationX(o.rx)); g.applyMatrix4(mm); g.applyMatrix4(m); g.translate(s.x, 0, s.z); return g; };
          add(P2(new THREE.BoxGeometry(s.w, 0.95, 0.6), 0, 0.475, s.d / 2 - 0.3), 'wood', s); add(P2(new THREE.BoxGeometry(s.w, 2.0, 0.08), 0, 1.0, -s.d / 2), 'wood', s);
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const hh = sz > 0 ? s.h - 0.25 : s.h + 0.1; add(P2(new THREE.CylinderGeometry(0.05, 0.05, hh, 8), sx * (s.w / 2 - 0.06), hh / 2, sz * (s.d / 2 - 0.06)), 'wood', s); }
          add(P2(new THREE.BoxGeometry(s.w + 0.5, 0.06, s.d + 0.9), 0, s.h, 0.15, { rx: 0.2 }), 'cloth', s, { mat: 'awning' });
          blockBox(s, s.w + 0.2, s.d + 0.2, -a / RAD + 0);
          blockers[blockers.length - 1].a = a;
        } else if (k === 'stall') {
          const h = s.h || 2.3, a = (s.turn || 0) * RAD, m = new THREE.Matrix4().makeRotationY(a), P2 = (g, lx, ly, lz) => { g = g.index ? g.toNonIndexed() : g; g.translate(lx, ly, lz); g.applyMatrix4(m); g.translate(s.x, 0, s.z); return g; };
          add(P2(new THREE.BoxGeometry(s.w, 1.0, s.d * 0.45), 0, 0.5, s.d * 0.2), 'wood', s); add(P2(new THREE.BoxGeometry(s.w + 0.4, 0.12, s.d + 0.5), 0, h, 0), 'cloth', s, { mat: 'awning' });
          for (const px of [-1, 1]) for (const pz of [-1, 1]) add(P2(new THREE.CylinderGeometry(0.05, 0.05, h, 6), px * s.w / 2, h / 2, pz * s.d / 2), 'dark', s);
          blockBox(s, s.w + 0.2, s.d + 0.2, s.turn);
        } else if (k === 'wagon') {
          const b = geo(new THREE.BoxGeometry(s.w, s.h, s.d), s.x, s.h / 2 + 0.45, s.z, (s.turn || 0) * RAD); add(b, 'wood', s);
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(geo(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16), s.x + sx * (s.w / 2 - 0.5), 0.5, s.z + sz * (s.d / 2 + 0.08), 0, { rx: Math.PI / 2 }), 'dark', s);
          blockBox(s, s.w + 0.3, s.d + 0.4, s.turn);
        } else if (k === 'fire') {
          add(geo(new THREE.CylinderGeometry(s.r || 0.5, s.r || 0.5, 0.25, 16), s.x, 0.125, s.z), 'stone', s);
          fires.push({ x: ox + s.x, y: y0 + 0.35, z: oz + s.z, r: s.r || 0.5 }); lamps.push({ x: ox + s.x, y: y0 + 0.6, z: oz + s.z, seed: Math.random() * 10, k: 1.3, fire: true }); block(s, (s.r || 0.5) + 0.15);
        } else if (k === 'cyl') { const t = s.tone === 'stone' || /rock|boulder/.test(nm) ? 'stone' : /barrel|post|pole|stake/.test(nm) ? 'wood' : /rope|coil/.test(nm) ? 'dark' : 'stone'; add(geo(lump(new THREE.CylinderGeometry(s.r, s.r * 1.08, s.h, 20, 3), t === 'stone' ? 0.08 : 0, s.x), s.x, y + s.h / 2, s.z), t, s); block(s, s.r + 0.1); }
        else if (k === 'cone') {
          if (/tree/.test(nm)) {                                          // a thorn tree: a twisted dark trunk and bare branches; the painting's cone is kept to hide the ground behind it
            occl.push(geo(new THREE.ConeGeometry(s.r, s.h, 18), s.x, s.h / 2, s.z)); if (KIT) bushes.push({ kind: 'thorn', x: ox + s.x, z: oz + s.z, y: y0, r: s.r, h: s.h }); else thorn(s, ox, oz, y0); block(s, 0.35);
          } else if (/rock|outcrop|knoll/.test(nm)) { const g = geo(lump(new THREE.SphereGeometry(1, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), 0.14, s.x * 3), s.x, 0, s.z, 0, { sx: s.r * 0.92, sy: s.h, sz: s.r * 0.92 }); add(g, 'stone', s); block(s, s.r * 0.8); }
          else {                                                          // gorse, heather, bracken, reeds: the moor's own bushes (ow-props.js); the painting's cone kept to hide the ground behind them
            occl.push(geo(new THREE.ConeGeometry(s.r, s.h, 14), s.x, s.h / 2, s.z)); bushes.push({ kind: /reed/.test(nm) ? 'reed' : /bracken/.test(nm) ? 'bracken' : /heather/.test(nm) ? 'heather' : 'gorse', x: ox + s.x, z: oz + s.z, y: y0, r: s.r, h: s.h }); if (s.h > 0.75) block(s, s.r * 0.7); }
        } else {                                                          // a box: a stone, a wall, a crate, the airship's hull...
          const stone = s.tone === 'stone' || /stone|boulder|rock|crag|wall|bank|stump|leg|arch|span|waystone/.test(nm);
          const b0 = new THREE.BoxGeometry(s.w, s.h, s.d, stone ? 4 : 1, stone ? 4 : 1, stone ? 3 : 1); if (stone && !/wall|span|leg|stub|threshold/.test(nm)) lump(b0, 0.06, s.x * 7);
          const g = geo(b0, s.x, y + s.h / 2, s.z, (s.turn || 0) * RAD);
          add(g, stone ? 'stone' : s.tone === 'dark' ? 'dark' : 'wood', s, s.tone === 'hull' ? { noMirror: true, mat: 'hull' } : P.id === 'W6' && /arch|span|leg|stub|threshold/.test(nm) ? { mat: 'rubble' } : null);
          if (s.h > 0.35 && !(y > 1.5)) blockBox(s, s.w + 0.25, s.d + 0.25, s.turn);
        }
      }
      // the ground's own flat pieces that are water: walked round, not through
      for (const f of P.flats || []) if (f.tone === 'water') { if (f.kind === 'disc') blockers.push({ x: ox + f.x, z: oz + f.z, r: f.r * (P.id === 'W6' ? 1.6 : 1.0), place: P.id, water: true }); else blockers.push({ x: ox + f.x, z: oz + f.z, w: f.w / 2, d: f.d / 2, a: (f.turn || 0) * RAD, place: P.id, water: true }); }

      const kit = kb ? kb.finish(null) : null;                         // drawn below, with the other fair places' pieces, in one mesh
      if (kit) { for (const b of kit.blockers) blockers.push(b); for (const l of kit.lamps) lamps.push(l); for (const f of kit.fires) fires.push(f); }
      // ---- one mesh for all of it: position, normal, the thing's middle (for mirroring) and its own colour (filled in once the painting has loaded) ----
      const pos = [], nrm = [], obj = [], tone = [], toneOf = [];
      for (const p of parts) { const a = p.g.attributes.position, n = p.g.attributes.normal; for (let i = 0; i < a.count; i++) { pos.push(a.getX(i) + ox, a.getY(i) + y0, a.getZ(i) + oz); nrm.push(n.getX(i), n.getY(i), n.getZ(i)); obj.push(p.cx + ox, p.cz + oz, p.mirror ? 1 : 0, p.glow ? 1 : p.mat === 'tent' ? 2 : p.mat === 'rubble' ? 7 : p.tone === 'stone' ? 3 : p.mat === 'hull' ? 6 : p.mat === 'wood' ? 4 : p.mat === 'awning' ? 5 : 0); tone.push(0.3, 0.3, 0.3); toneOf.push(p); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('aObj', new THREE.Float32BufferAttribute(obj, 4)); g.setAttribute('color', new THREE.Float32BufferAttribute(tone, 3));
      const mat = new THREE.ShaderMaterial({ uniforms: Object.assign({ uDebug: { value: 0 }, tRock: { value: rockTex } }, U, pu, matU), vertexColors: true,
        vertexShader: `attribute vec4 aObj; varying vec3 vP; varying vec3 vN; varying vec4 vO; varying vec3 vC;
          void main() { vP = position; vN = normal; vO = aObj; vC = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: OW.GLSL + PAINT_GLSL + OWN_GLSL + `uniform float uDebug; uniform sampler2D tRock; varying vec3 vP; varying vec3 vN; varying vec4 vO; varying vec3 vC;
          void main() {
            vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
            if (vO.w > 0.5 && vO.w < 1.5) { vec3 col = s2l(vec3(1.0, 0.72, 0.40)) * 1.25 * (0.75 + 0.25 * max(n.y, 0.0)); col = owFog(col, vP); ` + OW.out + ` return; }       // a lantern's glass
            vec4 a = seen(vP, n, 0.12);
            vec3 col = a.rgb; float k = a.a;
            if (k < 0.99 && vO.z > 0.5) {                                     // not seen: the same height on the side the painting does see
              vec3 c = vec3(vO.x, vP.y, vO.y); vec3 dir = normalize(vec3(uPCam.x - c.x, 0.0, uPCam.z - c.z));
              vec3 q = vP - 2.0 * dot(vP - c, dir) * dir; vec3 nq = n - 2.0 * dot(n, dir) * dir;
              vec4 b = seenSky(q, nq, 0.12, abs(vO.w - 2.0) < 0.5 ? uSkyTest : 1.0); col = mix(b.rgb * 0.82, col, k); k = max(k, b.a);      // a mirrored booth or crate never takes the sky above it (a tent's blue would be taken for sky)
            }
            // not seen at all: the thing's own painted colour, carried by Chris's material for it, laid on by position
            vec3 own = ownCol(vP, n, vO, vC) * owLight(n, vP, 0.3);
            if (abs(vO.w - 7.0) < 0.5) own = recol(tri(tRub, vP, n, 2.0), mRub, vC, 0.4) * owLight(n, vP, 0.3);                 // the broken arch: Chris's rubble
            if (abs(vO.w - 3.0) < 0.5) { vec3 an = abs(n); an /= an.x + an.y + an.z; vec3 rk = s2l(texture2D(tRock, vP.zy / 3.0).rgb) * an.x + s2l(texture2D(tRock, vP.xz / 3.0).rgb) * an.y + s2l(texture2D(tRock, vP.xy / 3.0).rgb) * an.z; own = rk * (dot(vC, vec3(0.3, 0.59, 0.11)) / 0.09) * owLight(n, vP, 0.3); }
            col = mix(own, col, k);
            if (uDebug > 0.5) col = uDebug < 1.5 ? own : uDebug < 2.5 ? vec3(k) : vC;
            col = owFog(col, vP);
            ` + OW.out + `
          }` });
      const mesh = new THREE.Mesh(g, mat); scene.add(mesh);
      let tents = null;
      if (tent.pos.length) {                                             // the skinned tents: their own mesh and look, not the painting's
        const tg = new THREE.BufferGeometry(), F32 = (a, n) => new THREE.Float32BufferAttribute(a, n);
        tg.setAttribute('position', F32(tent.pos, 3)); tg.setAttribute('normal', F32(tent.nrm, 3)); tg.setAttribute('uv', F32(tent.uv, 2));
        tg.setAttribute('aA', F32(tent.a, 4)); tg.setAttribute('aR', F32(tent.r, 4)); tg.setAttribute('aS', F32(tent.st, 4)); tg.setAttribute('aK', F32(tent.k, 3));
        tents = new THREE.Mesh(tg, tentMat); scene.add(tents);
      }

      // ---- the painted ground: a sheet over the flattened land, fading out at the frame's edges and wherever the painting shows something else ----
      const sh = new THREE.Shape(); P.foot.forEach((q, i) => { if (i) sh.lineTo(q[0], -q[1]); else sh.moveTo(q[0], -q[1]); });
      const gg = new THREE.ShapeGeometry(sh); gg.rotateX(-Math.PI / 2); gg.translate(ox, y0 + 0.012, oz);
      const gmat = new THREE.ShaderMaterial({ uniforms: Object.assign({}, U, pu, { uSkyV: { value: 1 - P.skyBand } }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: OW.GLSL + PAINT_GLSL + `uniform float uSkyV; varying vec3 vP;
          void main() {
            vec4 pc = uPM * vec4(vP, 1.0); vec2 uv = pc.xy / pc.w * 0.5 + 0.5;
            float edge = smoothstep(0.0, 0.07, uv.x) * smoothstep(1.0, 0.93, uv.x) * smoothstep(0.0, 0.05, uv.y) * smoothstep(uSkyV, uSkyV - 0.12, uv.y);
            vec4 a = seen(vP, vec3(0.0, 1.0, 0.0), 0.25);
            vec3 col = owFog(a.rgb, vP);
            ` + OW.out + ` gl_FragColor.a = a.a * edge;
          }` });
      gmat.blending = THREE.CustomBlending; gmat.blendSrc = THREE.SrcAlphaFactor; gmat.blendDst = THREE.OneMinusSrcAlphaFactor; gmat.blendSrcAlpha = THREE.ZeroFactor; gmat.blendDstAlpha = THREE.OneFactor;
      const ground = new THREE.Mesh(gg, gmat); ground.renderOrder = 1; scene.add(ground);

      // ---- the depth picture from the painting's camera: the shapes, the hidden stand-ins (a tree's cone) and the flat ground ----
      const ds = new THREE.Scene(), dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide }), dmFat = dm.clone();
      dmFat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = vec3(position) + normal * 0.07;'); };
      ds.add(new THREE.Mesh(g, dmFat)); if (tents) ds.add(new THREE.Mesh(tents.geometry, dmFat)); for (const o of occl) { o.translate(ox, y0, oz); ds.add(new THREE.Mesh(o, dm)); }
      if (kit && kit.geometry) ds.add(new THREE.Mesh(kit.geometry, KIT.depthMaterial()));
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), dm); fl.rotation.x = -Math.PI / 2; fl.position.set(ox, y0, oz); ds.add(fl);
      const drawDepth = () => { const prev = renderer.getRenderTarget(); renderer.setRenderTarget(depthRT); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(ds, pcam); renderer.setRenderTarget(prev); };
      drawDepth(); if (kit) KIT.ready().then(drawDepth);                // again once the kit's cut-outs have loaded (they cut its cards in the depth picture)

      // ---- each thing's own colour: the painting, averaged where the painting shows the middle of it ----
      {
        const FALL = { cloth: [0.30, 0.12, 0.09], wood: [0.16, 0.10, 0.06], stone: [0.17, 0.16, 0.15], dark: [0.05, 0.045, 0.05], bush: [0.07, 0.08, 0.035], lamp: [1, 0.8, 0.5] };
        const skyish = (c) => c && P.zone !== 1 && c[2] > c[0] * 1.3 && c[2] > c[1] * 1.15, lin = (c) => c.map((v) => Math.max(0.02, Math.pow(v, 2.2) / 1.05));
        const cache = new Map(), c = g.attributes.color;
        for (let i = 0; i < toneOf.length; i++) {
          const p = toneOf[i]; if (!cache.has(p)) { const b = new THREE.Box3().setFromBufferAttribute(p.g.attributes.position), m = b.getCenter(new THREE.Vector3()); let t = pixAt(m.x, m.y, b.max.z); if (!t || skyish(t)) t = pixAt(m.x, b.min.y + 0.3, b.max.z); cache.set(p, t && !skyish(t) ? lin(t) : FALL[p.tone] || FALL.wood); }
          const t = cache.get(p); c.setXYZ(i, t[0], t[1], t[2]);
        }
        c.needsUpdate = true;                                            // the depth picture has already sent the shapes to the graphics card
      }

      // ---- the people who stand here, and the captain's grey stand-in ----
      for (const pp of P.people) {
        const who = { id: pp.id, name: pp.name, says: pp.says || [], x: ox + pp.x, z: oz + pp.z, y: y0, npc: null, root: null, place: P.id, home: Math.atan2(-pp.x * 0.25, 6) };
        people.push(who);
        if (window.MF_NPC && window.MF_NPCS && window.MF_NPCS.people[pp.id]) window.MF_NPC.make(pp.id).then((n) => { who.npc = n; who.root = n.root; n.root.position.set(who.x, who.y, who.z); n.root.rotation.y = who.home; n.root.traverse((o) => { o.castShadow = false; }); cast.add(n.root); }).catch(() => { who.root = standIn(); who.root.position.set(who.x, y0, who.z); who.standIn = true; cast.add(who.root); });
        else { who.root = standIn(); who.root.position.set(who.x, y0, who.z); who.standIn = true; cast.add(who.root); }
      }
      return { id: P.id, name: P.name, zone: P.zone, at: [ox, oz], base: y0, mesh, tents, ground, pcam, foot: P.foot, light: P.light, happens: P.happens, kit };
    }
  };

  // ---- which kit piece stands for which of a fair place's grey shapes (the layouts' own positions and sizes) ----
  // W1's four stalls by the painting: the brass stall and the moon stall at the back, the herb stall on the right, the lamp stall on the left
  const W1_FRONT = [['brass', -2.2, -11.2], ['moon', 2.6, -11.4], ['herb', 11.6, -5.2], ['lamp', -11.4, 5.4]];
  function kitPiece(P, s, kb, ox, oz, y0) {
    const nm = (s.name || '').toLowerCase(), k = s.kind, X = ox + s.x, Z = oz + s.z, t = s.turn || 0;
    const at = (lx, lz, extra) => { const a = t * RAD; return Object.assign({ x: X + lx * Math.cos(a) + lz * Math.sin(a), z: Z - lx * Math.sin(a) + lz * Math.cos(a), y: y0 + (s.y || 0), turn: t }, extra); };
    if (k === 'post') { kb.lanternPost(at(0, 0, { h: s.h || 3.3, turn: P.id === 'W2' && s.x > 0 ? 180 : 0 })); return true; }      // W2's lanterns hang toward the ring, the others to the east, as painted
    if (k === 'well') { kb.well(at(0, 0, { r: s.r })); return true; }
    if (k === 'p-stall') { const f = W1_FRONT.find((q) => Math.hypot(q[1] - s.x, q[2] - s.z) < 0.5);
      // the lamp stall: the painting turns it to the south-east, toward the viewer, and sets it a little north of its guide (its front's corners found on the ground from the painting's camera)
      if (f && f[0] === 'lamp') kb.stall({ x: ox - 11.45, z: oz + 4.5, y: y0, turn: 65, w: s.w, d: s.d, h: s.h, front: 'lamp' });
      else kb.stall(at(0, 0, { turn: Math.atan2(-s.x, -s.z) / RAD, w: s.w, d: s.d, h: s.h, front: f ? f[0] : 'lamp' })); return true; }
    if (k === 'stall') { kb.stall(at(0, 0, { w: s.w, d: s.d, h: s.h, front: s.x < 0 ? 'herb' : 'moon' })); return true; }      // W2: the red-rugged stall left of the ring, the blue one right
    if (k === 'wagon') { kb.wagon(at(0, 0, { w: s.w, d: s.d })); return true; }
    if (k === 'fire' && /brazier/.test(nm)) { kb.brazier(at(0, 0, { w: 0.8 })); return true; }
    if (k === 'tent-round' && P.id === 'W2' && /behind the ring/.test(nm)) { kb.tentRound(at(0, 0, { r: s.r, wall: s.wall, top: s.top, canvas: 'blue', door: 'bigtop', roof: 'bigtop', trim: 'bigtop' })); return true; }
    if (k === 'p-tent-round' && P.id === 'W1' && Math.abs(s.z - 14.02) < 0.1) { kb.tentRound(at(0, 0, { r: s.r, wall: s.wall, top: s.top, canvas: s.x < 0 ? 'red' : 'damask', trim: 'scallop', turn: s.x < 0 ? 40 : -40 })); return true; }    // the square's two near corner tents
    if (k === 'cyl' && /mooring post/.test(nm)) { kb.bollard(at(0, 0, { r: s.r, h: s.h })); return true; }
    if (k === 'tent-round') { kb.tentRound(at(0, 0, { r: s.r, wall: s.wall, top: s.top, canvas: P.id === 'W2' ? 'damask' : 'red', trim: 'scallop' })); return true; }
    if (k === 'tent-square') { kb.tentSquare(at(0, 0, { w: s.w, d: s.d, wall: s.wall, top: s.top, canvas: 'red', trim: 'scallop' })); return true; }
    if (/booth/.test(nm)) { kb.booth(at(0, 0, { w: s.w, d: s.d, h: s.h })); return true; }
    if (/oven cart/.test(nm)) { kb.ovenCart(at(0, 0, { w: s.w, d: s.d })); return true; }
    if (/pie cart/.test(nm)) { kb.pieCart(at(0, 0, { w: s.w, d: s.d })); return true; }
    if (/straw bale/.test(nm)) { kb.bale(at(-0.93, 0.1, { w: 1.12, d: 0.62, h: 0.55, turn: t + 3 })); kb.bale(at(0.31, 1.12, { w: 1.12, d: 0.62, h: 0.55, turn: t - 4 })); return true; }      // as the painting sets them
    if (/gate pole/.test(nm)) { if (s.z < 0) { const o = P.solids.find((q) => q !== s && /gate pole/.test(q.name || '')); const zm = o ? (s.z + o.z) / 2 : s.z; kb.gate({ x: X, z: oz + zm, y: y0, turn: 90, span: o ? Math.abs(o.z - s.z) : 4.6, h: s.h, r: s.r + 0.02 }); } return true; }
    if (/coin table/.test(nm)) { kb.table(at(0, 0, { w: s.w, d: s.d, h: s.h })); return true; }
    if (/coil of mooring rope/.test(nm)) { kb.rope({ x: ox - 3.85, z: oz + 6.3, y: y0, r: s.r, h: s.h }); return true; }        // where the painting has it, by the low crates (the layout's spot, 2.2, is bare in the painting)
    if (k === 'cyl' && /barrels/.test(nm)) { kb.barrel(at(-0.85, -0.35, { r: 0.36, h: s.h })); kb.barrel(at(0.0, -1.1, { r: 0.36, h: s.h })); return true; }      // as the painting sets them (a little in front of the guide's spot)
    if (P.id === 'W1' && nm === 'crates and barrels') { kb.crate(at(-0.45, 0.22, { w: 1.2, d: 0.85, h: 0.8 })); kb.barrel(at(0.4, -0.35, { r: 0.36, h: 0.88 })); kb.barrel(at(0.6, 0.32, { r: 0.35, h: 0.85, turn: t + 40 })); return true; }
    if (P.id === 'W1' && nm === 'crates') { kb.crateTall(at(0, 0, { w: 0.85, d: 0.85, h: 1.45 })); return true; }
    if (nm === 'stacked crates') { kb.crate(at(0, 0, { w: 1.5, d: 1.1, h: 0.55 })); kb.crate(at(0.08, 0, { w: 1.0, d: 0.78, h: 0.4, turn: t + 5, y: y0 + 0.55 })); return true; }
    if (nm === "ship's cargo crates") { kb.crate(at(-0.15, 0.1, { w: 1.15, d: 1.0, h: 0.72 })); kb.crate(at(-0.2, 0.05, { w: 0.8, d: 0.7, h: 0.5, turn: t - 6, y: y0 + 0.72 })); kb.crate(at(0.62, 0.3, { w: 0.5, d: 0.5, h: 0.42, turn: t + 10 })); return true; }
    if (nm === 'low crates') { kb.crate(at(-0.38, 0, { w: 0.85, d: 0.8, h: 0.75 })); kb.crate(at(0.45, 0.1, { w: 0.65, d: 0.65, h: 0.55, turn: t + 6 })); return true; }
    return false;
  }
  // the grey shape a kit piece stands in for, in the place's own metres: kept in the depth picture so the painting's own picture of the
  // thing is never laid on the ground behind the piece
  function standInRoof(s) {                                          // a tent's roof, for the same: the painted roof is not laid on the ground behind it either
    const sq = /square/.test(s.kind), mx = sq ? Math.max(s.w, s.d) : s.r, g = new THREE.ConeGeometry(mx * (sq ? 0.8 : 1.12), s.top - s.wall, sq ? 4 : 16).toNonIndexed();
    if (sq) { g.rotateY(Math.PI / 4); g.scale(s.w / mx, 1, s.d / mx); }
    g.translate(0, s.wall + (s.top - s.wall) / 2, 0); g.rotateY((s.turn || 0) * RAD); g.translate(s.x, 0, s.z); return g;
  }
  function standInShape(s) {
    const k = s.kind, y = s.y || 0, R = (g, ry) => { g = g.index ? g.toNonIndexed() : g; g.rotateY(ry || 0); return g; };
    let g;
    if (k === 'post') g = new THREE.CylinderGeometry(0.3, 0.3, s.h || 3.3, 8).translate(0, (s.h || 3.3) / 2, 0);
    else if (k === 'well') g = new THREE.CylinderGeometry(s.r, s.r, 2.4, 16).translate(0, 1.2, 0);
    else if (k === 'fire') g = new THREE.CylinderGeometry(s.r || 0.5, s.r || 0.5, 0.9, 12).translate(0, 0.45, 0);
    else if (/tent-round/.test(k)) g = new THREE.CylinderGeometry(s.r, s.r, s.wall, 16).translate(0, s.wall / 2, 0);
    else if (k === 'cyl') g = new THREE.CylinderGeometry(s.r, s.r, s.h, 12).translate(0, y + s.h / 2, 0);
    else { const h = k === 'stall' || k === 'p-stall' ? 1.0 : k === 'wagon' ? s.h + 0.45 : (s.wall || s.h || 1); g = new THREE.BoxGeometry(s.w || 1, h, s.d || 1).translate(0, y + h / 2, 0); }
    if (k !== 'post') g.scale(1.06, 1.06, 1.06);
    if (k === 'p-tent-round' && Math.abs(s.z - 14.02) < 0.1) g.scale(1.3, 1.0, 1.3);                     // the square's near corner tents: painted with a wider skirt than their guide
    // the pieces set where the painting has them, not at their guide's spot: their stand-in goes with them
    const nm = (s.name || '').toLowerCase(); let moved = [s.x, s.z];
    if (/coil of mooring rope/.test(nm)) moved = [-3.85, 6.3];
    else if (k === 'cyl' && /barrels/.test(nm)) { g = new THREE.CylinderGeometry(0.8, 0.8, s.h, 12).translate(0, s.h / 2, 0).toNonIndexed(); moved = [s.x - 0.42, s.z - 0.72]; }
    else if (/straw bale/.test(nm)) { g = new THREE.BoxGeometry(2.4, s.h, 1.6).translate(0, s.h / 2, 0).toNonIndexed(); moved = [s.x - 0.3, s.z + 0.6]; }
    else if (k === 'p-stall' && Math.hypot(s.x + 11.4, s.z - 5.4) < 0.5) { g = new THREE.BoxGeometry(s.w, 1.0, s.d).translate(0, 0.5, 0).toNonIndexed().rotateY(65 * RAD); g.translate(-11.45, 0, 4.5); return g; }
    g = R(g, k === 'p-stall' ? Math.atan2(-s.x, -s.z) : (s.turn || 0) * RAD); g.translate(moved[0], 0, moved[1]); return g;
  }

  // the unseen sides' own look: Chris's material for the kind of thing (vO.w: 2 tent canvas, 4 wood, 5 awning cloth; others plain), its
  // grain and its own colour kept, its brightness and part of its colour taken from the colour the painting gave the thing (vC), so a
  // blue wagon's back stays blue and a lamp-lit awning stays as bright as the painting has it
  const OWN_GLSL = `
uniform sampler2D tWood, tAwn, tStripe, tDarkW, tRub; uniform vec3 mWood, mAwn, mStripe, mDarkW, mRub;
vec3 tri(sampler2D t, vec3 p, vec3 n, float sc) { vec3 an = abs(n); an = an * an * an; an /= an.x + an.y + an.z; return s2l(texture2D(t, p.zy / sc).rgb) * an.x + s2l(texture2D(t, p.xz / sc + 0.5).rgb) * an.y + s2l(texture2D(t, p.xy / sc).rgb) * an.z; }
vec3 recol(vec3 tex, vec3 m, vec3 c, float t) { float lc = dot(c, vec3(0.3, 0.59, 0.11)), lm = dot(m, vec3(0.3, 0.59, 0.11)); return tex / m * mix(m * lc / lm, c, t); }
vec3 ownCol(vec3 p, vec3 n, vec4 o, vec3 c) {
  if (abs(o.w - 2.0) < 0.5) { float a = atan(p.z - o.y, p.x - o.x); return recol(s2l(texture2D(tStripe, vec2(a * 0.63662, p.y / 3.8)).rgb), mStripe, c, 0.15); }   // canvas round a tent: 4 widths a turn, 16 red stripes
  if (abs(o.w - 4.0) < 0.5) return recol(tri(tWood, p, n, 1.6), mWood, c, 0.5);                    // planks: 8 of them in 1.6 m
  if (abs(o.w - 5.0) < 0.5) return recol(tri(tAwn, p, n, 2.0), mAwn, c, 0.35);                     // awning cloth, 2 m across
  if (abs(o.w - 6.0) < 0.5) return recol(tri(tDarkW, p, n, 2.2), mDarkW, c, 0.5);                  // the airship's hull: dark tarred planks
  return c * (0.9 + 0.2 * owNoise(p.xz * 3.0 + p.y * 2.0));
}`;

  // ---- a fair square tent in Chris's skins: its canvas (with the valance and border from its door picture) round the walls, the door
  // picture on the side that faces the square's middle, the roof picture from above. tent_skin holds the doors and roofs, tent_wrap one
  // band per tent; tents.json (from prep_round1.py) says where. Attributes: uv (walls: metres round the wall from the door's middle, and
  // height 0..1; roofs: the roof picture's own 0..1, down = toward the door), aA (part 0 wall / 1 roof, the band's repeat in metres, the
  // door's width in metres, how much of the door picture's sides fade into the band), aR (the door's or roof's place in tent_skin),
  // aS (the band's rows in tent_wrap), aK (the tent's colour gain, to sit with the painting) ----
  const TENT_K = { red: [0.64, 0.62, 0.66], gold: [0.6, 0.6, 0.7], star: [0.7, 0.68, 0.72], green: [0.72, 0.72, 0.74] };      // by eye against the painting, from its own camera (check_pcam.py)
  function skinTent(T, s, info, ox, y0, oz, door) {
    const cx = ox + s.x, cz = oz + s.z, round = s.kind === 'p-tent-round', name = Object.keys(window.OW_DATA.tents).find((k) => window.OW_DATA.tents[k] === info);
    const K = TENT_K[name] || [0.62, 0.62, 0.66], st = [info.strip[0], info.strip[1], info.strip[2], info.index];
    let out, a, b;
    if (door) { const l = Math.hypot(door[0], door[1]); out = [door[0] / l, door[1] / l]; }
    else if (round) { const t = Math.atan2(-s.x, -s.z); out = [Math.sin(t), Math.cos(t)]; }
    else { const dx = -s.x, dz = -s.z; out = Math.abs(dx) > Math.abs(dz) ? [Math.sign(dx), 0] : [0, Math.sign(dz)]; }
    const right = [out[1], -out[0]];                                      // to the right of someone at the door, looking in
    const vert = (x, y, z, n, u, v, part, wrapW, doorW, fade, rect) => { T.pos.push(x, y, z); T.nrm.push(n[0], n[1], n[2]); T.uv.push(u, v); T.a.push(part, wrapW, doorW, fade); T.r.push(...rect); T.st.push(...st); T.k.push(...K); };
    const roofUV = (x, z, hr, ho) => { const dx = x - cx, dz = z - cz; return [0.5 + (dx * right[0] + dz * right[1]) / (2 * hr), 0.5 + (dx * out[0] + dz * out[1]) / (2 * ho)]; };
    if (round) {
      const R = s.r, C = 2 * Math.PI * R, wrapW = C / Math.max(1, Math.round(C / info.matW)), doorW = s.wall * info.doorAspect, td = Math.atan2(out[0], out[1]);
      const w = new THREE.CylinderGeometry(R, R, s.wall, 64, 1, true, td + Math.PI, Math.PI * 2).toNonIndexed(), p = w.attributes.position, n = w.attributes.normal, uv = w.attributes.uv;
      for (let i = 0; i < p.count; i++) vert(cx + p.getX(i), y0 + s.wall / 2 + p.getY(i), cz + p.getZ(i), [n.getX(i), n.getY(i), n.getZ(i)], (uv.getX(i) - 0.5) * C, uv.getY(i), 0, wrapW, doorW, 0.06, info.door);
      const RR = R * 1.08, c = new THREE.ConeGeometry(RR, s.top - s.wall, 64, 1, true).toNonIndexed(), q = c.attributes.position, m = c.attributes.normal;
      for (let i = 0; i < q.count; i++) { const x = cx + q.getX(i), z = cz + q.getZ(i), t = roofUV(x, z, RR, RR); vert(x, y0 + s.wall + (s.top - s.wall) / 2 + q.getY(i), z, [m.getX(i), m.getY(i), m.getZ(i)], t[0], t[1], 1, 1, 1, 0, info.roof); }
    } else {
      a = (right[0] !== 0 ? s.w : s.d) / 2; b = (out[0] !== 0 ? s.w : s.d) / 2;
      const P = 4 * (a + b), wrapW = P / Math.max(1, Math.round(P / info.matW)), doorW = 2 * a;
      const at = (i, j) => [cx + right[0] * i + out[0] * j, cz + right[1] * i + out[1] * j];
      // round the walls from the door's middle to the right, on to the back's middle; then from the back's middle on round to the door
      const path = [[[0, b], 0], [[a, b], a], [[a, -b], a + 2 * b], [[0, -b], P / 2], null, [[0, -b], -P / 2], [[-a, -b], -(a + 2 * b)], [[-a, b], -a], [[0, b], 0]];
      for (let k = 0; k + 1 < path.length; k++) {
        if (!path[k] || !path[k + 1]) continue;
        const [p0, s0] = path[k], [p1, s1] = path[k + 1], A = at(p0[0], p0[1]), B = at(p1[0], p1[1]), tx = B[0] - A[0], tz = B[1] - A[1], l = Math.hypot(tx, tz), n = [-tz / l, 0, tx / l];
        const V = (Q, sv, v) => vert(Q[0], y0 + v * s.wall, Q[1], n, sv, v, 0, wrapW, doorW, 0, info.door);
        V(A, s0, 0); V(B, s1, 0); V(B, s1, 1); V(A, s0, 0); V(B, s1, 1); V(A, s0, 1);
      }
      const k = 1.07, ha = a * k, hb = b * k, apex = [cx, y0 + s.top, cz], cs = [at(-ha, hb), at(ha, hb), at(ha, -hb), at(-ha, -hb)];
      for (let e = 0; e < 4; e++) {
        const A = [cs[e][0], y0 + s.wall, cs[e][1]], B = [cs[(e + 1) % 4][0], y0 + s.wall, cs[(e + 1) % 4][1]];
        const u = new THREE.Vector3(B[0] - A[0], 0, B[2] - A[2]), v = new THREE.Vector3(apex[0] - A[0], apex[1] - A[1], apex[2] - A[2]), n = u.cross(v).normalize().toArray();
        for (const Q of [A, B, apex]) { const t = roofUV(Q[0], Q[2], ha, hb); vert(Q[0], Q[1], Q[2], n, t[0], t[1], 1, 1, 1, 0, info.roof); }
      }
    }
  }
  function makeTentMat(skin, wrap) {
    return new THREE.ShaderMaterial({ uniforms: Object.assign({ tSkin: { value: skin }, tWrap: { value: wrap } }, OW.U),
      vertexShader: `attribute vec4 aA; attribute vec4 aR; attribute vec4 aS; attribute vec3 aK; varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying vec4 vA; varying vec4 vR; varying vec4 vS; varying vec3 vK;
        void main() { vP = position; vN = normal; vUv = uv; vA = aA; vR = aR; vS = aS; vK = aK; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: OW.GLSL + `uniform sampler2D tSkin, tWrap; varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying vec4 vA; varying vec4 vR; varying vec4 vS; varying vec3 vK;
        vec2 atl(vec4 r, vec2 q) { q = clamp(q, vec2(0.003), vec2(0.997)); return vec2(r.x + q.x * r.z, 1.0 - (r.y + q.y * r.w)); }
        void main() {
          vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
          float roof = step(0.5, vA.x), down = clamp(1.0 - vUv.y, 0.0, 1.0);
          vec3 band = texture2D(tWrap, vec2(vUv.x / vA.y, 1.0 - (vS.x + vS.z + down * (vS.y - 2.0 * vS.z)))).rgb;        // the canvas round the wall
          float du = vUv.x / vA.z + 0.5; vec4 door = texture2D(tSkin, atl(vR, vec2(du, down)));                         // the door picture
          float inDoor = step(0.0, du) * step(du, 1.0) * door.a * (vA.w > 0.0 ? smoothstep(0.0, vA.w, du) * smoothstep(1.0, 1.0 - vA.w, du) : 1.0);
          vec3 c = mix(band, door.rgb, inDoor);
          c = mix(c, texture2D(tSkin, atl(vR, vUv)).rgb, roof);                                                          // the roof picture, from above
          vec3 col = s2l(c) * vK * owLight(n, vP, 0.3);
          col = owFog(col, vP);
          ` + OW.out + `
        }` });
  }

  // what the painting shows at a point, and how sure we are that it shows this surface there (0 to 1)
  const PAINT_GLSL = `
uniform sampler2D tPaint; uniform sampler2D tPDepth; uniform mat4 uPM; uniform mat4 uPV; uniform vec3 uPCam; uniform float uPNear; uniform float uPFar; uniform float uSkyTest; uniform float uBand; uniform vec4 uMoon;
float pUnpack(vec4 v) { return dot(v, vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0)) * (255.0 / 256.0); }
float pViewZ(float d) { return (uPNear * uPFar) / ((uPFar - uPNear) * d - uPFar); }
vec4 seenSky(vec3 p, vec3 n, float face, float skyTest) {
  vec4 pc = uPM * vec4(p, 1.0); vec3 nd = pc.xyz / pc.w; vec2 uv = nd.xy * 0.5 + 0.5;
  if (uv.x < 0.002 || uv.x > 0.998 || uv.y < 0.002 || uv.y > 0.998 || pc.w < 0.0) return vec4(0.0);
  float here = -(uPV * vec4(p, 1.0)).z;
  float d0 = -pViewZ(pUnpack(texture2D(tPDepth, uv))); float tol = 0.06 + here * 0.004;
  float vis = 1.0 - smoothstep(tol, tol * 2.5, here - d0);
  float f = dot(n, normalize(uPCam - p)); vis *= smoothstep(face * 0.25, face, f);
  vec3 cs = texture2D(tPaint, uv).rgb; vec3 c = s2l(cs);
  float sky = skyTest * smoothstep(uBand - 0.04, uBand + 0.01, uv.y) * smoothstep(1.06, 1.25, cs.b / max(cs.r, 0.02)) * smoothstep(1.0, 1.15, cs.b / max(cs.g, 0.02)) * (1.0 - smoothstep(0.55, 0.7, cs.b));
  vec2 md = (uv - uMoon.xy) / uMoon.zw; sky = max(sky, 1.0 - smoothstep(0.9, 1.3, length(md)));
  return vec4(c, vis * (1.0 - sky));
}
vec4 seen(vec3 p, vec3 n, float face) { return seenSky(p, n, face, uSkyTest); }`;

  // a bare, wind-bent thorn tree: a leaning trunk and a few forking branches, all dark wood
  const treeMat = new THREE.ShaderMaterial({ uniforms: OW.U,
    vertexShader: 'varying vec3 vP; varying vec3 vN; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: OW.GLSL + 'varying vec3 vP; varying vec3 vN; void main(){ vec3 col = s2l(vec3(0.20, 0.16, 0.14)) * (0.8 + 0.4 * owNoise(vP.xy * 9.0)) * owLight(normalize(vN), vP, 0.4); col = owFog(col, vP); ' + OW.out + ' }' });
  OW.treeMat = treeMat;
  function thorn(s, ox, oz, y0) {
    const parts = [], rnd = ((k) => () => (k = (k * 16807) % 2147483647) / 2147483647)(Math.floor(Math.abs(s.x * 1000 + s.z * 77)) + 3);
    const lean = new THREE.Vector3(0.35, 1, 0.12).normalize();                         // bent by the wind off the sea
    function limb(a, dir, len, r, depth) {
      const b = a.clone().addScaledVector(dir, len), g = new THREE.CylinderGeometry(r * 0.62, r, len, 6, 1); g.translate(0, len / 2, 0);
      g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir))); g.translate(a.x, a.y, a.z); parts.push(g.toNonIndexed());
      if (depth <= 0) return;
      const n = depth > 2 ? 2 : 2 + (rnd() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) { const d2 = dir.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.4, (rnd() - 0.2) * 0.6, (rnd() - 0.5) * 1.4)).add(lean.clone().multiplyScalar(0.4)).normalize(); limb(b, d2, len * (0.55 + rnd() * 0.25), r * 0.62, depth - 1); }
    }
    limb(new THREE.Vector3(0, 0, 0), lean, s.h * 0.45, Math.max(0.09, s.h * 0.045), 4);
    let n = 0; for (const p of parts) n += p.attributes.position.count; const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3); let o = 0;
    for (const p of parts) { pos.set(p.attributes.position.array, o * 3); p.computeVertexNormals(); nrm.set(p.attributes.normal.array, o * 3); o += p.attributes.position.count; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    const m = new THREE.Mesh(g, treeMat); m.position.set(ox + s.x, y0, oz + s.z); OW._scene.add(m);
  }
  function standIn() {
    const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: 0x2c2636 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.5, 12), m); body.position.y = 0.75; const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), m); head.position.y = 1.66;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 16), m); brim.position.y = 1.78; const crown = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 12), m); crown.position.y = 2.0; g.add(body, head, brim, crown); return g;
  }
  OW.standIn = standIn;
})(window.OW);
