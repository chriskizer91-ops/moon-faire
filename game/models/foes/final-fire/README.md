# The fire that would not end (stand-in name): the final foe, in both forms

Rebuilt on November 15, 2026 by the "Levelling" session from Chris's three pictures (`ref/`). It replaces the first rough
model of the same day. Task board F11; project note `claude/final-boss-the-fire-that-would-not-end.md`.

`final-fire.js` defines `makeFinalFire({ detail, form })`, made the same way as the wraith: three.js r128, everything
built and painted in code, no skeleton and no picture files.

## The two forms

- **Form one, the fire, whole** (`ref/final-fire-form1-sheet.png`): a black sphere like an eclipse in an even corona of
  30 flame blades, three gold rings turning round it, a rose curtain hanging into a thorn-rimmed iron bowl on four legs,
  the keeper's two iron hands either side, and four lit fair lanterns on crooks on the bowl's rim. About 8 m tall.
  **It shows no damage.** Its `hurt` move is a flinch and nothing on it breaks.
- **The final form, the fire, broken open** (`ref/final-fire-form2-sheet.png`): the sphere in ten black shards round a
  white-hot heart with one small candle flame at its centre, a wild uneven corona with loose flecks, the rings snapped
  into six arcs with white-hot ends, the curtain turned to ribbons of flame, the bowl split into two leaning halves, the
  -X hand come apart into loose blades and the +X hand held under the heart, the lanterns dark. About 12 m tall.
- **Both forms are the same parts**, moved and lit differently, so they cost the same to draw.

## How to use it

It returns `root`, `fx` (sparks, in world space: add both to the scene), `animate(phase, walk, t, dt)`, `play(name)`,
`reset(form)`, `setForm(1 or 2)`, `form`, `anchor(name)`, `ACTIONS`, `busy`, `action`, `progress`, `gone`, `height`,
`width`, `setFade(0 to 1)` and `stats`. Metres, Y up. **It faces +Z: the party stands in front of it.**

| Move | Seconds | What happens |
|---|---|---|
| `idle` | | It stands and burns. |
| `blow` | 1.6 | The +X hand rises and strikes down in front. The hit lands at 0.8 s. Works in both forms. |
| `call` | 4.0 | The rings (or arcs) line up into one disc, flames stream in from the party's side, and it bursts at 3.1 s. |
| `hurt` | 0.8 | A flinch and a ripple through the corona. Nothing breaks, in either form. |
| `change` | 5.2 | Form one into the final form. It goes dark and still, light builds inside from 1.1 s, and it breaks open at 2.6 s. It always plays through, and it does nothing in the final form. |
| `ending` | 7.0 | The corona goes out blade by blade, the shards and arcs fall, the heart shrinks, and the candle comes down to stand between the halves of the bowl as one small ordinary flame. The lanterns light again. It holds until `reset()`. |

For the fight (`game/plan/finalboss/final-fight.json`): form one's Life runs out or the Jester seals it, the Curtain Call
plays, then `play('change')`; the final form's fight starts when `form` is 2 and `busy` is false.

`anchor('hit')` is the striking hand's fingertips; `'heart'` its centre; `'cradle'` the bowl; `'top'` its crown.

## Weight

| Detail | Triangles | Draw calls |
|---|---|---|
| 1 | 21,104 | 14 (13 are drawn at once in either form) |
| 0.5 | 10,724 | 14 |

One light of its own, which pulses; no shadows; six small painted textures. The corona, the curtain and the moving iron
pieces are moved on the CPU each frame; a piece that has not moved is left alone. The corona always turns to face the eye.

## The page to look at it

`python3 build_view.py` writes `out/final-fire-view.html`, one 65 KB file that loads only three.js from cdnjs. Drag to
turn it, pinch or use the wheel to zoom. The buttons along the bottom play each move ("Break open" is `change`); the
switches at the top right choose the form and the detail. `--three FILE_URL --out PATH` makes a test copy that loads
three.js from somewhere else.

## What is rough

- It has only been seen through a software renderer (`shots/`), not on Chris's phone or laptop, and not with the
  Flipbook look on.
- The pictures show the hands with broader, more layered plates and the legs with shaped feet; these are simpler.
- The final form's corona is paler than the picture's, which is a deeper crimson.
- The prompt asked for seven shards; there are ten (six round the front, three behind, one at the back), so the shell
  reads from every side.
- In the final form the ribbons and the loose blades reach a little past the edge of a narrow phone screen.
- At the ending the lanterns light again ("the lights go home"). That is a guess at the story and easy to take out.
- It is not joined to the fight piece, and it has no fight backdrop yet.
