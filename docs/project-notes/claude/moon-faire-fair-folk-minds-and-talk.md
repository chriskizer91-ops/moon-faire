# Moon Faire: the fair folk's minds and what they say (built November 14, 2026; pushed November 15, 2:14 pm)

Task board row S4, by the "Fair folk minds" session. Read `claude/HOW-TO-moon-faire-fair-folk-npcs.md` first for what the fair folk can do with their bodies.

## Where it stands

**Done and pushed.** Built and checked on November 14 (10:35 pm). Chris said "Yes push everything" on November 15 at 2:13 pm, and the branch was pushed at 2:14 pm. He has not yet said what he makes of it after trying it.

- The fair square with everyone in it (best place to watch the minds): https://claude.ai/artifact/GuZBEUxCeDNBi3Lw9qdHrd
- The open world with the same minds and lines: https://claude.ai/artifact/FqVU8WizNp6VHdr4QLwfRA
- Every line, laid out to read: https://claude.ai/artifact/P3oWwZhiW26Z6BYsJWpj5L
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-fair-folk-minds`, commit `0cd2262`, **pushed**. It sits directly on `claude/moon-faire-open-world` at `09b0c8f`, which was still that branch's newest commit on the remote when this was pushed. Folders `game/people/talk/` (start with its `README.md`) and `game/openworld/src/ow-folk.js`.
- Not in the commit, on purpose: the two built pages in `game/openworld/out/` (15 MB each; the open-world session rebuilds them). Build them with `cd game/openworld && python3 -I build.py ..`. The three pages above are those builds.

## What Chris said (his words)

- Nov 14, 8:58 pm: "can you work on the NPC utility AI minds and dialogue you can have an Opus 5.5 xhigh effort sub agent or two come up with coherent dialogue for each NPC given How many times you've talked to that in nPC if you've talked to other NPCs how much of the game you've completed in what level you're at, I guess I'm not sure what else I'm interested in brainstorming the popularities before we kick off any of that build"
- Nov 14, 9:10 pm: "you are the jester and the rest of the party walks with you so the Fairfolk only talk to to jester. 40 lines per person is enough"
- Nov 15, 2:13 pm: "Yes push everything", and "And note that in the project knowledge document of what you completed".

He did not answer whether gossip should pass between the fair folk. The session decided yes: lines can depend on who she has talked to (his own ask), and news passes between the fair folk when they meet.

## What was completed

1. **The shared sheet** (`TALK-KIT.md`): each person's voice, what a line may depend on, the 40 lines a person, the rules.
2. **480 lines:** 40 each for the eleven fair folk and the captain. **28 overheard exchanges** between two of them.
3. **A checker for the lines** (`check_lines.py`) and a builder (`build_talk.py`) that makes the data the game reads and the page to read every line.
4. **The picker** (`talk.js`, `MF_TALK`): chooses what a person says, calls out, or says to another.
5. **The minds** (`minds.js`, `MF_MINDS`): one for each of the eleven fair folk.
6. **The join to the open world** (`ow-folk.js`, `OW.folk`): small bubbles for call-outs and overheard talk, a crate to sit on, labels for what people are doing, and the menu's "The evening" rows.
7. **Two tests without a picture** (`test_talk.mjs`, `test_minds.mjs`) and one on the real page (`check_folk.py`).
8. **Three pages published**, the task board updated (S4 done, S7 added), and the branch pushed.

## What exists, in more detail

**The lines**

- Written by two Opus 5.5 sub-agents at extra-high effort (six people each) from the shared sheet. The session then read every line and changed five (one repeated joke between the two writers, one claim the watchman could not have seen, one thing the lamplighter could not have seen, one repeated "not crying", one repeated number).
- Nothing is written while playing. Every line is data, and the lines page shows each with when it can be said.
- Each line is spoken to the Jester. The other three are "you four", "your sharp-eyed one", "your herb-witch", "the one with the fox ears".
- Each person's 40: 3 first hellos (early, middle, late in the night), 12 on what they make of the night (two for each of six stages), 4 as they get to know her (2nd talk, a few, many, very many), 4 after something has just happened, 4 about other people and news, 3 on how the four are getting on (the level, never named), 2 counting lamps, 2 on a find or an errand, 2 caught doing something, 4 called out as she passes.

**What a line can depend on:** the stage of the evening (dusk; the lamps have flown; lamps coming home; all twelve home; the four on the crag; after the end), lamps home, the party's level, how many times she has talked to that person, whether she has talked to a named other person, news that has reached the person, a fight just won, the four knocked flat, one of the four hurt, a long time away, a lamp home since they last spoke, a find she carries, an errand open or done, what the person was doing when she walked up, and (the captain) the field or the ledge.

**How a line is picked:** a talk is one to three lines. First an opening: a hello the first time, later how well they know her. Then the most particular thing that fits and has not been said. Then what they make of the night at this stage. Nothing repeats until everything fitting has been said.

**News travels.** Whoever saw a thing knows it. When two of the fair folk talk, each tells the other what they have heard. When she talks to someone, both learn what the other knows. The lamplighter and the farm lad only hear things from her.

**What wisps are is never stated.** Each person has their own guess from their own trade (slipped wicks; colour that never took; invitations to a fire nobody came to; lights following a tune; lost heat; stragglers; hungry things; things that were sent for; fire that said yes; deserters; flames blown out and not capped; lights nobody was watching). Several change their guess after hearing Io warmed one.

**Minds.** Each of the eleven has six needs that rise and fall: the stall wants minding, legs get tired, the night is cold, they want company, they are restless, they want to go and look east. When a person finishes what they are doing they weigh up what each thing is worth right now and do the best: mind the stall, sit down (on a small crate by the stall), warm at a fire, walk over to a friend and talk, take a turn about, stand and watch the east. The night watchman walks his round of the lamps.

- The pull of the night is one number from the stage and lamps home. It raises cold and worry: on a bad night people leave their stalls for the fires and stand looking east; each lamp home eases it; after the end it is gone.
- Two who end up side by side (at the same fire, say) fall to talking. If she is within about 13 m she overhears their exchange in small bubbles.
- They glance at her as she passes, wave once they know her, and now and then call something out.
- They find their way round stalls and tents, wait for anyone in the way, and stand still when she is more than 90 m off.
- Who each person is (how dutiful, sociable, fidgety, worried, old; how far they roam; who their friends are) is a table of numbers at the top of `minds.js`. Stand-ins, like the names.

**On the page:** under Menu, "The evening" sets the stage, lamps home, the level, "she has just won a fight", "the four were knocked flat", "one of the four is hurt", and "Show what people are doing" (a small label over each person). These are for trying it until the story and the fights set them.

## Checks run (November 14)

- `check_lines.py` on both writers' files: ALL GOOD (counts, tags, lengths, banned words, nothing said twice).
- `test_talk.mjs`: 40 evenings played without a picture. Every talk had something to say; every line can be heard except one or two that need an exact lamp count; a quick single evening hears about half of each person's 40.
- `test_minds.mjs`: a 45-minute evening without a picture. Nobody stuck, nobody inside a stall, nobody past their roaming distance, 18 different pairs met.
- `check_folk.py` on the real pages in headless Chrome, laptop and phone sizes: no errors; people moved, sat, warmed, visited, talked; nobody standing inside anything solid.
- Cost of the minds: about 0.1 ms a frame on average. The worst single frame was 36 ms in the square test and 10 ms in the open world (a long way being worked out).

**Not checked:** nothing was watched moving (stills and numbers only). Not seen on Chris's phone or laptop. Speed with the minds on was not measured on a real device.

## Rough, or not done (this is board row S7)

- **Written before Chris's November 15 changes.** The lines know one evening in six stages, ending at the crag. They say nothing about bramble country after level 10, herbs and rest spots, or the final boss (`claude/chris-nov15-herbs-testers-foes-big-bad.md`). The three "how the four are getting on" lines per person still fit levels 1 to 20.
- **The captain has lines but no mind.** When this was built he was the grey stand-in. His model is now done (C6); once he stands in the world (C6b) he can be given a mind like the others, and his four overheard exchanges will start to be heard. Until then two of his lines are chosen by chance between "walking" and "watching".
- **The story does not move the evening yet.** S1 (story), F6 (fights) and G2 (saving) need to call `OW.folk.evening(...)`, `OW.folk.happened('won' | 'lost' | 'lamp')`, `MF_TALK.news(id, whoSaw)`, `MF_TALK.find(code)`, `MF_TALK.errand(name, 'open' | 'done')`, `MF_TALK.save()` and `load()`. The calls are listed at the top of `ow-folk.js` and in `game/people/talk/README.md`.
- **The errands are not given or ended by the lines.** The lamp-seller, lamplighter, pie-seller and captain have lines for the wick and the pie being under way and done, but handing over is S1's.
- **Finds:** lines know the five finds in `world.json`. The 13 new ones (S5) have no lines.
- **Turning:** a seated person does not turn to face her. Turning on the spot is a swivel.
- **The lamplighter and the farm lad** have few things to do: mind the lamp or fire, watch, take a short turn. They never leave.
- **People are away from their stalls about half the time** in a 45-minute run. If Chris finds them hard to find, raise `dutiful` or lengthen work in `minds.js`.
- One line of the lamplighter's at "lamps coming home" speaks of having watched Io warm a wisp. If a player wins a first lamp somewhere other than the Last Lantern, it is said too early.
- In the square test the lamplighter and the farm lad stand in the square with everyone else, so they can end up beside a fair person with no exchange written for them.
- `ow-main.js` belongs to the open-world session. This branch changes it in six small places, each marked with a comment naming `ow-folk.js`. Joining this branch into theirs is theirs to do or needs their say.

## For Chris to say

1. Read the lines page. Any person whose voice is wrong, any line to cut, any made-up fact he does not want (each person's are listed under their name).
2. Are people away from their stalls too much, too little, about right?
3. Should the fair folk call the Jester by pet names (the baker says "bells", the pie-seller "love", the dyer "night-blue")?
4. After the end: the lines for it are written. Whether the player can walk on is still his open question (S2).
5. Should the fair folk get more lines for the bigger game he set out on November 15 (bramble country, herbs, the final boss)?
