# Moon Faire — complete proposed move bible

Version 0.2 proposal (base-sheet references integrated) · October 17, 2026

This is a complete starting kit, not a claim of finished gameplay balance. Character identities, phases and hidden weapons follow the supplied lore bible. New names, extra moves, numeric stats and boss rules are proposals for Chris and Claude to approve. The added base-sheet pack now governs pixel style, character proportions, costume specifics and base-sheet layout; see Base_Sheets_Integration.md. The existing lore file is unchanged. Character names remain open; use stable R/W/F/J IDs so later renaming does not break assets.

## Scope and design

Each woman gets ten combat moves: one free concealed-weapon attack, eight spells or techniques, and one ultimate. Total: 40 unique combat sheets × 8 keyframes = 320 individual character images. Passive lore is not counted as an animation. Six optional common states per woman add 192 images (512 including combat). The 40 moves are the full proposed v1 combat kit, not an assertion that every possible spell must exist at launch. Unlock gradually: begin with weapon attack plus two spells and add complexity over the adventure.

Power should read Ranger → Witch → Fox → Jester in spell magnitude. Healing expertise stays with the Witch; accuracy, detection and fast protection stay with the Ranger. This is an asymmetrical party. Equal sustained DPS is not the target.

## Reference battle and units

- Real-time combat with one action at a time per character; no free simultaneous casts on the same character. Enemies and companions continue acting during a cast. Tactical pause may suspend ALL clocks.
- P = physical power, M = magic power, H = healing power. A coefficient of 2.0M means 2 × the caster's current M, not 200% of enemy HP.
- Reference ordinary enemy: 1,000 HP. Reference anchored boss phase: 12,000 HP. Example enemy direct hit: 100 damage every 2s, before protection. These are tuning fixtures, not final enemy stats.
- Reference defense is 0. Standard damage = coefficient × snapshotted power × 100/(100 + nonnegative defense), then outgoing modifiers, incoming vulnerability, and damage reduction. Physical attacks use physical defense; other standard damage uses magical defense. No critical hits, misses or elemental weaknesses in this baseline.
- Healing uses H; shields use the stat specified for the move. Round HP changes once per actual tick/hit to nearest integer, halves upward. Sum already-rounded hits for totals. Clamp overhealing to missing HP. Never count overheal as useful healing.
- AoE maximums are hard limits. Damage and healing target counts are separate. A four-target coefficient is per eligible target unless expressly described as a shared volley. Identical hits on one target are ticks/hits, not more target slots.
- Cooldown begins on successful release. Recovery follows release and blocks new actions. Base attacks have no cooldown, but cast + recovery is 2s. Cast time plus recovery is actor lock time. No global cooldown on top.
- MP is spent on cast start. Interrupted casts lose 50% of their MP cost, rounded up (refund the remainder), and impose 1s recovery plus a 2s retry lock. No normal spell cooldown is set on interruption. An ultimate's once-per-encounter use is consumed only on release. Cooldowns and retry locks both must be satisfied.
- Minor hits do not interrupt. Only explicit stagger/silence/interrupt effects do; ordinary dodge/movement cannot cancel a spell for free. Target invalid at release: 50% MP refund, 1s recovery, 2s retry lock, no effect. If an AoE still has legal targets it resolves on those targets without refund.
- No passive MP regeneration in battle in this reference. Start fixtures full. No items during baseline checks. MP recovery, items and encounter-to-encounter persistence require an explicit engine decision before final tuning. Do not silently refill MP after every move or every wave.
- An ultimate can release once per encounter and has a 60s cooldown. For multi-wave encounters both restrictions persist. Ability cooldowns persist across rapid encounter transitions; an encounter boundary alone does not reset them.

## Targeting, stacking and control

