# Makes jester_kit.js from jester_lod.js: one added step, used only when opts.lod.person is given. It drops her costume's
# cloth sheets and lets a person add new parts before the model is bound. With no opts.lod.person every line behaves as it did.
# Run: python3 patch_person_kit.py <jester_lod.js> <jester_kit.js>
import sys
s = open(sys.argv[1], encoding='utf-8').read()
a = "  // ---------- bind: one skinned mesh per material ----------"
assert s.count(a) == 1
hook = '''  // ---------- a person made from her (opts.lod.person): her costume's cloth is dropped, and the person's own parts are added here ----------
  if (LOD.person) {
    const PN = LOD.person;
    if (PN.cloth !== 'keep') { for (const c of cloths) for (const m of c.meshes) { m.visible = false; m.castShadow = false; } cloths.length = 0; }
    if (PN.build) PN.build({ addPart, loft, ringXZ, tubeRings, curvePts, spherePart, centroidOf, wTorso, wSpine, wArm, wLeg, wHead, wOne, BI, V3, sm, lerp, cl, prof, TORSO, LEG, ARM_R, restPts, armDir, HC, HR, SIDES, PI, TAU, Q });
  }

'''
s = s.replace(a, hook + a)
# three of her costume's small parts get names of their own, so a person can leave them off
for old, new, n in [("addPart('wine', spherePart(kc,", "addPart('capknot', spherePart(kc,", 1), ("addPart('wine', spherePart(c2,", "addPart('capknot', spherePart(c2,", 1),
                    ("addPart('cloth', loft(tubeRings([V3(0, 1.326, -0.008)", "addPart('neckband', loft(tubeRings([V3(0, 1.326, -0.008)", 1), ("addPart('wine', spherePart(pc, 0.060, 0.074, 0.062", "addPart('puff', spherePart(pc, 0.060, 0.074, 0.062", 1)]:
    assert s.count(old) == n, old
    s = s.replace(old, new)
a2 = "(LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth"
assert s.count(a2) == 1
s = s.replace(a2, "(LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS[{ capknot: 'wine', puff: 'wine', neckband: 'cloth' }[key]] || MATS.cloth")
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', len(s))
