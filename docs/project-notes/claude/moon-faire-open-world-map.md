# Moon Faire: the open-world map (November 14, 2026)

Latest state: 9:20 pm, November 14.

## Chris's decisions

After walking the first build (2:16 pm): **"This is absolutely the way I want the map to be in the game."**

- **Walking and exploring happen in the 3D open world.** Everywhere is walkable and explorable in 3D. It replaces the painted walking places as the game's map.
- **Fights stay painted.** Meeting a foe cuts to a fight on a painted backdrop, with the 3D cast on top, as built in the pilot.
- **Foes are not seen roaming (3:16 pm).** Encounters are unseen and random, and only happen outside the lit places and away from where people stand.
- **More to each area, not more areas (3:04 pm).** Because it is all 3D, each explorable area should hold more. The world can also grow later: new zones reuse the same texture packs.
- **More play time is needed (3:10 pm).** With land to run off into, the game needs many more fights than the 24 or so the starter plan was sized for. He chose 20 levels and 180 fights to finish (7:40 pm, `claude/levelling-for-the-bigger-game-options.md`).
- **Which models walk the world.** **Lightest for walking, on the laptop and the phone** (3:10 pm: "even lightest would work on the computer"). Light for close-ups and talking. **Trim is not used:** at Trim his laptop drew about 900 thousand triangles at 45 pictures a second and its fan spun up. Full only in the pause-menu viewer. The same goes for the fair folk and the captain (a friend of the Moon Faire): their light weights.
- **A viewer in the pause menu (2:36 pm).** Each of the four witches alone, at her highest detail: turn her round and play her moves, as on the model pages.
- **The Flipbook look covers the whole scene and can be switched on and off while playing (3:04 pm).** Tone and shading must keep things easy to see.
- **How she moves (3:16 pm).** Keys move her and the mouse turns the view. Walking covers ground at about the old running speed; running is about twice that; she runs when a direction is pressed twice quickly. At least two set zoom levels, and pinch to zoom on a touchpad or a phone.
- **How close the camera sits (7:56 pm).** He likes to be zoomed in as far as it goes. The camera zooms by itself: closest when she stands still, wider as she walks, wider again as she runs, and back in when she slows. **The three distances are the ones in his phone screenshots of 9:07 pm** (he first said 10% and 15%, then two 20% steps, then showed the distances he meant, which are much further apart): walking a little over twice the standing distance, running about five times.
- **The look of what is drawn over the picture (7:56 pm).** He asked for "a cooler UI": the menu buttons, the conversation text, the information text, and pop-up bubbles for talk with the fair folk. He also asked that the plan hold a lot of dialogue and a utility-AI mind for the fair folk (task board, S4).
- **Sub-agents (2:45 pm).** The open-world session may use Opus 5.5 sub-agents at high or extra-high effort to build parts, where it helps.
- He has moved on from the painted-map session. Its handoff is `claude/HANDOFF-starter-world-to-the-open-world.md`.

## Real speed, measured by Chris on his laptop (3:10 pm)

The fair square test, four witches at Lightest, eleven fair folk, Flipbook look on at its finest, Sharpest, full screen: **84 pictures a second**, 460 thousand triangles, 649 draws. On his phone at Lightest "it all works great". At Light on the laptop it "works perfect".

## For the witch sessions: the light versions are needed as files

The open world can only load a witch's light weights if they are saved as files. As of this note only the Jester's are in the repo (`game/models/jester/` on `claude/moon-faire-starter-world`: `jester_tex.js`, `jester_kit.js`, `lod.js`, `meshopt_simplifier.js`). The Fox's and the Ranger's were built as pages from a script in their notes and never saved; Io's are being built.

What each witch's session should save to the repo, when Chris asks it to: her built model file with the light-level switches in it, her `lod_<witch>.js`, and her painted surfaces file. Every witch's code is a fork of the Jester's and uses the same top-level names and the same `window.WITCH_LOD`, so two witches cannot be loaded on one page as plain scripts. The open world will wrap each witch's files in a function of their own and keep her `make(level)`; a session that can give its witch her own global name (for example `window.FOX_LOD`) and her own name for her painted-surfaces global saves that step.

## What it is

