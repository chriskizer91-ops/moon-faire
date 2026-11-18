# Combat: the agreed system (first version)

**Chris, November 13, 2026, after playing the blob battle in different conditions: he likes the balance.** This doc is the combat system as it stands now. It replaces the two earlier drafts (the first numbers draft and the rework proposal), which are summarized under "How it got here".

- **Play it:** *Moon Faire Blob Battle*, https://claude.ai/artifact/EmDURhEiinMwqyfi9DasDx. The rules with no animation: blobs, bars and words, a turn bar, every move, an Auto button for three play styles, and a button that plays 300 fights of each.
- **Its engine:** `lore/sim/blob-battle-engine.js`. Every number below is in its `RULES` block, so the balance can change without touching the rules code. `node -e "const E=require('./blob-battle-engine.js'); console.log(E.runMany('grand',1000,{style:'attentive'}))"` plays 1,000 fights.
- **One teaching scale:** the Jester has 1,000 HP at level 1. Damage and heals swing up to 25% either way. Splash, revive, Fate and the Curtain Call stand-up do not swing.

## Chris's decisions on levels and difficulty (November 13)

- **Encounters at the party's level are balanced as they are.** In the hardest fights every ability is needed, and the balance is good.
- **The game gets easier or harder through simple, obvious things in the game, never by changing the mechanics.** For example, something the party finds that raises its healing by about 5%: a measurable, obvious help, but only a slight increase in its ability to survive. Chris: there should be simple in-game ways to make it more challenging or easier, very simply, without changing the mechanics of the balance.
- **Zones, as in Envoi.** Ordinary foes in a zone can be up to four whole levels above the party. Those are always the weak foes, not bosses.
- **A single boss:** the party has to be within a level of it to win.
- **The big boss at the end of an area:** the party has to be at the same level as that boss.
- **The numbers keep scaling.** With every number growing 20% a level for both sides, the game can keep climbing: the Jester's HP is about 5,000 at level 10, 32,000 at level 20 and 100,000 at about level 26. Chris: "I was raised on anime, and just making the numbers bigger is fun."

What the simulator says about those rules (800 to 1,000 fights each; careless / attentive / expert):

| Test | Wins |
|---|---|
| Three wisps, four levels above the party | 100% / 100% / 100% |
| A knight and two wisps, four levels above | 100% / 100% / 100% |
| The same, before the Jester joins (the other three alone) | 56% / 100% / 100% |
| One boss, at the party's level | 29% / 100% / 100% |
| One boss, one level above | 2% / 98% / 100% |
| One boss, two levels above | 0% / 34% / 92% |
| The hardest fight, one level above | 0% / 0% / 3% |

So the rules hold: weak foes several levels up are fine, a lone boss needs the party within a level, and the big fights need the party at their level.

## Ways to make it easier or harder without changing the mechanics

Measured on the two biggest fights (1,000 fights each; careless / attentive / expert):

| Change | Two bosses, a knight and a wisp | The hardest fight |
|---|---|---|
| As it is | 1% / 52% / 99% | 0% / 42% / 87% |
| All healing 5% stronger | 1% / 54% / 99% | 0% / 48% / 92% |
| Every witch's HP 5% higher | 1% / 60% / 99% | 0% / 59% / 94% |

- A 5% healing find is the gentle kind Chris described: a few points, felt in the hardest fights.
- 5% more HP is much stronger than 5% more healing, because it works on every blow.

**Chris's example, as a hypothetical (November 13).** He likes it as a way the game could be made easier, not as a decision:
- **Three healing amulets,** each raising the party's healing by 5%, 15% in all.
- **Each harder to find:** the first moderately easy, the second pretty hard, the third almost impossible.
- **HP finds of 1–3% each,** for example several finds of 2%.

Measured (1,500 fights each; careless / attentive / expert):

| Finds | Two bosses, a knight and a wisp | The hardest fight |
|---|---|---|
| None | 1% / 51% / 99% | 0% / 43% / 87% |
| 1 amulet (+5% healing) | 1% / 54% / 99% | 0% / 47% / 92% |
| 2 amulets (+10%) | 1% / 56% / 100% | 0% / 52% / 95% |
| 3 amulets (+15%) | 1% / 58% / 100% | 0% / 56% / 96% |
| One +2% HP find | 1% / 54% / 99% | 0% / 50% / 89% |
| Three +2% HP finds (+6%) | 1% / 61% / 99% | 0% / 61% / 95% |
| All three amulets and three HP finds | 2% / 68% / 100% | 0% / 74% / 99% |

