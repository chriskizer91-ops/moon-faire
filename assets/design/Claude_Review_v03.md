# Moon Faire move packet v0.2: Claude review

October 17, 2026 · reviewed for Chris, to hand back to the ChatGPT instance

**Verdict:** the arithmetic is correct, and the names and rules are strong. But a simulation of the actual 40 moves found three design problems that the arithmetic could not show. Fix them before any move art is commissioned. All three are fixed in `moves_v03.json`. Move IDs R01–J10 are unchanged.

## What I checked, and how

1. **Arithmetic:** I recomputed all 35 rows of the Balance_Audit table and all 13 worked checks independently. Every number matches, and `verify_balance.py` passes 59/59. The rounding, the shield caps, the Doom/Gravity caps and the interrupt costs are all right.
2. **Simulation:** the packet asked me to say whether a runnable battle engine exists. None does yet. So I wrote one: `sim/moonfaire_sim.py`, a real-time ATB-style placeholder engine. It runs all 40 moves with their MP, cast, recovery, cooldown, shield caps, decoys, summons, Doom, Gravity, Stop, haste, interrupts and boss phase changes. Each fixture ran 150 times with different seeds. The party AI is a fixed priority list, so these are lower bounds on what a good player gets.
3. **Animations:** I checked the existing Jester animations frame by frame against the J03/J08/J10 timings.

### Fixture inputs

| Fixture | Enemies | Enemy damage |
|---|---|---|
| A | 1 normal, 1,000 HP | 100 every 2 s |
| B | 4 normals, 1,000 HP | 100 every 2 s each |
| B2 | 4 tough normals, 2,500 HP | 100 every 2 s each |
| C | Boss, 12,000 HP | 180 every 2 s + 140 to all every 10 s |
| D | Boss + 2 normals | as C and A |
| E | 3 waves of 4 normals, no MP refill | as B |
| F / F2 | 4 normals (1,000 / 2,500 HP) that interrupt the longest cast every 6 s | as B |
| G | Two-phase boss, 12,000 HP per phase | as C |
| G2 | Two-phase boss, lighter hitting | 120 every 2 s + 100 to all every 10 s |

## Results: the packet as written (v0.2) vs the proposed fixes (v0.3)

| Fixture | v0.2 win · time | v0.2 Jester share | v0.3 win · time | v0.3 Jester share |
|---|---|---|---|---|
| A one normal | 100% · 2.7 s | 0% | 100% · 2.7 s | 0% |
| B four normals | 100% · 3.1 s | 0% | 100% · 8.5 s | 24% |
| B2 four tough normals | 100% · 15.1 s | 10% | 100% · 28.0 s | 19% |
| C boss | 100% · 39.7 s | 33% | 100% · 30.7 s | 36% |
| D boss + adds | 100% · 39.7 s | 28% | 99% · 38.1 s | 32% |
| E attrition, 3 waves | 100% · 37.7 s | 10% | 100% · 39.1 s | 20% |
| F2 interrupters | 100% · 21.9 s | **0%** | 100% · 34.4 s | 19% |
| G two-phase boss | **0%** (party wipes) | 30% | **0%** | 32% |
| G2 two-phase, lighter boss | **0%** (party wipes) | 28% | 97% · 85 s | 31% |

Damage per second for each woman alone against a boss dummy, from full MP:

| | First 30 s, v0.2 | 120 s, v0.2 | First 30 s, v0.3 | 120 s, v0.3 |
|---|---:|---:|---:|---:|
| Ranger | 95 | 61 | 103 | 77 |
| Herbal Witch | 48 | 45 | 48 | 51 |
| Fox | **107** | **67** | 118 | 75 |
| Jester | 77 (MP empty at 14 s) | 60 | **134** | **79** |

## The three problems, and the fixes

### 1. Ultimates end ordinary fights before the Jester can act

Every ultimate is available at second zero. The Ranger's and Fox's ultimates delete four 1,000-HP enemies in about 3 seconds. The Jester's shortest spell takes 4 seconds, so she and the Witch contribute nothing to most fights. Doom's 20-second countdown never matters when fights end in 3.

**Fix:** ultimates unlock after 15 seconds of combat. A charge meter, filled by damage dealt and taken, would play better in the real game; the simulator uses the 15-second rule as a stand-in. Keep the once-per-encounter rule and drop the separate 60 s cooldown, since the gate replaces it. Four normals then take 8.5 s and the Jester deals 24% of the damage.

### 2. No MP recovery makes long fights unwinnable

With no MP regeneration, all four women are out of MP by the end of a 40-second boss fight. The Jester runs dry in 14 seconds. A two-phase boss wiped the party in 100% of runs, even the lighter-hitting one. The packet flagged this risk itself; the simulation confirms it.

**Fix:** slow MP regeneration in battle: Ranger 1.0, Witch 1.2, Fox 0.9, Jester 0.8 MP per second. The lighter two-phase boss goes from 0% to 97% wins.

The heavy boss fixture (C/G) still wipes any party after about 60 seconds. Its damage outpaces all healing. That isn't a bug, it's a clock: tune each boss's damage to the fight length you want. As a rule of thumb, the party can sustain roughly 100 incoming damage per second.

### 3. The Jester isn't "power beyond power" yet, and her casts don't match her animations

As written, the Fox out-damages the Jester both early and late, because the Jester spends 5 seconds per spell and has 90 MP. Chris's ranking is Ranger < Witch < Fox < Jester. The packet also adds 1 s of recovery after each existing animation, and fires each spell at the animation's last frame. In the real art, the sigil peaks two-thirds of the way through the Orb animation, and the hand is back at her side by the end.

