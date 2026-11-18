# Night of No Moon: the square (3D demo game)

Live game: https://claude.ai/artifact/MVSWShCc6GTQJZCYhGs1fD

Turn-based since the evening of November 11, 2026. Chris asked for the game to be turn-based, and to take a demo piece from *Envoi on the Longest Night* now that the witch can look this good in 3D. He wants to repurpose that whole game.

**The piece taken is Envoi's first fight:** one hero against the Shadow Wraith in the night square. The 3D Jester (`claude/jester-game-model.md`) stands in the witch's place, with her own six moves as her commands.

**November 12: this page is now a test of how she looks, not a game being balanced.** Chris said she is the only character for now, and that he is building the way she looks and moves; balance comes later. He asked for two wraiths in the scene (so there is enough in the picture to see how it holds up), a pulled-back camera that watches the whole field, and darker, more dramatic spells (see "The look of her power" in `claude/jester-game-model.md`). The numbers below are placeholders.

**Chris's decision, later the same evening: the Jester is the most powerful of the four, overwhelmingly so. Her power ends fights.** He sent the picture of all four with their sheets (in the repo at `models/jester-not-hd-3d/refs/sheets/four-witches-group-and-sheets.png`). The decision is also in the repo's `CLAUDE.md`. The rules below were rebuilt around it, and a fight takes about half a minute when she is played well.

Source: repo `chriskizer91-ops/moon-faire`, branch `claude/jester-not-hd-3d-model`, folder `models/jester-not-hd-3d/viewer/`:

- `battle.html`: the page. The staging: the camera, her casts, the wraiths' moves, the windows.
- `rules.js`: every number and rule. The page and the simulator both play from it.
- `envoi/wraith.js`: Envoi's 3D Shadow Wraith, unchanged. `envoi/foe.js` fits it to these pages. `envoi/snd.js`: Envoi's sound effects and battle theme, plus the Jester's cues and the chapel bell.
- `game.html`: the first, real-time version (three waves, flat foe pictures). Kept in the repo, no longer published.

## What came from Envoi

- **The rules' shape:** each side has a turn gauge, time waits while anyone acts or chooses, there are no dice, every amount is set and swings up to 25% either way, taking hits fills a Trance gauge, and everything grows 20% a level (Envoi's `docs/design-decisions.md`).
- **The Shadow Wraith,** as Envoi's own code-built 3D model with its own motions, the moth rising on defeat, and its fiercer look at higher levels.
- **Its four moves with Envoi's level 1 numbers,** grown 20% a level like everything else: Soul Reaper 190, Soul Bolts three of 70, Shadow Grasp 250, and Eclipse 480 once it is below 35% HP. 4,200 HP each. A wraith's turn gauge fills in 3.2 seconds, hers in 2.4. There are two of them, at her own level.
- **The sound:** every effect and the battle theme, all made in the browser.
- **The look of the windows:** command menu, status window, enemy window, banner, damage numbers, end cards.

Not brought over: Io, Sol, Lunara and the Summon command; the painted backdrop (the fight is in the 3D square built for the Jester, so the camera can move); and any of Envoi's story. The words on screen follow Moon Faire's own `docs/stories/a-fools-mercy.md`: the chapel bell tolls, a Shadow Wraith climbs out of the graveyard, the bell counts Doom down, and defeat is release.

## Her commands

Level 1 numbers. 1,000 HP and 100 MP. MP does not come back during a fight.

| Command | MP | What it does |
|---|---:|---|
| Attack (Gilded Rebuke) | 0 | 220 |
| Sealed Fate | 18 | Doom on one wraith. When that wraith has taken three turns, it is released, however much HP it has |
| Hush | 12 | The wraith cannot cast for its next two turns (it can only use Soul Reaper), and its turn is pushed back |
| Gravity | 24 | A quarter of the HP it has left, with no upper limit |
| Against All Odds | 26 | Heals 20% of her HP and quickens her next two turns. The heal is doubled at or below 40% HP |
| Defend | 0 | Halves what hits her until her next turn |
| Curtain Call | 0 | Her Trance, when the Curtain gauge is full: Doom lands at once on every marked wraith. Any wraith not marked takes three blows of 1,040. She gets a ward that soaks up 250 |

How the decision shows:

