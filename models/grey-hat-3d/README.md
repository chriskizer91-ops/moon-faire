# The Grey Hat: 3D model (working name)

A character the four witches meet. He is not playable. Chris, November 13, 2026: he "might like join them in a fight or
something or just talks to them", and he gets his own folder because he is a character in the game that they meet.

- **"The Grey Hat" is a working name**, taken from his hat. His name, who he is and what he can do are not set, and nothing in
  this folder is lore. The lore lives in the claude.ai Project "Flip Book Art", folder `lore/` (`discussion-notes.md`, section
  "The character they meet").
- He will be built the way the witches were: a code-built three.js model with realistic paintings baked on. The method is the
  Project docs `claude/HOW-TO-3d-witch-models.md` and `claude/HOW-TO-3d-witch-faces.md`. Read both before writing any code.
- Project note for this folder: `claude/grey-hat-3d-reference-prompts.md`.

## Where he stands: before stage one (November 13, 2026)

- There is one picture of him, from the front, a cartoon in sunset light: `references/source/grey_hat_picture.png`.
- The list of reference paintings Chris will make in ChatGPT is written: 62 prompts in three rounds
  (`references/grey-hat-3d-reference-prompts.md`). Round 1 (sets A to E, 37 paintings) is enough to start building.
- The page Chris runs it from, with the images to attach and a copy button on every prompt:
  https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x (republish every change to that link).
- No paintings have come back yet, and there is no model code yet.

## What is in this folder

| Path | What it is |
|---|---|
| `references/source/grey_hat_picture.png` | The picture Chris shared. The only source for his design so far. |
| `references/starters/` | The seven images Chris attaches in ChatGPT. N1 to N3 are his picture and two enlarged cuts of it. S1 to S4 are the Jester style guides the Ranger's and the Fox's pages also use (from branch `claude/jester-3d-model`, `models/jester-3d/references/`). |
| `references/grey-hat-3d-reference-prompts.md` | Every prompt, the standing rules, the checklist, and what was guessed from the picture. |
| `references/build_prompts.py`, `page.tpl.html` | Build the prompt list, the page, the starters and the zip. All the words live in `build_prompts.py`. |
| `references/chatgpt/` | Where the kept paintings go, as webp, named by code (`A1.webp`, `C3.webp`). |

Rebuild the page and the list after changing any wording (the page and the zip are not committed):

```
pip install pillow
python3 -I models/grey-hat-3d/references/build_prompts.py \
    models/grey-hat-3d/references/source/grey_hat_picture.png - models/grey-hat-3d/references \
    https://claude.ai/artifact/C5AQhCfSatL1PAZoLVPP2x
```

To rename him, change `NAME`, `CAP` and `SLUG` at the top of `build_prompts.py` and rebuild; then `git mv` this folder.

## His design, as read from the picture

Never mirror him. Seen from his own side:

- **Head:** a slumped grey felt witch's hat with a very wide brim, its tip falling to his left. Thick black rectangular glasses.
  Long wavy dark brown hair to just past his shoulders. A short full beard. A black plug in each ear; a small silver charm and a
  black feather hang from the left one. A short strand of pearls.
- **Body:** a cream linen poet's shirt with a red-laced front, lace-edged ruffles and very full sleeves pushed up the forearm.
  A black leather underbust corset with two buckled straps at the front. Black fingerless gloves under studded wrist cuffs.
- **Hips:** a wide black belt closed by a large silver ring, higher on his left hip, with a second strap dropping to his right
  hip. Right hip: a brown pouch, a rolled scroll in a leather loop, a silver skull charm and a gold leaf charm. Left hip: a
  sheathed dagger.
- **Legs:** baggy black trousers printed with dark red flowers, torn into long oval holes down the front of each leg, over
  black fishnet. Heavy glossy black strap boots with a turned-down studded cuff and a thick lug sole.

Where the picture was unclear, the prompt list says what was chosen (its section "What Claude read from the picture, and
where it guessed"). The open ones: whether the gold flecks on the boots and gloves are real, what exactly hangs on his left
thigh, and everything about his back.

## When the paintings come back

Follow the how-to's order: measure first, body and base layers, head and face, hands, boots, costume solids, cloth,
accessories, then movement. Show Chris each stage, and record what he approves.

- **Start from the Ranger's code** (branch `claude/ranger-3d-model`, `models/ranger-3d/`): it already has glasses, hair you
  can see, painted hands and arms, and belts, a satchel and a pouch as real objects (`src/R45_gear.js`). Take the wide cloth
  trousers and anything that swings from the Fox (branch `claude/fox-3d-model`, `models/fox-3d/`). Copy; do not reorganise
  shared code.
- **His body is a man's.** New proportion tables from A1, A3, B3 and B5. Build the body to B3 and B5 (no corset, no trousers)
  and check it before the corset and trousers go on.
- **His face is his own.** The Ranger and the Fox both ended up on the Jester's face model with their own painted faces. His
  brow, nose and jaw are heavier, so measure his profile from C3 before deciding whether that head can be reshaped to him or
  he needs his own tables. C1 is the painted face, C2 its blink and talking mouths, C9 the check between straight on and the
  side. The beard is paint from C1 over shallow relief; look at it in profile and from below (C8, C13) before adding anything.
- **No teeth**, as on the Fox: his mouth is closed or just parted in every painting.
- **The hat is a solid object** (C10), like the Jester's cap. The brim hides his hairline from most cameras; C12 is his hair
  for when the hat comes off in the bow.
- **Shirt:** the full sleeves are cloth sheets pinned at the shoulder and at the forearm band. The ruffles and lace are cut
  out with the lace's own holes.
- **Trousers:** one baggy cloth per leg with the holes cut out of it (map in F6 and B4), over legs that wear the fishnet (F9)
  on skin.
- **Belt gear:** belt and second strap as loops round the hips, pouch and scroll loop hung like the Ranger's bags, the two
  charms and the feather earring as spring chains.
- **Movement:** he is someone the four talk to, so standing, listening, talking, walking and the hat come first (set H). A
  dagger guard and lunge exist as one optional painting (H9). He has no magic until Chris says what he is.