- One basic formation model is assumed: two allied ranks and two enemy ranks. Switching an ordinary enemy with an ally exchanges their rank/frontage coordinates, but never allegiance or team membership. If the actual game has no spatial targeting, replace Switcheroo deliberately before art production.
- Buffs and HoTs of the same move from the same caster refresh/replace, never add independent copies. Different HoTs coexist. M bonuses add, capped at +50%; haste uses the strongest active value, capped at 25%.
- Haste sets recovery = base recovery/(1 + haste); cast time, cooldowns, effect clocks and summon pulse clocks do not change. Base attacks benefit only through their recovery portion.
- Shields absorb mitigated HP damage, cannot crit, and expire on time. Each shield application is capped at 30% of recipient maximum HP; total shields are capped at 40%. A stronger same-source shield replaces the old shield; a weaker one only refreshes duration without increasing its remaining HP. Different sources may coexist up to the total cap; excess new shield is discarded. Earliest-expiring shield absorbs first.
- Decoys/guardian intercept direct single-target enemy damage only. Eligible redirection order is guardian, then personal decoy; a hit redirects at most once. Apply the intended ally's defense/modifiers once, then consume the decoy/guardian HP budget; overflow reaches that ally's shields and HP. Their own-target HP is taken directly from attacks aimed at the summon using defense 0. No redirection loop, free invulnerability or double mitigation.
- Max one decoy per ally. A new decoy replaces one only if its remaining HP budget is greater (ties refresh duration); charges replace, never add. No survival benefit is counted until a hit is actually absorbed. Summon HP is not a party shield.
- Ordinary enemies can receive at most 6s uninterrupted hard control (Stop/silence/forced cancellation). Any extension is clamped to the remaining 6s continuous budget. After hard control ends they gain 4s Resolve, rejecting new hard control. Root is not hard control: it stops walking only; same-source roots refresh, never add durations.
- Anchored bosses receive only the explicitly listed boss control. After any successful Stop, Hush cast-extension or cancel they gain 8s Resolve against all three. No repeated cast-extension loop. Root does not interrupt boss attacks. Scripts can flag a specific attack uninterruptible, visible to the player; do not make whole bosses immune to all utility.
- Outgoing direct-damage reductions add but cap at 30%. Against anchored bosses the combined cap is 15%. Sailwing Moth's area reduction is a separate multiplicative 10%. Guiding Star is the only incoming vulnerability in this kit; cap it at +20% and a remaining 400-damage bonus budget. Spend the budget only on bonus HP/shield damage actually inflicted; it cannot magnify percentage-HP loss, Doom or reflected effects.
- Dispels affect removable statuses only. Cleanse priority: Doom → Stop/silence → damaging statuses → other negative statuses, oldest first within a tier. Positive-buff theft chooses oldest eligible buff. Reflect cannot produce a reflection chain; Doom is deliberately excluded from Royal Reversal.
- Death removes status effects and cancels that actor's unfinished action. A defeated caster's summon despawns. A Witch summon shares one slot; summoning the other replaces the previous summon immediately. First pulse is 3s AFTER release; include a final pulse at exactly 15s if alive. Target changes do not reset its pulse clock. Guardian attacks selected live enemy, falling back to the oldest-spawned live enemy. Moth heals lowest HP fraction, ties by party slot. All heal ticks skip defeated targets.
- Buffs snapshot P/M/H on successful release; summons, DoTs and HoTs retain that snapshot throughout their duration. Doom remembers both the phase ID and caster M at application. Boss transformations invalidate old marks rather than damaging a new phase with an old mark.
- At a shared timestamp process scheduled expiries (including Doom) first, then releases, then ordinary damage and heal ticks, then deaths and cleanup. Mark removal happens atomically before Doom's HP change. A Curtain Call at the exact expiry cannot trigger the mark twice. A mark's owner dying clears her unresolved marks. A boss changing phase clears all old-phase marks before the new phase becomes targetable.

## Doom, Gravity and the theatrical spell names

