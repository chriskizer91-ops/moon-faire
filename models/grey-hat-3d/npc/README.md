# The Grey Hat's light version: one of the fair folk

Chris, November 16: "Can you make A level of detail model of the gray hat Captain and only matching the model size that the
other NPCs are". So he is made **on the fair folk's own kit** (`game/people/kit` on branch `claude/moon-faire-starter-world`,
checked out at commit `90919e4`): the Jester's skeleton, body, hands, head, moves, emotes, walk, run and sit, with his own shapes
and his own paint. Game code makes him exactly as it makes one of them.

- **Page:** https://claude.ai/artifact/JLyeUSnZWjme7DPzWpdwVQ (the fair folk's test page with him first in the list).
- **Size, as theirs:** a quarter (the game's weight) **2,781 triangles** (theirs 2.5 to 2.9 thousand); half **5,608** (theirs
  4.9 to 5.6); full **10,775** (theirs 9.8 to 11.3). His finished model is about 599,000.

## For game code

```js
// load the fair folk's files as usual (see game/people/kit/build_npcs.py), then this one before npc.js:
//   models/grey-hat-3d/npc/greyhat_npc.js
const cap = await MF_NPC.make('grey-hat-captain');            // a quarter of the triangles; { weight: 'half' } or 'full' for more
scene.add(cap.root); cap.update(dt); cap.face(x, z); cap.greet(); cap.talk(true); cap.emote('laugh');
await cap.walkTo(x, z); cap.sit(); cap.stand(); cap.headTop(v);
```

`greyhat_npc.js` adds him to `window.MF_NPCS` (person, paint fit, weights, wiring) and `window.MF_NPC_TEX` (his two paint
pictures). It can be loaded with the fair folk or on its own. His wiring (`wiring.json`: gruff talk, a bow for hello, his moods)
is a stand-in, the same choice as his full model's.

## How he was made (no painter, no API key)

1. `sheet.py` draws his **finished model** flat-on, without perspective, in the kit's painting frame (front left, back right,
   1.5 m by 2 m of the template's size), shrunk by his height (`frame.json`: H 1.0885). His arms are posed 11 degrees out and his
   legs 3.4 degrees in so they land on the template's arms and legs. The scroll is left out of the drawing (`HIDE`), because the
   light version has its own. So the paint needs no fitting: `fit.json` is `[1, 1, 0, 0]`.
2. `make_paint.py` makes `body.webp` from that drawing, as the kit's `prep_skin.py` does from a painting (edge colours spread out,
   the small face painted out), and `face.webp` from his face painting C1, moved so his eyes and mouth sit where the template
   expects them (eyes 356 and 668 across, 309 down; mouth 652).
3. `person.js` is his shape, measured off the drawing (`out/sheet.png`; the measuring was a row-by-row table of his outline from
   the front and side): straight shirt-and-corset trunk with the ruffled front, full sleeves gathered at a band, lace cuffs,
   leather cuffs, fingerless gloves fitted to the template's hand, seat and baggy legs of the trousers, wide boot shafts, belt,
   pouch, scroll strapped to his right thigh, hair as a cap and long panels behind his ears, a beard shell along the template's
   jaw (measured off its face), the hat tipped back 20 degrees with its point bent to his left, and glasses placed from his own.
4. `skin.js` finishes the fit: plain colours for the parts that would pick up the wrong paint (hair, beard, brim, sleeves, gloves,
   scroll, glasses), and his skin colour matched to the edge of his face picture.
5. `weights.py` makes `weights.json`: the template's torso, legs and upper arms are left off at every weight (all are under his
   clothes); at half and a quarter each part keeps a share (most for the head, hat and glasses), and one number scales the shares
   to the fair folk's budgets.
6. `pack.py` writes `greyhat_npc.js` and the page `out/grey-hat-npc.html`.

Checks: `check.py` builds him through `MF_NPC.make` at each weight, checks every mesh's lists, plays all 14 emotes and the talk,
walks, runs, sits, waves seated and stands: no broken numbers. `look.py`, `closeup.py`, `moves_strip.py`, `lineup.py` make the
pictures (`out/`). The tools expect a checkout of the starter-world branch at `/home/claude/sw` (or `KIT=` for `look.py`).

## Rough

- His face is the template's face wearing his painting, and his body the template's moves: he walks, runs and sits as the fair
  folk do, not with his full model's own walk.
- The beard shell has a hard top edge on the cheeks up close. Hair and sleeves are plain colours, without the folds and waves.
- No gold dust from his boots at this weight.
- Not watched moving (stills only). Not seen on a real phone or laptop. The fair folk's Flipbook colours note applies to him too.
