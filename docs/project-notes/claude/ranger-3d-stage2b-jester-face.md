# Ranger 3D model: stage 2b, the Jester's face model (November 12, 2026, evening)

Read after `claude/ranger-3d-stage2-head.md` and `claude/HOW-TO-3d-witch-faces.md`.

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (version `1794525318-2f07`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`, commit `62e7865`.
- Files sent to Chris: `Ranger_3D_stage2b.html` (4.2 MB, opens offline) and `Ranger_Face_Prompts.html` (1.2 MB).
- The request for new face pictures: `claude/ranger-3d-round4-face-prompts.md` (J1, J2, J3).

## What Chris said (his words)

He sent the guide "How the Jester's face was made, step by step" (now `claude/HOW-TO-3d-witch-faces.md`) and wrote:
"just use the jester witch 3d face model And then we will make specific new images of just her face so you can paint that onto
the jester witch 3D face model".

This is the same choice he made for the Fox that day: the Jester's head as the shape, each witch's own face as the paint.

## What was done

- **Her head's shape is now the Jester's face model.** `JH` in `src/R40_head.js` holds the Jester's tables and her `headPoint`,
  word for word from `models/jester-3d/src/40_head.js`, in the Jester's own frame (eyes at 1.5246 m, lip line 0.066 m below).
- **It is worn at 94% of its size** (`HS`), with the eye line at 1.512 m and the tip of the nose 0.107 m forward, where her
  paintings put them. At 94% the chin is at 1.409 m and the face is 6.4 cm wide at the eyes, both as painted. Her pupils come out
  63 mm apart (painted: 61) and eye-to-lips 62 mm (painted: 60).
- **One addition to the Jester's shape** (`TUCK`): below the ears, the back of each ring is drawn in to the neck. The Jester's cap
  and ruff hide that part; the Ranger's hair is up, and without it the head had a flat floor behind the jaw.
- **Her face is still C1**, laid on by her pupils and the line of her lips. C1 fits the Jester's frame almost as it is: under the
  nose and under the chin moved by a few pixels, and no squeeze sideways. The sculpted eyes are placed from the painting's own
  numbers (`layout`), as the guide's step 1 asks.
- **From the guide, now done:** the painting is kept only inside the outline of her face and her skin is carried outward past it
  (step 4); the profile painting is used only at the far cheek and its tone is matched to the front cheek (step 5); plain skin
  only under the jaw, with the height test (step 5); the neck darkens toward the jaw.
- **Neck.** Its front leans forward as it rises and meets the underside of the jaw about 4 cm behind the chin.
- **Refitted, not redesigned:** ears, hair, headband (now a strip of even width), gem, glasses, loose locks.
- **Kept:** her own head shape from stage two, in `variants/ownhead/` (head code and its bake).

Triangles: 324,628.

## What changes for the eye

- Her profile is the Jester's now. Her own painted profile (C3) is no longer followed; her nose is a little sharper from the side.
- From the front she is nearly the same as before. At three-quarter, from below and from above, the face holds together better
  than the stage-two head did.

## Checked, and not checked

- Looked at from the front, three-quarter both ways, side, above, below and a low three-quarter.
- The single file loaded at phone size with no errors, and a drag turns her. The request page: no sideways overflow, the copy
  buttons copy, the Kept ticks are remembered.
- The whole folder rebuilds from a clean copy of the repo.
- Not checked: on a real phone. Nothing moves yet. The long button-by-button page test was not repeated for this stage.

## Rough, and known

- The join of jaw and neck is plain: the Jester's jaw has a hard edge and a flat underside, which her ruff hides and the Ranger's
  bare neck does not. The Fox session met the same thing and gave her a jaw table; that has not been done here.
- A faint pale patch remains on her brow where the gem's drop was painted out. J1 has no band, so it goes then.
- Her face does not blink or talk. J2 brings the states; the Jester's blink and talk code comes over with the movement stage.
- Hair as in stage two: smooth edge, plain bun, tall and flat on top from the front.

## When J1 to J3 arrive

1. Read both pupils and the lip line off a gridded copy of J1 (`lib/grid.py`), by eye.
2. In `bake_head.py`, bake J1 in place of C1: same frame, new anchors. There is no band, gem or drop to paint out.
3. Cut the states from J2 as soft-edged patches matched in tone at the rim, and write them as `faceParts` the way the Jester's
   `bake.py` does (shut, half, oh, smile), so her blink and talk code works unchanged when it is brought over.
4. Use J3's profile for the side picture and the ears, and J3's three views as the check at 0, 45 and 90 degrees. Work out the
   real angle of the "45 degree" view from its pupils first.
5. J3 also shows her hairline without the band: use it for the hair pass.

## Choice made for Chris to confirm

No teeth show in J1 to J3. That matches the Jester's states and his rule for the Fox, but he has not said it for the Ranger.
