# Io 3D: her spells and her reactions (stages nine to fourteen)

Session note, written November 18, 2026, before the game moves to a new repo.

## What this conversation built

All in `models/io-3d/`, for Io, the Herbal Witch, as a 3D model in code (three.js r128).

- **Stage nine:** one pass on pass-through. Her reading finger and the book, the book and her holding hand, her legs and her
  clothes, her arms and the cloak's sleeves.
- **Stage ten:** a slower, smooth reading hand, and her six feelings from painting C10 (reading, concentrating, surprised, hit,
  stern, delighted).
- **Stage eleven:** her first two spells, Harvest Crescent and Silverleaf Salve. `src/I98_fx.js`.
- **Stage twelve:** Elderwood Guardian (seed, sapling, fawn, the stag of living wood and its charge) and Moonflower Garden.
  `src/I98b_wood.js`, `src/I98c_garden.js`.
- **Stage thirteen:** Thornwake, Rootbound Return and Bramble Cradle. `src/I98d_thorn.js`.
- **Stage fourteen:** her reactions: hit, down (her hat falls off; she now has hair on top of her head) and win.
  `src/I98e_react.js`.

Every move planned for her has a first build: seven spells and three reactions. `models/io-3d/README.md` has a section for each
stage with what was built, how, what was checked and the limits.

## Branch and last commit

- Branch: `claude/io-3d-model`.
- This conversation's last commit of work: `3bc17a3` (stage fourteen).
- Another session added `72103c6` on top (the finer Flipbook look on her page). This note is committed after that.
- Not merged into main.

## Artifact links

- Io 3D, the one link republished at every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
- The same page as one offline file: `models/io-3d/deliver/Io_3D_stage14.html`. Stage pictures are beside it in `deliver/`.

## Chris's decisions in this conversation

Each stage also has a note in the Flip Book Art project (`claude/io-3d-stage9-...` to `claude/io-3d-stage14-...`).

- Her book and her sickle appear when a move uses them. She carries nothing by default.
- Fix pass-through in one pass before emotions, spells and attacks.
- The reading hand was "kind of jerky moving fast": slow it down.
- Her emotions are the faces in C10.
- Stage ten "Quite good", stage eleven "Wonderful", stage twelve "beautiful".
- The order for the rest: Elderwood Guardian, Moonflower Garden, Thornwake, Rootbound Return, Bramble Cradle, then being hit,
  falling and winning.
- A second, higher-detail pass over all her spells comes after the first builds and the reactions: "then we'll double back".

## Unfinished

- **The higher-detail pass over all her spells. Not started.** Listed in the README under Next stages: the Guardian's face,
  finer roots and planted feet; the sapling truly twisting into the fawn; the stag peeling apart strand by strand; flower
  crease, stamens, swelling buds, veined leaves, curling tendrils; the sickle unfolding from the pendant; gold veins on the
  silverleaf; real tongues of witchfire; the hip dagger leaving its sheath; the friend sitting up more naturally; painted hair
  on top of her head; a hat that flops as it lands; her magic's light on her face and clothes; her hair and cloak stirring as
  she casts; greens that survive the Flipbook look.
- Everything from stages eleven to fourteen is a first build, timed from still pictures. None of it was watched playing, and
  none was tried on a real phone.
- In the Flipbook look only stage twelve's two spells were looked at (their leaves turn yellow and grey there). The others
  were not.
- Things I added that Chris has not yet said keep or drop: the crescent of light flying to the foe; the sickle appearing in a
  flash; the seed taken from her pouch; her hand on the Guardian's cheek, not its neck; the Guardian's vines whipping round the
  foe; the moonflowers opening in one go; the briar lifting the foe; three blows landing on the Cradle.
- Two questions still waiting on Chris: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain
  seam (B3, as built).
- Still open if he asks: jog, squat, kneel and hover in line with the other witches; the cloak nearer M1.
