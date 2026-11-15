# The fight as one piece

Built November 14, 2026 by the "Fights" session (task board rows F1 and F2). The party of four against wisps, Shadow Wraiths and the
great wraith, on the five painted fight places, with the approved combat engine unchanged. Every name is a stand-in until Chris says so.

## One call

```js
const result = await MF_FIGHT.start({ place: 'F3', foes: 'K2w', partyLevel: 3, foeLevel: 4, party: last && last.party });
// { result: 'won' | 'lost' | 'fled', won, xp, turns, foeTurns, fainted, place, foes, tag,
//   party: { jester: { hp, max, mp, mpMax }, ranger: {...}, fox: {...}, io: {...} } }
```

- `place`: `F1` the moor clearing, `F2` the fair, `F3` the standing stones, `F4` the beacon stair, `F5` the lamp room.
- `foes`: a line-up as the plan writes it (`w` wisp, `K` Shadow Wraith, `B` great wraith: `3w`, `K2w`, `B2K2w`) or a list.
- `party`: what each witch brings in. Hand back the last result's `party` to carry HP and MP from fight to fight.
- Also: `gap`, `seed`, `label`, `tag`, `camera`, `speed`, `flipbook`, `weight`, `auto`. They are described at the top of `api.js`.

The fight covers the page with its own canvas and answers when the player leaves the result. While it runs, the page that called it
should stop drawing its own picture.

## Build

```
python3 game/fight/build_fight.py     # out/mf-fight.js (for another page) and out/moon-faire-fight.html (a page of its own)
python3 game/fight/tools/build_witches.py   # only when a witch's own branch has changed: remakes fight/witches/
```

`build_witches.py` needs the three model branches fetched first
(`git fetch --depth 1 origin claude/fox-3d-model claude/ranger-3d-model claude/io-3d-model`). It only reads them.

## Files

| File | What it does |
|---|---|
| `api.js` | `MF_FIGHT.start`: the screen, the settings row (camera, speed, Flipbook look), the clock. |
| `fight.js` | The fight: turns, moves, targets, bars, the five cameras, what the engine did shown on the models. |
| `actors.js` | The four witches behind one face, and the table of which of a witch's moves shows each engine move (`MOVES`). |
| `foes.js` | `MF_FOES.make(kind, weight)`: wisp, wraith, great; `light` for fights, `fine` for close-ups. |
| `places.js` | The five fight places: one camera, where the party stands, where foes of each size stand. |
| `witches/` | The Fox, the Ranger and Io with the light-level switches, built from their branches (`SOURCES.txt` says which commits), and `witch_levels.js`, which gives all four one name: `MF_WITCHES.fox.raw('lightest')`. |
| `tools/` | `patch_fox.py`, `patch_ranger.py`, `patch_io.py` (from the witches' light-level notes), `build_witches.py`, `stage_cameras.py` (the moving camera for `src/stage.js`, applied at build; `src/stage.js` itself is not changed). |
| `checks/` | `smoke.py`, `auto.py` (the engine's players take a whole fight through the page), `moves.py` (every witch move once), `views.py` (phone, cameras, Flipbook look, tapping), `weights.py`. |
| `../models/foes/wraith.js` | Envoi's Shadow Wraith and great wraith, unchanged (`chriskizer91-ops/envoi-on-the-longest-night`, branch `claude/send-note-gigdew`, `src/models/wraith.js`, commit `318bc96`). |

## Weights (triangles)

| | Light, for fights | Fine, for close-ups |
|---|---|---|
| Wisp | 4,700 | 16,300 |
| Shadow Wraith | 14,500 | 58,600 |
| Great wraith | 19,900 | 70,000 |

The witches at Lightest: Jester 18,800, Fox 30,200, Ranger 37,800, Io 45,000. The last fight (five foes) draws about 194,000 triangles
in 180 draws; a Shadow Wraith and two wisps, about 160,000 in 140.

## Stand-ins and things not built

- The Fox's Stitch plays Blue Mischief and her Pins and Needles plays The Moon's Little Lie; Io's Deity plays her herb move when it is
  cast (the Guardian comes on her next turn, as the rule says). Change them in `MOVES` in `actors.js`.
- Io's spells are built to land 1.4 m in front of her, so she walks to her target, casts, and walks back. The Fox does the same for
  Hemline Fangs, and the wraiths walk up to whoever they strike.
- The Ranger's arrow leaves level; she leans a few degrees toward a low target so it meets a wisp.
- One weight of each witch per fight (Lightest unless told otherwise). Swapping to Light for the close cameras is not built.
- The gem's two shots go to the same foe (the engine re-aims the second if the first one ends it).
- No sound. No story effects (task board F7). Not joined to the open world (F6).
- Real speed and how any of it moves have not been seen: the test browser has no graphics chip.

## The camera (Chris, November 14, 6:21 pm)

"We need the hero party looking at the foes and maybe the camera is from behind their heads. And then we do some camera movement to
swing around and look at each move but cuts back to the whole group in between."

- The party now rests facing the foes, in every camera.
- "Behind the party" is the default camera (`behindShot` in `fight.js`). At rest it stands behind the party's heads and looks over
  them at the foes. On a move it cuts to a camera that swings: from over the mover's shoulder round to her side, then to whoever the
  move landed on. A foe's strike is seen from behind the head of the witch it is aimed at. Then it cuts back to the group.
- A move at everyone cuts back to the group as it lands, so every number is seen. When the fight is won the party turns and bows
  to a camera on the foes' side.
- It is a camera that really moves, so the painting behind is always out of focus (less so at rest), showing the right-hand part
  of the painting. The four older cameras are still in the menu as "Side on".
- `checks/behind.py` takes stills of the group, of three moments of each swing, and of the bow.
