# Fights: the director camera, and the new move-picking screen

November 14, 2026, evening, by the "Fights" session. Read after `claude/fights-the-fight-as-one-piece.md` (what the fight is and how another page starts one) and `claude/fights-camera-behind-the-party.md` (Chris's first three answers about the camera). This note is the newest.

- **Page:** https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi
- **Repo:** branch `claude/moon-faire-fights`, commit `bfde75b`, `game/fight/` (its `README.md` has all of this in order).

## What Chris said (7:48 pm)

"I think the UI for selecting moves could be better and needs to be maybe brainstormed by tossing it towards a couple Opus 5.5 sub agents. And then I think a combination directed wide behind the party and behind their heads. Swing on every move for the two camera angles that it should like work between the two and maybe throw in some other good angles but like it should be switching between those intelligently as the fight takes place."

Before that (7:26 pm) he had asked for "director decisions" and called them very important.

## The director camera

The default camera, "Director: mixes the views" (`auto`; `directorShot` in `game/fight/fight.js`).

**The shots it can call**
- **Wide:** behind the party and well round to the audience's side; everyone in the picture.
- **Heads:** close behind the party's heads.
- **Turn:** over the shoulder of the witch whose turn it is, at the foe she is aiming at. It follows when she aims elsewhere.
- **Swing:** from over the mover's shoulder, round to her side, then to whoever the move landed on.
- **Profile:** both of them from the side, pushing in.
- **Low:** low in front of the caster, drifting round her.
- **Reverse:** from behind the target, looking back at who is coming.
- **High:** from above the foes, for a move at all of them.
- **Foe:** round a foe that acts on its own.

**How it chooses**
- The fight opens on the painting, sharp and side on, for two seconds.
- A witch's turn is Turn. Crossing the ground to a target is Wide. Between moves the last shot holds, so nothing flickers.
- A move at one foe from where she stands takes Swing, Profile and Low in turn, so the same shot never comes twice running. Sealed Fate, Curtain Call, the gem's two shots and the Guardian are always Swing.
- A move she walks up for (Io's, the Fox's Hemline Fangs) takes Reverse and Swing in turn. A move on a friend is Profile, close.
- A move at everyone or on herself is Low until it lands. Then High over the foes, or Heads when it is the party that feels it.
- A foe's strike at a witch takes "from behind her head" and "from behind the foe" in turn. Its Eclipse is Foe, then Heads as it falls on the party.
- A won fight ends on the party's bow, from the foes' side.
- Anyone standing on the line between the camera and what it looks at steps out of the picture for that shot.

**What it costs:** after the opening, the painting is always out of focus. One painting cannot be seen sharp from a second spot (`claude/pilot-fight-cameras.md`). The camera is kept from looking steeply down, because the painting has no ground to show there.

All the earlier cameras are still in the menu.

## The move-picking screen

Two Opus 5.5 sub-agents brainstormed it, one from console RPG menus and one from touch-first design. Both came to the same shape, and that shape is built:

- **Pick a move, then who, then Cast.** The first tap never acts.
- **The help line is always shown.** It says exactly what the picked move does, or why it cannot be used ("Needs 18 MP", "No Heavy or Crush on the turn bar").
- **Moves are large tiles,** two across on a phone and four on a laptop, with the MP cost or the reason on each.
- **The green Cast bar names the move and the target** ("Stitch → Shadow Wraith"), which catches a wrong tap before it counts.
- **Targets are chosen for you and can be changed.** A witch starts on whoever she aimed at last; a heal starts on whoever is hurt most. Tap a foe's bar in the picture or a friend's box to change it. Foes a move cannot reach go dim.
- Tapping the same move, or the same target, a second time also casts.
- **The party is one slim strip of four** (HP and MP as bars with numbers); the witch whose turn it is stands raised.
- The log line is now a caption on the picture. Camera, speed and the Flipbook look are behind a gear in the picture's corner.
- A coming Heavy, Crush or Eclipse on the turn bar has a triangle and its name, so it does not rely on colour.
- On a laptop: 1 to 7 pick a move, Tab or the arrows change the target, Enter casts, Esc goes back.

**From the brainstorms and not built yet:** the damage shown as a ghost on the target's bar before casting; tapping a foe's body in the picture (today it is the bar over it); the last-used move as a big quick button; a long press for more detail.

## Faults found and fixed on the way

- Twice a comment added in the middle of a long line cut off the code after it: once the line that turns a witch to her target (live on the page 6:29 to 6:42 pm, and Chris was told), once a line of the camera code (caught by the checks before it was published). Comments now go on their own lines.

## Checked, and not

- The move-picking screen played by taps and by keys on a phone held upright and on a laptop (`game/fight/checks/ui.py`): picking, changing the target, a move that cannot be used, a heal on a friend, casting.
- Stills of the director's shots through the last fight and a fight at the fair, and whole fights run to the end with no errors.
- **Not checked: anything moving.** The test browser has no graphics chip. How the cuts and the drift of each shot feel is Chris's to judge.

## For Chris to say

- Which shots he likes and which to drop, after watching a few fights.
- Whether the move-picking screen wants the ghost damage and tapping the foe itself.
- Which witch animations looked wrong (asked twice, not yet answered).
