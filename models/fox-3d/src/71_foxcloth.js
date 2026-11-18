
  // ---------- the Fox's own cloth: the flounces of her trousers ----------
  // Each flounce is a sheet sewn to the trouser leg along its top edge and free below. It falls under its own weight, lies on the leg,
  // swings when she moves and trails when she turns. The shapes come from 47_foxtrousers.js.
  // Cloth sheets are plain meshes, not skinned ones, so they need materials of their own: the body's materials are built for skinned meshes,
  // and drawing a sheet with one threw a stray strip of patchwork onto the floor.
  const clothMat = (key, W) => { const t = bakedTex(key, W, W, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(new THREE.MeshStandardMaterial({ map: t, color: lin('#d2c8c2'), side: THREE.DoubleSide, roughness: 0.86 }), '#ffd0a0', 3, 0.12); };
  const CLM = { patch: clothMat('patch', 1024), patch2: clothMat('patch2', 768) };
  // Under her sheath the flounce is held nearly still, so cloth and sheath do not pass through each other when she moves.
  const SH = FOXGEAR.sheath;
  const underSheath = (side, p) => {
    if (!SH || side > 0) return 0;
    const dx = p[0] - SH.M.x, dy = p[1] - SH.M.y, dz = p[2] - SH.M.z, yl = dx * SH.Y.x + dy * SH.Y.y + dz * SH.Y.z, xl = dx * SH.X.x + dy * SH.X.y + dz * SH.X.z, t = -yl / SH.L;
    if (t < -0.05 || t > 1.10) return 0;
    const hw = SH.hwAt(cl(t, 0, 1)); return 1 - sm(hw + 0.006, hw + 0.034, Math.abs(xl));
  };
  for (const f of FLOUNCE) {
    const NR = f.tr.length, NC = f.tr[0].length;
    const cloth = makeCloth({ pleat: { n: 9, amp: 0.006, hem: 0.012, ph: f.ph }, cols: NC, rows: NR, wrap: true, mask: 32, margin: 0.007, bend: 0.3, grav: 0.8, drag: 0.02, flutter: 0.6,
      rest: (c, r) => f.tr[r][c], pin: (c, r, p) => Math.max(r === 0 ? 1 : r === 1 ? 0.55 : 0.04, 0.6 * underSheath(f.side, p)), weights: (c, r, p) => f.wLeg(p[0], p[1], p[2]),
      uv: (c, r) => [f.ph * 0.13 + (c / NC) * 2, 1 - (r / (NR - 1)) * 0.8] });
    addCut(cloth, CLM[f.key], 1);
  }
