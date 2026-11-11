// Spell effects for the Jester. Everything is a pure function of the clip's time, so a
// spell can be paused or scrubbed and always looks the same at the same moment.
// Pictures come from reference set F (drawn on black, so they are added to the scene as light).
import * as THREE from 'three';

const CHAIN_ASPECT = 184 / 1024;

export function makeFx(scene, base = 'fx/') {
  const L = new THREE.TextureLoader();
  const load = n => { const t = L.load(base + n + '.png'); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
  const T = { sigil: load('sigil'), ring: load('ring'), glows: load('glows'), sparks: load('sparks'), chain: load('chain') };
  const cell = (tex, cols, rows, i) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(1 / cols, 1 / rows); t.offset.set((i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows); return t; };
  const glowTex = [0, 1, 2, 3].map(i => cell(T.glows, 2, 2, i));
  const sparkTex = [...Array(12).keys()].map(i => cell(T.sparks, 4, 3, i));
  const group = new THREE.Group(); group.renderOrder = 30; scene.add(group);
  const pool = new Map();
  const plane = new THREE.PlaneGeometry(1, 1);
  // light is added to the picture's colour but never to its solidity, so the pixel finish can still tell her from her spells
  const mat = (map, color = 0xffffff) => new THREE.MeshBasicMaterial({ map, color, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor });
  let cam = null;
  const tmpQ = new THREE.Quaternion(), flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), spinQ = new THREE.Quaternion(), zAxis = new THREE.Vector3(0, 0, 1);

  function get(id, make) {
    let o = pool.get(id);
    if (!o) { o = make(); o.renderOrder = 30; group.add(o); pool.set(id, o); }
    o.visible = true; return o;
  }
  const quad = (id, map, color) => get(id, () => new THREE.Mesh(plane, mat(map, color)));

  const F = {
    begin(camera) { cam = camera; for (const o of pool.values()) o.visible = false; },
    // a flat picture in the world: tilt 0 faces the way she faces, 1 lies flat like a floor
    disc(id, map, pos, rootQ, size, spin, alpha, tilt = 0, color) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = quad(id, map, color);
      tmpQ.copy(rootQ).slerp(tmpQ.clone().copy(rootQ).multiply(flat), tilt);
      m.quaternion.copy(tmpQ).multiply(spinQ.setFromAxisAngle(zAxis, spin));
      m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    sigil(id, pos, rootQ, size, spin, alpha, tilt, color) { F.disc(id, T.sigil, pos, rootQ, size, spin, alpha, tilt, color); },
    ring(id, pos, rootQ, size, spin, alpha, tilt = 1, color) { F.disc(id, T.ring, pos, rootQ, size, spin, alpha, tilt, color); },
    // a glow that always faces the camera. kind: 0 orb, 1 flame, 2 curl, 3 burst
    glow(id, kind, pos, size, alpha, color) {
      if (alpha <= 0.003) return;
      const m = quad(id, glowTex[kind], color);
      m.quaternion.copy(cam.quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    // n sparkles born over 'emit' seconds from origin, each living 'life' seconds. age is seconds since the first was born.
    sparks(id, origin, n, age, o = {}) {
      const { emit = 0.3, life = 0.9, spread = 0.6, rise = 0.2, size = 0.09, seed = 1, color, inward = false, flatten = 1 } = o;
      for (let i = 0; i < n; i++) {
        const r = k => { const x = Math.sin((i + 1) * 127.1 * (k + 1) + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
        const la = age - r(0) * emit;
        if (la <= 0 || la >= life) continue;
        const u = la / life, th = r(1) * Math.PI * 2, ph = Math.acos(2 * r(2) - 1);
        const k = inward ? (1 - u) * (1 - u) : 1 - (1 - u) * (1 - u);
        const d = spread * (0.35 + 0.65 * r(3)) * k;
        const m = quad(id + ':' + i, sparkTex[i % 12], color);
        m.quaternion.copy(cam.quaternion);
        m.position.set(origin.x + d * Math.sin(ph) * Math.cos(th), origin.y + d * Math.cos(ph) * flatten + rise * la, origin.z + d * Math.sin(ph) * Math.sin(th));
        const s = size * (0.5 + r(4)) * (0.6 + 0.4 * Math.sin(u * Math.PI));
        m.scale.set(s, s, 1); m.material.opacity = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(la * 23 + i));
      }
    },
    // the bell chain, stretched from one point to another and turned to face the camera
    chain(id, from, to, alpha) {
      const dir = to.clone().sub(from), len = dir.length();
      if (alpha <= 0.003 || len < 0.02) return;
      const m = quad(id, T.chain);
      const x = dir.clone().normalize(), view = cam.position.clone().sub(from).normalize();
      const y = view.clone().cross(x).normalize(), z = x.clone().cross(y);
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
      m.position.copy(from).addScaledVector(dir, 0.5);
      m.scale.set(len, Math.max(0.18, len * CHAIN_ASPECT), 1); m.material.opacity = Math.min(1, alpha);
    },
  };

  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ramp = (t, a, b) => cl((t - a) / (b - a));
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const win = (t, a, b, c, d) => Math.min(ramp(t, a, b), 1 - ramp(t, c, d));       // fade in a..b, out c..d
  const GOLD = 0xffc060, DUSK = 0x9a78ff;

  // Each spell: (t, c) where c gives hands (world points), root (object she stands on), and helpers.
  const SPELLS = {
    CurtainCall(t, c) {
      const L = c.hand('Left'), R = c.hand('Right'), q = c.q, mid = L.clone().add(R).multiplyScalar(0.5);
      const g = win(t, 0, 0.8, 1.6, 2.0) + win(t, 6.4, 6.9, 7.5, 8.0);
      F.glow('gl', 0, L, 0.22, g); F.glow('gr', 0, R, 0.22, g);
      // the circle forms between her hands, is carried up on her right hand, then opens wide over her head
      const up = ease(ramp(t, 1.9, 3.3)), over = ease(ramp(t, 3.3, 4.8));
      const p = mid.clone().add(c.dir(0, 0, 0.06)).lerp(R.clone().add(c.dir(0, 0.10, 0)), up).lerp(c.at(0, 2.02, 0), over);
      F.sigil('s', p, q, 0.30 * ease(ramp(t, 1.1, 1.9)) + 0.25 * up + 0.9 * over, t * 0.9, win(t, 1.1, 1.6, 5.17, 5.5), Math.max(up * 0.6, over));
      F.sparks('rain', c.at(0, 2.0, 0), 46, t - 3.5, { emit: 1.7, life: 1.3, spread: 0.75, rise: -0.75, size: 0.10, seed: 3 });
      // release: the ring sweeps out around her and the light scatters
      const r = t - c.release;
      F.ring('r1', c.at(0, 1.0, 0), q, 0.5 + 3.4 * ease(r / 1.2), r * 2.5, win(r, 0, 0.08, 0.5, 1.2));
      F.ring('r2', c.at(0, 0.5, 0), q, 0.5 + 2.6 * ease((r - 0.18) / 1.2), -r * 2.0, 0.7 * win(r, 0.18, 0.3, 0.7, 1.4));
      F.glow('fl', 3, c.at(0, 1.5, 0.1), 1.6 * ramp(r, 0, 0.15) + 0.4, win(r, 0, 0.05, 0.15, 0.5));
      F.sparks('burst', c.at(0, 1.2, 0), 60, r, { emit: 0.1, life: 1.2, spread: 1.9, rise: 0.15, size: 0.12, seed: 9, flatten: 0.5 });
      F.sparks('bow', c.at(0, 0.9, 0.3), 16, t - 6.0, { emit: 0.6, life: 1.0, spread: 0.5, rise: 0.25, size: 0.07, seed: 5 });
    },
    SealedFate(t, c) {
      const R = c.hand('Right'), L = c.hand('Left'), q = c.q, r = t - c.release;
      F.glow('g', 0, L.clone().add(R).multiplyScalar(0.5), 0.26, win(t, 0.3, 0.7, 1.0, 1.4));
      const held = R.clone().add(c.dir(0, 0.02, 0.07));
      if (r < 0) F.sigil('s', held, q, 0.36 * ease(ramp(t, 1.0, 1.8)), t * 1.4, ramp(t, 1.0, 1.4), 0);
      else {                                                   // the seal is thrown at her target and stamps there
        const fly = ease(r / 0.4), at = c.releaseHand.clone().add(c.dir(0, 0.02, 0.07)).add(c.dir(0, 0.04, 2.3).multiplyScalar(fly));
        F.sigil('s', at, q, 0.36 + 0.75 * fly, c.release * 1.4 + r * 4, 1 - ramp(r, 0.55, 1.0), 0);
        F.glow('hit', 3, at, 1.3 * ramp(r, 0.35, 0.5), win(r, 0.35, 0.42, 0.5, 0.9));
        F.sparks('sp', at, 30, r - 0.38, { emit: 0.08, life: 0.9, spread: 0.9, rise: 0.1, size: 0.10, seed: 2 });
      }
      F.sparks('tr', held, 14, t - 1.2, { emit: 1.6, life: 0.7, spread: 0.22, rise: 0.25, size: 0.06, seed: 7 });
    },
    AgainstAllOdds(t, c) {
      const L = c.hand('Left'), R = c.hand('Right'), q = c.q, a = win(t, 1.0, 1.6, 6.8, 7.6);
      F.sigil('floor', c.at(0, 0.03, 0), q, 2.0 * ease(ramp(t, 1.0, 1.7)), t * 0.35, 0.9 * a, 1);
      F.glow('gl', 1, L.clone().add(c.dir(0, 0.10, 0)), 0.34, a); F.glow('gr', 1, R.clone().add(c.dir(0, 0.10, 0)), 0.34, a);
      for (let k = 0; k < 4; k++) {                           // rings of light climb her, one after another
        const u = ((t - c.release) / 1.7 - k * 0.25) % 1, on = t > c.release + k * 0.42 && t < 6.9;
        if (on && u >= 0) F.ring('up' + k, c.at(0, 0.1 + 1.9 * u, 0), q, 1.25 - 0.45 * u, t * 1.5 + k, 0.8 * Math.sin(u * Math.PI));
      }
      F.sparks('fl', L, 24, t - c.release, { emit: 5.0, life: 1.1, spread: 0.3, rise: 0.55, size: 0.08, seed: 4 });
      F.sparks('fr', R, 24, t - c.release, { emit: 5.0, life: 1.1, spread: 0.3, rise: 0.55, size: 0.08, seed: 8 });
      F.glow('start', 3, c.at(0, 1.2, 0.1), 2.2 * ramp(t, c.release, c.release + 0.25), win(t, c.release, c.release + 0.06, c.release + 0.2, c.release + 0.6));
    },
    GildedRebuke(t, c) {
      const L = c.hand('Left'), r = t - c.release;
      let to;
      if (t < 0.55) to = L.clone().add(c.dir(0.05, -0.45 * ramp(t, 0.3, 0.55), 0.02));                 // drawn from her belt
      else if (r < 0) { const a = (t - 0.55) * 20; to = L.clone().add(c.dir(0.55 * Math.cos(a), 0.25, 0.55 * Math.sin(a))); }   // whirled overhead
      else to = L.clone().add(c.dir(0, 0, 0.3 + 2.1 * (ease(r / 0.12) - ease((r - 0.3) / 0.35))));    // lashed out, then drawn back
      F.chain('ch', L, to, win(t, 0.3, 0.4, 1.7, 1.95));
      F.sparks('sp', to, 40, r - 0.1, { emit: 0.06, life: 0.7, spread: 0.9, rise: 0.05, size: 0.13, seed: 6, color: GOLD });
    },
    Hush(t, c) {
      const tip = c.bone('RightHandIndex3'), q = c.q, r = t - c.release;
      // motes drift near her face, then hang still
      F.sparks('motes', c.at(0, 1.5, 0.15), 14, Math.min(t - 0.2, 0.75), { emit: 0.5, life: 1.5, spread: 0.45, rise: 0.05, size: 0.045, seed: 11, color: DUSK });
      if (r < 0) F.ring('r', tip.clone().add(c.dir(0, 0, 0.05)), q, 0.12 + 0.12 * ease(ramp(t, 1.5, 2.6)), t * 3, ramp(t, 1.5, 1.9), 0, DUSK);
      else {                                                   // the ring flies to her target and closes
        const fly = ease(r / 0.3), at = c.releaseTip.clone().add(c.dir(0, 0.02, 2.2).multiplyScalar(fly));
        F.ring('r', at, q, 0.24 + 0.36 * fly - 0.56 * ease((r - 0.35) / 0.5), c.release * 3 + r * 5, 1 - ramp(r, 0.8, 0.95), 0, DUSK);
        F.glow('th', 2, at, 0.5, win(r, 0.8, 0.9, 1.0, 1.5), DUSK);
        F.sparks('sp', at, 12, r - 0.8, { emit: 0.05, life: 0.6, spread: 0.3, size: 0.06, seed: 12, color: DUSK });
      }
    },
    Gravity(t, c) {
      const L = c.hand('Left'), q = c.q, r = t - c.release, tgt = c.at(0.1, 0.04, 1.7);
      if (r < 0) {
        const p = L.clone().add(c.dir(0, 0.12, 0)), s = ease(ramp(t, 0.15, 0.9));
        F.glow('orb', 0, p, 0.16 + 0.26 * s, ramp(t, 0.15, 0.4));
        F.ring('orbit', p, q, 0.30 + 0.25 * s, t * 9, 0.9 * ramp(t, 0.3, 0.6), 0.7);
        F.sparks('pull', p, 18, t - 0.3, { emit: 0.6, life: 0.45, spread: 0.5, size: 0.05, seed: 13, inward: true });
      } else {                                                 // the weight drops on her target and the ground ring pulls shut
        const drop = ease(r / 0.12), p = c.releaseHand.clone().add(c.dir(0, 0.12, 0)).lerp(tgt.clone().add(c.dir(0, 0.25, 0)), drop);
        F.glow('orb', 0, p, 0.42 + 0.5 * drop, 1 - ramp(r, 0.2, 0.45));
        F.ring('gr', tgt, q, 2.4 - 2.0 * ease(r / 0.4), -r * 8, win(r, 0.02, 0.1, 0.3, 0.5));
        F.glow('hit', 3, tgt.clone().add(c.dir(0, 0.2, 0)), 1.5 * ramp(r, 0.1, 0.22), win(r, 0.1, 0.14, 0.22, 0.5));
        F.sparks('in', tgt.clone().add(c.dir(0, 0.2, 0)), 30, r, { emit: 0.1, life: 0.4, spread: 1.3, size: 0.08, seed: 14, inward: true, flatten: 0.4 });
      }
    },
  };

  return { F, SPELLS, group };
}
