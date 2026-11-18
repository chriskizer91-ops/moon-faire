# Jester Witch HD 3D model: pass 19, the night square and her moves from the lore (November 12, 2026)

Read after `claude/HOW-TO-3d-witch-models.md`, `claude/jester-3d-pass18-playable.md` and `lore/jester-3d-and-lore.md`.

- Page: **Jester Witch 3D: the night square**, https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh (version `1794501842-3f67`).
- The first page, https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M, still shows pass 18. It was left alone on purpose until Chris has seen this one. If he says to move it over, publish the same files there.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`, commit `a7d52c8`. The README section "In the night square, with her moves from the lore" has the code-level detail.

## What Chris asked for (his words)

- "I want all of her like her standing, sitting, walking, running, laughing, talking, dancing, twirling to still be buttons ... I want all the buttons to still be there"
- "I want to put her into the non-hd little moon fair Town square tent with the dummy"
- "I want to update the animation of her spells following what's been described in the lore"
- "I don't want to remove any animations. I only want to add animations to the high definition version of her"

## How that was read

- **Nothing was removed or changed.** Every Body, Moves and Spells button is there, and the ten spells play as they did.
- **The lore's moves were added beside them,** in a new row called From the lore.
- **She stands in the not-HD night square.** The little theatre is still there, on the Night square switch.

## What was added

**The place**
- The night square from the not-HD training page: flagstones round the new-moon medallion, lantern posts with bunting, striped tents, stars, the new moon, fireflies. It is turned half round so the big tents are behind her.
- The not-HD practice dummy, on her casting side. Aimed spells turn her to it.
- Glow: lanterns and spell light shine. It is a switch, because it costs speed on a slow phone.
- With the walk pad at rest, Walk and Run send her on a lap of the square.

**From the lore** (names are placeholders, kept as words in `viewer/app.js`)
- **Take a hit.** She rocks back, bounces up, and either laughs with her hands on her hips or brushes her shoulder off. Her bells jingle and a ring lights round her. This is how the big spell is charged.
- **Big spell.** Sealed Fate. The flipbook's own opening, then she turns and throws the seal, holds her open hand on the target while her rings turn round it, and closes her fist as they clamp shut. About 5 seconds.
- **Big spell: the ending.** The cast that brings every foe to zero. The same, running on into Curtain Call: a new moon lit between her hands, the ground under her becoming the night sky, a black hole taking what is left of the foe, a new moon rising behind until the sky is stars, and two curtains of night closing as her arms come down. About 13 seconds.
- **Attack taunt.** Two steps of her jig, a twirl with a black hole gathering over her raised hand, the throw, her hand pressing it down on the target, and a laugh.
- **Heal taunt.** Against All Odds, danced: she jigs a full turn with her arms up inside a circle of seven stars, laughs, and their light runs down into her alone.
- **Start the count again** resets the hit count.

**The hit count**
- Three hits charge the big spell the first time, four the next, and so on (Chris's rule in `lore/discussion-notes.md`).
- The ring for each hit was Claude's proposal in the lore doc. It is built so Chris can see it and decide.
- On this page the Big spell button works at any count, so it can be watched without first taking hits. A game would make her wait. The count is kept in the page, not in the model.

**More dancing and jester acting,** in the Moves row
- Caper: four side leaps with her heels together, a turn in the air, a pose.
- Prance: six high-kneed skips, then a heel dug out in front and her arms thrown wide.
- Juggle: three small new moons tossed from hand to hand. It works sitting, kneeling or hovering.

**The look**
- The new moves use the not-HD model's look for her power: holes with the night sky inside, thin cold rings, round star dust, and the square going dark while she stays lit. Gold is only a thread.
- The old six spells keep their own effects. Giving them this look would change them, and Chris asked only for additions.

## Checked

- Every move over every stance: 168 pairs, no errors, no broken numbers.
- Stills of every new move, at phone and laptop size, in the square and the theatre, with glow on and off, and in the Flipbook look.
- The single offline file opens and runs.

## Not checked, and not done

- **Nothing was watched at real speed.** The headless browser here runs at under two frames a second. Timing, the weight of the hit reactions and how the dances read in motion are Chris's to judge.
- Not tried on a real phone. Glow is the new cost there; the switch turns it off.
- Not done: a guard, a real victory and a real defeat, expressions beyond her three mouths and her eyelids, the battle, the wraith and the sound from the not-HD demo.

## Questions for Chris

- Should this page take over the first link?
- Is a ring for each hit the right way to show the charge?
- Sealed Fate now has a throw and a closing fist that the flipbook does not have. Keep them?
- Should the old six spells get the night-sky look too, as a second version of each?
- When the big spell ends the show, should the foe be taken by the black hole, as here, or simply fall?

## For the how-to

These are worth adding to `claude/HOW-TO-3d-witch-models.md` when it is next edited:

- New files: `src/88_void.js` (the night-sky effect building blocks), `src/89_lore.js` (her lore moves), `viewer/square.js` (the square).
- The stage draws the world first in its own scene and her over it with her own lights, so the look tuned in the theatre holds anywhere.
- New moves put their keys through `autoHold`, so a pose is struck quickly. The older moves let a channel drift from rest toward its first key.
- `check_moves.py` runs every move over every stance (about 20 minutes). `seq.py` makes stills of one move at chosen moments on the real page.
- Chris's rule for her: add, never remove a move or a button.
