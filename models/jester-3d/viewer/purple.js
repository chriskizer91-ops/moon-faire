// purple.js: the purple glow of her first animation (October 2026, "A Fool's Mercy in 3D"), laid over the 3D model's moves.
// In the October film her painted frames bloom magenta and violet while she casts: the light gathers in her hands, her whole
// body takes it on, her heart burns white, and violet light pools on the ground round her. This puts the same light on the
// 3D model. It is an add-on for the night square page (viewer/app.js): it wraps J.animate, so neither the model nor app.js
// changes, and the other pages build exactly as before. Built by build_purple.sh.
(function () {
  'use strict';
  const P = window.JESTER; if (!P || !P.J || !window.THREE) return;
  const { J, stage } = P;
  const QS = new URLSearchParams(location.search);

  // ---- the look, as data ----
  const LOOK = {
    violet: [190, 110, 255],      // her spell light in the October film (scenes/lib/fx.js VIOLET)
    magenta: [235, 110, 215],     // (scenes/lib/fx.js MAGENTA)
    lit: [205, 95, 255],          // the light falling on her: the bloom colour of her October frames (scenes/lib/jester.js)
    core: [255, 214, 255],        // the white-hot heart of the glow at her chest
    idle: 0.2,                    // how much she glows standing (the October frames are never quite without it)
    move: 0.3,                    // during a dance, a wave and the other body moves
    cast: 0.62,                   // as a spell gathers
    peak: 1.0,                    // when the blow lands
    flash: 0.9,                   // the extra flare on each blow
  };
  // moves that count as casting: every move with a blow in it (her ten spells, the lore's moves, her hit reactions), except the jump
  const NOT_CAST = { jump: 1 };
  const isCast = (a) => !NOT_CAST[a] && J.ACTIONS[a] && J.ACTIONS[a].hits.length > 0;
  const WORDS = {
    chip: 'Purple glow',
    strength: 'Strength', soft: 'soft', strong: 'strong',
    note: 'The purple glow from her first animation, laid over her 3D moves',
  };

  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lin = (rgb, k) => new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).convertSRGBToLinear().multiplyScalar(k || 1);
  const V3 = () => new THREE.Vector3();

  // ---- 1. her own materials take the light: violet falling on her cloth, a glow round her edges, her hands and her heart ----
  const U = {
    uPurp: { value: 0 }, uPurpCol: { value: lin(LOOK.violet, 1.7) }, uPurpLit: { value: lin(LOOK.lit) }, uPurpCore: { value: lin(LOOK.core, 1.1) },
    uPurpHR: { value: V3() }, uPurpHL: { value: V3() }, uPurpKR: { value: 0 }, uPurpKL: { value: 0 }, uPurpC: { value: V3() }, uPurpCK: { value: 0 },
  };
  const VDECL = '\nvarying vec3 vPurpW;';
  const VCODE = '\n#ifdef USE_INSTANCING\n vPurpW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\n vPurpW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif';
  const FDECL = '\nvarying vec3 vPurpW; uniform float uPurp; uniform vec3 uPurpCol; uniform vec3 uPurpLit; uniform vec3 uPurpCore; uniform vec3 uPurpHR; uniform vec3 uPurpHL; uniform float uPurpKR; uniform float uPurpKL; uniform vec3 uPurpC; uniform float uPurpCK;';
  const FCODE = [
    'if (uPurp > 0.0005) {',
    ' float pNV = saturate(abs(dot(normalize(vViewPosition), normal)));',
    ' float pRim = pow(1.0 - pNV, 2.4);',
    ' vec3 pR = vPurpW - uPurpHR, pL = vPurpW - uPurpHL, pC = vPurpW - uPurpC;',
    ' float pNear = uPurpKR * exp(-dot(pR, pR) * 34.0) + uPurpKL * exp(-dot(pL, pL) * 34.0);',      // the hand itself, about 17 cm round
    ' float pWide = uPurpKR * exp(-dot(pR, pR) * 5.0) + uPurpKL * exp(-dot(pL, pL) * 5.0);',        // the light it throws on her, about half a metre
    ' float pCore = uPurpCK * exp(-dot(pC, pC) * 160.0);',                                         // her heart
    ' vec3 pAdd = uPurpLit * diffuseColor.rgb * (uPurp * 0.6 + pWide * 0.9)',
    '   + uPurpCol * (uPurp * (0.03 + 0.95 * pRim) + pNear * (0.25 + 0.7 * pRim))',
    '   + uPurpCore * pCore * (0.4 + 0.6 * pRim);',
    ' float pM = max(pAdd.r, max(pAdd.g, pAdd.b));',
    ' gl_FragColor.rgb += pAdd / (1.0 + 0.45 * pM);',                                              // strong light stays violet instead of burning white
    '}\n#include <tonemapping_fragment>',
  ].join('\n');
  let patched = 0;
  function patch(mat) {
    if (!mat || !mat.isMeshStandardMaterial || mat.userData.purple) return;
    mat.userData.purple = true; patched++;
    const before = mat.onBeforeCompile, key0 = mat.customProgramCacheKey();
    mat.onBeforeCompile = function (sh, r) {
      before.call(this, sh, r);
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>' + VDECL).replace('#include <project_vertex>', '#include <project_vertex>' + VCODE);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>' + FDECL).replace('#include <tonemapping_fragment>', FCODE);
    };
    mat.customProgramCacheKey = () => key0 + '|purple1';      // each material keeps its own program: the face's patch is not the skin's
    mat.needsUpdate = true;
  }
  J.root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(patch); });

  // ---- 2. light that is not on her: the glow in her hands, a haze behind her, her heart, the pool on the ground, sparks ----
  function radial(stops) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [at, a] of stops) gr.addColorStop(at, 'rgba(255,255,255,' + a + ')');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
  }
  const soft = radial([[0, 1], [0.25, 0.55], [0.6, 0.14], [1, 0]]), haze = radial([[0, 0.7], [0.45, 0.28], [1, 0]]), pool = radial([[0, 0.6], [0.3, 0.42], [0.7, 0.12], [1, 0]]);
  const add = (map, col) => new THREE.SpriteMaterial({ map, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
  const sprite = (mat, order) => { const s = new THREE.Sprite(mat); s.renderOrder = order; s.visible = false; s.frustumCulled = false; group.add(s); return s; };
  const group = new THREE.Group(); group.name = 'purple'; stage.scene.add(group);
  const C = { violet: lin(LOOK.violet), magenta: lin(LOOK.magenta), core: lin(LOOK.core) };
  const handGlow = [sprite(add(soft, C.violet.clone()), 30), sprite(add(soft, C.violet.clone()), 30)];
  const handCore = [sprite(add(soft, C.core.clone()), 31), sprite(add(soft, C.core.clone()), 31)];
  const aura = sprite(add(haze, C.magenta.clone()), 1);
  const heart = sprite(add(soft, C.core.clone()), 31);
  const poolMat = new THREE.MeshBasicMaterial({ map: pool, color: C.violet.clone(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 48), poolMat); ground.rotation.x = -Math.PI / 2; ground.renderOrder = 2; ground.visible = false; group.add(ground);
  // her light reaches what is round her: one violet lamp with her (it lights her body and cloth) and one in the square (the flagstones)
  const lampHer = new THREE.PointLight(0xbe6eff, 0, 3.0, 2); group.add(lampHer);
  const lampWorld = new THREE.PointLight(0xbe6eff, 0, 6.0, 2); if (stage.world) stage.world.add(lampWorld);
  // sparks: small motes of violet, magenta and white that leave her hands and drift up off her as she casts
  const NS = 220, sPos = new Float32Array(NS * 3), sCol = new Float32Array(NS * 4), sSize = new Float32Array(NS), sV = new Float32Array(NS * 3), sLife = new Float32Array(NS), sMax = new Float32Array(NS), sTint = new Float32Array(NS * 3);
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3)); sGeo.setAttribute('aCol', new THREE.BufferAttribute(sCol, 4)); sGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  const sMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 400 } },
    vertexShader: 'attribute vec4 aCol; attribute float aSize; uniform float uScale; varying vec4 vCol; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vCol = aCol; gl_PointSize = max(1.0, aSize * uScale / max(0.05, -mv.z)); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec4 vCol; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d) * 4.0; float a = exp(-r * 3.2) * (1.0 - r) * vCol.a; if (a < 0.003) discard; gl_FragColor = vec4(vCol.rgb * a, a); }' });
  const sparks = new THREE.Points(sGeo, sMat); sparks.frustumCulled = false; sparks.renderOrder = 32; group.add(sparks);
  let sNext = 0, sAcc = 0; const R = Math.random;
  const TINTS = [lin(LOOK.violet, 2.4), lin(LOOK.magenta, 2.2), lin(LOOK.core, 2.0)];
  function spark(p, spread, vUp, size, life) {
    const i = sNext; sNext = (sNext + 1) % NS;
    sPos[i * 3] = p.x + (R() - 0.5) * spread; sPos[i * 3 + 1] = p.y + (R() - 0.5) * spread; sPos[i * 3 + 2] = p.z + (R() - 0.5) * spread;
    const a = R() * 6.283, out = 0.05 + R() * 0.18; sV[i * 3] = Math.cos(a) * out; sV[i * 3 + 1] = vUp * (0.5 + R()); sV[i * 3 + 2] = Math.sin(a) * out;
    sLife[i] = sMax[i] = life * (0.6 + R() * 0.8); sSize[i] = size * (0.6 + R() * 0.8);
    const tc = TINTS[R() < 0.5 ? 0 : R() < 0.7 ? 1 : 2]; sTint[i * 3] = tc.r; sTint[i * 3 + 1] = tc.g; sTint[i * 3 + 2] = tc.b;
  }
  function stepSparks(dt) {
    const f = Math.exp(-dt * 1.2);
    for (let i = 0; i < NS; i++) {
      if (sLife[i] <= 0) { sCol[i * 4 + 3] = 0; continue; }
      sLife[i] -= dt; sV[i * 3] *= f; sV[i * 3 + 2] *= f; sV[i * 3 + 1] += dt * 0.05;
      sPos[i * 3] += sV[i * 3] * dt; sPos[i * 3 + 1] += sV[i * 3 + 1] * dt; sPos[i * 3 + 2] += sV[i * 3 + 2] * dt;
      const k = sLife[i] / sMax[i], a = Math.min(1, k * 2.5) * Math.min(1, (1 - k) * 10) * (0.7 + 0.3 * Math.sin(sLife[i] * 23 + i));
      sCol[i * 4] = sTint[i * 3]; sCol[i * 4 + 1] = sTint[i * 3 + 1]; sCol[i * 4 + 2] = sTint[i * 3 + 2]; sCol[i * 4 + 3] = Math.max(0, a);
    }
    sGeo.attributes.position.needsUpdate = true; sGeo.attributes.aCol.needsUpdate = true; sGeo.attributes.aSize.needsUpdate = true;
  }

  // ---- 3. how strongly she glows: a little standing, more in a move, gathering through a spell to the blow, a flare on each blow ----
  let on = QS.get('purple') !== '0', strength = 1, level = 0, flash = 0, hitSeen = J.state.hitN || 0;
  function want() {
    const a = J.action; if (!a) return LOOK.idle;
    if (!isCast(a)) return LOOK.move;
    const A = J.ACTIONS[a], d = A.dur, t = Math.max(0, J.time), hs = A.hits.map((h) => h * d);
    const first = hs[0], last = hs[hs.length - 1];
    let k = LOOK.move + (LOOK.cast - LOOK.move) * sm(0, Math.max(0.25, first * 0.6), t) + (LOOK.peak - LOOK.cast) * sm(first * 0.45, first, t);
    k *= 1 - 0.55 * sm(last + 0.35, d, t);
    return k;
  }
  const _sz = new THREE.Vector2(), hR = V3(), hL = V3(), tR = V3(), tL = V3(), chest = V3(), pend = V3(), feet = V3(), tmp = V3(), cam = V3();
  function step(dt) {
    const hn = J.state.hitN || 0; if (hn !== hitSeen) { hitSeen = hn; if (isCast(J.state.hitName)) flash = Math.min(1.4, flash + (J.state.hitK || 0.6) + 0.35); }
    const w = want(); level += (w - level) * Math.min(1, dt * (w > level ? 5 : 2.2)); flash *= Math.exp(-dt * 4.5);
    const L = on ? (level + LOOK.flash * flash) * strength : 0;
    group.visible = L > 0.002; lampWorld.visible = group.visible;
    U.uPurp.value = L;
    if (!group.visible) { U.uPurpKR.value = U.uPurpKL.value = U.uPurpCK.value = 0; lampHer.intensity = lampWorld.intensity = 0; return; }
    J.anchor('handR', hR); J.anchor('handL', hL); J.anchor('tipR', tR); J.anchor('tipL', tL); J.anchor('chest', chest); J.anchor('pendant', pend); J.anchor('feet', feet);
    // the hand that is out casts: each hand glows by how far it reaches from her chest
    const reach = (h) => Math.max(0, Math.min(1, (h.distanceTo(chest) - 0.2) / 0.32));
    let kR = reach(hR), kL = reach(hL); const top = Math.max(kR, kL, 0.001); kR = 0.25 + 0.75 * kR / top; kL = 0.25 + 0.75 * kL / top;
    const gather = Math.max(0, L - LOOK.idle * strength);      // the hands only light once she is doing something
    U.uPurpHR.value.copy(hR).lerp(tR, 0.5); U.uPurpHL.value.copy(hL).lerp(tL, 0.5); U.uPurpKR.value = gather * kR * 1.25; U.uPurpKL.value = gather * kL * 1.25;
    U.uPurpC.value.copy(pend); U.uPurpCK.value = Math.max(0, L - 0.5) * 0.8;
    // the hands
    for (let i = 0; i < 2; i++) {
      const at = i ? U.uPurpHL.value : U.uPurpHR.value, k = (i ? kL : kR) * gather;
      handGlow[i].position.copy(at); handGlow[i].scale.setScalar(0.07 + 0.22 * k); handGlow[i].material.opacity = Math.min(1, 1.3 * k); handGlow[i].material.color.copy(C.violet).multiplyScalar(1.2 + 1.1 * k); handGlow[i].visible = k > 0.01;
      handCore[i].position.copy(at); handCore[i].scale.setScalar(0.03 + 0.06 * k); handCore[i].material.opacity = Math.min(1, 1.1 * k); handCore[i].material.color.copy(C.core).multiplyScalar(1.1 + 0.9 * k); handCore[i].visible = k > 0.08;
    }
    // the haze behind her: pushed away from the camera so her body hides its middle and it shows round her outline
    stage.camera.getWorldPosition(cam); tmp.copy(chest).sub(cam).setY(0).normalize();
    aura.position.copy(chest).addScaledVector(tmp, 0.35); aura.position.y = feet.y + 0.95; aura.scale.set(1.5 + 0.7 * L, 2.3 + 0.6 * L, 1);
    aura.material.opacity = Math.min(1, 0.38 * L); aura.material.color.copy(C.magenta).multiplyScalar(0.8 + 0.5 * L); aura.visible = true;
    // her heart
    const hk = Math.max(0, L - 0.5); heart.position.copy(pend).addScaledVector(tmp, -0.03); heart.scale.setScalar(0.04 + 0.11 * hk); heart.material.opacity = Math.min(1, 0.9 * hk); heart.material.color.copy(C.core).multiplyScalar(1.0 + 0.8 * hk); heart.visible = hk > 0.01;
    // the pool on the ground
    ground.position.set(feet.x, feet.y + 0.008, feet.z); ground.scale.setScalar(0.75 + 0.85 * L); poolMat.opacity = Math.min(1, 0.42 * L); poolMat.color.copy(C.violet).multiplyScalar(0.6 + 0.45 * L); ground.visible = true;
    // the lamps: at the casting hand (or her chest when both are in), lighting her and the flagstones round her
    tmp.copy(chest).lerp(kR >= kL ? U.uPurpHR.value : U.uPurpHL.value, 0.7);
    lampHer.position.copy(tmp).addScaledVector(cam.clone().sub(tmp).setY(0).normalize(), 0.18); lampHer.intensity = 1.1 * L;
    lampWorld.position.set(tmp.x, Math.max(0.6, tmp.y), tmp.z); lampWorld.intensity = 3.2 * L;
    // the sparks: from her hands while she casts, and a few off her body, more on each blow
    sAcc += dt * (70 * gather * gather + 5 * L + 140 * flash * flash);
    while (sAcc >= 1) { sAcc -= 1; const r = R(); if (r < 0.62 && gather > 0.05) spark(R() < kR / (kR + kL) ? U.uPurpHR.value : U.uPurpHL.value, 0.09, 0.22, 0.016, 1.2); else { tmp.copy(feet); tmp.y += 0.35 + R() * 1.1; spark(tmp, 0.55, 0.3, 0.012, 1.6); } }
    sMat.uniforms.uScale.value = stage.renderer.getDrawingBufferSize(_sz).y / (2 * Math.tan(stage.camera.fov * Math.PI / 360));      // a spark's size in metres, as pixels
  }

  // ---- 4. run with the model: after she is posed each frame, before the picture is drawn ----
  const animate0 = J.animate;
  J.animate = function (phase, wb, t, dt, rb) { animate0.call(J, phase, wb, t, dt, rb); const d = dt > 0 ? Math.min(dt, 0.05) : 0; step(d); stepSparks(d); };

  // ---- 5. the switch and the strength slider, under the Switches row ----
  const row = document.getElementById('toggles');
  if (row) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = WORDS.chip; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    row.prepend(b);
    const box = document.createElement('div'); box.style.cssText = 'margin-top:8px; font-size:13px; opacity:.9';
    box.innerHTML = '<label style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">' + WORDS.strength + ': ' + WORDS.soft + ' <input type="range" id="purpleK" min="0" max="200" step="5" value="100" style="width:150px; accent-color:#be6eff" aria-label="Purple glow strength"> ' + WORDS.strong + ' <output id="purpleOut">100%</output></label>';
    row.parentNode.appendChild(box);
    const k = document.getElementById('purpleK'), out = document.getElementById('purpleOut');
    const set = () => { strength = +k.value / 100; out.textContent = k.value + '%'; box.style.display = on ? 'block' : 'none'; };
    k.addEventListener('input', set);
    b.addEventListener('click', () => { on = !on; b.setAttribute('aria-pressed', on ? 'true' : 'false'); set(); });
    if (QS.get('purpleK')) k.value = String(Math.max(0, Math.min(200, +QS.get('purpleK') || 100)));
    set();
  }
  // for checks: P.purple.state() says how many of her materials took the glow and how strong it is now
  P.purple = { LOOK, U, get level() { return level; }, get flash() { return flash; }, set on(v) { on = !!v; }, get on() { return on; }, set strength(v) { strength = +v; }, state: () => ({ patched, level: +level.toFixed(3), flash: +flash.toFixed(3), on, strength }) };
})();
