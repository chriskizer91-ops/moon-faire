# Moon Faire lore folder

Lore for the four Moon Faire witches: the Jester, the Fox, Io (the Herbal Witch) and the blue Ranger, and the airship captain they meet. Started November 12, 2026.

## Status: in discussion

- Nothing in this folder is final until Chris says so.
- How the final lore is organized is not decided either. Chris: "this isn't the order we're going to organize it."
- Chris wants the lore and the powers to be his ideas. Claude helps him work them out and keeps the notes.

## Which source wins

1. Chris's own words in this folder (`discussion-notes.md`), and the combat system he approved (`combat-balance.md`).
2. Everything older: the "Moon Faire: Lore Bible" doc and its Spellbook tab, the cast table in `claude/START-HERE-sprite-animation-method.md` and `claude/HANDOFF-game-build.md`, the move list `assets/design/moves_v03.json` in the moon-faire repo, and the demo game's rules. Most of that was proposed by Claude and never confirmed. `earlier-drafts.md` summarizes it.

Where they disagree, this folder wins.

## Already changed by Chris

- **Moon Faire is its own game,** in the same universe as (or an alternate universe of) Chris's other games. It will reuse their assets and may borrow their lore.
- **It takes place on a different continent of Thareia, not Aethermoor, in a different time period** from his other games (November 13). The continent's name and the number of years are open.
- **Moon phases are not part of the witches' magic** (November 13). The older moon rule, with one phase per witch, is dropped.
- **The Moon Faire is a normal fair that follows the moon around the planet,** a melting pot of cultures, identities and knowledge. The four travel with it (November 13). The older hook, a festival airship whose performers are secretly its strongest casters, no longer holds.
- **The moon Auros goes once round Thareia every 500 years,** because it is almost tidally locked with Thareia (November 13). That is how a fair can follow it.
- **The world:** a Dark Ages fantasy run on solar crystal power that looks like steam; travel to the wealthy moon and nearby planets by space airship, through a space that is magical, not a vacuum. **There will be an airship in this game.** See "The world" in `discussion-notes.md`.
- **An airship captain the four meet,** not a playable character (November 13). His 3D models are being built now. His look, from Chris's picture, is under "The airship captain" in `discussion-notes.md`.
- **Power order, strongest magic first:** the Jester, the Fox, Io, the Ranger.
- **The Jester's HP is the highest of the four, not the lowest.** Her taunts are moves that also attack or heal her. Her big spell is charged by the blows aimed at her, with no countdown, and it ends fights. The demo game *Night of No Moon: the square* (`claude/night-of-no-moon-the-square.md`) still plays her as the frailest, and its Doom releases a foe after a countdown. Its rules have not been changed yet.
- **The HD Jester model is the version that will be used** (November 12), not the not-HD game model. What could come over from the not-HD model is in `jester-3d-and-lore.md`.
- **The combat system has a first agreed version** (November 13). It was reworked from the fundamentals, keeping only the animations, then tuned with two consultant agents. Chris played it in the blob battle (https://claude.ai/artifact/EmDURhEiinMwqyfi9DasDx) and likes the balance. His rules for levels, and for making the game easier or harder with simple finds rather than changes to the mechanics, are in `combat-balance.md`.

## Files

- `discussion-notes.md`: what Chris has said, one section per character, with the open questions.
- `combat-balance.md`: the agreed combat system: the turn bar, Fate, every move and foe with its numbers, how the fights play for three kinds of player, Chris's level and difficulty rules, and the open questions.
- `sim/blob-battle-engine.js`: the engine behind the blob battle and `combat-balance.md`. Every number is in its `RULES` block. Run it with node.
- `sim/moonfaire_sim.py`: the simulator from the first combat draft, which Chris set aside. Kept for history.
- `jester-3d-and-lore.md`: the HD Jester's moves now, what could come over from the not-HD model, and how both fit the lore (Claude's proposal).
- `earlier-drafts.md`: what existed before this folder, from the docs and the sibling repos.

## Where the work lives

The lore lives here in the project. The models and games live in GitHub repos.

- **`chriskizer91-ops/moon-faire`** (public): the only repo to write to for Moon Faire. Its own `CLAUDE.md` has the rules.
  - **The HD Jester (the one used):** branch `claude/jester-3d-model`, folder `models/jester-3d/`. Published at https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M. Start with `claude/HOW-TO-3d-witch-models.md` and `claude/HANDOFF-jester-3d-and-flipbook.md`.
  - **The not-HD Jester** (effects, battle and sound to bring over): branch `claude/jester-not-hd-3d-model`, folder `models/jester-not-hd-3d/`. Notes: `claude/jester-game-model.md`.
  - **The older move list:** `assets/design/moves_v03.json` on the default branch. This folder outranks it.
  - **The Jester's story *A Fool's Mercy*:** `docs/stories/a-fools-mercy.md` on the default branch.
- **Sibling repos, read-only.** Reuse their assets and code, but never commit to them:
  - `chriskizer91-ops/envoi-on-the-longest-night` (public): Io, Lunara, the Shadow Wraith, the sound. Its lore canon is in `docs/`, starting at `docs/game-context.md`. Its balance report, with a target per play style for every fight, is `docs/balance-report.md` on branch `claude/send-note-gigdew`.
  - `chriskizer91-ops/follow-me-down-witch-way` (private, so it must be added to the session before it can be read): the herb game. Its lore is in `materials/Witch-Way-Bundle/Follow_Me_Down_Witch_Way_Chat_Archive/01_Lore/`.
  - `chriskizer91-ops/20-min` and `chriskizer91-ops/airship-game-in-aethermoor-`: the Aethermoor games.

## For the 3D sessions

All four witches will be modelled in 3D over the coming month or more, plus the airship captain, a non-playable character the four meet (his models are under way). The lore is being written first because it's quicker than the many sessions each model takes. A model's spells and moves should follow this folder, not the older move list. The moves each witch uses in the game, with their numbers, are in `combat-balance.md`; a model can animate more than that, as a bank for later. For the Jester, start with `jester-3d-and-lore.md`. Her moves can change, and so can the story parts of it.