- Each amulet is worth about 4 to 5 points to an attentive player in the hardest fight, so the rarest one is a real prize without breaking anything.
- A single 2% HP find is worth about as much as one amulet. HP finds are the stronger lever, so they should stay small, as Chris suggested.
- Everything together takes the hardest fight from 43% to 74% for an attentive player. The fight still needs every ability, and careless play still loses.
- **Ideas for later, not measured:**
  - **Easier:** things found or earned that add a few percent to healing, HP, Fate per blow, or one taunt catch.
  - **Harder:** optional charms that take a few percent off, or simply fighting foes above the party's level.
  - Each would be one number in `RULES`, so the balance underneath stays the same.

## The turn bar

- Nothing is timed. When it is a witch's turn, the game waits as long as the player likes.
- The bar across the top shows the next 8 turns. Wisps acting one after another share one chip.
- **Who goes next** is set by speed. Each fighter waits a number of steps between turns:
  - Ranger 8, Fox 9, Io 10, Jester 11. The Ranger gets about four turns for every three of the Jester's.
  - Wisp 12, knight 11, boss 10. While only one boss stands, it waits 5, so it acts twice as often.
- Each witch's first turn comes after half her wait, and each foe's after its full wait. Ties go to the witches.
- **Foes move in fixed patterns,** so their moves show on the bar ahead of time:
  - A knight's every third action is a Heavy.
  - A boss's every third action is, in turn, an Eclipse or a Crush.
  - A second boss starts one step into its pattern, so the two never line up.
- Chris asked on November 13 for the game to be turn-based "like chess", so nobody is penalized for not clicking fast. It already waits for every move. Whether to keep speeds or switch to rounds is the first open question below.

## How a blow on one witch is settled

In this order:
1. Same Cloth turns back a Heavy or Crush.
2. A confused foe hits the biggest other foe instead.
3. The Fox's ghost takes the blow.
4. The Jester catches it, if she is taunting.
5. Otherwise it lands on its target.

## The four witches

| Witch | HP | MP | Wait between turns |
|---|---:|---:|---:|
| Jester | 1,000 | 60 | 11 |
| Ranger | 480 | none | 8 |
| Fox | 380 | 100 | 9 |
| Io | 420 | 120 | 10 |

MP does not come back during a fight. Below, "wisp / knight / boss" is how much of each foe one use takes; they have 300, 1,000 and 8,000 Life.

### The Jester: the tank and the finisher

| Move | Cost | What it does |
|---|---|---|
| Gilded Rebuke | — | 40 to one foe. No taunt |
| Attack taunt | — | 50 to one foe, and she catches the next 3 single-target blows until her next turn |
| Heal taunt | 10 MP | Heals her 120, and taunts |
| Sealed Fate | — | Ends a sealed foe outright. Every other foe loses 20% of the ended foe's max Life (1,600 from a boss, 200 from a knight, 60 from a wisp). No taunt that turn |
| Curtain Call | — | The same cast, when it leaves no foe standing. Fainted friends stand at 25% HP |

**Fate:**
- Each foe has one bar: Life drains from one end and Fate grows from the other. When Fate reaches the foe's Life, the foe is sealed.
- A blow a foe lands on her gives that foe 500 Fate.
- A Heavy, a Crush or an Eclipse that lands on her gives 1,000.
- A foe struck by its own move through Same Cloth gains 500.
- **Peril dust:** the first time each of her friends drops below half HP, every foe gains 5% of its max Life as Fate.
- If the Jester faints, every foe's Fate halves.

### The Ranger: the fastest hands

| Move | Cost | What it does | Wisp / knight / boss |
|---|---|---|---|
| Bow | — | 150 to one foe | 50% / 15% / 1.9% |
| The gem | — | Two shots of 200, each aimed separately, then 2 of her turns before it is ready again | kills / 40% / 5% |

### The Fox: chaos and control

| Move | Cost | What it does |
|---|---|---|
| Hemline Fangs | — | 50 to one foe |
| Stitch | 8 MP | 160 to one foe |
| Pins and Needles | 12 MP | 80 to every foe |
| Same Cloth | 18 MP | A Heavy or Crush showing on the bar lands on its own foe at double strength, and that foe gains 500 Fate. One per foe; not on a confused foe; then 2 of her turns to rest. A turned Crush is 880 on the boss |
| Crazy Quilt | 20 MP | Wisps lose their next 2 actions and knights their next 1: their blows land on the biggest other foe. Bosses are immune. Then 3 of her turns to rest |
| Borrowed Face | 10 MP | A ghost takes the next 2 single-target blows, marked ones too. One at a time |
| Slip Stitch | — | The party leaves at the start of her next turn, if she is still standing. Never while a boss stands. Not yet tested |

