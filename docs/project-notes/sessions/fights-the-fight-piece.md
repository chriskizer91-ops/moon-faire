# Session "Fights": the fight as its own piece

November 14 to 18, 2026. Task board rows F1, F2 and F8.

## What this conversation built

- The fight as one self-contained piece: the party of four against foes on the five painted backdrops, with the approved combat
  engine unchanged. Another page starts one with a single call, `MF_FIGHT.start({...})`, and gets back who won and what was gained.
- The foes: the wisp, the Shadow Wraith and the great wraith (brought over from `envoi-on-the-longest-night`), each at a light weight.
- A director camera that mixes the views (wide behind the party, behind their heads, a swing on each move, and others).
- The move-picking screen: pick a move, the target is chosen for you, one Cast bar. On a laptop it is a card in the bottom right corner.
- Blows that can be seen to land, clearer bars, and the damage number a beat after the blow, with a total for several hits.
- Wide spells fitted to the room they take (the stag, the Fox's spells at every foe).
- A framing guard so nobody is cut off by the picture's edge. The great wraith was measured at 6.65 m, not 5.6 m.
- Checks in `game/fight/checks/`. `game/fight/README.md` has every step in order.

## Branch and last commit

`claude/moon-faire-fights`. Last commit before this note: `5f3e799`.

## Artifact links

- The fight on its own: https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi (built from `game/out/moon-faire-fight.html`)

## Chris's decisions made here

- The party faces the foes. The camera is behind the party, at a wider angle, and switches between views by itself.
- "Camera is perfect" with every view zoomed out 25%. Moves run 10% slower.
- Bars are not larger, they use colour better.
- The damage number comes a beat after the blow lands, and several hits add up to a total, as in Envoi.
- On the phone the move-picking screen is good as it is. On a laptop it is condensed to the bottom right corner.
- Each wide spell gets a shot as wide as the spell.
- Nobody an attack involves may be cut off by the picture's edge. He likes the cutting as it is.
- Push everything once a finished piece has been shown to him.

## Unfinished

- Chris has not said which witch animations he meant on November 14 ("some of the witches animations need to be looked at").
- Close shots beside the great wraith are now wider so all of it fits. He has not said whether he wants that or the close shot back.
- Twice in the last fight a struck witch stood straight behind another witch from the camera. Not fixed.
- The Fox's Stitch and Pins and Needles and Io's Deity cast use stand-in moves.
- None of it has been seen in motion by the session that built it (the test browser has no graphics chip). Chris judges motion.
- Row F12 (HP and MP carried in and out, herbs as a move, brambles, the two-form last fight) is not started.
- Row F6 (joining the fight to the open world) belongs to the open-world session.
