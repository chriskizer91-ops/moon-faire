# Fights: zoomed out 25%, and a tenth slower

November 14, 2026, 9:30 pm, by the "Fights" session. The newest fights note; read after `claude/fights-seeing-blows-land-and-bar-colours.md`.

- **Page:** https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi
- **Repo:** branch `claude/moon-faire-fights`, `game/fight/`.

## What Chris said (9:16 pm)

"If you can make the camera angles be exactly like that but zoomed out 25%. And I think you should slow down the pacing of like how moves are executed and followed through by like 10% slower."

"Exactly like that" is his approval of the director camera's angles (`claude/fights-director-camera-and-move-picking-screen.md`), after the change that puts the camera on the target before a blow lands.

## What was built

- **Zoomed out 25%.** The director's camera stands a quarter further from what it looks at, along the same line. Every angle is unchanged, and everything is a fifth smaller in the picture. It is one number, `zoomOut: 1.25`, in `MF_FIGHT.settings` (or passed to `MF_FIGHT.start`).
- **A tenth slower.** The whole fight runs at 0.9 of the models' own timing: the moves, their follow-through, the walk to a target and the pauses between. It is one number, `pace: 0.9`. The Speed choice in the fight multiplies it, so "1×" is now this pace.
- The fight's opening on the sharp painting and the older cameras in the menu are not zoomed.

## Checked, and not

- Stills of a witch's turn, three moves, the bow and the phone layout at the new distance. Whole fights ran with no errors.
- **Not checked: how the slower pace feels.** The test browser cannot show motion.

## Still open with Chris

- Which witch animations looked wrong (asked twice, not yet answered).
- Whether the held beat and the shake when a blow lands are right.
