# Music for Moon Faire: Suno requests

These are from the director's chair. The films cut music to the second:
- a song starts on a story beat,
- it sinks under a spell,
- it stops dead for the Hush,
- it drops to silence before the Curtain Call,
- and it comes back for the walk home.

So what I need from Suno is different from a song you'd listen to on its own. Below is how to ask for it, then the pieces I'd like, in the order I'd use them.

## What makes a piece easy to cut

- **No singing.** Words fight the spell names and the effects. A wordless choir is fine, but as its own piece, so I can choose when it comes in.
- **Clear sections.** A thin opening, the full band, a break where most of it drops out, then the full band again. Every change of section is a place I can cut.
- **A steady beat.** Steady from start to end, with no slowing down or speeding up inside the piece. Then I can cut on the bar lines and the cuts don't show.
- **One family of keys.** Moonlit Forest Path is in B-flat major and Herbal Decay is in E minor. Their home notes, B-flat and E, are a tritone apart, the most unsettled gap in music, so going straight from one to the other jars. That's why the film needs silence or a drone between them. For Moon Faire's own music, I'd keep everything in B-flat major and its dark twin, G minor. Then any piece can follow any other, and her bells and chimes fit everything.
- **Space in the sound.** A sparse arrangement leaves room for the bells, flail and footsteps. Big, dense, loud mixes bury them.

## How to set Suno up

1. Use **Custom** mode and turn **Instrumental** on.
2. Paste the **Style** line I give for each piece into the style box. Suno follows the instruments and the mood well. It follows the tempo and key only roughly, so I'll measure each take and tell you which ones landed.
3. If your Suno lets you write in the lyrics box while Instrumental is on, paste the **Sections** line there. If it doesn't, turn Instrumental off and paste only the section tags, with no words at all. Then "instrumental, no vocals" in the style keeps it from singing.
4. If you have an **Exclude** box, put this in it: `vocals, singing, rap, EDM drop, dubstep, autotune`.
5. Let each piece run two to three minutes, because I only need slices. Make three or four takes of each and send me every one you like.
6. Download **WAV** if Suno offers it; MP3 is fine too. Send them in the chat. I run each through `tools/pack_audio.py`, which trims it, evens out the loudness, shrinks it and finds its key and tempo. Then I choose the take whose key and beat fit, and cut it in.

## The pieces

### 1. The Jester's Waltz: her theme
Her entrance, her idle moments, the menus, and the walk home in a quieter version. If you only make one, make this one.
- **Style:** `whimsical dark carnival waltz, music box, celesta, pizzicato strings, accordion, tiny bells, 3/4 time, 120 bpm, B-flat major, playful, mischievous, moonlit, instrumental, no vocals`
- **Sections:** `[Intro: music box alone] [Theme: strings join] [Theme: full, accordion lead] [Break: music box alone] [Theme: full] [Outro: music box slows to a stop] [End]`
- **What I listen for:** a short tune you could hum, played first on the music box alone. That bare version is what plays under her close-ups.

### 2. Lost Souls: the wisps
For when the wisps come out of the graveyard and cling to the lamps. Cold and sad, not scary.
- **Style:** `eerie ambient, glass harmonica, bowed vibraphone, soft low strings, distant wordless choir hum, slow, 70 bpm, G minor, sad, cold, sparse, lots of space, instrumental, no vocals`
- **Sections:** `[Intro: glass harmonica alone] [Main: low strings enter] [Swell: choir hum] [Break: almost silent] [Main] [End]`
- **What I listen for:** long held notes and plenty of air. The wisps' wail sits on top of this, so it must stay quiet.

### 3. A Fool's Mercy: the fight
The wraith, Gravity, the great wraith, Sealed Fate and Against All Odds. It's theatrical and dangerous, but a fool is dancing through it.
- **Style:** `dark fantasy battle theme, theatrical, driving cello ostinato, pizzicato strings, harpsichord, taiko and frame drum, brass stabs, 132 bpm, G minor, tense but playful, circus edge, instrumental, no vocals`
- **Sections:** `[Intro: drums build alone] [Main: full band] [Break: sudden stop, then cello alone] [Main: bigger] [Bridge: drums drop out, strings only] [Climax: full band] [End: hard stop]`
- **What I listen for:** the sudden stop and the hard ending. Each gives me a dead-silent moment to put a spell into.

### 4. Curtain Call: the build and the release
Her biggest move: a drum roll, the curtains, and every soul going home on one chord.
- **Style:** `theatrical orchestral build, snare roll, rising strings, brass swell, wordless choir, ends on a huge sustained B-flat major chord with church bells, triumphant and tender, instrumental, no vocals`
- **Sections:** `[Build: snare roll and rising strings, getting faster] [Peak: full orchestra and choir] [Release: one huge chord, bells] [Afterglow: strings fade] [End]`
- **What I listen for:** the moment the build lands on the big chord. That's the frame where she releases the spell.

### 5. Going Home: the moths and the walk away
After the release: the lamps light again, the moths fly to the moon, and she walks up to the chapel.
- **Style:** `gentle fantasy lullaby, harp, music box, soft strings, wooden flute, 80 bpm, B-flat major, peaceful, bittersweet, warm, instrumental, no vocals`
- **Sections:** `[Intro: harp alone] [Theme: flute and strings] [Theme: music box joins] [Outro: harp alone, fading] [End]`
- **What I listen for:** a hint of her waltz tune in it, if Suno gives one. That ties the ending back to her entrance.

### 6. The Faire: the title theme
The festival airship itself, for the title screen and the airship between towns.
- **Style:** `whimsical fantasy festival march, accordion, fiddle, hurdy-gurdy, glockenspiel, frame drum, 110 bpm, B-flat major, wonder, a travelling show arriving, instrumental, no vocals`
- **Sections:** `[Intro: hurdy-gurdy drone] [Main: full band] [Break: glockenspiel alone] [Main] [Outro] [End]`

## Later: the other three witches

Each witch could have her own theme in the same family of keys, so any two can share a scene. Their names are still open, so these go by role:
- **The Ranger, the Full Moon:** bold folk, French horn, low drums, F major.
- **The Herbal Witch, the Waxing Moon:** gentle and green, nylon guitar, recorder, cello, E-flat major.
- **The Fox, the Waning Crescent:** sly and quick, clarinet, pizzicato, brushed snare, D minor.

## What I'd do with the first five

With pieces 1 to 5, I'd re-score *A Fool's Mercy in 3D* with Moon Faire's own music instead of Witch Way's songs:

| Film time | Moment | Music |
|---|---|---|
| 0:00 | The town | The waltz, on the music box alone |
| 0:20 | The wisps | Lost Souls |
| 0:38 | The Hush | Silence |
| 0:41 | The wraith climbs out | The fight comes in with the drums |
| 1:15 | Curtain Call | The build, landing on the big chord at 1:20 |
| 1:23 | Home | Going Home, into the waltz tune as she reaches the chapel |

Because every piece would be in the same family of keys, I could cross between them anywhere, with no drone to cover the change.

Sound effects (bells, flail, steps, the wraiths' voices) come out better from a sound-effects maker than from Suno. Those prompts are in `docs/sound-requests/`. Suno is worth trying for the long background sounds, though: the night town and the cold wind as "ambient instrumental" pieces.