The racing game's method (Chris's Mud Lab page), in the witches' renderer (three.js r128):

- **The land is made from rules, not stored.** A height and a ground type for every spot, worked out from the painted world map's own lines (`game/world/map/map.svg`). The same rule runs on the page and in a background worker.
- **Squares round the camera.** 32 m squares, each made at the detail its distance needs (a point every 0.5 m near her, then 1, 2 and 4 m), made in the background and swapped as she moves. A coarse ring carries the land and sea to the horizon.
- **Colour.** The painted world map, with the places' little pictures painted out, gives the broad colour. Chris's ground paintings (heather, turf, track, fair ground, rock) show in their own colour near her and fade to the map far off.
- **Scale.** 0.5 m to a pixel of the world map: 768 m east to west, 512 m north to south. x is east, z is south, and the map's middle is 0, 0.
- **The painted places, built in 3D.** Each of the seven fair and moor places is built from the grey-box shapes its painting was made from, with the painting laid back onto them from the camera it was painted for. A depth picture from that camera says which surfaces the painting can see; unseen surfaces take canvas, planks, a mirrored side or the thing's own colour.
- **The fair square's four tents are properly skinned** (round 1): their own canvas wrapped round the walls with the border, a door picture on the door side, a roof picture from above. They look right from every side.
- **Between the places:** drystone walls, the tor, boulders, gorse, heather clumps near her, the woods, three farms, the bridge and the dead tower.
- **The cast.** The Jester and the eleven fair folk with their story lines, lit by the witches' own rig, which turns with the camera. The captain is still the grey stand-in.
- **Camera and controls.** Behind her and turnable: drag, Q and E, or mouse-look (C or a button captures the mouse; Esc lets go). Two set views (a button or Z) and free zoom by wheel or pinch. WASD or the arrows walk at about 1.9 m a second; a direction pressed twice (or Shift, or a double tap on the ground) runs at 4.4. A tap on the ground walks her there. The Map shows where she is; tapping the land takes her there.
- **Encounters, as a stand-in.** Away from lamps, fires, the fair and people, after a random 35 to 100 m walked (Chris asked for them more often, 4:01 pm), a card shows the painted fight place for that land (F3 near the stones, F1 elsewhere). The fight itself is not built here yet. The place label says when foes may be near; a button turns encounters off.
- **Automatic zoom** (8:00 pm). The standing distance is whatever Z, the wheel or a pinch set (closest, 2.3 m, by default; far is 6.5 m). Walking takes it to 2.15 times that (about 4.9 m), running to 4.9 times (about 11.3 m), never past 14 m; measured against his screenshots by her size in the picture. It is back in within about two seconds of her stopping, and holds still while she talks.
- **The look over the picture** (8:45 pm, `src/ow.tpl.html` and the lower part of `src/ow-main.js`; built by an Opus 5.5 sub-agent and checked). What the game says is dark plum "ink": tickets with cut corners and a gilt line (place name, buttons, menu, toasts, map, encounter card, loading). What a person says is lamp-lit "paper": a bubble over the speaker's head with a name ribbon, its tail pointing at them, the line typed out a few letters at a time; a crescent means more, a full moon the last line. A small "…" bubble over someone near invites the talk. Map, View and Menu sit in the picture's corner; the Menu (or Esc) holds the Flipbook look, weights, sharpness, encounters, mouse look, the speed line's switch, full screen and how to play. A new place's name arrives as a banner and settles in the corner; a pair of glinting eyes beside it means foes may be near. Jacquard 24 for names and titles only. On a phone the picture is now edge to edge and taller. Rough: the phone map's W1 to W3 pins crowd; in the phone's near view the bubble often drops to the foot of the picture; the bubble is full size before its line has typed. Left room for, not built: her own replies in a bubble over her, and a picture card of the speaker (S6).
- **Flipbook look.** The whole picture, switchable with a button or F: the land, sky and places in their own 64 colours, dithered, lifted a little in tone, and inked where one thing ends in front of another; the cast in the witches' 56 colours with the inked outline.

### Where each place stands

