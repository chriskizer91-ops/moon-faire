# Fights: nobody cut off by the picture's edge

Session "Fights", November 15, 2026, 5:10 pm to 6:20 pm. Task board row F8. This follows `claude/fights-number-after-the-blow-laptop-corner-wide-spells.md`.

## What Chris asked (5:10 pm)

"If you could have maybe one or two different Opus 5.5 set to high sub-agents, go through the Entire battle sequence specifically with the Great Wraith. so that the whole of each attack is within the camera when it executes. I mean, I do like the way it's cutting around, but it's like cutting off the top of the great wraith's head at some points. Or the witch furthest to the edge isn't fully in the image, and this is on my laptop. The scene like cutting is really good most of the time, but very rarely there are scenes, and it just takes away from how epic the whole thing looks when a couple scenes or a couple cuts cut off part of a character."

## Where it is

- Page: https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi (the same link as before).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-fights`, commits `cc714e8` and `5f3e799`. `game/fight/README.md` has every step of the fight's history in order; this one is its last section.

## What was wrong

The shots were sized for a great wraith 5.6 m tall. Measured with its bones in every move, it stands 6.65 m to the tip of its scythe and lifts it to 8.85 m in its sweep (9.7 m in the Eclipse). So its top was out of the picture most of the time, in the wide views too. Counting honestly, someone was cut by an edge in 70% of the moments of the last fight on a laptop.

## What was built

**A framing guard.** The director still calls every shot. The guard checks the shot against everyone's real size and the parts of the screen that are taken (the turn strip along the top, the card in the corner, the message line), and when someone the shot is about is not whole it moves the camera by the least that puts it right: back, a little across or up, or its aim a little higher. The camera's angle stays the same.

- A view of everyone: every witch and every foe is whole.
- A witch's turn: she and every foe are whole, and any other witch at the edge is brought in whole.
- A move: whoever the shot is on is whole (the one the camera looks at, and whoever stands right by them). Anyone else at the edge is brought in or left out when that takes only a small move. If it doesn't, a witch or small foe the move doesn't involve steps out for that shot.
- The great wraith is never left partly in the picture. If the picture can slide so that it is wholly out, it does. If not, the camera backs away until all of it is in.
- A move's shot keeps one distance. When the shot begins, the director's shot is run forward to its end to find the furthest back it will need to be, and the camera takes that distance at once. It doesn't back away as a blow lands.

**Two director changes.** The great wraith's attack on everyone is now a wide shot from behind the party, pushing in. And it is never shot from behind itself, because its cloak hid the witch it struck.

**Other fixes the review turned up.** Io's Revive showed her grey practice figure lying across her lap; it is hidden now. A foe's bar no longer sits in the turn strip, and a foe that is out of the picture shows no bar.

## The review Chris asked for

Two Opus 5.5 sub-agents at high effort each went through half of 150 pictures of the whole fight (every move at three moments, and every turn), twice.

- First pass: 56 pictures with a fault. The main ones: the great wraith's cloak filling one side of a close shot with its head out of the picture; Io's hem and feet off the bottom in most turn shots; the struck witch hidden behind the great wraith's cloak; the grey practice figure in Revive.
- Second pass, after those were fixed: the great wraith whole in every picture; no witch cut by an edge or covered by the card or the message line; no grey figure. Three pictures were still flagged, all for one thing: a struck witch behind another witch (below).

**The second pass was not on the very last build.** After it, four smaller things changed: a comment that had switched off the corner card's part of the guard was removed; the look-ahead was made exact, so the camera no longer drifts back during a wind-up; a bystander is no longer held in a shot at any cost; and a foe's shot is sized for its whole move from the start. The published build was checked by the count below and by fresh pictures of two moves, not by a third pass of the reviewers.

The fight's own count of moments with someone cut, on the published build: on a laptop 70% before, 1.2% now; on a phone-sized screen 0.5%. What is left are moments while the camera is turning quickly from one figure to another.

## For Chris to say

1. **Close shots beside the great wraith are now wider.** When a small fight happens at its feet (Io's thorn on a Shadow Wraith standing next to it), the shot used to be close with its cloak filling one side. Now the camera stands far enough back to hold all of it, so the witch is smaller in the picture. If he would rather keep those close and accept its cloak at the edge, that is one line to change.
2. **A struck witch behind another witch.** Twice in the fight the witch a blow lands on stood straight behind another witch from the camera, so the hit showed but she didn't. Nobody is cut by an edge there. It is not fixed; it wants the camera to choose the side the target is clear from.
3. **The Fox's spells at every foe** (Crazy Quilt, Pins and Needles) are very wide, with small figures. That is the fitted shot from 1:03 pm, not the guard. The reviewers noticed it; Chris hasn't asked for it closer.
4. Still open from November 14: which witch animations he meant by "some of the witches animations need to be looked at".

## Not seen in motion

The test browser has no graphics chip, so all of this was checked on stills and by numbers. How the wider shots feel in motion is Chris's to judge.

## Checks added (`game/fight/checks/`)

- `audit.py [on|off] [width] [height] [foes] [place]`: plays a whole fight without drawing and counts the moments anyone is cut by an edge, by move.
- `film.py` and `sheets.py`: pictures of the whole fight, and contact sheets of them for looking through.
- `trace.py` and `stills.py`: one kind of move, moment by moment.
- `bodies.py`: how tall and wide everyone really is in every move.

## A mistake that kept happening

Three times in this piece of work a `//` comment added in the middle of a long line of code swallowed the rest of that line. One of them switched off the corner card's part of the guard until the count showed it. Comments go on their own lines, and `node --check` is run on `fight.js` and on the built `out/mf-fight.js` after every change.