**Fix:**
- **Timing:** time the Jester's three existing moves to their real release frames. The total length still equals the animation, so no art changes.
- **Hush:** cut its cast time to 1.0 s, so she can answer an interrupter before it interrupts her.
- **MP:** raise her MP pool to 100.

With these, her opening burst is the highest in the party at 134 damage per second, and her sustained output is at the top too. Without the faster Hush, interrupting enemies shut her out entirely (0% share in F2).

| Move | v0.2 cast / recovery | v0.3 cast / recovery | Why |
|---|---|---|---|
| J03 Sealed Fate | 4.0 / 1.0 s | 2.7 / 1.3 s | Orb: the sigil peaks around frame 16 of 24 at 6 fps |
| J08 Against All Odds | 8.0 / 1.0 s | 2.0 / 6.0 s | Skyward: arms are up by frame 4 of 16 at 2 fps. The heal now lands when it's needed, and she holds the pose while it streams |
| J10 Curtain Call | 8.0 / 1.0 s | 5.3 / 2.7 s | Cast: the ring sweeps around her near frame 32 of 48 at 6 fps |
| J04 Hush | 2.0 / 1.0 s | 1.0 / 1.0 s | Counterplay to interrupters |
| Jester MP pool | 90 | 100 | Lets her ultimate and her signature spells coexist |

Against All Odds was effectively unusable at 8 s, because its emergency trigger checks party HP at release. Eight seconds later the party is often already down.

## Rules and edge cases

The packet's rules for 0 HP, 1 HP, shields, phase changes, simultaneous expiry and dead mark owners are sound. The simulator implements them, and none produced a double trigger or a carried-over mark. Two rules need a game decision before art:

- **Switcheroo (F04)** and the **Root** effects assume front and back rows. Envoi's FF9-style battles have rows, so this fits. Confirm it before drawing F04, because without rows its art shows an effect the game can't do.
- **Royal Reversal (J07)** and **Finders Keepers (F05)** need enemies that cast statuses and buffs. None of the fixtures do, so the simulator could not test them. Build one status-casting enemy before tuning them.

## Names

The names are good, and they keep the costume voice of the lore. Two notes:

- **R04 Crescent Volley:** a crescent belongs to the Witch's and Fox's phases, not the Full Moon Ranger. Suggested name: **Silver Rain**.
- **J05 Stop and J06 Gravity:** every other move has a costumed name, so these two read as placeholders. ChatGPT's earlier **Hold Your Breath** and **The Weight of Night** match the rest. This one is Chris's call; I left the names as they are.

Confirmed: Doom is a status applied by Sealed Fate, not a move with its own sheet. Keep the IDs as asset names.

## Art: what already exists and what to generate

- **Already drawn:** J03 Sealed Fate (Orb, 24 frames), J08 Against All Odds (Skyward, 16 frames) and J10 Curtain Call (Cast, 48 frames). The Jester's walk cycles (16 frames) also cover her movement states. **Generate 37 move sheets, not 40.**
- **Fix the J03/J08/J10 pose lists** in moves.json to describe the real animation. For example, the real Orb raises a hand to her cheek and opens a double sigil ring, rather than touching the pendant. `moves_v03.json` carries the corrected descriptions.
- **Pre-fill the template's first and last cells** with the woman's accepted ready pose, and ask the generator to draw only poses 2–7. This is the method that kept the Jester's 36 in-between frames on-model, scaled and aligned. It also cuts new images from 296 to **222**.
- **Playback length:** at 6 fps, eight keyframes play for 1.33 s, but most moves lock the actor for 2 to 5 s. `Animation_Timing_v03.csv` lists each move's lock time, its frame count at 6 fps, and its release frame. After a sheet is accepted, it gets in-betweens using the process already proven on the Jester.
- **Fast moves can't fit the "release at pose 6" convention.** A 0.4 s weapon attack has under 3 frames before release at 6 fps, not enough room for five wind-up poses. For moves that cast in under 1 s, release at pose 3 or 4 and give the remaining poses to follow-through. The release frames in the CSV follow the cast times.
- **Effect assets are separate.** They are counted in `Effect_Assets.md`, about 30 small loops, not part of the 222.

## Production order

1. Chris approves names, ultimate gate and MP regen.
2. Generate the three base sheets from `base_sheets_pack/`. Claude cuts and registers them on the Jester's ground line.
3. Four pilot sheets: R02, W02, F02 and **J09 The Last Toll**. J09 replaces J03, which already exists. The briefs are in `Pilot_Briefs.md`.
4. Claude cuts, aligns and plays the pilots in the flipbook. Chris approves.
5. Remaining sheets in the packet's order. Then effects, after the engine confirms which ones it animates independently.

## Files in this review

- `Claude_Review_v03.md`: this document.
- `moves_v03.json`: v0.2 with the changes above, plus a change note on each touched move. IDs unchanged.
- `Animation_Timing_v03.csv`: lock time, playback frames and release frame for all 40 moves.
- `Effect_Assets.md`: projectiles, status marks, shields and summons, listed separately from the move sheets.
- `Pilot_Briefs.md`: four ready-to-run pilot sheet prompts.
- `sim/`: the simulator, the comparison runner and the raw results (`variants.json`). Run `python3 sim/variants.py` to reproduce every number above.
