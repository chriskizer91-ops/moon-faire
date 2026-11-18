# Fights: seeing a blow land, and bars that read

November 14, 2026, 9:20 pm, by the "Fights" session. The newest fights note; read after `claude/fights-director-camera-and-move-picking-screen.md`.

- **Page:** https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi
- **Repo:** branch `claude/moon-faire-fights`, commit `3ed70b2`, `game/fight/`.

## What Chris said (9:00 pm, after playing the director camera and the new move-picking screen)

"Ok so it's hard to see their attacks land and the UI for the fight info needs to be easier to see. The HP bar should read more clearly, not larger, just better color usage."

## Why blows were hard to see, and what changed

- **The cause:** in the director camera a ranged move could land outside the picture. The camera was beside the caster when the blow landed, and only then turned toward the target. The numbers also stayed where they first appeared on the screen when the camera cut.
- **The camera now goes to the target half a second before a move lands,** whatever shot it is in. For a long shot the swing also ends looking along the line to the target, not across it.
- **The shot from behind a target cuts to the side just before the blow,** because the target's own body hid it.
- **A blow that lands now has four signs:** a burst of light where it lands; the picture held for a beat (about a tenth of a second, a little longer for a big blow); a harder camera shake; and the bar of whoever took it flashes white.
- **The numbers** are bigger, pop in, and follow the one they belong to when the camera cuts. A big blow's number is bigger still.

## The bars (the same size, new colours)

- Every bar sits on a black track with a light edge, so it reads over any painting.
- **A witch's HP:** green, amber under half, red under a quarter. Her HP number takes the same colour. Before, it was always orange-red.
- **MP:** blue, with a blue number.
- **A foe's Life:** rose red (it was green, the same green as a wisp's glow). **Fate:** gold, under it. A sealed foe's Life turns to gold stripes.
- **What was just lost shows white for a moment, then drains,** on both kinds of bar.
- Turn chips: witches edged green, foes rose, a coming Heavy, Crush or Eclipse gold on a dark gold ground. The caption on the picture has a dark backing.

## Checked, and not

- `game/fight/checks/hits.py`: a still as each of fourteen moves landed and a third of a second after. In every one the target is in the picture with the burst on it.
- The move-picking test and whole fights still run with no errors.
- **Not checked: anything moving.** The held beat, the shake and the half-second lead are numbers chosen without seeing them move. The numbers over the picture run on real time, so the stills (stepped by hand) do not show them properly.
- The colours were not checked against a colour-blindness simulator. HP always has its number beside the bar.

## For Chris to say

- Whether the held beat and the shake are too much or too little.
- Whether a blow now reads on his phone.
- Which witch animations looked wrong (asked twice, not yet answered).
