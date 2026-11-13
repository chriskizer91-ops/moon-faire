# The Moon Faire starter world

A small, complete Moon Faire game: three zones, the four witches and the airship captain, levels 1 to 5, painted scenes
with the 3D models on top. The brief is the project doc `claude/moon-faire-starter-world-brief.md`.

Every name, place and story beat is a placeholder until Chris says otherwise.

## Step 1: the whole game on one page (November 13, 2026) — waiting for Chris's approval

- **The page:** `plan/starter-world-plan.html`, published at https://claude.ai/artifact/97eaGFUQv1WqPMUJEdDUPU.
  It works offline as one file (only the two web fonts are fetched; it falls back without them).
- **What it proposes:**
  - Zone 1, the Moon Faire (W1 fair square, W2 stall row and ring, W3 mooring field): party level 1 to 2, three set fights.
  - Zone 2, the wilds (W4 Last Lantern, W5 standing stones, W6 still pool, W7 hidden hollow): party level 2 to 4.
  - Zone 3, the Dark Beacon (W8 landing ledge, W9 beacon stair, F5 lamp room): party level 4 to 5, the boss at level 5.
  - The gate: the airship's twelve lamps, won back one fight at a time in the wilds (3, 4 and 5 per wild scene).
  - The Ranger, the Fox and Io from the start; the Jester joins at the standing stones.
  - 14 paintings: 9 walking scenes and 5 fight backdrops. Pilots: W1 and F1.
  - Ten choices for Chris, each with a pick and alternatives.
- **The plan as data:** `plan/sim/plan.js` (scenes, fight tables, foe levels, XP).

### What was measured, and how to run it again

`plan/sim/blob-battle-engine.js` is a copy of the approved combat engine, the project doc `lore/sim/blob-battle-engine.js`,
unchanged. New line-ups are passed in through `opts.rules`; no rule or number of the engine is touched.

```
cd game/plan/sim
node check.js                      # the copy gives the same wins as lore/combat-balance.md
node table.js                      # every planned fight at the level the party meets it, 1,000 fights x 3 play styles
node finds.js                      # the three end-boss line-ups, with and without the small finds
node route.js xp                   # 2,000 whole playthroughs per play style: level at each milestone, fights, turns
node pace.js                       # which fight each level arrives on
node survey.js K2w,5w 0,2,4 500    # any line-up (w wisp, K Shadow Wraith, B great wraith; leading t = no Jester) at any level gaps
```

Results on November 13 (careless / attentive / expert):

- Every set fight and every walking fight before the boss: 100% / 100% / 100%.
- The boss (great wraith, two Shadow Wraiths, two wisps) at level 5: 6% / 81% / 100%. A level short: 0% / 3% / 92%.
- Levels arrive on fights 3, 8, 14 and 22 of about 24. The party is level 4 when the twelfth lamp is back, in every run.
- About 240 witch turns and 85 foe turns in all. Fight minutes are an estimate (4 to 9 seconds a witch turn).

Not measured, because it cannot be yet: real speed on Chris's laptop (the test browser runs at under two frames a second),
how long a fight takes with the spell animations, and how the walking feels.

## Next: step 2, the pilot

Grey-box layouts and camera guides for W1 (walking) and F1 (fight), the standing rules, and the two pilot prompts on a
page Chris can use on his phone.
