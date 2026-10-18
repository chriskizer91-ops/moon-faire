# Moon Faire: handoff to the game build

Written October 18, 2026 by the Claude session that built the art pipeline in the claude.ai project **Flip Book Art**. This file is for the Claude Code session building the game in the repo.

**The split:**
- **The claude.ai project:** lore, new ideas, and all new art (ChatGPT image generation plus Claude's cutting pipeline).
- **The repo:** the game. It consumes the assets in this folder and never draws or edits art itself.

When new art is ready, a fresh export of this folder replaces the old one wholesale.

---

## 1. The cast

Four Renaissance Faire outfits Chris's wife wore, turned into characters. They live on Thareia, Chris's world, alongside its moon and the other planets in his lore. Thareia is the same world as his Aethermoor and Envoi games, with airships on sunstone lift, the Gloomfen and Ironhold.

Story hook (proposed): **the Moon Faire**, a festival airship touring Aethermoor. Its four performers are secretly its strongest casters. All four use magic, carry a hidden weapon in their costume, and draw on one phase of the moon. The rule of the world: all magic is moonlight, and the less moon in the sky, the more of it a caster carries.

| Character | Moon phase | Magic | Hidden weapon | Power rank |
|---|---|---|---|---|
| Ranger (blue princess, silver-grey bun, glasses) | Full Moon | Light: arrows, flares, barriers | Folding moonsteel bow worn flat in her corset | 1 (steadiest) |
| Herbal Witch (wine-red horned hat, spellbook in her left hand) | Waxing Moon | Healing and big summons | Crescent pendant that unfolds into a golden sickle | 2 |
| Fox (fox ears, bell collar, patchwork pants) | Waning Crescent | Foxfire, illusions, tricks | Dressmaker's shears that split into twin daggers | 3 |
| Jester (noble witch, black jester hat, sheer veils) | New Moon | Fate: Doom, Stop, Gravity | Gold hip bells that form a chain flail | 4: power beyond power |

Names for the four, the moon's name and the other planets are still open, and are being decided in the project.

---

## 2. What's in this folder

```
moonfaire_game_assets/
  HANDOFF.md                     this file
  manifest.json                  every clip, frame, fps, anchor and status (generated, don't hand-edit)
  hd/<character>/<clip>/NN.webp  HD frames, transparent, WebP 90% (~10 MB total)
  pixel/moonfaire_pixel_128.png  every frame as 128 px pixel art on one indexed-PNG sheet
  examples/play_clip.html        tested reference player: loads the manifest, draws on anchors, HD or pixel
  design/                        combat design + balance simulator (section 5)
```

### manifest.json

```json
{ "characters": { "jester": { "clips": { "curtain_call": {
    "fps": 6, "loop": false, "flipX": false, "seconds": 8.0,
    "release_frame": 32, "status": "done",
    "frames": [ { "hd": "hd/jester/curtain_call/01.webp", "w": 246, "h": 377,
                  "anchorX": 119.6, "anchorY": 375.4,
                  "pixel": { "x": 0, "y": 0, "w": 278, "h": 193 }, "source": "K01" } ] } } } } }
```

- **anchorX / anchorY:** the torso centre and the boot soles, in that frame's own pixels. Draw every frame so its anchor lands on the character's stage position: `drawImage(img, stageX - anchorX*s, stageY - anchorY*s, w*s, h*s)`. Frame sizes differ wildly, because effects like the Witch's deer guardian or the Jester's flail arc make some frames wide. The anchor is what keeps her standing still. Never centre a frame by its box.
- **One shared scale for every character.** The Jester is about 370 px from boot to hat in HD. The four women's height differences are real, so keep them.
- **flipX:** `walk_left` reuses the `walk_right` files mirrored about the anchor. Mirroring is fine for walks. Don't mirror spells, because costumes are asymmetric (the Witch's book is in her left hand).
- **release_frame:** the 1-based frame where the spell's effect fires: damage, heal, projectile launch. Gameplay events fire on that frame, not on the last frame. The Jester's big spells were timed to their real release frames: the sigil peak, the ring sweep. On the 8-key draft moves it's a best guess, so tune it by eye.
- **pixel:** each frame's rectangle in the pixel sheet. Every cell is 278×193 with a shared anchor (139, 185). Draw at whole-number scales with smoothing off.
- **source:** the internal frame name in the art pipeline (for example K01). Use it to trace a frame back if something looks wrong.