| Place | Middle (x, z) in metres | Ground height |
|---|---|---|
| W1 the fair square | -228, 96.5 | 3.0 |
| W2 the stall row and the sparring ring | -188, 96.5 | 3.0 |
| W3 the mooring field | -148, 96.5 | 3.0 |
| W4 the Last Lantern | 31.75, 101.9 | 5.0 |
| W5 the standing stones | 161, 37.5 | 11.0 |
| W7 the hollow | 161, 97 | 4.2 |
| W6 the still pool and the broken arch | 289, 97 | 6.5 |

The crag (W8, W9, F5) is in the land as rock, with the ledge and the high shelf, but its places are not built.

## The pages

- `moon-faire-open-world.html` and `moon-faire-square-test.html` (14.7 MB each, work offline), sent to Chris as files in the open-world conversation; the newest were sent at 9:20 pm and are in the repo under `game/openworld/out/`. Not published as artifacts.
- The square test is the same world started in the fair square, with four witches (four Jesters, see above) and all eleven fair folk standing round it, and a switch between Lightest and Light.

## Where the code is

**In the repo since November 14, 7:05 pm, pushed on Chris's word:** `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-open-world` (latest commit `09b0c8f`, 9:20 pm), folder `game/openworld/`. Start with its `README.md`: how to build (`python3 -I build.py ..`) and what each file does. The branch sits on `claude/moon-faire-starter-world`, reads the rest of `game/` and changes nothing there. Chris's 52 pictures are in `round1/`, `round2/`, `round3/` as he sent them; the built pages are in `out/`.

## Pictures Chris made for it

Prompts page: `moon-faire-open-world-picture-prompts.html`, with `Moon_Faire_Open_World_References.zip`. 52 prompts in three rounds.

- **The choice made:** texture packs, not building reference photos. Seamless squares of ground, cloth, wood, stone and plants do most of the work and are reused in every zone. Flat "skin sheets" cover what a pack cannot: tent doors and roofs, stall fronts, the wagon, the well.
- **All three rounds have arrived, all 52 pictures, and they are what was asked for** (round 1 at 2:45 pm, round 2 at 3:20 pm, round 3 at 3:44 pm).
- **All three rounds are in** (5:15 pm): the ground, the drystone wall, the four hero tents, and a kit of fair pieces in his skins (`src/ow-kit.js`: tents, stalls, booth, wagon, well, lantern post, crates, barrels, carts, gate, brazier), gorse, bracken, reeds, the thorn tree, the marsh and field ground. Only `ground_cobbles` is unused.
- **Wild plants** (4:40 pm, `src/ow-flora.js`): five kinds of flower in drifts, tussocks, rushes, bilberry and bracken sown round her, and 144 trees she walks round.
- **The bigger fairground and fuller moor places** (6:45 pm, `src/ow-dressing.js`): lanes, rows of tents and stalls, wagons and bunting joining the three fair places into one ground; more walls, stones, reeds and thorns round each moor place. Sent to Chris; he has not walked it yet. The sub-agent that built it was cut off before reporting, so its own list of rough spots was lost; what it left was rebuilt and checked (she can run the whole lane from the west road to beyond the gate; no encounter can start inside the fairground).
- The airship is left out on purpose: it wants its own model and references.
- A new zone will want a small pack of its own. None is written yet, because no new zone has been decided.

## Rough, as of the round 1 build

- Tents in the stall row and the mooring field still show painted sky on their backs, and some booths show bits of painted tent. Rounds 2 and 3 replace these.
- A little ghosting where a tent's border meets its door, and a thin line at the back seam of the round tents.
- Dark lines at the edges of the painted ground sheets in the fair square.
- Plain ground lies between the fair's three places.

## Not in yet

The bigger fairground and fuller moor places, the real fights behind the encounter card, the pause-menu viewer, the things that can happen, the lamp count and the gates, the other three witches, the captain's model, the airship and the flight to the crag, the crag's places, saving.

## Next

1. Chris walks the bigger fairground and tries the new look and the automatic zoom, and says what to change.
2. Join the fights to the encounters: the Fights session's piece is done (`claude/fights-the-fight-as-one-piece.md`), so an encounter can start a real fight (task board, F6).
3. The other witches' light files, when their sessions have saved them.
4. Then the game's own parts on this map: the story's happenings, then the fights behind the encounters, with the levelling resized as Chris chooses.
