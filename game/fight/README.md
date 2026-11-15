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

## The camera, again (Chris, November 14, 6:38 pm)

"I think it's better just seeing the whole party and foe party from the side in front of the painted background, with the witches
facing the foes. Also some of the witches' animations need to be looked at, maybe adjusted."

- "Side on, everyone" is the default camera now: the whole party and every foe from the side, in front of the sharp painting, for the
  whole fight. The witches rest facing the foes and turn to the audience to bow when the fight is won.
- "Behind the party" and the other cameras stay in the menu.
- A fault in the version before this one (commit `3f78a98`, live on the page from 6:29 to 6:42 pm): a comment had swallowed the
  line that turns a witch toward her target, so the Jester, the Fox and the Ranger cast while still facing the foes, and their
  spells and arrows went toward the back of the place. Fixed here.
- Which animations Chris means is not known yet.

## The directed camera (Chris, November 14, 7:26 pm)

"I feel like maybe behind the party with a wider angle would be a good idea. I'm open to even more direction, decisions. I guess
director decisions is what we have to decide here and this is very important."

"Directed: wide, behind the party" is the default camera (`directed`; `behindShot` and `BIG` in `fight.js`). The decisions, which are
Claude's and Chris's to overrule:

1. Every fight opens on the painting, sharp and side on, for two seconds while the foes arrive. Then it cuts behind the party.
2. The resting view is wide: behind the party and well round to the audience's side, so the party is on the left with their backs
   to us, all four whole, and every foe is beyond them on the right.
3. A plain move stays in that wide view, with a slow push in. Nothing cuts.
4. A big move earns its own shot, the swing: Sealed Fate, Curtain Call, the Heal taunt, the gem's two shots, Pins and Needles,
   Crazy Quilt, Same Cloth, Borrowed Face, the Guardian, Revive, Bloom; and a foe's Heavy, Crush or Eclipse.
5. A won fight ends on the party's bow, seen from the foes' side.

The painting is out of focus in every shot but the opening: that is what a camera behind the party costs with one painting a place.

## The director camera, and the new move-picking screen (Chris, November 14, 7:48 pm)

"I think the UI for selecting moves could be better and needs to be maybe brainstormed by tossing it towards a couple of Opus 5.5 sub
agents. And then I think a combination: directed wide behind the party and behind their heads, swing on every move ... maybe throw in
some other good angles, but it should be switching between those intelligently as the fight takes place."

**The camera** (`auto`, "Director: mixes the views", the default; `directorShot` in `fight.js`, where the rules are written out):
the fight opens on the sharp painting; a witch's turn is seen over her shoulder at the foe she aims at; crossing the ground is the
wide view; every move gets a shot, chosen by what kind of move it is and never the same twice running (the swing, both of them from
the side, low in front of the caster, from behind the target, from above for a move at everyone); between moves the last shot holds;
a won fight ends on the bow. The earlier cameras are all still in the menu.

**The move-picking screen** (two Opus 5.5 sub-agents brainstormed it; both came to the same shape): pick a move, then who, then Cast.
The first tap never acts. The help line is always shown and says what the move does, or why it cannot be used. Moves are large
tiles. The green Cast bar says the move and the target ("Stitch → Shadow Wraith"). Targets start on whoever she aimed at last (heals
start on whoever is hurt most); tap a foe's bar or a friend's box to change it; tapping the same move or target twice also casts. The
party is one slim strip of four. The log line is a caption on the picture. Camera, speed and look are behind a gear. A Heavy, Crush
or Eclipse on the turn bar is marked with a triangle and its name. Keys: 1 to 7, Tab or arrows, Enter, Esc.
Not built from the brainstorm: the damage shown as a ghost on the target's bar before casting, and tapping a foe's body in the picture.
`checks/ui.py` plays it by taps and keys on a phone and a laptop.
