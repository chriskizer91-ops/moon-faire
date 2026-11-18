# The Grey Hat (maybe Noiz): stage 7, everything the fair folk NPCs can do (November 14, 2026)

Read after `claude/grey-hat-3d-stage6-hat-belt-jewellery.md`.

- Page: https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794698632-b260`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`, commit `92d5b87`. README sections "Stage 7, second half" and the one below it. First-half report: `builder/stage7a_report.md`.

## What Chris said (his words)

- "give him his hat, his belt and pouch and scroll and jewelry as well as all of the animations that the NPCs have"
- When the key ran out and an Opus 5.5 sub-agent had started: "Will you finish him up yourself? Do you think that you'd be faster". The session Claude let the sub-agent finish the first half, reviewed it, and built the second half itself.

## What exists now

**First half (Opus 5.5 sub-agent, reviewed):**
- His face moves: blinking, and mouths from painting C2 (parted, "oo", smile). His face at rest is unchanged (0 pixels differ).
- Three talking loops: `talk_calm`, `talk_lively`, `talk_gruff`.
- The fourteen emotes by the fair folk's names: `nod`, `shake_head`, `wave`, `greet_bow`, `shrug`, `laugh`, `point`, `think`, `surprised`, `sad`, `cross`, `beckon`, `refuse`, `thanks`.
- Fidgets in idle: `fidget_shift`, `fidget_look`, `fidget_hands`.

**Second half (session Claude):**
- The same calls game code uses for a fair folk NPC: `update(dt)`, `face(x, z)`, `greet()`, `talk(on)`, `emote(name)`, `walkTo(x, z)`, `runTo(x, z)`, `stop()`, `moving`, `sit()`, `stand()`, `sitting`, `seated`, `seat()`, `headTop(vec3)`, `wiring`.
- Walking and running to a point. He is moved by the foot he stands on, so his feet do not slide (0.002 mm a frame at full walk or run). He steps off left foot first and shortens his last strides to arrive with his feet together.
- A run: a heavy-booted jog at 2.6 m a second.
- Sitting on a seat (top 0.46 m up, 0.34 m behind him) and getting up, 1.15 s each way. Talk and emotes work seated.
- Page: a "Go and sit" row (Walk over, Run over, Sit, Stand, Face me), a stool, and a camera that follows him.

His `wiring` (which talk, hello, favourite emotes and moods are his) is a stand-in. Chris decides who he is.

## Rough

- Turning on the spot is a swivel with no steps.
- He can stop up to about 13 cm short of the spot on a short hop (1 to 6 cm on longer ones).
- The run's arms are held a little stiffly forward.
- The bow does not touch the hat: his elbow came through the sleeve when it did. The smile is small.
- Seated, the dagger hangs beside the stool and the scroll lies on his thigh.
- Nothing was watched moving (stills and numbers only). Not seen on a real phone. Not looked at: the new moves with "Old shirt", "Old trousers", "Old hair" or "Blank doll" on.

## Still not built

- The scroll's place (it sticks out in front of his thigh); Chris has not answered.
- Shirt polish (ruffled front, sleeve folds, collar corners); corset and boots as their own pieces; the hair's flat top.
- Lighter versions of him for the game, as the witches have.
