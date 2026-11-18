# Ranger 3D, stage eight second pass: lace pushed up her arm, and what comes next

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `26d44f7`.
One-file copy sent to Chris: `Ranger_3D_stage8b.html`.

## What Chris said

- "You don't need to add the grays in her hair for the flipbook look." Settled: her hair is left as it lands in that look.
- "The lace for her sleeves, her arm's still passing through it. If you can make that not happen somehow, it would look better."
- "Let's move on to doing the rest of her animations and spells and attacks."

## Sleeves, the third way

The first two tries (a swinging bell; a loop that slides across the arm) both still let a bent forearm cut through the lace near the hem, because the sleeve reaches her elbow.

Now (`sleeveTick` in `src/R99_static.js`):

- With her arm straight, the sleeve hangs to her elbow, as painted.
- As soon as her elbow bends past about 25 degrees, the lace is pushed up her arm. By about 107 degrees it is 35% of its length and 55% of its width, close round her upper arm.
- So the hem always ends well above her elbow, and her forearm has nothing to pass through.
- It still slides a little toward the ground on a raised arm, and still follows on a spring.
- In "Take aim" her elbow now folds to 143 degrees at most.

Checked in stills: "Take aim" from above and from the front, the jog, the talk. In each, the forearm is clear of the lace. Not watched in motion.

Known look: on a fully folded arm the lace is a small bunch near her shoulder.

## Next: the rest of her animations, spells and attacks

Her kit, from the reference prompts (`claude/ranger-3d-reference-prompts.md`, sets G, H and I) and her flipbook:

**Things to build first (set G paintings)**
- Her folding bow: open (G1) and folded on her back (G2).
- Her sword, in its scabbard at her left hip (G4).
- Her two throwing knives, in a double sheath across the back of her belt (G5).
- Her hands on each of them (G7).

**Moves that use them (set H paintings)**
- Moonsteel Draw: taking the bow from her back (H1), full draw (H2, her signature pose; "Take aim" becomes this), loosing an arrow of light.
- Silverglass: the round pane of silver-blue glass from her open palm (H6).
- Sword: on guard like a fencer, and a full cut with a long step (H7).
- Knives: wind-up and throw, the second knife already coming up (H8).
- The gem: two fingers to her headband, light running down her arms, the air held still for a breath (H9).

**Light and effects (set I paintings)**
- Arrow of light (I1) and the rest of set I, layered into the spells.

**Rules to keep**
- Her own moves, quick and athletic; her own talking animation; emotes with face, hands and body.
- She attacks toward screen right.
- Glows must follow the Flipbook how-to (section 6) so they are not inked or snapped.
- Fingers need to curl before any grip looks right. They do not yet.

**Choices that still need Chris's yes** (first raised at stage one)
- Folded bow: its limbs curl in like fern tips. The folding-bow sheet was a concept, not a fixed design.
- Sword and knives are new designs. Carry: bow on her back, sword at her left hip, knives across the back of her belt.
- Silverglass shown as something she casts in front of herself.

**Proposed order**
1. Fingers that curl, then the bow (open and folded) and "Moonsteel Draw" with an arrow of light.
2. Sword, with guard and cut.
3. Knives, with the throw.
4. Silverglass and the gem.
5. Hit reactions, a dodge, a win and a fall, so she can stand in a fight.
