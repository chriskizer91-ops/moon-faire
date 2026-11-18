# Moon Faire fair folk: two lighter weights, and the Flipbook look switch (November 13, 2026)

Follows `claude/HOW-TO-moon-faire-fair-folk-npcs.md` and `claude/chris-on-flipbook-settings-light-weight-and-fight-camera.md`.

## What Chris asked

An experiment: lighter versions of the NPC models that the painted surfaces can go onto, two of each (half as many triangles, and a quarter), made through the API key; and a Flipbook look switch. **Done as an experiment. Chris has not judged it yet.**

- Test page (weight choice and the switch are under the emote buttons): https://claude.ai/artifact/Gqb3KJtYJ76eTn5k1bWkAM
- Picture of five people at the three weights: `game/people/out/fair-folk-weights.jpg`
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`. README section "Fair folk: two lighter weights, and the Flipbook look switch".

## The lighter weights

- **Nothing has to be baked.** The painted skin is read by where each point of the model stands. Thin the model and the paint is still in the right place. So a lighter weight is the same person with some parts left off and fewer triangles in the rest.
- Fable 5.2 at high effort, through the key, decided each one. For each of the nine sets of shapes it was shown the person at full, half and a quarter (first with every part thinned equally), chose what to leave off and how to share the triangles, and looked at the result. A tool held each total to its budget. $1.94 for all nine.

| Weight | Triangles a person |
|---|---|
| Full | 9.8 to 11.3 thousand |
| Half | 4.9 to 5.6 thousand |
| Quarter | 2.5 to 2.9 thousand |

- What it chose: keep the head (the face painting, the blink and the mouth are there), take most from boots, soles and hands, leave off the legs under long skirts and robes and the trunk under closed coats.
- At game size the three weights are hard to tell apart in stills. Up close at a quarter, hands and boots are plainer.
- In the game: `MF_NPC.make(id, { weight: 'half' })` or `'quarter'`.

Not done, and worth knowing:
- The number of draws is the same at every weight (about 15 a person). Putting every painted part into one mesh would cut that. It is the next thing to try if draws matter more than triangles.
- For scale: Chris leans to the witches at Light, where the Jester is 43 thousand triangles. A fair-folk person at full is about a quarter of that already.
- Speed on Chris's laptop is not measured; no Claude session can measure it.

## The Flipbook look switch

- The look is now in the game's own stage (`game/src/stage.js`), applied from the patch the Flipbook session left in `claude/flipbook-look-finer-and-pilot.md`. With the switch off a picture is drawn exactly as before. The pilot page was not changed or republished.
- On the fair folk's page the switch starts off, as the rule says. On, it uses Chris's setting: 1.2 mm of the person to a pixel, never finer than the screen, full flipbook colours. 2.2 mm and 4.75 mm (the sprites' size) are there to compare.

**Finding for Chris:** the witches' shared colours do not suit the fair folk. That list has almost no green or cream, so a green coat goes brown and a cream apron goes pink. The page therefore starts on each person's own 64 colours, worked out from their painting, with the witches' list beside it to compare. The look holds one list of 64 colours for everyone on screen, so how witches and fair folk share it in one scene is not solved. Ways it could go: draw the fair folk in a separate pass with their own colours; make one new shared list from the witches and the fair folk together; or keep the fair folk out of the colour step and only ink them.

## Cost

This step: $1.94. Everything spent on Chris's API key across the people work: about $23.75. The key is kept only in the session's workspace.
