
  // ---------- the Jester's veils, skirts and drapes are not the Fox's: out of the simulation and out of the picture ----------
  // (their helpers stay, because the belt and the moves still read them; the Fox's own cloth is made after this line)
  for (const c of cloths) for (const m of c.meshes) { m.visible = false; if (m.parent) m.parent.remove(m); }
  cloths.length = 0;
