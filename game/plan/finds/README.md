# Finds for the bigger game (task board S5)

Made by the "Levelling" session on November 14, 2026. With level 20 as the top (`../levelling/plan-chosen.json`),
what the party finds is the only thing that makes the last gate easier. This folder holds 18 finds, three in each of
the six rings beyond the fair (one on the way, one off the path, one hidden), each with one measurable effect, and
what they are worth, measured with the approved combat engine unchanged.

**A proposal waiting on Chris.** Five finds are the cards already in `game/world/world.json`, unchanged. Thirteen are
new, and every new name and card is a stand-in. `world.json` is not changed.

The page for Chris: `finds.html` (published; the link is in the project note `claude/finds-for-the-bigger-game.md`).

## What is here

| File | What it is |
|---|---|
| `finds.js` | The 18 finds: ring, how hard to find, name, what it does, card words, the picture in words, and the numbers it changes. |
| `finds.json` | The same as the game reads it, with the five existing cards' words and pictures taken from `world.json`. Made by `export.js`. |
| `lib.js` | How a find is applied: each change is one number in the engine's `RULES` (`{path, mul}` or `{path, add}`). The rules code is untouched. |
| `candidates.js`, `each.js` | 26 kinds of find, each measured alone against the fights that can be lost. Results: `each.json`, `each.txt`. |
| `profiles.js` | What a player is likely to carry at each gate (nothing; what lies on the way; also off the path; everything) and what it does there. Results: `profiles.*`. |
| `gentler.js` | The same at half strength. Results: `gentler.*`. |
| `picture-prompts.md` | Prompts for the thirteen new cards' pictures: two sheets of six and one single, after the first item sheet's prompt. |
| `make_page.js`, `thumbs.py` | Build `finds.html`. |

```
cd game/plan/finds
node each.js 4000 > each.txt          # about 2 minutes
node profiles.js 4000 > profiles.txt
node gentler.js 4000 > gentler.txt
node export.js
node make_page.js
```

## What was measured (4,000 fights each; careless / attentive / expert)

The last gate (`B2K2w` at the party's level, level 20):

| She has found | Finds | Full strength | Half strength |
|---|---|---|---|
| nothing | 0 | 6% / 81% / 99% | 6% / 81% / 99% |
| what lies on the way | 6 | 15% / 95% / 100% | 10% / 90% / 100% |
| and what is off the path | 12 | 27% / 99% / 100% | 15% / 95% / 100% |
| everything | 18 | 39% / 100% / 100% | 20% / 99% / 100% |

- The two gates before it are never lost by an attentive player. For a careless one, the lone great wraith goes from
  58% to 85% with everything, and the level-17 gate from 17% to 50% (34% at half strength).
- **HP is the strongest lever:** 2% more HP is worth 3 points to an attentive player at the last gate, 5% is worth 7;
  5% stronger healing is worth 3. As `lore/combat-balance.md` found.
- **MP finds do nothing in one fight** (every fight starts with full HP and MP, `game/world/LORE-BRIEF.md`). So Cold
  lantern glass and The cut thread, as their cards stand, show no help. Chris to say whether they get a new job.
- **The sim's attentive player never uses the Fox's ghost and seldom needs Bloom,** so The spare outline and The
  fourth seed show a gain only for the careless player. A real player who uses them gets more than is measured.
- **Left out:** the Ranger's gem ready a turn sooner (+13 points alone, too strong); the Jester catching a fourth
  blow (no help); getting up for the bow at 50% (no change); a turned-back blow at two and a half times (no change).
- The keeper's charm ("the Jester takes 5% less damage") is measured as 5.3% more HP for the Jester, because the
  engine has no number for damage taken. Against blows that is the same; with healing it is very slightly less.
- Harder than anything in the game: `lore/combat-balance.md`'s hardest fight goes from 43% to 98% for an attentive
  player with all 18.

## Not decided here

Which piece of the map each ring is and where each find lies (F5, S1); how hidden "hidden" is; the names and cards.
