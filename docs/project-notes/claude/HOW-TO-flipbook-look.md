# How to give a Moon Faire witch the Flipbook look

For the sessions building the Ranger, the Fox and Io. Written November 13, 2026, from the Jester's working version. Updated that evening: section 3 (all four witches now have the switch) and section 11 (a finer look, with sliders).

- **See it:** any of the Jester's pages has the switch. The newest is "Jester Witch 3D: how light can she go", https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh (Switches, Flipbook look).
- **The code:** `models/jester-3d/viewer/stage.js` on branch `claude/jester-3d-model`, from the comment "The Flipbook look" down to `drawHer`. About forty lines.
- **The colours:** `models/jester-3d/out/palette.js`.
- **The finer look and the look on the pilot:** `claude/flipbook-look-finer-and-pilot.md`.

## 1. What it is

A switch that redraws the 3D witch so she looks like her pixel flipbook: drawn small, at the sprites' pixel size, every colour snapped to the flipbook's 56 colours, with a dark inked outline. It is done to the finished picture, not to the model. Nothing about her shape, her paintings or her moves changes, and it can be turned on and off while she moves.

## 2. Chris's rules for it (November 13)

- **It is a switch on every witch's page.** It starts off: the page opens in the smooth look.
- **Make her look right without it first.** In his words, a model that looks good without it looks really good with it on.
- **Never use it to hide a model that does not look good.** "If you use the flipbook to hide it not looking good, without it doesn't look good."
- He has not decided whether the game shows the witches with it or without it. Build both.

## 3. What each witch already has

As of the evening of November 13, every witch has the stage code, the 56 colours and the switch. Look again before starting: the branches move fast.

| | The switch | Extra colours | Where it is written up |
|---|---|---|---|
| Jester (`claude/jester-3d-model`) | yes | none | this note |
| Fox (`claude/fox-3d-model`) | yes (pass 13; read in her branch at commit `0a21ddc`) | three for her blouse: `[84,122,116]`, `[51,82,82]`, `[22,45,47]` | `claude/fox-3d-pass13-flipbook-look-blue-mischief-borrowed-face.md` |
| Ranger (`claude/ranger-3d-model`) | yes (stage 8, by her note) | **greys for her hair still needed**: it lands on olive brown | `claude/ranger-3d-stage8-flipbook-look-sleeves.md` |
| Io (`claude/io-3d-model`) | yes (stage 2, by her note) | none needed | `claude/io-3d-stage2-head-hair-hat.md` |

The Ranger's and Io's rows are from their sessions' notes, not read in their branches.

## 4. Turning it on

1. **The colours.** Copy `models/jester-3d/out/palette.js` into her `out/` if it is not there, and load it before `stage.js`. It sets `window.JESTER_PALETTE`. The name says Jester, but these are the colours of the whole Moon Faire sprite sheet (`assets/pixel/moonfaire_pixel_128.png`), which holds all four witches. **All four share the same 56 colours.** Do not make a new set for each witch.
2. **The stage.** If her `stage.js` has the comment "The Flipbook look", it is in.
3. **The switch.** One line where her page makes its switches:

```js
chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); }, false);
```

   On a page with no `chip` helper, any button that sets `stage.look` to `'flipbook'` or `'smooth'` will do. Nothing else has to be called: the stage reads `stage.look` each time it draws.
4. Leave `stage.look = 'smooth'` as the page's starting value.

## 5. How it works

Each time the stage draws with the look on:

1. **She is drawn small, into a picture of her own**, with a clear background. The size is worked out from the camera so that one pixel of that picture is 4.75 mm of her (`stage.mmPerPixel`), the same as her sprites. As the camera pulls back she covers fewer pixels, as a sprite would.
2. **That small picture is laid over the place behind her with hard pixels.** The place itself stays smooth.
3. **Outline.** A clear pixel next to a solid one is inked dark (`0.075, 0.05, 0.065`). A solid pixel on her own edge is darkened to 45%.
4. **Colour.** Her colours are pushed first, because a lit 3D model is duller than painted pixels: 1.4 times the saturation, and a little more contrast. Then every solid pixel takes the nearest of the 56 colours.
5. **See-through things** (sheer cloth) are mixed over the backdrop colour before the snap, so a veil becomes solid pixels of the right colour and does not turn to mud.

The numbers that can be tuned, all in the small shader in `stage.js`: `mmPerPixel` (4.75), the saturation push (1.4), the contrast (1.14 about 0.42), the edge darkening (0.45), the outline colour, and `uSnap` (1 is fully snapped; lower lets some of the smooth colour through).

## 6. What her model and her spells must do

These are the things that break the look. The Jester's code already does them; a new spell or a new part has to follow them.

- **Glowing effects must not write to the picture's see-through channel.** The outline and the snap go by what is solid. An effect drawn with ordinary adding makes the air round her count as solid: it gets an ink outline and is snapped to flat colour. Every glow, sigil, spark and light shaft uses this (`src/80_fx.js`):

```js
const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
```

