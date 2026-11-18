# Moon Faire: people from a template, and what the API charges for one (November 13, 2026)

## Where it stands

- **Chris's ruling:** the only NPCs in the game are people the party talks to. No background crowd.
- By that measure he found **none of the first twelve people good enough** for the game.
- He then called the hand-made **lamp-seller "pretty fantastic"** and pointed out she is the only one made by Fable 5.2. She was made by hand in the session that built the kit, and is the worked example every model is given.
- He asked for **Opus 5.5 only, at high or extra-high effort**, and no other model. That second test is done (below). Whether its people pass is Chris's to say.
- The game does not load any of this yet.

Page with the people in 3D, the costs and a person maker: https://claude.ai/artifact/S2zzMgXm1qwoGEF2Nk491T
Offline copy (the person maker only works in this one): `game/people/out/moon-faire-people.html`
Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/people/`. README section "People from a template".

## How it works

The Jester's finished model is the template. Her skeleton, every move, her body, hands, head and boots are reused at the Lightest weight. A person is one small file (2 to 5 KB) that sets:

- height, build and head size, and skin colour
- colours for the body she already has (top, sleeves, forearms, legs, boots)
- a repainted face: her face painting with the jester make-up painted out, then lips, brows, eye colour, lines of age, freckles, stubble and so on painted over it
- new parts made of simple shapes fixed to her bones: skirts, coats, aprons, belts, hats, scarves, ready-made hair and beards

A Claude model is given one page of instructions (`game/people/kit/PERSON-KIT.md`, about 5,000 tokens) and one line about the person. It writes the file. The tool builds it, shows the model one picture (front, three-quarter, side, back, walking, face twice) and lets it fix the file.

## What it cost

Four one-line test descriptions (a baker, a fortune-teller, a farm lad, a night-watchman: stand-ins, not lore). List prices of November 13, 2026. Both tests together cost $8.02 of Chris's API credit.

| Made by | Each person | Time |
|---|---|---|
| Opus 5.5, high effort (second test) | 38 cents | 123 s |
| Opus 5.5, extra-high effort (second test) | $1.33 | 423 s |
| Opus 5.5, default effort (first test) | 18 cents | 55 s |
| Sonnet 5.5 (first test) | 11 cents | 58 s |
| Haiku 5.5 (first test) | 0.52 cents | 34 s |

The first test was written for people seen small, with up to two fixes. The second was written for a person the party talks to (more shapes, smoother clothes, telling details), with up to three fixes.

## What was learned

- **Opus 5.5 at high effort is the setting to use.** It adds real detail: pockets, apron ties, a neckerchief, sleeve trim, belts with buckles. Extra-high adds a few more touches (a lantern, a hat feather) for three to five times the price and wait.
- **The design decides more than the price.** A woman in long clothes (the lamp-seller, the fortune-teller) suits the template and holds up. Men and stout people do not yet, because every person has the Jester's body and the shape of her face. A second template body would lift this.
- Very dark skin comes out too dark on the face painting; the skin step needs work before it is used.
- The shapes are stiff. Nothing sways or blows.
- Each person is about 12 thousand triangles and 15 draws. The Jester took 106 thousand walking the fair square on Chris's laptop. Speed with people in a scene has not been measured; no Claude session can measure it.
- Fable 5.2 has not been tried through the key. It is on the key at twice Opus's price.

## Making more without the subscription

- The offline page has a "Make one yourself" box: one line, Opus 5.5 at high or extra-high effort, the key. It makes the person in the browser, shows tokens and cost, and can save the file.
- `python3 people/kit/make_person.py --model claude-opus-5-5 --effort high --rounds 4 --list people/kit/test-people.json`

The key was kept only in the workspace of the session that ran the tests (never in the repo, the pages or these notes).