### Io: the healer

| Move | Cost | What it does |
|---|---|---|
| Harvest Crescent | — | 40 to one foe |
| Thorn | 8 MP | 180 to one foe |
| Mend | 10 MP | Heals one friend 250, at once |
| Bloom | 14 MP | Heals every friend 60 at the start of each of her next 3 turns. Does not stack |
| Deity | 20 MP | Arrives at the start of her next turn: 220 to every foe. Once a fight |
| Revive | 24 MP | Brings a fainted friend back at 30% HP |

## The foes

| Foe | Life | Wait | Moves |
|---|---:|---:|---|
| Wisp | 300 | 12 | A blow of 50 |
| Knight | 1,000 | 11 | A blow of 100. Every third action a Heavy: 200 on one witch, shown ahead |
| Boss | 8,000 | 10 (5 when it is the only boss) | A blow of 130. Every third action, in turn: Eclipse, 110 on everyone and 25 more each time; then Crush, 440 on one witch |

The answers to a big move:
- **Heavy and Crush:** the Jester's taunt, Same Cloth, or Borrowed Face.
- **Eclipse:** only healing, but it charges her Fate when it hits her.

## The fights and how they play

Each fight was tuned to a target for three kinds of player, as Envoi's balance report does:
- **Careless:** random moves.
- **Attentive:** sensible, but only reacts to big moves about to land.
- **Expert:** reads the whole bar.

Wins in the blob battle's engine, 1,500 fights each (careless / attentive / expert):

| Fight | Wins | Chris's moment |
|---|---|---|
| Three wisps | 100% / 100% / 100% | |
| A knight and two wisps | 100% / 100% / 100% | |
| One boss and three wisps | 29% / 100% / 100% | 22% / 16% / 8% |
| Two bosses, a knight and a wisp | 1% / 52% / 99% | 0% / 27% / 10% |
| Hardest: two bosses, two knights, three wisps | 0% / 43% / 87% | 0% / 29% / 34% |

- **Chris's moment** is a fight won on Curtain Call against a boss still above half its Life, with two or more of her friends under half HP.
- The consultants' own simulator gave the same within a couple of points, except experts in the hardest fight (75% there).
- Fights take about half a minute for wisps, about two minutes for one boss and about three for the biggest.
- Before the Jester joins, the other three win the small fights 100% of the time.

## Open questions

1. **Turn order.** Keep the speed-based turn bar (no clock, but the Ranger gets more turns and a lone boss acts twice), or switch to rounds where everyone acts once? And if rounds, the party's side then the foes', like chess, or everyone in one fixed order?
2. **The two-boss fight.** An attentive player wins about half. That suits an optional fight; Envoi aimed story gates at 80–96%. The second consultant found the lever is how clearly the bar warns, more than any number.
3. **The Jester's Gilded Rebuke is a dead button:** her attack taunt is always better.
4. **She is the whole win condition in the big fights.** With Fate switched off, nothing beyond one boss is ever won.
5. **Drama against hit size.** A bigger boss makes the moment more common but each hit a smaller share. The Ranger's bow is about 2% of a boss.
6. **Untested:** Slip Stitch in play, and any Stop or haste effect.

## How it got here

1. **First draft** (November 13 morning): HP and spell numbers from the old lore rules, tested in `lore/sim/moonfaire_sim.py`. Chris set it aside: rework from the fundamentals, keep only the animations.
2. **Rework:** the turn bar with big moves shown ahead, and Fate eating the foe's bar from the far end.
3. **A teaching scale,** with the Jester at 1,000 HP. Chris saw that the others faint without her taunt and that hits were a small share of a foe. He asked about splash, so Sealed Fate now splashes 20%.
4. **Two consultants went three rounds:** one on the numbers, one from the player's seat.
   - Envoi's balance method came in: a target per play style for every fight, with Chris's rule for a formidable foe (a decent player beats one below their level, about half at their level, seldom one above).
   - They agreed on everything here. On boss size, they differed only between 8,000 Life and 7,200 with a harsher Eclipse; both played within a few points.
5. **Chris played the blob battle and approved the balance.**
