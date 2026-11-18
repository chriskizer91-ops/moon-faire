# Ranger 3D model: stage 2c, her new face (November 12, 2026, night)

Read after `claude/ranger-3d-stage2b-jester-face.md` and `claude/ranger-3d-round4-face-prompts.md`.

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (version `1794534449-450e`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`, commit `f4710b7`.
- File sent to Chris: `Ranger_3D_stage2c.html` (4.2 MB, opens offline).

## What Chris sent

The three pictures from the round 4 request, made in one go: J1 (her face straight on, 1254 square), J2 (six states, 1536 by 1024)
and J3 (front, turned and side, 1536 by 1024). They are stored as `references/chatgpt/J1.webp`, `J2.webp`, `J3.webp`.

## What was done

- **Her face is J1**, on the Jester's face model. Landmarks were read off a gridded copy by eye and are written in `bake_head.py`:
  pupils (436, 541) and (823.5, 541); the middles of the two eye openings x 442.5 and 838.5; the middle of nose and mouth x 651;
  brows y 452; under the nose 810; lip line 928; under the chin 1168.
- J1 fits the head's frame with one scale (eye line to lip line = 0.066 m gives 5864 pixels a metre): under the nose and under the
  chin land within 1 to 2 mm of the head's own heights.
- **One oddity in J1:** her nose and mouth sit 11 pixels (about 2 mm) to one side of the middle of her eyes. Each half of the picture
  is scaled on its own (about 5% apart), so the nose lies on the head's middle line and each eye on its own sculpted socket.
- **Her states are from J2**: eyes shut, eyes half shut, lips parted, "oo", smile. The first cell was settled onto J1 picture
  against picture, each other cell onto the first by the parts that did not change (shifts of under 3 pixels). Only the eyes or
  the mouth are lifted, as soft patches, tone matched at the rim (all gains within 4%). They are stored as the Jester's are
  (`faceParts`: `shut`, `half`, `oh`, `oo`, `smile`).
- **On the model:** the face is drawn on a canvas; `setFace(eyes, mouth)` sets a state into it (eyes 0 to 1; mouth `rest`, `open`,
  `oo`, `smile`). The page has a "Her face" row: At rest, Blink, Half shut, Talking, Oo, Smile.
- **Her sides are from J3's profile**: cheeks and jaw at the far edge, and both ears. Read by eye: eye y 405, tip of the nose
  x 1502.5, lip line y 535, under the chin y 627, ear x 1187 to 1262 and y 382 to 519. Tone matched to J1's cheek (within 4%).
- J3 paints the ear about 6.5 cm tall; J1's front view allows 5.7. The ear is built at 5.7 cm and its picture drawn in to fit.
- **Two fixes found on the way:** the pale patch on her brow was the front edge of her hair showing under the band, not the face
  picture; the hairline is now further under the band. A line across her neck was the neck's shade starting below the collar.

## Checked, and not checked

- Each state looked at on the model: at rest, blink, talking and smile from the front; "oo" and smile at three-quarter; half shut
  in profile; smile from below.
- The single file loaded at phone size with no errors; the Face buttons, the Glasses button and a drag all work.
- The folder rebuilds from a clean copy of the repo.
- Not checked: on a real phone; the long button-by-button page test was not repeated.

## Rough, and known

- The join of jaw and neck is still plain (the Jester's hard jaw edge, with no ruff to hide it).
- Her hair pictures still come from C3, C5 and C8 with the band painted out. J3 shows her hair and hairline without the band and
  is the source for the hair pass. J3's front and turned views are not used yet.
- The states change only on a button. Blinking and talking on their own come when the Jester's movement code is brought over;
  `paintFace` already takes her names. J2 has no teeth in it (Claude's choice in the prompts; Chris has not objected).
- From the front, the hair above the band is tall and flat on top. The loose locks are simple.

## Next

Chris's notes on her face. Then, in the how-to's order: hands and painted arms (D1, D2); boots once more; strap hooks, belts,
satchel and pouch; cloth; jewellery; weapons; movement; her moves and spells. A hair pass from J3 fits in whenever he wants it.
