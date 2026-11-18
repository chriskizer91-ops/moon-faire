# Fights: the number after the blow, the zoom-away, the laptop corner, and the wide spells

November 15, 2026, about 2 pm, by the "Fights" session. The newest fights note; read after `claude/fights-zoom-out-and-slower-pace.md`.

- **Page:** https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi
- **Repo:** branch `claude/moon-faire-fights`, commit `f0f8aed`, `game/fight/` (its `README.md` has every step in order).

## What Chris said (1:03 pm)

"Camera is perfect except a tiny zoom away when attacks land. If we could look for that and fix it. Then the attack damage number should be moved to the end of the attack landing so that when an attack is happening, it doesn't tell you how much damage is from it until after the attack has landed. So like a beat pause after the attack lands and then damage. If multiple hits happen, you could show each like damage from those hits adding up to the total damage using the battle sequence from Envoi and the Longest Night. On the phone, the UI is good. On the laptop, the witches, stat boxes, and cast and spell buttons running across the whole of the screen is too much. It should be condensed to like the bottom right hand corner. You also can't see the deer summons and other wider shots on some of the spells. I think being specific on how wide the shot is for certain spells will be good so that all of the animation gets captured."

So: **the director camera is approved** ("perfect"), and **the phone layout is approved** ("good").

## The zoom-away: what it was

- The camera's extra 25% distance was measured, every picture, from the point the camera looks at. As a blow landed the camera turned to the target; that point moved away, and the camera backed off with it.
- A shot held between moves was also pushed back again every picture.
- The extra distance is now taken once for each shot and held.

## The number comes a beat after the blow

- **As it lands:** the burst of light, the held picture, the shake, the flinch, the flash on the bar. No number, and the bar does not move.
- **0.45 seconds later:** the number, and the bar drains. A foe that is ended falls when its number is told; a witch faints then too.
- **Several blows on one fighter in one move:** each number sits a line above the last, as Envoi's battle screen stacks them, and after the last one the total is told in gold with the word "total". (Envoi itself stacks the numbers and tells no total; the total is new here.)
- A move does not end until its numbers have been told.

## The laptop layout

- On a screen 900 pixels wide or more, the picture takes the whole window. The witches' boxes, the help line, the moves and Cast are one card in the bottom right corner (430 pixels wide). During a move the card shrinks to the witches' boxes.
- The middle of the picture moves left and up so the action is not behind the card.
- The gear and the caption are in the bottom left. The phone layout is unchanged.

## Wide spells

- **Every move was measured.** `game/fight/checks/measure.py` plays each witch's move and measures the room it takes up: how far toward the target, how far to each side, how high. The numbers are in `game/fight/spell_extents.js`.
- **Six spells get a shot sized to hold all of that room,** plus whoever they are aimed at: the Elderwood Guardian, The Moon's Little Lie (the moon rises 6.5 m), Crazy Quilt, Borrowed Face (the ghost goes 7 m toward the foes), the Jester's Heal taunt, and Curtain Call. The list is `WIDE_SPELLS` in `fight.js`. Curtain Call's room was set by hand, because it only plays in the last fight.
- The other moves keep the shots Chris approved.

## Why the deer was never seen

- The fight thought the Guardian struck at 9.4 seconds. Io's model strikes at 13.02 (planting to 7 s, the stag arriving to 11.6 s, then its leap). So the camera left for the target while the stag was still growing behind Io.
- She also stood 4.2 m from her target; her model is built for 1.8 m, so the stag's leap fell short.
- Both are corrected. In the stills the stag stands beside her with its antlers above her hat, then leaps and wraps the foe in vines.

## Also fixed

- A witch who walks up to a target (Io, the Fox) used to stop on top of another foe if one stood in the way. She now comes round to one side.

## Checked, and not

- The number's beat by the clock: a blow at 5.53 s, its number at 6.00 s; the second at 7.47 s, its number at 7.93 s; the total at 8.57 s.
- Stills of the laptop layout, the phone layout, the stag at four moments, and each wide spell early, middle and late. The move-picking test and the last fight ran with no errors.
- **Not checked: anything moving,** so whether the zoom-away is fully gone to Chris's eye is his to say. The cause found matches what he described.
- For anyone writing a check: Io's and the Ranger's models never advance more than 0.05 s a step. Step them at 1/30 s or finer, or their animation falls behind the fight's clock.

## Still open with Chris

- Which witch animations looked wrong (asked twice, not answered; the Guardian may have been one).
- Whether the beat before the number (0.45 s) is the right length.
