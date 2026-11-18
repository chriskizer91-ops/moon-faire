# Session note: the open-world map

Written November 18, 2026, as a wrap-up before the game is merged into a new repo.

## What this conversation built

The 3D open world that Moon Faire's walking and exploring happen in, in `game/openworld/` (start with its `README.md`).

- **The land:** made from rules read off the painted world map, drawn in 32 m squares round the camera at four levels of detail, with a far ring to the horizon. 768 m by 512 m.
- **Seven places built in 3D** from their paintings: the fair square, the stall row and sparring ring, the mooring field, the Last Lantern, the standing stones, the hollow, the still pool and broken arch.
- **A kit of fair pieces** skinned with Chris's 52 pictures (tents, stalls, booth, wagon, well, lantern posts, carts, gate, crates, barrels), and one continuous fairground joining the three fair places.
- **Wild plants:** five kinds of flower, grasses, rushes, bracken, gorse and 144 trees she walks round.
- **The cast:** the Jester and eleven fair folk who talk; the captain is a grey stand-in.
- **Controls:** keys or taps to walk, a direction pressed twice to run, mouse look, two set views, wheel and pinch zoom, a map she can travel by.
- **Automatic zoom:** closest standing, 2.15 times that walking, 4.9 times running, back in within about two seconds.
- **Encounters as a stand-in:** unseen and random, only away from lamps, the fair and people; a card shows the painted fight place.
- **The Flipbook look** for the whole scene, switched on and off while playing.
- **The look over the picture:** buttons and a menu inside the picture, speech bubbles over the speaker's head, place banners, a sign for "foes may be near".
- **A square test page:** four witches and all eleven fair folk in the fair square, to measure speed.
- **The prompts page** and reference pictures Chris painted the 52 pictures from.

## Branch and last commit

`claude/moon-faire-open-world` (on top of `claude/moon-faire-starter-world`). Last code commit `09b0c8f`; this note is the commit after it.

## Pages

None of this conversation's pages were published as artifacts. They were sent to Chris as files and are in `game/openworld/out/`:

- `moon-faire-open-world.html`
- `moon-faire-square-test.html`
- `moon-faire-open-world-picture-prompts.html`
- `Moon_Faire_Open_World_References.zip`

## Chris's decisions

All of these are also in the project knowledge (`claude/moon-faire-open-world-map.md` and `claude/TASK-BOARD-moon-faire-game.md`); nothing was decided here that is missing from it.

- Walking and exploring are the 3D open world; fights stay on painted backdrops.
- Encounters are unseen and random, outside lit places and away from people, and frequent.
- More in each area rather than more areas; new zones reuse the texture packs.
- Texture packs and flat skin sheets, not reference photos of buildings.
- Lightest models for walking, Light for close-ups, Trim not used, Full only in the pause-menu viewer.
- Walking covers ground at the old running speed; running is about twice that, by pressing a direction twice.
- He likes the camera as close as it goes. The three automatic distances are the ones in his phone screenshots of November 14.
- A look of its own for menus, talk and information text, with bubbles over the speaker.
- A lot of dialogue and a utility-AI mind for the fair folk are in the plan (task board, S4).
- 20 levels and 180 fights to finish (chosen in the levelling session).

## Unfinished

- Chris has not yet said what to change in the bigger fairground or the new look.
- Real fights behind the encounter card (task board F6): the fight piece is on `claude/moon-faire-fights`, not joined here.
- The other three witches in the world (C5); the square test uses four Jesters.
- The captain's own model in place of the stand-in (C6).
- The crag's places and the airship (M4, M5).
- The camera can sit inside trees, tents and walls (M7).
- A speed pass for the phone (M8).
- The pause-menu viewer (C8) and the rest of the pause menu (G3).
- The story's happenings, saving, sound and the title are not in this folder.
- `ground_cobbles` is painted but not used.
- Rough in the new look: on a phone at the closest zoom the bubble often drops to the foot of the picture; the bubble is full size before its line has typed; the phone map's three fair pins crowd; the note under the picture mentions Esc on a phone.
- The check scripts' screenshots (`look/`) are not kept in the repo; the scripts remake them.