- **Effects made of points size themselves by the height of the picture being drawn**, not by the screen, so a one-pixel speck is still one sprite pixel (see `dust.onBeforeRender` in the Jester's `src/89_lore.js`: it reads the height of the picture being drawn into).
- **Anything that should be inked and coloured with her must be in her scene** (`stage.scene`), not the place's (`stage.world`). Foes standing with her belong in her scene.
- **Solid cloth cut out with a ragged edge** (alpha test) is fine. Sheer cloth is fine.

## 7. What to check on each witch

Look at her with the switch on, close and at fight distance, standing and in two or three moves. The things most likely to go wrong:

- [ ] **Her face.** At 4.75 mm a pixel her eyes are two or three pixels wide. Check that eyes, brows and mouth still read, and that a blink and a talking mouth show.
- [ ] **Thin things.** Wire glasses (the Fox, the Ranger), bracelets, chains, charms, a bow string, shears. Anything thinner than a pixel flickers or vanishes as she moves. That is true to a sprite, but if a thing she is known by disappears, thicken it a little for this look or accept it and say so.
- [ ] **Colours that land wrong.** The 56 have many reds, pinks, purples, oranges and blues, two yellows, one teal and **no green**. The witches' flipbook frames sit well inside them (97% or more of each witch's pixels have a close colour). But the 3D models wear newer paintings. A green blouse, grey hair or a brown leather may snap to something that looks wrong. If so, add colours: the shader holds 64, so **eight slots are free**. Pass her list as `makeStage(canvas, { palette: [...] })`: the 56, then her extra few. Take the extra colours from her own flipbook frames, not from the 3D render. **The eight are shared by everyone on screen together.** The Fox has taken three and the pilot's wisp three (greens), so two are left for a scene with both. The Ranger's greys must fit in those, or share with something.
- [ ] **Skin.** It should land on the same skin colours on her face, neck, chest and hands. If the face and the neck land on different ones, the fault is in the smooth model's skin tones: fix it there.
- [ ] **Her outline.** One clean dark line round her. Glows must not have one (section 6).
- [ ] **Her spells.** Play each with the look on. Light should stay soft and uninked round her.
- [ ] **The smooth look is unchanged.** Switch it off and compare with a still taken before.

A quick way to find colours that will land wrong: take a still of her in the smooth look and list the common colours that have no close neighbour in the 56.

```python
# far.py: python3 -I far.py out/palette.js still.png
import sys, json
from collections import Counter
from PIL import Image
s = open(sys.argv[1]).read(); pal = json.loads(s[s.index('['):s.rindex(']') + 1])
near = lambda c: min(sum((a - b) ** 2 for a, b in zip(c, p)) ** .5 for p in pal)
im = Image.open(sys.argv[2]).convert('RGB'); im.thumbnail((300, 300)); d = im.tobytes()
n = Counter((d[i] >> 4, d[i + 1] >> 4, d[i + 2] >> 4) for i in range(0, len(d), 3))
far = sorted(((k, c) for c, k in n.items() if near([v * 16 + 8 for v in c]) > 40), reverse=True)[:12]
for k, c in far: print([v * 16 + 8 for v in c], '%.1f%%' % (100 * k / (len(d) / 3)))
```

Crop the still to her first, or the backdrop will top the list.

## 8. If a new set of colours is ever needed

For a character who is not in the sprite sheet (the airship captain, a new foe), follow how the sheet's 56 were made: `art-pipeline/scripts/build.py`, step 2. It pushes saturation by 1.18, then picks 56 colours by clustering, **with saturated colours counted more than their share** so gold, teal and purple survive.

Tested on November 13: a palette made by plain share of pixels comes out washed-out, pink and brown, because the big dull areas take every slot. Count each colour for much less than its share.

## 9. In the game

- The look draws her small, so it is cheap. With it on, the four weights of a witch (`claude/HOW-TO-3d-light-levels.md`) are nearly the same picture, so the lighter ones lose nothing.
- **Still open, for Chris:** with the witches standing on painted places, is only the witch pixelled, or the whole picture? In the not-HD demo only the witch was pixelled and the wraiths beside her looked out of place. He can now try it both ways on "Moon Faire pilot: the Flipbook look", https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg. What that took is in `claude/flipbook-look-finer-and-pilot.md`. In short: a painting needs its own 64 colours (the witches' 56 turn it pink and purple), and at the game's distances the pixel size has to be set in rows down the screen, because 4.75 mm of her is smaller than a screen pixel there.
- Several characters in one scene are drawn into the same small picture and share the one list of colours. That is another reason to keep one palette for everyone.

## 10. Checked, and not

- The 56 colours were checked against each witch's painted flipbook frames: the Jester and Io 99% close, the Ranger and the Fox 97%.
- The look has been turned on for all four 3D models by their own sessions. What each saw is in the notes named in section 3.
- **Not checked by anyone:** the look in motion at real speed. The test browsers draw about two pictures a second.

## 11. The finer look (added the evening of November 13)

Chris asked for something between the Flipbook look and no look, with a slider if possible. There are now two sliders, on the Jester's and the Fox's "how light can she go" pages and on the pilot page:

- **Pixel size**: from the look as it was down to as fine as the screen.
- **Colours**: from the smooth colours to the flipbook's own.

Two new settings on the stage do it:

- `stage.pixelWhole` (starts `true`). `false` lets `stage.mmPerPixel` take any value. Before, each of her pixels had to be a whole number of screen pixels, so only a few sizes were possible.
- `stage.snap` (starts `1`). 1 is the flipbook's colours, 0 is the smooth colours, still inked.

With neither set, the look is exactly the old one.

**These are not in the branches' `stage.js` yet.** They are in the copy used by the two "how light can she go" pages. The change is five replacements, given in full as `patch_stage.py` in `claude/flipbook-look-finer-and-pilot.md`. A session that wants the sliders on its witch's page applies those five and adds:

```js
// pix and snap are sliders, 0 to 100. pix 0 is the look as it was.
stage.pixelWhole = pix === 0;
stage.mmPerPixel = 4.75 * Math.pow(0.8 / 4.75, pix / 100);
stage.snap = snap / 100;
```

Chris has not asked for the sliders on the Ranger's or Io's page. Do not add them unasked.
