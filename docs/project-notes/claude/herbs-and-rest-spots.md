# Herbs and rest spots: fights that start with the HP and MP the party has (task board F9)

November 15, 2026, by the "Levelling" session. Read after `claude/chris-nov15-herbs-testers-foes-big-bad.md` and `claude/the-eight-testers.md`.

- **Page for Chris:** "Moon Faire herbs", https://claude.ai/artifact/AniF3xsyjHNUnyKG3sYvYV
- **Where it is:** repo `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (commit `46a85d5`), folder `game/plan/herbs/` (start with its `README.md`). Pushed.
- **The plan the game reads:** `game/plan/herbs/herbs-chosen.json`.

## What Chris chose (November 15)

His words, 12:56 pm: "You should be able to bulk give HP and MP herbs to the whole party at once, not just who needs them. Like, top everybody up outside of a fight. With the ability for the bag of herbs she's carrying to be very high. I also think easy, medium, hard and crazy, an option could pop up before the final fight, which would then make the final fight either 20, 21, 22... could we make it a level 22.8 instead of 23. Yes MP herb is 20, and I think steady for the plants between fights, but then a player could just harvest more in a safer zone and prepare for a harder area. The game teaches the player early on that if you don't top up between fights, you don't win fights."

| Thing | Chosen | When |
|---|---|---|
| A fight starts with | the HP and MP the party has | 7:38 am |
| HP herb | 60 HP on the scale where the Jester has 1,000 (half the weakest heal, by his rule) | 7:38 am |
| MP herb | 20 MP | 12:56 pm |
| Where herbs come from | she picks wild plants on the moor and Io makes them | 7:54 am |
| How many plants | steady: about 1 HP plant and 2 MP plants to pick for every walking fight (about 180 and 350 in the game) | 12:56 pm |
| Outside a fight | one press, "top everybody up", for the whole party. Herbs are how the party heals between fights | 12:56 pm |
| The bag | very big: no limit a player will meet, so she can pick ahead in a safer ring | 12:56 pm |
| In a fight | a herb can be eaten; it takes that witch's turn | 7:38 am |
| Rest spot | refills everything for free; to be placed with care | 7:54 am |
| The last fight | the game offers easy, medium, hard and crazy: its foes at level 20, 21, 22 or 22.8 | 12:56 pm |
| What the game should teach | early on, that if you do not top up between fights you do not win | 12:56 pm |

## Still open, for Chris

1. **A witch who fainted.** As built she gets up after a won fight with 10% of her HP. Made up by this session.
2. **Where the game teaches topping up.** It does not happen by itself early: a party that never eats a herb still wins about 31 fights in a row in ring 1 (23 on an unlucky run) and 18 in ring 2; it only bites in ring 3 (9). Suggested: a taught moment at the fair. The three set fights there do not refill her, and after the second the game shows "Top everybody up".
3. **The careless player in the far rings.** Herbs do not save her: about 3 fights from a rest spot in ring 6 whatever she carries, because she loses those fights outright. Hard game, or a gentler main path?
4. **A rest spot right before the last fight?** The last-fight numbers assume she meets it with everything full.
5. **The two play styles.** "Bold" is only a weaker player, with or without herbs. Drop to five testers?

## The last fight at the four settings

Today's last fight stands in for the big bad. The party is level 20 and meets it fresh. 3,000 fights each; wins with nothing found / with all 18 finds.

| Tester | Easy, level 20 | Medium, 21 | Hard, 22 | Crazy, 22.8 |
|---|---|---|---|---|
| very careless | 2% / 11% | 0% / 1% | 0% / 0% | 0% / 0% |
| careless | 6% / 20% | 0% / 1% | 0% / 0% | 0% / 0% |
| attentive, careful | 81% / 98% | 3% / 13% | 0% / 0% | 0% / 0% |
| attentive, bold | 54% / 84% | 3% / 9% | 0% / 0% | 0% / 0% |
| focused, careful | 96% / 100% | 35% / 65% | 0.4% / 6.5% | 0% / 0% |
| focused, bold | 77% / 92% | 15% / 37% | 0% / 0.1% | 0% / 0% |
| expert, careful | 99% / 100% | 91% / 97% | 27% / 80% | 0.1% / 3.6% |
| expert, bold | 97% / 100% | 67% / 84% | 8% / 50% | 0% / 0.7% |

Crazy at 22.8 is "just barely": a careful expert who has found everything wins about one try in 28. At a flat 23 she won 1%.

## The chosen rule, measured

Careful attentive player, steady plants, tops everybody up to full after every fight. 200 runs each. Fights won from a rest spot before the first loss: the unlucky 1 in 10 / the usual run. "40" means still winning at 40.

| Ring | Bag empty when she sets out | 10 HP + 20 MP herbs | 20 + 40 | 40 + 80 |
|---|---|---|---|---|
| 1 to 4 | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| 5 | 10 / 33 | 21 / 40 | 29 / 40 | 40 / 40 |
| 6 | 5 / 11 | 12 / 19 | 19 / 26 | 34 / 40 |

- **Picking ahead works as Chris pictured.** With 40 HP herbs and 80 MP herbs in the bag she crosses most of ring 6 (42 fights) without a rest spot.
- **Rest spots inside the rings, for a player who does not stock up:** ring 5: 3, ring 6: 6. None are needed inside rings 1 to 4. Every ring also has one where it begins.
- **What she eats a fight** (HP herbs, MP herbs): ring 1: 0.5, 2.8; ring 2: 1.4, 3.1; rings 3 and 4: 2.2, 3.7; ring 5: 2.6, 4.1; ring 6: 3.1, 4.7.

## What was found

- **MP runs out, not HP.** Io's Mend turns 10 MP into 250 HP, so a party with MP is a party with HP. This is why the two MP finds matter now.
- **With no herbs at all,** a careful attentive player wins 23 / 31 fights in a row in ring 1, 12 / 18 in ring 2, 6 / 9 in rings 3 and 4, 4 / 6 in ring 5 and 3 / 4 in ring 6.
- **Herbs do not save a careless player in the far rings** (ring 5: 3 / 6; ring 6: 2 / 3, whatever she carries).
- **"Bold" (topping up only part of the way) saves almost no herbs and is much less safe.**
- **The other ways to set the plants,** for reference: sparing (0.5 HP + 1 MP a fight) needs 20 rest spots inside the rings; generous (1.5 + 3) needs 3.
- **The earlier numbers were the best case.** The levelling hours and the finds assumed fresh fights.

## The approved engine is not changed

A fight is set up by the engine, the party's HP and MP are set to what it carries, and the fight runs through the engine's own functions with the eight testers. A fresh fight played this way is the same fight, turn for turn (checked over 200 fights). The engine takes a fraction for the foes' level, so 22.8 needs nothing new.

## For the other sessions

- **Open world (task board M10):** two kinds of plant she can pick, at about 1 HP and 2 MP for every walking fight; rest spots that refill the party; three more inside ring 5 and six inside ring 6, once F5 says where the rings lie.
- **Fight piece (F12):** always pass `party` in and out; a herb as a move; a fraction for the foes' level; the four settings before the last fight.
- **Menus (G3):** the bag, and "top everybody up".
- **Herb cards:** two are needed (an HP herb and an MP herb). Chris has offered to paint them; no prompts are written yet.

## Not done yet

- A whole playthrough of the chosen plan with herbs and rest spots for the testers: fights, losses, hours.
- The finds tuned again under the new rule.

## How to run it again

```
cd game/plan/herbs
node run.js 200 20 > results-mp20.txt     # every ring and tester, six rates of plants; two minutes
node chosen.js 200 > chosen.txt           # the chosen rule, empty bag and stocked
node ../testers/lastfight.js 3000 > ../testers/lastfight.txt
node make_page.js                         # builds herbs.html; republish it to the link above
```
