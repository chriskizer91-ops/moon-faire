# Moon Faire: painted skins on simple people (November 13, 2026)

Follows `claude/moon-faire-people-from-a-template-api-cost.md`.

## Where it stands

- Chris's idea worked: one simple 3D person, several painted skins. **19 painted people are built and waiting for Chris to judge them.**
- Chris made all 22 pictures in ChatGPT (11 skins: a body sheet and a face each).
- As Chris asked, Fable 5.2 at high effort did the fitting through his API key: the lamp-seller model and the Fable 5.2 models first, then the same skins on the Opus 5.5 models.
- The game does not load any of this yet. Chris's ruling stands: the only NPCs are people the party talks to.

Links:
- People page (the painted people in 3D, first in the menu): https://claude.ai/artifact/S2zzMgXm1qwoGEF2Nk491T
- Skin prompts page: https://claude.ai/artifact/8BgZ19cqFPZvpJGBeqEQ2v
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/people/`. README section "Skins".

## How a skin works

One person model keeps its shapes. A skin is two pictures made in ChatGPT:

1. **The body sheet**, painted over the model's grey guide: the model standing, flat from the front (left half) and from behind (right half), 1536 x 1024, each half 1.5 m wide and 2 m tall.
2. **The face**, painted over the face guide (the Jester's face painting with the make-up painted out), so eyes, nose and mouth stay where the 3D head expects them.

Laying it on:
- Every part of the model except the face and hands takes its colour from the body sheet by where its points stand in the standing pose: the front figure on what faces forward, the back figure on what faces back.
- The face picture replaces the face painting. Hands and neck take the skin colour.
- Before that, each sheet is prepared: the figures are found and measured against the guide (ChatGPT kept to the guide within 1 to 2 percent), the figure's edge colours are spread over the grey background, and the small face on the body sheet is painted out so hair and headcloths do not pick it up.
- Then a Claude model looks at the painted person and writes a small file: skin colour, which parts should be one flat colour, how shiny, small nudges.

## What it cost

| Step | Who | Cost |
|---|---|---|
| The model's shapes, once per model | Opus 5.5 high effort / Fable 5.2 high effort | 38 cents / $1.08 |
| Writing the skins for a model | Opus 5.5 high effort | about 5 cents |
| The two pictures per skin | Chris, in ChatGPT | his time |
| Finishing the fit, per painted person | Fable 5.2 high effort | about 11 cents, 16 seconds |

Fitting all 19 cost $2.01. Everything spent on Chris's key so far: about $15.23.

## What was learned

- The painted skin does most of the work. The lamp-seller model is three different women; the men now have men's faces.
- The same pictures sit on the Opus 5.5 models nearly as well as on the Fable 5.2 models they were painted for. Which model built the shapes matters less than the painting.
- Fable 5.2 as the fitter made small, sensible choices (flat hair, skin colour, shine). The automatic fit already did most of it.
- Still showing: hair is a flat-coloured shape round the face; shoulders are angular; under a man's clothes the body is still the Jester's; the top of a tall hat smears.
- ChatGPT did not have `style-reference.jpg` (its own note says so), so the skins are more lifelike than the witches' painted look. Attach the style picture if the witches' look is wanted.
- Each person is about 12 thousand triangles and 15 draws. Speed on Chris's laptop has not been measured; no Claude session can measure it.

## The painted people (stand-ins, not lore)

- Lamp-seller model: old lamp-seller, pie seller, ballad singer
- Fortune-teller model: fortune-teller, old lamplighter
- Night-watchman model: old night-watchman, chestnut roaster
- Baker model: fair baker, ribbon dyer
- Farm lad model: farm lad, gate keeper

The last four models each exist twice: shapes by Fable 5.2 and shapes by Opus 5.5.

## Tools (in `game/people/kit/`)

`guides.py` (a model's guide), `make_skins.py` (Opus writes the skins), `build_skin_prompts.py` (prompts page and pack), `prep_skin.py` (prepares Chris's pictures), `person-kit.js` (lays a skin on), `paint_person.py` with `SKIN-KIT.md` (the fitter), `build_maker.py` (the people page). Chris's original PNGs are not in the repo; the prepared copies are in `game/people/skins/`.

The key is kept only in the session's workspace, never in the repo, the pages or these notes.
