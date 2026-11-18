# The Grey Hat captain (maybe Noiz): DONE (November 15, 2026)

**Chris, November 15:** "the gray hat Captain is done and is in the repo".

He is finished as a model. Do not rebuild or restyle him unless Chris asks.

## Where he is

- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/grey-hat-3d-model`, folder `models/grey-hat-3d/`. Final commit `92d5b87`, checked on GitHub on November 15: the branch points there and nothing is left unpushed.
- **He is on his own branch, not merged** into another branch, the same as the witches' models. A session that needs him fetches that branch.
- **His page:** https://claude.ai/artifact/L25hB8DWnPBxJm44MAfiJe (version `1794698632-b260`).
- **Start here:** `models/grey-hat-3d/README.md`. The stage sections at the top are the newest; "Stage 7, second half" says how game code drives him.
- **Rebuilding him from the repo:** the paintings are stored in `references/chatgpt/`; `lib/restore_refs.py` puts them back where the tools read them; the bake scripts and `./build.sh` make the rest. Build commands are in the README.

## What he is

A man's blank doll under real clothes, as the witches are made:

- painted skin, legs in fishnet;
- trousers with eleven real holes;
- a shirt of real cloth that moves;
- hair as locks over real ears;
- the hat, pearls, feather earring, belt, pouch, scroll, charms and dagger;
- gold dust from his boots;
- a walk and a resting stance;
- everything the fair folk can do: three talking loops, fourteen emotes, blink and talking mouths, fidgets, facing, walking and running to a point without sliding feet, sitting and standing.

About 599,000 triangles.

**Game code calls him the same way as a fair folk NPC:** `update`, `face`, `greet`, `talk`, `emote`, `walkTo`, `runTo`, `stop`, `sit`, `stand`, `seat`, `headTop`, `wiring`. His `wiring` (which talk, hello and moods are his) is a stand-in until Chris says who he is.

## The notes, in order

1. `claude/grey-hat-3d-reference-prompts.md`
2. `claude/grey-hat-3d-first-build.md`
3. `claude/grey-hat-3d-rebuild-stage1-doll.md`
4. `claude/grey-hat-3d-rebuild-stage2-legs-trousers.md`
5. `claude/grey-hat-3d-rebuild-stage3-shirt.md`
6. `claude/grey-hat-3d-rebuild-stage4-hair.md`
7. `claude/grey-hat-3d-rebuild-stage5-walk-posture.md`
8. `claude/grey-hat-3d-stage6-hat-belt-jewellery.md`
9. `claude/grey-hat-3d-stage7-npc-animations.md`

## Known rough edges Chris has accepted by calling him done

- Shirt front flatter than painted.
- Corset and boots are still the old painted skin.
- The hair's top is flat.
- The scroll sticks out in front of his thigh.
- He swivels when turning on the spot.
- He has not been watched moving or seen on a real phone by any Claude session.

## Not done (separate jobs, not the model)

- His lighter versions for the game, as the witches have.
- Placing him in the open world in place of the grey stand-in (task board row C6b).
- Who he is, his name and his lines: Chris's to decide. "Noiz" is still a maybe.
