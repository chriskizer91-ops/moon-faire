
  // ---------- round 3, continued: her ghost double, her foxfire fox, Blue Mischief and Borrowed Face ----------
  // Flipbook clips blue_mischief (22 frames at 6 a second, release on frame 16) and borrowed_face (22 frames, release on frame 10); paintings H5 to H8.
  // Her spells act toward her left (+x in her own space: screen right when she faces you), as on the sprite sheet; the host turns her so that is her target.

  // A ghost double (lore: "if a ghost 3D copy of any character in the game can be made, that is the direction"). It is her own meshes drawn a
  // second time on a second set of bones, in one see-through blue material, so it costs no new geometry and no textures, only the drawing while it shows.
  // Each frame it is live, a pose is worked out for it on her bones, copied across, and her own pose is then laid back over them (animate, 90_api.js).
  const GHOST = (function () {
    const g = new THREE.Group(); g.name = 'ghost'; g.visible = false; root.add(g);
    const map = new Map(), gb = skeleton.bones.map((b) => { const n = new THREE.Bone(); n.name = b.name; n.position.copy(b.position); n.quaternion.copy(b.quaternion); n.scale.copy(b.scale); map.set(b, n); return n; });
    skeleton.bones.forEach((b, i) => { const p = map.get(b.parent); (p || g).add(gb[i]); });
    const gs = new THREE.Skeleton(gb, skeleton.boneInverses);
    const mat = new THREE.ShaderMaterial({ skinning: true, transparent: true, depthWrite: true, side: THREE.DoubleSide,
      uniforms: { cA: { value: new THREE.Color(0.10, 0.30, 0.85) }, cB: { value: new THREE.Color(0.70, 0.92, 1.0) }, uOp: { value: 0 } },
      vertexShader: '#include <common>\n#include <skinning_pars_vertex>\nvarying vec3 vN; varying vec3 vV;\nvoid main() {\n#include <beginnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <defaultnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvN = normalize(transformedNormal); vV = normalize(-mvPosition.xyz); }',
      fragmentShader: 'uniform vec3 cA; uniform vec3 cB; uniform float uOp; varying vec3 vN; varying vec3 vV;\nvoid main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6); gl_FragColor = vec4(mix(cA, cB, f), uOp * (0.34 + 0.6 * f)); }' });
    for (const key in meshes) { if (key === 'lens' || !meshes[key].isSkinnedMesh) continue; const m = new THREE.SkinnedMesh(meshes[key].geometry, mat); m.name = 'ghost_' + key; m.frustumCulled = false; m.renderOrder = 6; g.add(m); m.bind(gs, new THREE.Matrix4()); }
    const P = clonePose(REST), api = { live: false, asked: false, P, group: g, mat,      // asked: a spell called show() this frame; if none did, it goes (a move cut short must not leave it standing there)
      // the host of a spell sets P (the double's pose), place (where it stands, in her space) and turn, then calls show(opacity) each frame it should be seen
      show(op, x, y, z, turn) { api.asked = true; api.live = op > 0.004; g.visible = api.live; mat.uniforms.uOp.value = op; g.position.set(x || 0, y || 0, z || 0); g.rotation.y = turn || 0; },
      pose() { poseQuiet = true; applyPose(P); poseQuiet = false; for (let i = 0; i < gb.length; i++) { const a = skeleton.bones[i], b = gb[i]; b.position.copy(a.position); b.quaternion.copy(a.quaternion); b.scale.copy(a.scale); } },
      hide() { api.live = false; g.visible = false; } };
    return api;
  })();

  // A fox made of foxfire: a handful of simple shapes in one glowing material. Its body is one unit long, nose toward +x, feet on y = 0.
  // stretch 0 is sitting or standing, 1 is at full leap. It is light, not a thing: it is never inked in the Flipbook look.
  const FOXFIRE = (function () {
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.FrontSide, uniforms: { cA: { value: new THREE.Color(0.10, 0.36, 1.0) }, cB: { value: new THREE.Color(0.50, 0.84, 1.0) }, uOp: { value: 1 } },
      vertexShader: 'varying vec3 vN; varying vec3 vV;\nvoid main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 cA; uniform vec3 cB; uniform float uOp; varying vec3 vN; varying vec3 vV;\nvoid main() { float d = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(mix(cA, cB, d * d), uOp * (0.10 + 0.42 * d)); }' }));      // kept dim: the shapes overlap and add up, and a white blob has no legs
    const g = new THREE.Group(); g.visible = false; g.renderOrder = 28; fx.add(g); fxAuto.push(g);
    const sph = new THREE.SphereGeometry(0.5, 14, 10), cone = new THREE.ConeGeometry(0.5, 1, 10);
    const add = (geo, par, px, py, pz, sx, sy, sz, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); if (rz) m.rotation.z = rz; m.renderOrder = 28; m.frustumCulled = false; (par || g).add(m); return m; };
    const piv = (x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); return p; };
    add(sph, null, 0, 0.42, 0, 0.58, 0.22, 0.19); add(sph, null, 0.28, 0.48, 0, 0.24, 0.24, 0.19); add(sph, null, 0.48, 0.64, 0, 0.27, 0.24, 0.23);       // body, chest, head
    add(cone, null, 0.68, 0.60, 0, 0.12, 0.22, 0.11, -PI / 2);                                                                                           // snout
    for (const s of [-1, 1]) { const e = add(cone, null, 0.44, 0.86, s * 0.085, 0.12, 0.28, 0.07); e.rotation.x = s * 0.30; }                           // ears
    const legs = []; for (const [x, f] of [[0.27, 1], [-0.27, -1]]) for (const s of [-1, 1]) { const p = piv(x, 0.40, s * 0.075); add(cone, p, 0, -0.20, 0, 0.12, 0.40, 0.12, PI); legs.push([p, f]); }
    const tail = piv(-0.26, 0.47, 0); add(sph, tail, -0.30, 0.03, 0, 0.62, 0.24, 0.24); add(sph, tail, -0.56, 0.04, 0, 0.22, 0.15, 0.15);       // a big brush, and its pale tip
    const _x = V3(), _y = V3(), _z = V3(), _m = new THREE.Matrix4();
    return { group: g, mat,
      // put it at p (world), nose along dir, len metres long
      place(p, dir, len, stretch, op, t) {
        g.visible = op > 0.01 && len > 0.001; if (!g.visible) return; mat.uniforms.uOp.value = op;
        _x.copy(dir).normalize(); _z.crossVectors(_x, _y.set(0, 1, 0)).normalize(); _y.crossVectors(_z, _x).normalize(); g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); g.position.copy(p); g.scale.setScalar(len);
        for (const [pv, f] of legs) pv.rotation.z = f * (1.2 * stretch) + 0.10 * Math.sin(t * 9 + f); tail.rotation.z = -0.75 + 0.85 * stretch + 0.16 * Math.sin(t * 7);      // forelegs reach ahead and hind legs trail in the leap; sitting, the brush stands up tail.rotation.y = 0.25 * Math.sin(t * 5);
      } };
  })();

  (function foxSpells2() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), eD = (s) => [s * 0.7, -1, -0.2], K6 = (f, o) => Object.assign({ t: (f - 1) / 6 }, o), tt = (f) => (f - 1) / 6;
    const BELL = [-0.138, 1.381, 0.089], SHH = [0.075, 1.319, 0.171], COVER = [-0.056, 1.491, 0.155];                  // fingertip on her bell, fingertip on her lips, palm over her right eye (bench/contacts.js)
    const idleL = arm('L', [0.20, 0.99, 0.19], [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0]), idleR = arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]);
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), _e = V3(), UPV = V3(0, 1, 0); let spinWas = 0;
    // where her target really is: her left, undoing whatever turn the move itself has given her
    const tdir = (out) => out.set(1, 0, 0).applyQuaternion(root.getWorldQuaternion(_qa)).applyAxisAngle(UPV, -spinWas);
    const flame = (p, n, size, up) => { for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) emit(p.x + rs() * size, p.y + rs() * size, p.z + rs() * size, rs() * 0.08, (up || 0.25) * (0.5 + Math.random()), rs() * 0.08, 0.25 + Math.random() * 0.3, size * (0.5 + Math.random() * 0.6), Math.random() < 0.35 ? COL.foxPale : COL.fox, -0.2, 0.9); };

    // Blue Mischief. She flicks her bell; the spark it gives jumps to her fingertip; she turns her hand over and it grows into a little fox of
    // foxfire sitting on her palm; she turns, winds up and throws, and it leaps at her target, full-size by the time it lands.
    (function () {
      const keys = [], palm = (h) => arm('R', h, eD(-1), FP.open, 1.35, [-0.25, 0]), T_REL = tt(16), FLY = 0.42, T_HIT = T_REL + FLY, dur = 22 / 6;
      keys.push(K6(3.0, Object.assign({ hd: [0, 0.05, -0.08], sp: [0, 0, 0] }, arm('R', [BELL[0] - 0.028, BELL[1], BELL[2] + 0.004], [-1, -0.3, 0.3], FP.point, 0.6, [0.6, 0.4]), idleL)));
      keys.push(K6(3.6, { hR: BELL })); keys.push(K6(4.2, { hR: [BELL[0] - 0.03, BELL[1] + 0.004, BELL[2] + 0.005] }));                                         // ding
      keys.push(K6(5.6, Object.assign({ hd: [-0.14, -0.02, 0.10], mouth: 2 }, arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, 0]), idleL)));             // the spark on her fingertip
      keys.push(K6(6.8, Object.assign({ hd: [-0.14, -0.02, 0.10] }, arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, 0.2]))));
      keys.push(K6(8.6, Object.assign({ hd: [-0.10, 0.12, 0.08], sp: [0, 0.03, 0] }, palm([-0.20, 1.14, 0.27]), idleL)));                                            // her hand turns over: a little fox on her palm
      keys.push(K6(10.4, Object.assign({ hd: [-0.08, 0.10, -0.10] }, palm([-0.19, 1.17, 0.27]))));
      keys.push(K6(11.6, Object.assign({ hd: [0.10, 0.02, 0.06], sp: [0, 0, 0] }, palm([-0.20, 1.15, 0.27]), stand())));
      keys.push(K6(14.2, Object.assign({ hd: [0.15, 0, 0], sp: [-0.32, 0.06, 0], hip: [-0.02, -0.07, -0.04], ftL: [0.04, 0, 0.16, 0.2, 0], knL: [0.2, 0, 1], ftR: 'rest', knR: [-0.3, 0, 1] },      // she turns to her target and winds up
        arm('R', [-0.38, 1.00, -0.10], [-0.6, -0.2, -1], FP.cup, 1.2, [-0.3, 0]), arm('L', [0.22, 1.16, 0.26], eD(1), FP.soft, 0.6, [0, 0]))));
      keys.push(K6(15.0, { sp: [-0.34, 0.06, 0] }));
      keys.push(K6(16.0, Object.assign({ hd: [0, 0.02, 0], sp: [0.22, 0.14, 0], hip: [0.02, -0.10, 0.10], ftL: [0.05, 0, 0.26, 0.2, 0], knL: [0.25, 0, 1], ftR: [-0.02, 0.03, -0.08, -0.3, 0.3], knR: [-0.3, 0, 1], mouth: 1 },   // and throws
        arm('R', [-0.06, 1.27, 0.44], [-1, -0.5, -0.3], FP.open, 0.5, [-0.3, 0]), arm('L', [0.30, 1.02, -0.02], [0.5, -0.4, -1], FP.soft, 0.4, [0, 0]))));
      keys.push(K6(17.6, Object.assign({ sp: [0.24, 0.15, 0], mouth: 2 }, arm('R', [-0.02, 1.20, 0.45], [-1, -0.5, -0.3], FP.open, 0.5, [0.2, 0]))));
      keys.push(K6(20.0, Object.assign({ hd: [0.05, 0, 0.10], sp: [0, 0, 0], mouth: 2 }, stand(), arm('R', [-0.22, 1.05, 0.20], eD(-1), FP.soft, 0.6, [0, 0]), idleL)));
      const spin = [[0, 0], [tt(11.4), 0], [tt(14.0), 1.25], [tt(18.2), 1.25], [tt(20.6), 0], [dur, 0]];
      let p0 = V3(), p1 = V3(), flew = false;
      defAction('blue_mischief', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [tt(3.6) / dur, T_REL / dur], impact: 0.8,
        start() { flew = false; },
        fx(a, t, dt) {
          const T = a.t, td = tdir(_e); spinWas = spinNow;
          if (cue(a, 'ding', tt(3.6))) { const p = anchor('tipR', _a); burst(p, 10, 0.5, 0.35, 0.02, COL.foxPale, 0.2, 1.2, 0.2); }
          if (T > tt(3.6) && T < tt(8.2)) { const p = anchor('tipR', _a), k = sm(tt(3.6), tt(5.6), T); flame(p, 2.2 * k * dt * 60 / 2, 0.012, 0.12); light(p, 0.5 * k, 0x66c8ff); }       // the spark on her fingertip
          if (T >= tt(7.6) && T < T_REL) {                                                                                                                                           // the little fox on her palm
            const p = anchor('handR', _a), grow = sm(tt(7.6), tt(9.6), T), len = 0.17 * (grow + 0.18 * Math.sin(Math.min(1, grow) * PI) ), wind = sm(tt(11.6), tt(14.2), T);
            p.y += 0.012 * FOX_K; _b.copy(td).applyAxisAngle(UPV, 0.5 * Math.sin(T * 2.4) * (1 - wind)); FOXFIRE.place(p, _b, len * FOX_K, 0.1 * wind, 0.95, t);
            flame(_c.copy(p).addScaledVector(UPV, 0.09 * grow), 1.6 * grow * dt * 60 / 2, 0.03, 0.18); light(p, 0.8 * grow, 0x66c8ff);
          }
          if (cue(a, 'throw', T_REL)) { anchor('handR', p0); p1.copy(anchor('chest', _a)).addScaledVector(td, 2.6 * tgtK); p1.y = p0.y - 0.25 * FOX_K; fxHitP.copy(p1); flew = true; burst(p0, 16, 1.0, 0.4, 0.03, COL.fox, 0.2, 1.2, 0.3); }
          if (flew && T >= T_REL && T < T_HIT + 0.12) {                                                                                                                             // the leap: it grows as it goes
            const u = cl((T - T_REL) / FLY, 0, 1), e = u * u * (3 - 2 * u), h = 0.55 * FOX_K, len = lerp(0.17, 0.95, e) * FOX_K;
            _a.lerpVectors(p0, p1, u); _a.y += h * 4 * u * (1 - u) - 0.42 * len * 0.5; _b.subVectors(p1, p0).normalize(); _b.y += (1 - 2 * u) * 0.9; _b.normalize();
            FOXFIRE.place(_a, _b, len, Math.sin(PI * Math.min(1, u * 1.1)), 1 - sm(0.98, 1.12, (T - T_REL) / FLY), t);
            _c.copy(_a).addScaledVector(UPV, 0.4 * len); flame(_c, 7 * dt * 60 / 2, 0.10 * len + 0.02, 0.2); light(_c, 1.3, 0x66c8ff);
          }
          if (cue(a, 'hit', T_HIT)) { burst(p1, 90, 2.6, 0.7, 0.05, COL.fox, 0.6, 1.3, 0.5); burst(p1, 40, 1.4, 0.9, 0.04, COL.foxPale, 0.3, 1.1, 0.8); shock(p1, 0.08, 0.7, 0.4, COL.foxPale); }
          const fl = win(T, T_HIT - 0.02, T_HIT + 0.35, 0.05); if (fl > 0.01) light(p1, 1.8 * fl, 0x8fd8ff);
        } });
      function stand() { return { hip: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' }; }
    })();

    // Borrowed Face. She covers one eye; a ghost double of her steps out of her left side, toward whoever is watching her, and makes them a
    // deep mocking bow; behind it she leans away with a finger to her lips. The double is what they will look at now.
    (function () {
      const keys = [], dur = 22 / 6, T_OUT = tt(6.0), T_IN = tt(10), T_FADE = tt(19.5), gp = clonePose(REST), held = clonePose(REST), CUR = ACTS.bow;      // the double's bow is the Jester's bow she keeps: in H8 it is a deep, sweeping, mocking one
      const cover = arm('R', COVER, eD(-1), FP.soft, 0.9, [0.3, 0.2]);
      keys.push(K6(3.8, Object.assign({ hd: [0.08, 0.02, -0.10], sp: [0, 0, 0.02], mouth: 2 }, cover, idleL)));                                  // one eye covered
      keys.push(K6(6.4, Object.assign({ hd: [0.08, 0.02, -0.11], sp: [0, 0, 0.02] }, cover, idleL)));
      keys.push(K6(8.2, Object.assign({ hd: [-0.10, 0, -0.06], sp: [0.06, 0.03, 0.04], hip: [-0.03, -0.02, 0] }, arm('R', [-0.24, 1.16, 0.20], eD(-1), FP.soft, 0.6, [0, 0]), idleL)));   // she lets it go, and looks at what she has made
      keys.push(K6(10.6, Object.assign({ hd: [0.04, -0.02, 0.08], sp: [0, 0.10, 0], hip: [-0.05, -0.05, -0.02], eyes: 0.5 }, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR)));   // behind it: shh
      keys.push(K6(17.6, Object.assign({ hd: [0.04, -0.02, 0.08], sp: [0, 0.10, 0], hip: [-0.05, -0.05, -0.02], eyes: 0.5 }, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR)));
      keys.push(K6(20.2, Object.assign({ hd: [0, 0, 0.08], sp: [0, 0, 0], hip: [0, 0, 0], eyes: 0, mouth: 2 }, idleL, idleR)));
      defAction('borrowed_face', dur, keys, { outro: 0.3, stand: true, hits: [T_IN / dur], cues: [T_OUT / dur], impact: 0.3,
        start() { GHOST.hide(); }, end() { GHOST.hide(); },
        fx(a, t, dt) {
          const T = a.t;
          if (T > tt(2.4) && T < T_OUT + 0.3) { const p = anchor('head', _a), k = win(T, tt(2.4), T_OUT + 0.3, 0.25); flame(_b.set(p.x + rs() * 0.16, p.y - 0.35 * FOX_K * Math.random(), p.z + rs() * 0.12), 3.5 * k * dt * 60 / 2, 0.02, 0.3); light(p, 0.7 * k, 0x66c8ff); }
          if (T >= T_OUT && T < T_FADE + 0.5) {
            // the double starts as she is, covering her eye, and by the time it stands clear of her it is into its bow
            const u = sm(T_OUT, T_IN, T), w = sm(T_OUT + 0.1, T_IN - 0.1, T), op = sm(T_OUT, T_OUT + 0.35, T) * (1 - sm(T_FADE, T_FADE + 0.5, T));
            if (u < 0.02) for (const k of CHANS) { const x = cur[k]; if (typeof x === 'number') held[k] = x; else for (let i = 0; i < x.length; i++) held[k][i] = x[i]; }
            evalPose(CUR.tracks, cl((T - T_IN + 0.45) * 1.25, 0, CUR.dur - 0.45), gp); blendPose(GHOST.P, held, gp, w); GHOST.P.eyes = 0; GHOST.P.mouth = 2;
            GHOST.show(op, 0.82 * u, 0.02 * Math.sin(u * PI), 0.10 * u, 0.95 * u);
            if (op > 0.05 && Math.random() < 20 * dt) { _a.set(0.82 * u + rs() * 0.25, (0.3 + Math.random() * 1.3), 0.10 * u + rs() * 0.2); root.localToWorld(_a); emit(_a.x, _a.y, _a.z, rs() * 0.04, 0.08 + Math.random() * 0.1, rs() * 0.04, 0.5 + Math.random() * 0.4, 0.028, COL.foxPale, -0.05, 0.6); }
          } else GHOST.hide();
          if (cue(a, 'out', T_OUT)) { const p = anchor('chest', _a); burst(p, 30, 0.9, 0.6, 0.03, COL.fox, 0.1, 1.2, 0.4); }
          if (T < T_IN) { fxHitP.set(0.82, 1.05, 0.10); root.localToWorld(fxHitP); }
          if (cue(a, 'in', T_IN)) { _a.set(0.82, 0.02, 0.10); root.localToWorld(_a); shock(_a, 0.15, 0.7, 0.5, COL.fox, true); }
        } });
    })();
  })();
