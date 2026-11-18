# Handoff: Jester 3D model and the better flipbook

Written November 11, 2026, for a second session in this project, and brought up to date after pass 14 the same day. Where this note and `claude/jester-3d-model.md` differ, this note is newer.

## Where everything is

Repo `chriskizer91-ops/moon-faire` (public), branch **`claude/jester-3d-model`**, folder `models/jester-3d/`:
- `README.md`: what each part is, how to build, and how the hands, head and veil are made.
- `src/`, `viewer/`, `bake.py`, `bake_hands.py`, build and render tools: the 3D model and its texture bake.
- `references/chatgpt/`: the 23 ChatGPT paintings (`01` to `23`).
- `references/hands/`: the younger hand paintings.
- `references/faces/`: five newer face paintings (front, two three-quarter views, from above, from below). The face painted on the model is still painting 08.
- `references/Jester_Witch_HD_Flipbook.html`: Chris's HD flipbook, 58 painted frames at 1152×1680 as base64 AVIF in `const FR={...}`: Curtain Call `K01` to `K48`, key poses `WS1-3` (Whisper Sigil), `RH1-3` (Raise the House), `CK1-4`. `lib/unavif.py` extracts them (Pillow 11.3 or newer reads AVIF).

The repo's own `CLAUDE.md` describes the rest: the pixel and HD game frames in `assets/` and `game-assets/`, the coded films in `scenes/`, and the rule that Chris tries everything on his phone.

Published 3D model: https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M (artifact "Jester Witch 3D": `index.html`, `jester.js`, `jester_tex.js`, `fb/`).

## What Chris wants from the two sessions

- **This 3D session:** keep doing fidelity passes on the 3D model until it is "as perfect as we can". He wants a demonstration of a realistic 3D model of this character, and it may run only on his laptop if that is what it takes (close to a million triangles is fine there). The sheer veil should stay translucent at sensible levels.
- **The second session: a better flipbook.** His view: the art is gorgeous and the 3D model is not as gorgeous. A flipbook that plays the HD painted frames keeps the art as painted.

## References Chris named as best for body and clothing proportions (November 11)

`03_front`, `04_back`, `05_base_front_back`, `06_base_sides`, `08_face_front`, `14_details`, and the Gravity pose `23`. Use these for proportions. The HD flipbook is the look for cloth, light and motion. Leaning on the HD flipbook for proportions made her head too small; he corrected that. For the hat he later pointed at the flipbook sprite: horns that flop and thin to a point.

## State of the 3D model after pass 14 (November 11)

About 566k triangles at full detail. The viewer picks phone detail only on touch phones; a **Full detail** switch overrides it. A **Veil and shawl** switch takes the outer layers off.

Passes 9 to 12 (base outfit, agreed order: skirt, sleeves and cuffs, horns and head size):
- Veil fitted to the head (it floated above it), layers closer together.
- Skirt narrow at the hip, widening to mid-shin, four soft tiers, plain olive tier, open at the front. Chris had the front swag removed.
- Boot laces sit on the boots. Two belt pouches. Cuffs are large uneven balls of frills. A velvet puff at each shoulder. Head scale 0.98, `UPK` 0.97.

Pass 13 (hands, then the face from every angle):
- **Hands are one continuous skin each** (`src/32_hands.js`): a soft solid (palm slab, heel mounds, four fingers, thumb) whose surface is found on a 1.25 mm grid. Knuckle joints are inside the back of the hand, the thumb grows from the wrist, there are webs between the fingers, and nails are thin plates. Sizes are read off `hands_young_left` (1 pixel = 0.2366 mm). Chris: "they're good looking hands".
- **Head rebuilt from the paintings** (`src/40_head.js`): the profile matches painting 07's side view to about a millimetre (`prof_cmp.py`). Forehead forward, chin back, nose with wings and a rounder tip, a jaw with an edge and a flat underside. **This is the face shape Chris wants** (see pass 14).
- **One face material mixes three pictures** by which way the skin faces: the front painting, the profile painting at the far edge of the cheek, plain skin under the jaw and on the neck (dimmed there).
- The ruff sits about 2 cm lower so the neck shows. The hair is a bob from under the cap to the ruff.
- Hush: the finger stands upright at her lips.

Pass 14 (Chris's notes on pass 13):
- **Horns** leave the head at the same thickness, arc over lower and thin to a point; the pompom hangs from the very tip. He asked for the hat to "flop down more" and "come to more of a point before the pom-poms".
- **Hands 7% smaller** (he said about 10%, perhaps less), **cuffs about 8% smaller**.
- **Veil:** the fourteen ribbon strands are gone ("it looks like she's wearing a bunch of strips of fabric on the front"). The veil now has one wide front fall on each side, from the knot down past her cheek and over the shoulder. The sheer cloth is **one fabric in two tones**, red where you look straight at it and gold where it turns away. The knot sits on the cap. He likes the veil from behind.
- Chris on all of the above: "Everything is good".
- **Face: tried and undone.** After the five newer face paintings I slimmed the jaw about 5% and made its line climb toward the ear. Chris: "The last face shape was much better", so the pass 13 face shape and face paint were restored exactly. Do not slim the jaw or tilt the jawline again without asking him. The newer face paintings do not outrank the face he already likes.

Every move runs with no errors in a headless browser at phone detail. Full detail is checked by still renders only, because the software renderer here is too slow to drive the page at that size. Chris runs it on his laptop and sends photos.

## Known gaps

- Face: the eye seen in full profile is still the front-view eye edge-on. The far edge of the cheek, next to the cap, uses the low-resolution profile painting and looks smoother than the rest. Under the jaw and the neck are plain skin with no painted detail.
- The newer face paintings show a shorter lower face than painting 08 (mouth about 4 mm higher, chin about 12 mm higher, for the same eye spacing). The model keeps painting 08's face; the blink and mouth pictures are painted to match it. Repainting from the newer front painting is an open question for Chris, not a plan.
- Hands: rings are paint, wrapped round the fingers. The right-hand painting is saved but unused (the left is mirrored).
- Cuffs, ruff and pompoms are faceted and read as pine cones or spikes up close.
- Skirt tiers still read partly as strips. Sleeves are plain tubes below the puff. The veil has no moons and stars and a simple drape.
- Brooch and necklace are paint. Boot creases and cap seams are not projected.
- Mistakes to avoid: when filtering a script's output, do not hide its errors. Do not put a `//` comment in the middle of a line when patching code: it swallows the rest of the line (this broke one bake and one build).
