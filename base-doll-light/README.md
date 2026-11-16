# The base doll, light models only

`moon_faire_base_doll_light.html` is one file (70 MB) with everything inside it. Open it in a browser and it works offline, with no other files next to it.

The same page as a link: https://claude.ai/artifact/DL4bd5jt1AjxUxQNtae4T1 (Moon Faire: the base doll light).
The full doll, with each outfit at full detail and a switch to its light model: https://claude.ai/artifact/TvHFXuVgnHo8e6kkTGcWNC (Moon Faire: the base doll).

Nothing in the game loads this folder yet.

## What is in it

- The base doll (Io's body) in 21 outfits, each one a light model of about 50,000 triangles. The full outfits are 450,000 to 560,000.
- Each light model is her body, the clothes and the bun as one mesh. The paintings, shine and velvet sheen are baked into its pictures.
- Her face stays its own small live mesh, so she still blinks, talks and shows her feelings. Every move works, and skirts, capes and sleeves still swing.
- The fae's wings, the bard's feather and the masquerade mask stay real see-through pieces. They count inside the 50,000.
- The same moves, views, Turn slowly and Flipbook look as the full doll page.
- Not here: the bra-and-shorts look, the hair choice (she always wears the bun) and the bra and shorts colours. None of those has a light model.

## How it works

- Each outfit has two parts inside the file: its light model, and the small code file that says how the outfit moves (heels, the skirt kept off her legs, the wings' flutter).
- When you pick an outfit, the page sets up that code on a rough, unseen copy of the outfit, then shows the light model in its place. The full outfit is never drawn and its paintings are never loaded, except the paintings of the three see-through pieces.
- Checked: for every outfit, her bones move the same as on the full doll through walk, jog, kneel, squat, twirl, curtsey and hover. Night out, the Court gown, the Sorceress and the Devil gown build their footwear at full detail, because their moves read it.
- Changing outfits takes a second or two, because of that setup.

## Not checked

- On a real phone or laptop. Speed cannot be measured in the test browser.
- Opening a 70 MB file on a phone. If it is slow to open, use the link instead: it downloads each outfit only when you pick it.

## Made from

The workspace of the session that made it (not in this repo): the doll and its 21 outfits, the light-model tools (`tools/lightbake/`: simplify to 50,000 triangles, unwrap, bake the pictures, compare with the full model), `build_doll_light_site.py` and `build_doll_light_single.py`.
