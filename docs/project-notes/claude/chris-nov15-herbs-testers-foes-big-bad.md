# Chris, November 15, 2026: HP and MP carry over, Io's herbs, more testers, the bramble foes, the big bad

Written down by the "Levelling" session from what Chris said at 7:38 and 7:40 am, in answer to the finds page. **Every session that touches fights, foes, finds or the story should read this.** His words are quoted; what they mean for the work follows each.

## 1. A fight starts with the HP and MP the party has

> "We can make it so that fights don't start with full MP. They start with whatever MP you have. Then we have to add items for refilling your MP and HP after a fight. So then that adds like resource management."

- **This overturns a settled rule.** `game/world/LORE-BRIEF.md` and the first plan say "Every fight starts with full HP and MP". From now on a fight starts with what the party has left, both HP and MP.
- Everything measured so far (the levelling options, the finds, the gates) assumed fresh fights. Those numbers are the best case now, and the whole-game numbers have to be measured again once herbs exist.
- The fight piece already passes `party` (each witch's HP and MP) in and out of `MF_FIGHT.start`, so the page can do this today. Task board F12.

## 2. Io's herbs

> "It would be herbs made by Io that heal the MP and HP. That have to be individually less beneficial than any spells that could be done in combat. You could use the herbs in combat but they're only half as good as like the weakest healing spells. But then after a battle you would like, okay, let's use six of those HP herbs and four of those MP herbs."

- Two kinds: an **HP herb** and an **MP herb**, made by Io.
- **One herb is worth less than any spell.** Used in a fight, a herb is half as good as the weakest healing spell.
- **They are mostly used between fights, several at a time** ("six of those HP herbs and four of those MP herbs").
- **Not said yet:** how big a herb is in numbers, how many she can carry, how she gets more, and whether a rest spot refills everything. Task board F9 works these out and brings Chris options with numbers.
- For reference, the healing spells in the approved engine at the level-1 scale (the Jester has 1,000 HP): the Jester's own heal 120, Io's Mend 250, Io's Bloom 60 to each friend three times. The weakest single heal is the Jester's 120, so by Chris's rule an HP herb used in a fight is worth about 60.

## 3. More pretend players for testing

> "We might need to work on the AI that's playing the game as a test. We need a variety of game testers, so when we test the game instead of just three versions, five levels of attentiveness and two variations of the three most attentive, so that's eight total levels. It would be like very careless and careless, then attentive, focused and expert, and those three are split into two different play styles. I am less sure about that one."

- **Five levels:** very careless, careless, attentive, focused, expert.
- **The top three each in two play styles,** eight testers in all. Chris is less sure about the two styles, so they are to be shown to him as a proposal.
- Today's three (careless, attentive, expert) are in `game/plan/sim/blob-battle-engine.js`. Known gaps the new ones should close: the attentive player never calls the Fox's ghost and seldom uses Bloom, and nobody manages herbs yet. Task board F10.

## 4. The finds

> "I say half strength for the power of the found items. And I really don't even like that finding all of the items gets you that close to a guaranteed win."
> "I think the two MP items have a reason to be there if you do have to recharge your MP after the end of a fight."
> "The names and cards work good."

- **Half strength** is chosen, and is in `game/plan/finds/finds.js` (commit `38db67c`).
- **The names and cards of all 18 are approved.** They are no longer stand-ins.
- **The two MP finds stay as they are.**
- Chris sent the thirteen new pictures; they are in `game/art/items/`.
- The strength is to be tuned again against his aim in part 6. Detail: `claude/finds-for-the-bigger-game.md`.

## 5. The foes of the moor

> "The Envoi game we have used the wraiths from has two different levels of bramble foes, and I think the wraiths should be level 1 to 10. The bramble mobs from Envoi, the two different levels, with wraiths mixed in there, should be 11 to 20."

- **Levels 1 to 10: the wraith family** (wisp, Shadow Wraith, great wraith), as now.
- **Levels 11 to 20: Envoi's two bramble foes, with wraiths mixed in.**
- This answers task board F3. Still to do there: bring the two bramble foes over from `chriskizer91-ops/envoi-on-the-longest-night` as models with light versions, and give each its numbers for the combat engine. Until they have numbers, F5 (which foes are met where) can only be laid out, not measured.
- In the chosen levelling plan, levels 11 to 20 are rings 4, 5 and 6.
- The repo's own rule still holds: Envoi's foes and art may come over; Envoi's retired lore does not.

## 6. The big bad

> "Then I think we should come up with a big bad that is always one or two levels above the player, like at the end. That's a whole other thing, putting a note in for that."
> "Having a big bad that's always one or two levels above, like set at level 21 or level 22 compared to the player's max, which is level 20, means the whole game can be experienced by different levels of players, but that you have to really try very hard to win the game."
> "I like that an expert player can just barely beat the final fight when the final fight foes are two levels above, which means that it should only be that the expert player can do that with like all of the found items, because that is an expert player: one that has found everything in the game before doing the final fight."

- **A big bad at level 21 or 22,** against a party whose top level is 20.
- **The aim:** anyone can play through the whole game; winning it takes real effort; only an expert who has found everything should just barely win.
- **Who or what the big bad is has not been said.** It is a note for later, by his word. Task board F11.
- **Where today's last fight stands against that aim** (the great wraith, two Shadow Wraiths and two wisps, with its foes moved up; fresh fights; 3,000 fights each; careless / attentive / expert):

| Its foes are | No finds | All 18 finds at half strength |
|---|---|---|
| level 20 | 6% / 81% / 99% | 20% / 98% / 100% |
| level 21 | 0% / 3% / 91% | 1% / 13% / 97% |
| level 22 | 0% / 0% / 27% | 0% / 0% / 80% |
| level 23 | 0% / 0% / 0% | 0% / 0% / 1% |

  At level 22 nobody but an expert wins, which fits. But the expert wins 27% with nothing and 80% with everything, which is more than "just barely". His aim sits between 22 and 23 for this line-up, so a big bad at 22 would need to be a little tougher than today's last fight. All of this moves again once HP and MP carry over.

## What changes on the task board

- F3: answered (the bramble foes). F5 waits on their numbers and on F9.
- New rows: F9 (HP and MP carry over, and the herbs), F10 (the eight testers), F11 (the big bad, a note for later), F12 (the fight piece under the new rule).
- S5 (finds): answered; one tuning pass left after F9.