Sealed Fate is the cast button; Doom is its condition. Do not commission a second redundant Doom sheet. Stop and Gravity remain named moves: their plain names make the Jester's authority legible. Against All Odds replaces Raise the House. Curtain Call keeps its name. The Last Toll is a separate direct-damage spell, not another Doom detonation.

For ordinary enemies Doom is a genuine death sentence after 20s. Any elite using the capped rule must be visibly tagged Anchored before casting. For anchored bosses it resolves to min(10% of the marked phase's maximum HP, 5 × snapshotted M). This exception must appear in the tooltip; do not describe boss Doom as certain death. Doom bypasses shields, armor and damage modifiers and cannot crit. It may end a phase, with excess loss discarded. After a phase-ending resolution, remaining queued effects may not strike the newly spawned phase in the same action.

Gravity is min(25% of CURRENT HP, 4 × M, current HP − 1). It cannot kill and gives no advantage from repeatedly refreshing full HP. Percent-HP effects bypass shields and all damage modifiers. These explicit exceptions preserve boss encounters while allowing both spells to work.

Sealed Fate allows at most three active marks owned by the Jester. A fourth mark replaces the oldest without resolving it. Refreshing an existing target resets its 20s clock and snapshot. Curtain Call resolves all current marks, including ones outside its four direct-damage target slots. It then strikes up to four surviving selected enemies and applies its ward, even if there were no marks. It does not get damage credit for already-dead targets.

The secret in her turquoise pendant remains story and animation flavour. MP is the only spendable resource in this proposal. A finite secret inventory would require a separate resource economy; do not quietly add it on top of high MP and long casts.

## Reference character stats

| Character | HP | MP | P | M | H | Weapon attack damage / 2s |
|---|---:|---:|---:|---:|---:|---:|
| Ranger | 1000 | 140 | 100 | 100 | 80 | 100 |
| Herbal Witch | 900 | 150 | 80 | 130 | 150 | 64 |
| Fox | 950 | 110 | 105 | 180 | 80 | 106 |
| Jester | 850 | 90 | 90 | 260 | 90 | 81 |

Weapon damage does not establish magical rank. Fox and Jester have much greater M; Witch has much greater H. These stats are one tuning tier. Scaling to other levels needs actual enemy curves.

## Ranger — Full Moon

A moonsteel bow folds flat against the back of her corset; necklace beads supply its spare string.

| ID | Move | MP | Cast / recovery | Cooldown | Target |
|---|---|---:|---|---:|---|
| R01 | **Moonsteel Draw** | 0 | 0.4s / 1.6s | 0s | One enemy |
| R02 | **Silver Arrow** | 8 | 0.6s / 0.8s | 4s | One enemy |
| R03 | **Lantern Flare** | 12 | 0.8s / 0.8s | 12s | Up to four enemies |
| R04 | **Crescent Volley** | 16 | 1.2s / 0.8s | 8s | Three bolts assigned among enemies |
| R05 | **Silverglass Ward** | 14 | 1s / 1s | 14s | One ally |
| R06 | **Guiding Star** | 10 | 0.6s / 0.8s | 16s | One enemy |
| R07 | **Moonlit Passage** | 18 | 1.2s / 0.8s | 20s | All four allies |
| R08 | **Pin the Shadow** | 12 | 0.8s / 0.8s | 12s | One enemy |
| R09 | **Beacon’s Mercy** | 14 | 1s / 1s | 10s | One living ally |
| R10 | **Full Moon Ascendant** (ultimate) | 44 | 3s / 1s | 60s | Up to four enemies and all four allies |

**R01 · Moonsteel Draw.** Free weapon attack: 1.0P physical damage.

**R02 · Silver Arrow.** 2.0M light damage.

**R03 · Lantern Flare.** 0.6M light damage each; reveal stealth for 12s; Dazzle reduces direct damage dealt by 20% for 6s. Boss damage reduction is 10%.

**R04 · Crescent Volley.** Three bolts, each 1.0M light damage. Bolts may share a target; total damage is 3.0M, not 3.0M per enemy.

**R05 · Silverglass Ward.** Shield of 3.0M for 8s; subject to global shield limits.

**R06 · Guiding Star.** For 8s, incoming damage receives +20% additive vulnerability; this mark can add at most 400 total HP damage before ending. No bonus to Doom, Gravity or reflected damage. Does not stack with itself.

**R07 · Moonlit Passage.** Each ally evades their next eligible direct enemy hit within 5s. Does not evade ground hazards, damage-over-time or explicitly unavoidable attacks. Each charge is consumed once; a multi-hit action loses only one hit.

**R08 · Pin the Shadow.** 1.2M light damage and 4s Root; anchored bosses receive 1s Root. Root stops movement, not casting or attacks.

**R09 · Beacon’s Mercy.** Heal 2.0H and remove one removable negative status; prioritize Doom, then hard control, then damage-over-time.

**R10 · Full Moon Ascendant.** Ultimate, once per encounter. 4.0M light damage per enemy; shield every living ally for 1.5M for 8s.


## Herbal Witch — Waxing Moon

Her crescent pendant unfolds into a golden harvest sickle.

| ID | Move | MP | Cast / recovery | Cooldown | Target |
|---|---|---:|---|---:|---|
| W01 | **Harvest Crescent** | 0 | 0.6s / 1.4s | 0s | One enemy |
| W02 | **Silverleaf Salve** | 12 | 1s / 1s | 4s | One living ally |
| W03 | **Moondew** | 10 | 1s / 1s | 12s | One living ally |
| W04 | **Thornwake** | 12 | 1.2s / 0.8s | 10s | One enemy |
| W05 | **Bitter Remedy** | 10 | 1s / 0.8s | 8s | One living ally |
| W06 | **Bramble Cradle** | 26 | 2s / 1s | 22s | All four living allies |
| W07 | **Elderwood Guardian** | 30 | 3s / 1s | 24s | Summoned guardian; enemies and allies |
| W08 | **Sailwing Moth** | 28 | 3s / 1s | 24s | Summoned moth; lowest-HP living ally |
| W09 | **Rootbound Return** | 32 | 4s / 1s | 45s | One defeated ally |
| W10 | **Garden Beneath the Moon** (ultimate) | 52 | 4s / 1s | 60s | All living allies and up to four enemies |

**W01 · Harvest Crescent.** Free weapon attack: 0.8P physical damage.

**W02 · Silverleaf Salve.** Heal 2.4H.

**W03 · Moondew.** Heal 0.5H at 2,4,6,8,10,12s after release: total 3.0H. Same-caster refresh replaces remaining ticks; no immediate tick.

**W04 · Thornwake.** 1.6M nature damage and 3s Root; anchored bosses receive 1s Root.

**W05 · Bitter Remedy.** Heal 0.8H and cleanse up to two removable negative statuses using the shared priority order.

**W06 · Bramble Cradle.** Shield each ally for 1.5H for 10s.

**W07 · Elderwood Guardian.** Summon for 15s, HP 5.0H. It intercepts at most three single-target direct hits against allies and attacks the selected enemy for 0.6M at 3,6,9,12,15s after summon. Redirect overflow reaches the original ally. One shared Witch summon slot.

**W08 · Sailwing Moth.** Summon for 15s, HP 3.0H. Heal the living ally with lowest HP percentage for 0.6H at 3,6,9,12,15s. Party takes 10% less area damage while it lives. Does not intercept attacks. Shares Witch summon slot.

**W09 · Rootbound Return.** Revive at 30% maximum HP. Each ally may receive this revive only once per encounter. Clears removable debuffs; recipient cannot act for 2s and is not invulnerable. No effect on story deaths.

**W10 · Garden Beneath the Moon.** Ultimate, once per encounter. Heal each living ally for 2.0H immediately, then six ticks of H/3 at 2s intervals: 2.0H more over 12s. Root enemies 3s; anchored bosses 1s. Does not revive.


## Fox — Waning Crescent

Dressmaker shears separate into twin daggers; sewn-in needles become darts. Her skirt-like silhouette is made by wide patchwork trousers gathered at the ankles.

| ID | Move | MP | Cast / recovery | Cooldown | Target |
|---|---|---:|---|---:|---|
| F01 | **Hemline Fangs** | 0 | 0.5s / 1.5s | 0s | One enemy |
| F02 | **Blue Mischief** | 14 | 0.8s / 0.8s | 6s | One enemy |
| F03 | **Borrowed Face** | 12 | 0.8s / 0.8s | 14s | Self |
| F04 | **Switcheroo** | 14 | 0.6s / 0.8s | 14s | One ally and one enemy |
| F05 | **Finders Keepers** | 12 | 0.8s / 0.8s | 10s | One enemy; self receives stolen buff |
| F06 | **Loose Thread** | 14 | 0.8s / 0.8s | 12s | One enemy |
| F07 | **Ninefold Lie** | 22 | 1.5s / 1s | 12s | Up to three enemies |
| F08 | **Bellbound Bargain** | 16 | 1s / 1s | 20s | One other living ally |
| F09 | **When the Bell Falls Silent** | 24 | 2s / 1s | 30s | Self |
| F10 | **The Moon’s Little Lie** (ultimate) | 48 | 3s / 1s | 60s | Up to four enemies and all living allies |

**F01 · Hemline Fangs.** Free weapon attack: two hits of 0.5P each; 1.0P total.

**F02 · Blue Mischief.** 2.0M cold foxfire damage. It harms only its designated target.

**F03 · Borrowed Face.** Create one decoy for 6s with a total 2.0M HP budget. It redirects at most two eligible single-target hits aimed at Fox. Overflow damages Fox; no copied attacks or extra turns.

**F04 · Switcheroo.** Swap an ally and an ordinary enemy between their formation slots and cancel one ordinary enemy windup aimed at that ally. Against anchored bosses, move ally between allied ranks and grant one direct-hit evasion charge for 4s; do not move boss or cancel its windup. No cooldown reset.

**F05 · Finders Keepers.** Steal the oldest eligible positive buff for its remaining duration, capped at 10s. Excludes phase mechanics, invulnerability, summons, shields and unique boss effects. With no eligible buff, deal 1.0M foxfire damage instead; never both.

**F06 · Loose Thread.** Three damage ticks of 0.65M at 3,6,9s: total 1.95M. Target deals 15% less direct damage for the first 6s; anchored bosses receive 7.5% reduction.

**F07 · Ninefold Lie.** Three successive waves each deal 0.8M per enemy; total 2.4M per enemy. Nine visible images are cosmetic and do not add nine extra hits.

**F08 · Bellbound Bargain.** Ally gains +25% M for 10s. Fox pays ceil(15% of her maximum HP) on release, bypassing shields; cannot cast if this would leave her below 1 HP. No MP transfer. Bonus adds to other M buffs, with total M bonus capped at +50%.

**F09 · When the Bell Falls Silent.** For 12s gain +30% M and +20% physical weapon-attack damage. Bell falls silent and spectral fox tails appear. No instant attack; no time stop. Same buff cannot stack.

**F10 · The Moon’s Little Lie.** Ultimate, once per encounter. 5.0M foxfire damage per enemy. Each ally receives one decoy for 6s; each has M HP and redirects only one eligible direct hit, with overflow reaching ally. Replaces weaker decoys on same ally.


## Jester — New Moon

Gold hip bells unfold into the head of a concealed chain flail.

| ID | Move | MP | Cast / recovery | Cooldown | Target |
|---|---|---:|---|---:|---|
| J01 | **Gilded Rebuke** | 0 | 0.6s / 1.4s | 0s | One enemy |
| J02 | **Ill Omen** | 4 | 1s / 1s | 4s | One enemy |
| J03 | **Sealed Fate** | 18 | 4s / 1s | 6s | One enemy |
| J04 | **Hush** | 12 | 2s / 1s | 12s | One enemy |
| J05 | **Stop** | 20 | 3s / 1s | 18s | One enemy |
| J06 | **Gravity** | 24 | 4s / 1s | 16s | One enemy |
| J07 | **Royal Reversal** | 16 | 2s / 1s | 18s | One living ally |
| J08 | **Against All Odds** | 26 | 8s / 1s | 30s | All living allies |
| J09 | **The Last Toll** | 28 | 4s / 1s | 20s | One enemy |
| J10 | **Curtain Call** (ultimate) | 54 | 8s / 1s | 60s | Up to four enemies; all living allies |

**J01 · Gilded Rebuke.** Free weapon attack: 0.9P physical damage.

**J02 · Ill Omen.** 0.8M fate damage. Affordable lesser spell; does not place Doom.

**J03 · Sealed Fate.** Apply one Doom mark for 20s, maximum three active marks across enemies; reapplication refreshes rather than stacks. At expiry an ordinary enemy dies. Anchored boss instead loses min(10% phase-maximum HP, 5.0M). Mark remembers phase and M at application. Boss loss bypasses shields and damage modifiers. No impact damage.

**J04 · Hush.** Silence an ordinary enemy for 6s and cancel one interruptible magic windup. Anchored boss instead has its current interruptible magic cast extended by 1.5s, without silence or cancellation. No damage.

**J05 · Stop.** Freeze an ordinary enemy for 3s; anchored boss for 1s. Pauses its action/movement progress, not global time, cooldowns, status durations or Doom. Uninterruptible scripted actions are explicitly excluded.

**J06 · Gravity.** Lose min(25% current HP, 4.0M), leaving at least 1 HP. Bypasses shields and modifiers, cannot crit and does not receive Guiding Star. Bosses use the same capped formula.

**J07 · Royal Reversal.** For 8s intercept the next removable negative status application against ally. Block it and attempt to apply that status once to its source under normal boss/control rules. Never reflect damage, Doom, other reflected effects, phase effects or unavoidable mechanics. Consumed even if source is immune.

**J08 · Against All Odds.** Over 12s heal each ally for six ticks of H/6 (total 1.0H), plus 15% Haste. If mean HP fraction of living allies is at or below 40% at release: total heal becomes 2.0H and Haste 25%. Haste affects recovery only, not casting, cooldowns, summons, DoT or Doom.

**J09 · The Last Toll.** 4.0M fate damage. One deep bell note accompanies impact. Does not trigger or consume Doom.

**J10 · Curtain Call.** Ultimate, once per encounter. First resolve all active Doom marks immediately, consuming each once; then deal 2.0M fate damage to each surviving selected enemy. Shield each living ally for 0.75M for 6s. No damage to corpses; no second Doom trigger.

## Optional moon-phase affinity — OFF in the baseline

Start with no discount. If desired after initial testing, reduce only MP cost by 10% on a woman's aligned phase: max(1, ceil(base cost × 0.9)) for paid moves. Free basics stay free. This is a proposal replacing the lore's unquantified discount. Do not also boost damage, cast speed or regeneration. Test new-moon Jester separately: small discounts can cross entire-combo thresholds.

## Launch and asset priorities

Approve the names and combat mode first. Generate and accept the three missing pixel base sheets from base_sheets_pack/ before commissioning the move art. Prototype all 40 with placeholder silhouettes before generating 320 pictures. First art pilot: one eight-frame sheet each for R02 Silver Arrow, W02 Silverleaf Salve, F02 Blue Mischief and J03 Sealed Fate. Confirm identity, viewpoint, framing, crop and registration in the actual flipbook. Then complete attacks, defense/healing, advanced utility, summons and ultimates in that order. No final images are produced by this packet.
