# Night of No Moon: the Jester's mini JRPG

Built October 18, 2026. Live game (claude.ai artifact): https://claude.ai/artifact/JoP7S96fhVk4kD9JW751C4

A short FF9-style game starring only the Jester. It takes about 15 to 25 minutes to play: the Moon Faire deck, the Gloomfen Boardwalk with random encounters, then the Misthollow Stage and a two-phase boss. It uses her real frames from the flipbook (HD webp and the 128 pixel sheet). Enemies and backgrounds are drawn in code.

## What it uses from the art

| Clip | In the game | Fires on frame |
|---|---|---:|
| idle, walk_right/left, walk_toward, walk_away | 4-way field walking, battle idle | — |
| gilded_rebuke | Rebuke (basic attack) | 5 |
| sealed_fate | Doom 3 on one enemy, 15 MP | 16 |
| gravity | The Weight of Night: −25% current HP (−12.5% on the boss), 35 MP | 11 |
| hush | Light damage to all enemies and silence for 3 turns; cancels the boss's charge. 12 MP | 17 |
| against_all_odds | Regen (stronger at low HP) and haste for 30 s, 25 MP | 4 |
| curtain_call | Trance-style ultimate: ends every Doom mark, hits every enemy, sets a 25 s ward. Spends all her MP | 32 |

The Ranger, Herbal Witch and Fox appear as NPCs on the deck, using their first frames (J01, M01, X01).

## Size and quality controls

- **Quality:** HD, Pixel 128 (the shipped sheet), plus Pixel 96, 64, 48 and 32. The game makes the smaller sizes on the fly from the HD frames, snapped to the sheet's 56-colour palette.
- **Size:** a slider from 40% to 160%.
- **Pixel scene:** draws the whole battle or field at the sprite's pixel size.
- **Sprite Theater:** plays any clip in every version side by side, either scaled to the same height or at its real on-screen size.

## Calls I made that the docs didn't settle

- Doom counts the enemy's own turns (3), following the Spellbook, rather than the handoff's 20 s timer.
- Curtain Call is gated by a "Curtain" gauge. It fills over about 15 s of battle time and faster when she takes damage. This stands in for the handoff's 15 s unlock and makes it feel like a trance.
- Her MP pool is 60 at level 1 (Spellbook), not 100 (moves_v03). She regenerates 0.8 MP/s (moves_v03).
- The Fool's Privilege: her turn gauge starts full in every fight.
- Battle clock: Wait mode (default) pauses while her menu is open. Active mode keeps it running.
- The boss, "The Unstrung", the enemies and every line of dialogue are placeholders I invented. Rename freely.
