# The fair folk's talk and minds

What the eleven fair folk and the captain say, and what the fair folk do with themselves. Built November 14, 2026 for task board row S4. The story of it, Chris's decisions and what is still rough are in the project note `claude/moon-faire-fair-folk-minds-and-talk.md`.

## What is here

| | |
|---|---|
| `TALK-KIT.md` | The sheet every line was written to: the people's voices, what a line may depend on, the 40 lines a person, the rules. Read it before writing or changing a line. |
| `lines-A.json`, `lines-B.json` | The lines as written, by two Opus 5.5 writers at extra-high effort (six people each), then read through and corrected. **Change lines here.** |
| `check_lines.py` | Checks a lines file against the sheet (counts, tags, lengths, banned words, nothing said twice). |
| `build_talk.py` | Joins the two files into `lines.json` and `lines.js` (`window.MF_LINES`), and makes `out/moon-faire-fair-folk-lines.html`, every line laid out to read. |
| `talk.js` | `MF_TALK`: the picker. Holds what the evening has come to and chooses what a person says, calls out, or says to another. No drawing. |
| `minds.js` | `MF_MINDS`: a mind for each person. Needs that rise and fall, a choice of what to do, and a way round things. No drawing; it drives `MF_NPC`. |
| `test_talk.mjs`, `test_minds.mjs` | Both played without a picture: `node game/people/talk/test_talk.mjs`, `node game/people/talk/test_minds.mjs`. Each ends with `ALL GOOD`. |

In the open world they are joined on by `game/openworld/src/ow-folk.js` (`OW.folk`), which `build.py` adds to the page with the three scripts above.

## After changing a line

```
python3 -I game/people/talk/build_talk.py          # checks, then writes lines.json, lines.js and the page to read
node game/people/talk/test_talk.mjs                # can every line still be heard?
cd game/openworld && python3 -I build.py ..        # the game's pages
```

## How a line is chosen (`talk.js`)

A talk is one to three lines: an opening (a hello the first time; later, how well they know her or what has just happened), then the most particular thing they have not yet said, then what they make of the night at this stage. "Most particular" is the line with the most conditions that all hold. A line is not said again until everything else that fits has been said; then the one said longest ago comes round.

News travels: whoever saw a thing knows it; when two of the fair folk talk they tell each other everything they have heard; when she talks to someone, each learns what the other knows. The lamplighter and the farm lad only hear things from her.

What the rest of the game tells it:

```js
MF_TALK.set({ stage, lamps, level, hurt });   // stage 0 to 5, see TALK-KIT.md
MF_TALK.event('won' | 'lost' | 'lamp');
MF_TALK.news('wisp-warmed', ['old-lamplighter']);   // something happened, and who saw it
MF_TALK.find('glass');  MF_TALK.errand('wick', 'open' | 'done');
MF_TALK.save();  MF_TALK.load(saved);         // for saving the game
```

In the open world, use `OW.folk.evening({...})` and `OW.folk.happened(...)`, which also tell the minds. Until the story (S1) and the fights (F6) are joined on, the menu's "The evening" rows set these by hand.

## How a mind works (`minds.js`)

Each person has six needs between 0 and 1: the stall wants minding, legs get tired, the night is cold, they want company, they are restless, and the night's wrongness makes them want to go and look east. Each rises on its own clock and falls while the person is doing the thing that answers it. When a person finishes what they are doing they weigh what each thing they could do is worth right now and do the best: mind the stall, sit down, warm at a fire, go and see a friend, take a turn about, stand and watch the east, or (the watchman) walk the round of the lamps.

The pull of the night is one number from the stage and the lamps home. It raises the cold and the worry, so on a bad night people leave their stalls for the fires and stand looking east, and each lamp home eases it.

Who each person is, as numbers (how much the stall matters, how sociable, how fidgety, how much the night gets to them, how soon they tire, how far they roam, who their friends are), is the table at the top of `minds.js`. These are stand-ins like the names: change them freely.

They find their way on a grid of half-metre cells (A*, then pulled straight), stop for anyone standing in their way, and give up an errand they cannot reach for a minute. Far out of her sight (90 m) they stand still.