---

## 3. Clips and their status

Speeds are Chris's choices, made by watching each clip in the flipbook. Keep them.

| Character | Clip | Frames | fps | Release | Status |
|---|---|---:|---:|---:|---|
| Jester | idle (breathing loop) | 8 | 4 | — | done |
| Jester | walk_right / walk_left | 16 | 6 | — | done |
| Jester | walk_toward | 4 | 2 | — | done |
| Jester | walk_away | 6 | 3 | — | done |
| Jester | curtain_call (ultimate) | 48 | 6 | 32 | done |
| Jester | sealed_fate | 24 | 5 | 16 | done |
| Jester | against_all_odds | 16 | 2 | 4 | done |
| Jester | gilded_rebuke (flail attack) | 8 | 4 | 5 | done |
| Jester | hush | 29 | 6 | 17 | done |
| Jester | gravity | 15 | 9 | 11 | done |
| Ranger | moonsteel_draw, silver_arrow | 8 | 6 | 5 | draft: 2 finishing frames each in progress |
| Ranger | silverglass_ward | 8 | 4 | 5 | draft: becoming 11 frames |
| Herbal Witch | harvest_crescent | 8 | 4 | 5 | draft: becoming 12 frames at 6 fps |
| Herbal Witch | silverleaf_salve, elderwood_guardian | 8 | 2 | 6 / 5 | draft: becoming 22 frames at 6 fps |
| Fox | hemline_fangs | 8 | 4 | 5 | draft: becoming 12 frames at 6 fps |
| Fox | blue_mischief, borrowed_face | 8 | 2 | 6 / 4 | draft: becoming 22 frames at 6 fps |

The drafts are complete, playable moves, only choppier. Build with them now, and when the smoothed versions arrive the manifest swaps in with the same clip names.

**Not drawn yet:**
- **Ranger, Witch and Fox:** idle, walks, hit, defeat and victory.
- **Remaining moves:** 7 more each for the Ranger, Witch and Fox (they have 3 of 10), plus 4 more for the Jester (Stop, Royal Reversal, The Last Toll, Ill Omen).
- **Effects:** separate assets such as projectiles, Doom marks and shields (see `design/Effect_Assets.md`).

Use placeholders and ask Chris; new art comes from the project, not the repo.

---

## 4. Rules for using the animations

1. **Data-driven.** Read clips from `manifest.json`. Don't hard-code frame counts, sizes or file names. They will change when new art lands.
2. **Anchor every frame** (section 2). This is the single most important rule.
3. **Fire gameplay on `release_frame`.** Cast time = (release_frame − 1) / fps. Recovery is the rest of the clip. One-shot moves return to idle when they end.
4. **Preload per character.** Load a character's clips when she joins the scene. Decoded HD memory today: Jester ≈ 67 MB, each of the other three ≈ 8–9 MB, ≈ 91 MB total. That fits on a phone, but it grows quickly as moves are smoothed (the Jester alone took 48 frames for one spell). Release clips you're not using, and don't decode everything at boot.
5. **The pixel sheet is 2780 × 7141.** That's above the 4096 texture limit of some phones and older GPUs. If you draw pixel mode through WebGL, split the sheet per character in a build step. 2D canvas `drawImage` from it is fine.
6. **Choose HD or pixel per scene, not per frame.** Both share anchors, so the switch is free. HD suits close-ups, the gallery and cutscenes; pixel 128 suits a battle line-up of many sprites.
7. **Leave the art alone.** No recolouring, cropping or rescaling of individual frames in the repo. If a frame looks wrong, report its `source` name to Chris and it gets fixed in the pipeline.

---

## 5. Combat design (proposal, not final)

Two documents went back and forth: ChatGPT's move packet v0.2 and Claude's review v0.3. Both are in `design/`.

- `design/moves_v03.json`: the current proposal. 40 moves (10 per character, IDs R01–R10, W01–W10, F01–F10, J01–J10, with stable IDs) giving MP cost, cast/recovery/cooldown, coefficients and the 8-pose description of each.
- `design/Claude_Review_v03.md`: what changed and why, with simulation results.
- `design/sim/moonfaire_sim.py`: a small real-time ATB battle simulator that runs all 40 moves. Run `python3 design/sim/variants.py` to reproduce the v0.2 vs v0.3 comparison. Use it as the balance harness: test numbers there before putting them in the game.

