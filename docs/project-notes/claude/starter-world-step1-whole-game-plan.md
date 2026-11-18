# Starter world, step 1: the whole game on one page

November 13, 2026. Step 1 of `claude/moon-faire-starter-world-brief.md`. **Approved by Chris the same day, with one change:
all four witches are in the party from the start.** Every name, place and story beat is still a placeholder.

- **The page:** https://claude.ai/artifact/97eaGFUQv1WqPMUJEdDUPU ("Moon Faire starter world plan")
- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/`
  (`plan/starter-world-plan.html`, `plan/sim/`, `README.md`)
- **Next step:** `claude/starter-world-step2-pilot-prompts.md`

## Chris's decisions (November 13)

His words: "As to everything except question 3, all four of them from the start. I like it being a party of four and the
story goes back from before the game."

| Choice | Decided |
|---|---|
| Time of day | One evening that darkens as they go: dusk at the fair, night on the moor, deep night at the beacon |
| Auros in the paintings | In every sky, always in the same spot, upper left behind the scene |
| **The party** | **All four witches from the start.** Their story together goes back before the game |
| The gate to zone 3 | The airship's twelve lamps, won back in the wilds |
| Town fights | Three set fights as wisps come into the fair, and the sparring ring for practice bouts |
| Foes | Envoi's wraith family only: wisp, Shadow Wraith, great wraith. A lamp-carrying wisp is the same wisp |
| Names | Placeholders for now, all kept in one data file |
| The last fight | The great wraith, two Shadow Wraiths and two wisps, level 5 |
| Between fights | Every fight starts with full HP and MP, as in the blob battle |
| Fair folk | Voices from stalls and tents, no new models |

Also used, from Chris's other sessions the same day: one witch walks the scene (nobody follows her); talking shows a picture
card beside the text box, as in Envoi; Trim for walking, Light in fights, Full for close shots.

## The game

| Zone | Scenes | Party level | Foe level | Fights |
|---|---|---|---|---|
| 1. The Moon Faire | W1 fair square (start), W2 stall row and sparring ring, W3 mooring field (captain, airship) | 1 to 2 | 1 to 2 | Three set fights with wisps; ring bouts for practice; no walking fights |
| 2. The wilds | W4 the Last Lantern, W5 the standing stones, W6 the still pool and broken arch (camp), W7 the hollow (hidden) | 2 to 4 | 2 to 6 | Walking fights about every 14 m; one set fight in each scene |
| 3. The Dark Beacon | W8 the landing ledge (captain, airship), W9 the beacon stair, F5 the lamp room | 4 to 5 | 5 to 6 | Walking fights on the stair; the boss at level 5 |

- **Story, six lines (a suggestion):** the four are at the fair at dusk, as they have been since before the game; wisps
  carry off the twelve lamps of the captain's airship; the four win them back on the moor; a Shadow Wraith bars the road at
  the standing stones; with all twelve lit the captain flies them to a dead airship beacon on a crag; a great wraith at the
  top hoards the stolen light.
- **The gate:** a lamp only comes from winning a fight in the wilds, and each wild scene holds its own share (3, 4, 5: its
  first walking fights and its set fight). They light up on the moored ship in W3.
- **The captain** is at W3, then W8; he flies the ship and is never in the party.
- **The lamp room door opens at level 5,** the boss's level.
- **Finds (Chris's hypothetical kind):** a healing amulet (+5% healing) in the hidden hollow; a charm (+2% HP) off the path
  on the beacon stair.
- **Losing costs nothing:** wake at the last rest spot.
- **XP:** wisp 10, Shadow Wraith 40, great wraith 400, growing 20% a foe level. Totals to reach levels 2 to 5: 80, 400,
  1,150, 2,000. The party shares XP and levels together.
- **Paintings: 14.** Walking W1 to W9; fight backdrops F1 moor clearing (W4, W6), F2 the fair from the ring (town),
  F3 among the stones (W5, W7), F4 the crag (W9), F5 the lamp room (boss). Pilots: W1 and F1. Optional fifteenth: a still
  of the airship crossing.

## Measured with a party of four (the approved engine, unchanged; careless / attentive / expert)

- The engine copy reproduces `lore/combat-balance.md` for all seven fights and all seven level tests.
- Every set fight and every walking fight before the boss, at the level the party meets it: 100% / 100% / 100%
  (1,000 fights each).
- The boss at level 5: 6% / 81% / 100%. A level short: 0% / 3% / 92%. With both finds: 7% / 87% / 100%.
- 2,000 whole playthroughs per style on the shortest sensible route: levels arrive on fights 3, 8, 14 and 22 of about 24;
  the party is level 4 when the twelfth lamp is back in every run; about 245 witch turns and 85 foe turns.
- A careless (random-move) player needs about 17 tries at the boss; everything before it is safe for anyone.
- **Play time is an estimate:** 25 to 45 minutes of fights (at 4 to 9 seconds a witch turn) plus 12 to 15 of walking and
  talking, so about 45 to 55 minutes.
- **Not measured, because it cannot be yet:** real speed on Chris's laptop, real fight length with spell animations, and
  how walking feels.