- **Doom ends the fight.** This is what her move sheet (`assets/design/moves_v03.json`) already says Doom does to an ordinary foe. A boss would only be wounded by it (the rule is there, switched off for the wraith).
- **Curtain Call lands Doom at once,** and her Curtain gauge fills sooner than Io's Trance does, so most well-played fights end on it.
- **She meets two wraiths alone.** Her Attack barely scratches them. (The earlier single wraith four levels above her is gone; the rule for it is still in `rules.js` as `ahead`.)
- **What holds her back:** she is the frailest of the four, Doom takes three of the foe's turns, and her MP does not come back. So the fight is staying alive while the chapel bell counts.

Aimed commands (Attack, Sealed Fate, Hush, Gravity) ask which wraith. Winning gives a level. The top level is 20.

## Does choosing matter?

`tools/sim_battle.mjs` plays 4,000 fights for each kind of player (two wraiths, November 12):

| Player | Wins |
|---|---:|
| Marks each wraith with Doom, then stays alive; takes Curtain Call when it is ready | 100%, in about 3 of her turns |
| Marks each with Doom, then just attacks | 96% |
| Picks at random | 10% |
| Only attacks | 0% |

Played right she cannot lose, which is the point. A player who never uses her power loses. None of this is tuned; it only shows the rules hold together with more than one foe.

## For the other three

Nothing is built for them yet. What this fight suggests for a party of four: the Ranger, the Herbal Witch and the Fox fight the way Envoi's party does, by wearing a foe down and keeping each other standing, and the Jester is the one whose turn ends things, at the price of being the easiest to drop and the slowest to pay off. Their job in a fight would be to keep her alive while the bell counts. This is a suggestion for Chris, not a decision.

## Staging

- **One camera, pulled back, that holds the whole field the whole time.** It never cuts. It leans a little toward whoever is acting, and when the edge of the square stops it backing away it widens its lens instead. Tall screens look over her shoulder from higher up; wide screens see the fight from the side. Dragging the picture turns the view.
- The two wraiths carry a small I and II over their heads, and a gold hoop shows which one is being aimed at.
- A marked wraith carries its Doom over its head: a small black sun with one point of light circling it for each turn left. When Doom lands, a pit of night opens under the wraith, a black hole drops onto it and swallows it, and the square goes almost black.
- The wraiths' moves use her spell building blocks in soul-green: bolts that fly, a circle and column under her for Shadow Grasp, a black sun for Eclipse.
- She flinches when hit, crouches inside a gold shell to defend, kneels when beaten and raises her arms when she wins.
- Pixel finish and sound switches are at the top right.

## Checks

`tools/smoke_battle.mjs` plays the page itself in headless Chrome with stills. On November 12, with two wraiths: a careful player won in three turns at phone size (390x800), laptop size (1280x720) and a phone on its side (844x390, pixel finish), with no errors. A player told to avoid Doom and Curtain Call lost, and in losing showed Gravity, Hush, Against All Odds, Defend and Attack, and the wraiths' Soul Reaper, Soul Bolts and Shadow Grasp. Eclipse was not seen this time.

## Not there yet

- Claude has not seen or heard it on a real device. The sound in particular has only been checked for errors, not listened to.
- She has no hurt, guard or victory motion of her own yet: the flinch is a lean, the guard is her squat, the win is the arms-up test clip.
- In pixel finish only she is pixelled; the wraiths stay smooth.
- On a phone held on its side the windows take most of the screen, and the field is a small band at the top.
- Two wraiths, one fight. Envoi's plan has more: wisps and a second party member, the great wraith, Halcyon, the finale, walking maps and the airship.
- Her other four moves from the sheet (J02, J05, J07, J09) have no clips, so they are not commands.

## If the whole of Envoi is repurposed

What this demo shows can be reused as it stands: Envoi's models run on the newer three.js with the bloom pipeline through `envoi/foe.js` (the wisp, great wraith, Halcyon and Noctara should come across the same way), the rules sit in one file with a simulator, and the staging scripts run on a game clock. Open questions for Chris: whether the party is the four Moon Faire witches (his picture of the four suggests so, but he has not said it in words), whether the fights stay in the 3D square or go back to painted backdrops, and whether Envoi's story or Moon Faire's is the one being told.
