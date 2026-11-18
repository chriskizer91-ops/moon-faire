# Jester Witch HD 3D model: pass 20, the charge as dust (November 12, 2026)

Read after `claude/jester-3d-pass19-square-and-lore-moves.md`. Where the two differ, this note is newer: the ring for each hit and the hit count in pass 19 are gone.

- Page: **Jester Witch 3D: the night square**, https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh (version `1794506119-28fa`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`, commit `a0c77e3`. The README section "The charge as dust" has the code-level detail.
- The first page, https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M, still shows pass 18. Chris has not yet said whether to move this one over.

## What Chris said after seeing pass 19

- "I do like everything you've done and timing and all of it." The rings he was undecided about.
- The lore's spells "need to be more dramatic", with a "battle ending guaranteed" feeling. Add effects and graphics; do not change what is there.
- The charge counts damage. Every blow aimed at her charges it, "whether or not she's taunted them". It is full at 75% of her total HP. How little of that she really takes is balance for later.
- The look: "an aura of dust that gets thicker and thicker until she uses it", then it "manifests out of the air as those rings".

These are recorded in `lore/discussion-notes.md`.

## What was built

- **The charge is a number from empty to full,** kept by the page. The model only draws it.
- **Dust round her.** Single points, about one sprite pixel each, drifting close about her. More come out as the charge grows, the newest showing brighter for a moment, and the light near her dims a little. It is one draw call with no work per frame on the processor: up to 560 points, 420 on a phone.
- **The cast.** The dust draws into a band round her, her rings come out of the air one after another, and the rest streams to the seal over her hand. Three rings at the least, five from a full charge. From there Sealed Fate and the ending play as in pass 19. The charge is spent when she throws.
- **On the page.** Her HP is set at 1,000 and a blow at 160 to 320, only so the charge can be watched. The line under the From the lore row reads, for example, "Absorbed 410 of 750". Empty the charge starts over. The Big spell button still works at any charge.

## Checked

- The lore's moves over every stance, with a charge set: no errors, no broken numbers.
- Stills of the dust after one to five hits, through the cast, while she walks, in the theatre and in the Flipbook look.
- Not watched at real speed, and not tried on a real phone.

## Still open

- Which of the ways to make the spell feel final to add next. Claude's list, none built yet:
  - The world stops as the seal lands.
  - A held frame at the clamp, then the shake.
  - One toll of the giant bell from The Last Toll as her fist closes.
  - The foe goes black against the stars before anything touches it.
  - Four lights round the foe and three go out, showing 75% without a number.
  - Each blow she absorbed flies back to whoever dealt it.
  - She turns away before it lands.
- What Chris meant by "use the full animations from the different sources". Claude read it as playing each source whole, for example all of the flipbook's Sealed Fate before the throw. Not confirmed, and not built.
- The questions about the spell's damage and price in `lore/discussion-notes.md`.
