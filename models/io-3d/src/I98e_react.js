  // ===== I98e_react.js: stage fourteen: what her reactions need (painting H17, H18) =====
  // Chris, November 14: "let's continue on to her reactions". His lore: "She holds her hat on when she is hit, loses it when she
  // falls, and tips its brim when she wins." Her hat is part of her head, so to lose it the worn hat is hidden and a copy of it is
  // shown where it falls; and under the hat she had no hair on top, so HAIRTOP is that hair: tresses combed down each side from a
  // middle parting (C11, C12), shown only while the hat is off.
  const HAIRTOP = (() => { const G = new THREE.Group(); G.visible = false; fxG.add(G); const bag = wBag(), c = HB.c, rx = HB.rx + 0.005, ry = HB.ry + 0.005, rf = HB.rzF + 0.004, rb = HB.rzB + 0.004, cols = HAIRC.map((h) => { const k = new THREE.Color(h).convertSRGBToLinear(); return [k.r, k.g, k.b]; });
    const tone = (i) => (j, a) => { const b = cols[1 + Math.floor(wHash(i * 3.3) * 3.99) % 4], g = (0.72 + 0.28 * Math.min(1, j / 3)) * (0.90 + 0.16 * Math.sin(a * 2 + i)); return [b[0] * g, b[1] * g, b[2] * g]; };
    for (const s of [-1, 1]) for (let i = 0; i < 26; i++) { const z0 = lerp(-0.118, 0.080, i / 25), pts = []; for (let j = 0; j <= 12; j++) { const t = j / 12, a = 0.06 + t * 1.80, z = z0 - 0.022 * t * t + 0.004 * Math.sin(t * 13 + i), f = Math.sqrt(Math.max(0.05, 1 - Math.pow(z / (z > 0 ? rf : rb), 2))); pts.push(V3(s * rx * f * Math.sin(a) * (1 + 0.05 * t), c.y + ry * f * Math.cos(a), c.z + z)); }
      wTube(bag, pts, (j) => 0.0105 * (1 - 0.25 * j / 12), 5, tone(i + (s > 0 ? 40 : 0)), null, () => [1.7, 0.45]); }
    for (let i = 0; i < 16; i++) { const ph = PI + lerp(-1.25, 1.25, i / 15), pts = []; for (let j = 0; j <= 10; j++) { const t = j / 10, th = 0.42 + t * 1.36, w = 0.004 * Math.sin(t * 12 + i); pts.push(V3(rx * Math.sin(th) * Math.sin(ph) + w, c.y + ry * Math.cos(th), c.z + rb * Math.sin(th) * Math.cos(ph))); } wTube(bag, pts, (j) => 0.0115, 5, tone(i + 90), null, () => [1.8, 0.45]); }
    const m = wMesh(bag, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, side: THREE.DoubleSide })); m.receiveShadow = false; G.add(m); return G; })();
  const HAT_KEYS = ['felt', 'brim', 'hatband', 'silver', 'gold', 'horn'], HAT_PIV = V3(0, 1.585, -0.03), HAT_Q = new THREE.Quaternion(), HAT_QG = new THREE.Quaternion(); let HATD = null, hatK = 0;
  function hatMake() { HATD = new THREE.Group(); HATD.visible = false; fxG.add(HATD); const cp = (x) => { const y = x.clone(); y.skinning = false; return y; };
    for (const k of HAT_KEYS) { const m = meshes[k]; if (!m) continue; const d = new THREE.Mesh(m.geometry, Array.isArray(m.material) ? m.material.map(cp) : cp(m.material)); d.position.copy(HAT_PIV).negate(); d.castShadow = true; d.frustumCulled = false; HATD.add(d); } }
  // k: 0 the hat is on her head; 1 it lies on the ground at G (turned by yaw); between, it tumbles down
  function hatApply(k, G, yaw) { const off = k > 0.002; for (const n of HAT_KEYS) if (meshes[n]) meshes[n].visible = !off; HAIRTOP.visible = off; if (!off) { if (HATD) HATD.visible = false; return; } if (!HATD) hatMake(); HATD.visible = true;
    HAIRTOP.position.set(0, 0, 0); carried('head', 0, 0, 0, HAIRTOP.position); rootQuat(SK.head, HAIRTOP.quaternion);
    const e = k * k * (3 - 2 * k), from = carried('head', HAT_PIV.x, HAT_PIV.y, HAT_PIV.z, V3()); rootQuat(SK.head, HAT_Q); HAT_QG.setFromEuler(new THREE.Euler(0.22, yaw, -0.30, 'YXZ'));
    HATD.position.copy(from).lerp(G, e); HATD.position.y += 0.28 * Math.sin(PI * Math.min(1, k * 1.15)) * (1 - e); HATD.quaternion.copy(HAT_Q).slerp(HAT_QG, e); HATD.rotateX(-1.4 * Math.sin(PI * e)); }
