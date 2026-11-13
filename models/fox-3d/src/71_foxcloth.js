
  // ---------- the Fox's own cloth: the flounces of her trousers ----------
  // Each flounce is a sheet sewn to the trouser leg along its top edge and free below. It falls under its own weight, lies on the leg,
  // swings when she moves and trails when she turns. The shapes come from 47_foxtrousers.js.
  // Cloth sheets are plain meshes, not skinned ones, so they need materials of their own: the body's materials are built for skinned meshes,
  // and drawing a sheet with one threw a stray strip of patchwork onto the floor.
  const clothMat = (key, W) => { const t = bakedTex(key, W, W, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(new THREE.MeshStandardMaterial({ map: t, color: lin('#d2c8c2'), side: THREE.DoubleSide, roughness: 0.86 }), '#ffd0a0', 3, 0.12); };
  const CLM = { patch: clothMat('patch', 1024), patch2: clothMat('patch2', 768) };
  for (const f of FLOUNCE) {
    const NR = f.tr.length, NC = f.tr[0].length;
    const cloth = makeCloth({ pleat: { n: 9, amp: 0.006, hem: 0.012, ph: f.ph }, cols: NC, rows: NR, wrap: true, mask: 32, margin: 0.007, bend: 0.3, grav: 0.8, drag: 0.02, flutter: 0.6,
      rest: (c, r) => f.tr[r][c], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.55 : 0.04), weights: (c, r, p) => f.wLeg(p[0], p[1], p[2]),
      uv: (c, r) => [f.ph * 0.13 + (c / NC) * 2, 1 - (r / (NR - 1)) * 0.8] });
    addCut(cloth, CLM[f.key], 1);
  }
