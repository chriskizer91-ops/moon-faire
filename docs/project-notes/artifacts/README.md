# Pages that exist only as artifacts

Saved November 18, 2026. These are the pages the project notes name that the repo has no script or built copy for on any branch. Each was read in full and checked for keys, passwords and private details before it was saved here.

| File | Link | What it is | How it was saved |
|---|---|---|---|
| `moon-faire-blob-battle.html` | https://claude.ai/artifact/EmDURhEiinMwqyfi9DasDx | "Moon Faire Blob Battle": the combat rules with no animation, to play or to let the party play itself. One file; the combat engine is inside it. | The published file, byte for byte (57,519 bytes; its checksum matches the one the artifact reports). Version `1794586683-7e51`. It loads two fonts from Google Fonts and works without them. |
| `the-covens-names.html` | https://claude.ai/artifact/Qr2aC6PYqiJFu5xz4wonoG | "The Coven's Names: Io, Kore, Europa and Callisto": what each of the four names means, with sources. A claude.ai doc, not a hand-built page. | The doc's own HTML export of its one tab. See the two changes below. |
| `moon-faire-lore-bible.html` | https://claude.ai/artifact/FjzmuJiuSkf5xrDuggkNmx (the notes also give it as https://claude.ai/code/artifact/7760c8bf-ce71-4a49-a92a-1934db9ac5ab) | "Moon Faire: Lore Bible", first tab. The October lore: most of it was proposed by Claude and never confirmed by Chris (see `../lore/earlier-drafts.md`). A claude.ai doc. | The doc's own HTML export of that tab. See the two changes below. |
| `moon-faire-lore-bible-spellbook.html` | the same doc | The Lore Bible's second tab, "Spellbook": six spells for each of the four, from October. | The doc's own HTML export of that tab. See the first change below. |

## Two changes made to the three doc exports

1. A doc export is only the body of a page. Each one was wrapped in a plain page (a title, and a line saying the text is UTF-8) so it opens properly. Nothing inside the export was changed by this.
2. The byline of the Coven's Names doc and of the Lore Bible's first tab held an account ID in place of a name. It was replaced with "@Chris", because the repo is public.

## How the doc exports were checked

The exports arrive as encoded text that had to be written out by hand. Each decoded file is exactly the size the export reported (17,145, 7,355 and 8,975 bytes) and every tag in it closes. The two Lore Bible tabs were also compared, word for word, with the text copies already in the repo (`flipbook-art-source/project-docs/lore-bible.md` and `spellbook.md` on branch `claude/flipbook-art-source`): they match, apart from those copies' own header notes. The Coven's Names doc has no other copy to compare with; its words and links were read through after decoding and nothing looked damaged.

## What is not here

- The blob battle's engine is also in the notes as `../lore/sim/blob-battle-engine.js`, and on the game branches as `game/sim/blob-battle-engine.js`. The page above is the only copy of the page itself.
- Every other page the notes name has a script or a built copy in the repo. `../INDEX.md` lists each link and where.
