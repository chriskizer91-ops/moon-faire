# Moon Faire: the talk kit (what the fair folk say, and when)

The one sheet every writer of fair folk lines works from. Written November 14, 2026 by the "Fair folk minds" session for task board row S4. Chris's decisions on it are marked **Chris**.

## What we are making

A bank of written lines for the twelve people the Jester can talk to: the eleven fair folk and the airship captain. Each line carries tags saying when it fits. While playing, a small picker reads what has happened so far and chooses the best fitting line the person has not said yet. Nothing is written while playing: every line is here, in data, where Chris can read it.

- **Chris: the player is the Jester.** The other three (the Ranger, Io, the Fox) walk with her. The fair folk speak to the Jester, and can speak of "you four" or of one of the others standing beside her.
- **Chris: 40 lines a person.**
- **Chris asked that a line can depend on:** how many times she has talked to that person, whether she has talked to other people, how far the game has got, and what level the party is.

## Read these first (all in this repo)

- `game/world/world.json`: the evening. Read all of it: `story` (ten beats), `chosen` (the four acts), every area's `people` (where each stands, what they are doing, their three or so lines today) and `happens`, `captain`, `finds`, `invented`.
- `game/people/npc/review.md`, the "Review" part: what each person looks like.
- This sheet.

Do not read or use the sibling games' lore. Envoi's retired lore stays out (the Drowned Mother, Old Snuff, the mandrakes, Mother's Hollow).

## The world, as far as a line may lean on it

- The Moon Faire is an ordinary travelling fair. It is called that because it follows the moon round the world. It is the most mixed company anywhere: every trade, every country, every way of living. Tonight it stands on a moor it will never stand on again. Tomorrow it is on the road.
- The four are the fair's own: a troupe who travel with it and are due on stage tonight, after the ballad-singer. Everyone at the fair knows them, knows they have magic, and thinks nothing of it. The fair folk have known them for years. They have not, until tonight, had much reason to talk to them at length.
- The Jester: she laughs at things other people do not. She is the one who steps in front. Her magic is the night sky, and lamps gutter when she casts. People are fond of her and a little careful of her. Call her "Jester", "fool", "you", or a name that person would give her (the baker might say "bells", the gate keeper "you"). Do not invent a proper name for her.
- The others, when a line points at them: "your Ranger" or "the sharp-eyed one"; "Io" or "your herb-witch"; "the Fox" or "the one with the fox ears".
- Airships are common. The captain is a friend of the fair and moors in its field.
- It is a lamp-and-candle world. Leave out machines, guns, gods by name, kings by name, coin names and place names. Say "the moon", not its name. Do not name the country or the moor.

## Tonight (the story's stand-in, which Chris may still change)

Long ago the beacon on the crag was left untended. Its fire went cold and hungry and calls every flame within reach. Tonight every flame at the fair leans east with no wind. Cold wisps pass through the fair going east. The captain's twelve ship's lamps tear off their hooks and fly east. The four go out on the moor to win them back, come home with all twelve, the Fox sews the flames down with blue thread, the captain flies them to the crag, and the Jester ends the old fire. One small new flame is left in the beacon.

**What the fair folk know is only what they see from where they stand.** Nobody at the fair knows what a wisp or a wraith is. Chris has not settled it either. So:

- **No line states what wisps or wraiths are as fact.** Each person has their own guess, from their own trade, and holds it as a guess ("If you ask me...", "My mother called them..."). Guesses should differ between people and can be wrong. A person may change their guess after hearing news.
- People think the beacon fire is simply out. The captain says it has been out longer than he has flown.
- Small facts about a person's own stall, family or past may be invented. List each one in that person's `invented` so Chris can see it. Do not invent anything bigger than a person's own life.

## The stages of the evening (`stage`)

| stage | name | what has happened |
|---|---|---|
| 0 | dusk | The fair at dusk. Flames lean. A wisp or two has passed. The captain's lamps are still on the ship. |
| 1 | gone | The twelve lamps have flown east. None is home yet. |
| 2 | hunt | Between 1 and 11 lamps are home. |
| 3 | twelve | All twelve are home and sewn down. The four have not flown yet. |
| 4 | crag | The four have flown to the crag. (She can fly back to the fair for anything left undone.) The captain is on the landing ledge, `where: "W8"`. |
| 5 | after | The old fire has had its ending. One new flame burns in the beacon. Nothing leans any more. (Chris has not said whether the player can walk on after the end. Write these lines anyway.) |

At stages 1 to 4 the pull grows: people are more worried the later it gets, and each lamp home eases them a little. At stage 5 it is gone.

## What a line can depend on (`when`)

Every key is optional. All the keys a line has must be true for it to be said. A line with more keys is more particular and is chosen first. A line with an empty `when` can be said any time.

| key | value | meaning |
|---|---|---|
| `stage` | `[min, max]` | The stage of the evening, 0 to 5. |
| `talks` | `[min, max]` | How many times she has talked to this person before now. 0 is the first meeting. Use 99 for "and up". |
| `met` | a person's id | She has talked to that other person at least once. |
| `heard` | a news id | This person has heard that news (table below). |
| `lamps` | `[min, max]` | Lamps home, 0 to 12. |
| `level` | `[min, max]` | The party's level, 1 to 20. Never say the word. People see it as how the four carry themselves, how quick the bouts in the ring end, what follows them home. 1 to 4 is green, 5 to 9 is steady, 10 to 14 is formidable, 15 to 20 is a thing people will tell their grandchildren. A player can reach a high level early by fighting in the ring a lot, so a level line must make sense at any stage unless it also has a `stage`. |
| `just` | `won`, `lost`, `hurt`, `away`, `lamp` | `won`: she won a fight a few minutes ago. `lost`: the four were knocked flat since she last spoke to this person. `hurt`: one of the four is below half health now. `away`: she has not spoken to this person for a long while. `lamp`: a lamp has come home since she last spoke to this person. |
| `doing` | `work`, `rest`, `warm`, `walk`, `watch`, `chat` | What the person was doing when she walked up: at their stall or job; sitting down; warming at a fire; walking somewhere; standing watching their flame or the east; talking with another of the fair folk. |
| `has` | `glass`, `thread`, `stone`, `amulet`, `charm` | She carries that find (see `finds` in world.json). |
| `errand` | `{"wick": "open"}` or `"done"`; `{"pie": "open"}` or `"done"` | The lamp-seller's wick for the lamplighter; the pie-seller's pie for the captain. `open` is given and not yet delivered. |
| `where` | `W3` or `W8` | Only for the captain: the mooring field or the landing ledge. |

### News (`heard`)

News starts with whoever saw it. It reaches others when two of the fair folk talk to each other, and when the Jester talks to someone (she tells them what she knows). The lamplighter and the farm lad are out on the moor, so news only reaches them through her. Phrase a `heard` line as something passed on: "I hear...", "The pie-seller says...", "Is it true that...".

| id | the news | who saw it |
|---|---|---|
| `lamps-gone` | The captain's twelve lamps tore off their hooks and flew east. | gate keeper, chestnut roaster, captain |
| `first-lamp` | The four brought a lamp home. | captain, gate keeper, chestnut roaster |
| `wisp-warmed` | The herb-witch held a beaten wisp till it was warm and it drifted home to the fair. Beaten wisps come home now. | lamplighter |
| `wraith-down` | The dark thing that stood on the road at the stones is gone. | nobody (she tells it) |
| `card` | The Jester paid her coin and the fortune-teller turned the card with the fire nobody sits by. | fortune-teller |
| `wick` | The new wick lit on the dead post, leaned, and went out. "It's never the wick." | lamplighter |
| `pie` | The captain got his pie. | captain |
| `flat` | The four were knocked flat and woke by their wagon. | night watchman |
| `stitched` | The Fox sewed the twelve flames to their posts with blue thread. | captain, gate keeper, chestnut roaster |
| `beacon` | There is a light on the crag again. A small one. | everybody, at stage 5 |

## The twelve people

Ids are the game's. The words after each are the voice to write in. Keep each one unmistakable: a reader should know who is speaking with the name covered.

**Writer A**

- `old-lamp-seller` (The lamp-seller). A small woman in an ochre kerchief who has sold lamps and wicks at the fair all her life. Calm, precise, fond. Notices flames before faces. Counts things. Dry. Gives the wick errand. Stands in the fair square.
- `ribbon-dyer` (The ribbon-dyer). An old, quiet man at a steaming dye pot. Thinks before he answers, and his answers are short and sideways. Sees the world as colour and what holds fast. Sold the Fox all his blue. The fair square.
- `fortune-teller` (The fortune-teller). Tall, thin, in a star-patterned tent. A professional: she knows it is a trade, and is unsettled tonight because for once the cards mean it. Sharp, a little grand, quick to name a price. The fair square.
- `ballad-singer` (The ballad-singer). A young woman who sings old songs on the rug in the ring. Warm, lively, a little stage-struck round the four, who go on after her. Thinks in verses and endings. Her oldest song is about a light on the crag and has no last verse. The fair square.
- `old-lamplighter` (The old lamplighter). An elderly woman in a red dress and headscarf. Out on the moor at the Last Lantern, the end of her round, and she will not leave it. Stubborn, plain-spoken, tender about lamps as other people are about children. Lights the dead post every night though it never holds. Refer to her as "she".
- `farm-lad` (The farm lad). A cheerful young farmhand who cuts rushes for the fair's ponies. Out on the moor by the still pool, feeding a fire he will not take his eyes off, because his own lantern got up and left him. Talks fast, frightened and trying not to show it, easily delighted. Looks up to the four.

**Writer B**

- `fair-baker` (The baker). A stout, cheerful man at an oven cart on the stall row. Laughs easily, feeds everyone, threatens the dark with his bread peel. His oven draws as if it wants to leave.
- `old-night-watchman` (The night watchman). An old man who walks the rows after dark, shutters first, then lamps. Gruff, steady, has seen forty years of fairs. Minds the sparring ring and tells the four the rules of it. Unsentimental and kind underneath.
- `pie-seller` (The pie-seller). A sturdy middle-aged woman with a pie cart on the way to the gate. Loud, quick, a trader to her boots, mothers the captain. "Mutton, and the other one's mutton too." Gives the pie errand.
- `gate-keeper` (The gate keeper). Stern, tidy, flat hat and waistcoat, at the coin table by the gate. Counts everyone in and out, takes it personally that twelve lights went over the gate without paying. Few words. Thaws very slowly. Other people's lines should say "the gate keeper", not he or she.
- `chestnut-roaster` (The chestnut roaster). A cheerful middle-aged man at a brazier just inside the gate. Gives chestnuts away, laughs at his own stories, the fair's gossip. His coals went grey as the lamps passed and then came back, and he cannot leave that alone.
- `captain` (The captain). The airship captain, a friend of the fair. Will not fly dark. Short sentences, a sailor's weather-eye, treats his lamps like crew. Walks from post to post in the mooring field (`where: "W3"`); at stage 4 he is on the landing ledge on the crag (`where: "W8"`). His stage 4 lines must have `where: "W8"`; his lines for other stages must make sense in the field. Chris has not said who he is; keep him unnamed.

## What to write: 40 lines for each person

Each person gets exactly these, by `slot`:

| slot | how many | what it is | its `when` must have |
|---|---|---|---|
| `hello` | 3 | The first thing they ever say to her. One for meeting early, one for the middle of the night, one for late. | `talks: [0, 0]` and `stage`: one each of `[0, 1]`, `[2, 3]`, `[4, 5]` |
| `stage` | 12 | The backbone: two for each stage 0, 1, 2, 3, 4, 5. What this person makes of the night right now, from their own trade. | `stage: [n, n]` and nothing else (the captain's stage 4 pair also has `where: "W8"`) |
| `count` | 4 | How well they know her now. One each for the second talk, a few talks, many, and so many they tease her for it. | `talks`: one each of `[1, 1]`, `[2, 4]`, `[5, 9]`, `[10, 99]` |
| `just` | 4 | Four different `just` values out of the five. | `just` |
| `gossip` | 4 | Two that turn on someone else she has talked to (`met`), two that turn on news (`heard`). | `met` or `heard` |
| `level` | 3 | One each for green, the middle, and mighty. | `level`: one each inside `[1, 4]`, `[5, 14]`, `[15, 20]` |
| `lamps` | 2 | A count of lamps home that matters to this person. | `lamps` |
| `thing` | 2 | A find she carries or an errand. The lamp-seller, lamplighter, pie-seller and captain must use their own errand here, both `open` and `done`. | `has` or `errand` |
| `doing` | 2 | Two different `doing` values that suit this person. | `doing` |
| `bark` | 4 | Called out as she walks past, not in a talk. One before they have met, one once they know her well, one when the night is bad, one of your choice. | `kind: "bark"`; `talks: [0, 0]`, `talks: [3, 99]`, `stage: [2, 4]`, and any |

A line may carry extra keys beyond what its slot must have, if that makes it better (a `just: "won"` line that also has `stage: [2, 3]`). Do not make a line so particular it will never be heard.

### Rules for a line

- Spoken by that person, to the Jester. One or two short sentences. **At most 120 characters** (a bark at most 48). It is read in a speech bubble on a phone.
- **It stands alone.** The picker shows one to three lines in a talk, in an order it chooses. No line may need another line before it.
- Plain words. No dashes used as punctuation, no semicolons, no ellipses, no exclamation unless the person is calling out. Nothing a twelve-year-old could not read.
- Never the words level, HP, MP, experience, quest, player, game, demo, zone, spell names, or any name not on this sheet.
- No line repeats another line's joke or its fact, for the same person or a different one. The twelve are different people who noticed different things.
- Do not reuse the lines already in world.json. You may build on what they say.
- Humour is welcome and should come from the person, not from a pun.
- Each line has an `emote` chosen from this list if one fits, or none: `nod`, `shake_head`, `wave`, `greet_bow`, `shrug`, `laugh`, `point`, `think`, `surprised`, `sad`, `cross`, `beckon`, `refuse`, `thanks`.

## Pairs: two of the fair folk talking to each other

When two of the fair folk meet they exchange a few lines the Jester can overhear. Each writer writes **14 pairs**: 10 between two of their own people, and 4 between one of their own and one of the other writer's. Only people who can meet: the lamplighter and the farm lad are alone on the moor and have no pairs. Every one of your fair-side people is in at least 3.

- 2 to 4 lines, alternating, each at most 90 characters.
- A pair may have `stage: [min, max]` and nothing else.
- A pair may pass news: `news: "<id>"` if the exchange is one of them telling the other that news.
- These are for overhearing: they must make sense to someone who walks up halfway.

## The file to write

One JSON file. Writer A writes `game/people/talk/lines-A.json`, writer B writes `game/people/talk/lines-B.json`.

```json
{
  "writer": "A",
  "people": {
    "old-lamp-seller": {
      "guess": "One sentence: this person's own guess at what the wisps are.",
      "invented": ["Her mother kept the stall before her."],
      "lines": [
        { "id": "old-lamp-seller-01", "slot": "hello", "kind": "talk",
          "when": { "talks": [0, 0], "stage": [0, 1] },
          "text": "...", "emote": "beckon" },
        { "id": "old-lamp-seller-37", "slot": "bark", "kind": "bark",
          "when": { "talks": [0, 0] }, "text": "..." }
      ]
    }
  },
  "pairs": [
    { "id": "A-pair-01", "who": ["old-lamp-seller", "ribbon-dyer"],
      "when": { "stage": [0, 1] }, "news": "card",
      "lines": [ { "by": "old-lamp-seller", "text": "..." }, { "by": "ribbon-dyer", "text": "..." } ] }
  ]
}
```

- `id` is the person's id and a two-digit number, 01 to 40. `kind` is `talk` or `bark`.
- Check your file as you go: `python3 -I game/people/talk/check_lines.py game/people/talk/lines-A.json`. It must end with `ALL GOOD`.
- Write one person at a time and save the file after each, so nothing is lost.

## When you report

Say in a few lines: that the check passes, anything you were unsure of, any place where the sheet stopped you writing the better line, and the three lines you are proudest of.