Key v0.3 numbers:
- **MP pools:** Ranger 140, Witch 150, Fox 110, Jester 100.
- **MP regeneration in battle:** Ranger 1.0, Witch 1.2, Fox 0.9, Jester 0.8 MP per second. Without it, every two-phase boss wiped the party.
- **Ultimates:** unlock after 15 s of combat (a stand-in for a charge meter), once per encounter. Without the gate, the Ranger's and Fox's ultimates ended normal fights in 3 seconds, before the Jester could act.
- **Cast times = the animation.** A long cast is a window where enemies can interrupt her, so the party has to protect the Jester while she casts.
- **Doom** is a status applied by Sealed Fate (20 s countdown; ordinary enemies die, bosses lose min(10% phase HP, 5×M)). Curtain Call resolves every Doom mark at once.

Chris prefers MP-based balancing. Equal damage across the four is not the goal: Ranger < Witch < Fox < Jester in raw magic.

The Jester timings in moves_v03.json were set when Sealed Fate played at 6 fps. It now plays at 5 fps, so recompute its cast from `release_frame` and `fps` in the manifest (16 frames at 5 fps puts the release at 3.0 s).

---

## 6. Tips for building this with Claude

These come from Chris's own experience across his game projects (Thareia, Envoi, the Aethermoor games) and from this art session.

- **Ask for concrete, ambitious features.** "Make it sophisticated" gets something safe and simple. "The Jester's Curtain Call dims the field, every Doom mark rings at once on frame 32, and the ward ring settles over the party" gets the real thing.
- **Work in milestones that are playable at each step.** For example:
  1. One woman idling and casting on a painted backdrop.
  2. Four-person party versus one enemy.
  3. MP, the ultimate gate and Doom.
  4. A boss with two phases.

  Play each one before moving on.
- **Use more than one file.** Earlier single-file games hit size walls: artifacts cap at 16 MB, and one Aethermoor build reached 31 MB. Load assets as files from this folder, with the code as ES modules.
- **Watch it, don't just trust it.** Have the session take Playwright screenshots of the running game, and look at them. Check anchors (feet planted), release timing and effects staying inside the scene. Chris judges by playing, so get it in front of him early.
- **Balance with the simulator, not by feel alone.** Change numbers in `moonfaire_sim.py`, run the fixtures, then copy the numbers that pass into the game. Have the session report win rate, fight length and each character's damage share, not just "balanced".
- **Ask where it had to guess.** When the docs don't cover a rule, have the session list what it interpreted or invented, so Chris and his son can decide those calls.
- **Treat the lore as source data.** Character names, the moon's name and the Faire's story are still being written in the project. Keep text in data files so they can change without code edits.

---

## 7. How new art reaches the repo

1. **Generate:** in the project, ChatGPT draws moves as a strip of key poses, then in-between strips where the keys before and after are already drawn in. The rules: exactly two hands, every effect inside its box, flat #383043 backdrop.
2. **Cut and register:** Claude (in a project chat) cuts the strips, scales each pose to the keys, anchors on torso and soles, and rebuilds the flipbook.
3. **Re-export:** Claude regenerates this folder (`manifest.json`, `hd/`, `pixel/`).
4. **Replace:** Chris drops the new folder into the repo, replacing the old one. Clip names stay stable; frame counts and anchors change.

The pipeline itself (raw cut frames, frame data, scripts, original sheets) ships separately as `moonfaire_art_pipeline_part1-of-N.zip` and the parts after it. Each part is under 20 MB; unzip them all into the same folder. Keep it somewhere safe, for example a `art-pipeline/` folder in the repo, so any future art session can pick up exactly where this one stopped. The scripts carry paths from the art session's workspace, so adjust them before running.

---

## 8. Links

- **Live flipbook (claude.ai artifact):** https://claude.ai/artifact/TB8mTsAZdzqQdahK5zKCPa (also offline as `Moon_Faire_Flipbook_viewer.html`, in its own zip)
- **Lore bible (claude.ai doc, with a Spellbook tab):** https://claude.ai/code/artifact/7760c8bf-ce71-4a49-a92a-1934db9ac5ab
- **Project docs in Flip Book Art:**
  - `START-HERE-sprite-animation-method.md`
  - `jester-animation-decisions.md`
  - `three-witches-animation-plan.md`
  - `HANDOFF-game-build.md` (this file)
