# The final boss (task board F11)

Made by the "Levelling" session, November 15, 2026. **Everything here is a proposal until Chris says so, and every name
is a stand-in.** The project note is `claude/final-boss-the-fire-that-would-not-end.md`.

## What Chris has said

- A big bad after the great wraith (gate at level 10) and the great bramble (gate at level 20), fought at level 20, 21,
  22 or 22.8 (easy, medium, hard, crazy) by a party that stops at 20.
- November 15, 1:58 pm: the first rough model (`game/models/foes/final-fire/`) "is a good first draft of phase one of
  the boss and it should lose hp but not take visible damage and then at zero hp transform into its final form which
  looks broken larger and more vibrant". So: **two forms.**
- He asked which fight: one body alone, harder than the gate fights; or the great wraith's numbers under new names with
  the same helpers, all at the last fight's level. **Not chosen yet.**

## Files

| File | What it is |
|---|---|
| `picture-prompts.md` | F1 (form one, whole), F2 (the final form, broken open), F3 (both side by side). B2 and B3 are set aside. |
| `forms.js` | A fight in forms, through the approved engine, which is not changed. |
| `forms_run.js` | Measures the ways of building the fight with the eight testers. Writes `forms.json` and `forms.txt`. |
| `make_page.js` | Builds `two-forms.html`, the page for Chris, from `forms.json` and `picture-prompts.md`. |
| `concept.html` | The first page (the idea, 1:35 pm). Its prompts are older than `picture-prompts.md`. |

## How a fight in forms is played (`forms.js`)

A form is one engine fight. The next form starts with the HP and MP the party has left. A witch who is down stays down
until Io revives her. Io's Deity stays once a fight across both forms; the Ranger's gem and the Fox's rests carry over.
The foe starts a new form with no Fate on it. By the approved rules a fight ended by Sealed Fate ends in the Curtain
Call, where the fallen get up at a quarter HP; that is left as it is when form one ends, unless the form is marked
`bow: false`. A one-form fight with no herbs is the same fight, win for win, as `testers.playOut` (checked on 200).

A form is `{ code, up, life, dmg, bow }`: the line-up (`B` the big body, `K` a Shadow Wraith's kind, `w` a wisp's kind),
levels above the fight's own level, and two multipliers on the big body's Life and blows.

## What was measured (2,000 fights a cell; `forms.txt` has every number)

Wins with no finds / with all 18, the careful expert, at easy, medium, hard, crazy:

| Fight | Easy | Medium | Hard | Crazy |
|---|---|---|---|---|
| The great wraith's fight under new names, one form (`B2K2w`) | 100 / 100 | 91 / 97 | 26 / 80 | 0.1 / 3.6 |
| One body alone, two forms (`B` Life x1.3, then `B` Life x0.4, blows x1.1) | 100 / 100 | 94 / 99 | 17 / 51 | 0 / 0.3 |
| Helpers in form one, alone in form two (`B2K2w`, then `B` Life x0.25) | 99 / 100 | 89 / 95 | 13 / 63 | 0 / 0.5 |

1. **The helpers are most of the great wraith's difficulty.** The great wraith alone, with its own numbers: the careful
   attentive player wins 100% on easy and medium and 60% on hard (with helpers: 80%, 3%, 0%).
2. **One body alone can be made hard enough with more Life,** but easy becomes a walkover for anyone attentive (100%,
   against about 80% at the gate); the Fox's Crazy Quilt cannot be cast and nothing spreads; and it swings on saving MP
   (the expert on hard, no finds: 17% as the testers play, 76% if she holds MP back for the second form).
3. **Helpers first, then alone,** is a notch harder than the great wraith's fight at every setting, hard stays an
   expert's fight, and the same saving habit does not help (5% on hard).
4. **Herbs in the bag do not rescue it.** With 20 or 60 of each, the testers did slightly worse: a herb costs a turn.

The "Levelling" session's pick is the third. Dials if it should be harder: the final form's blows 20% bigger (expert on
hard 6 / 46), or nobody gets up when form one ends (3 / 37).

## Not done

- Chris has not chosen. Nothing is in the game's rules.
- The testers do not know a second form is coming, apart from one crude "saving" habit.
- The helpers use the wraiths' numbers; the bramble foes have none yet. The finds are to be tuned again.
- The model has only form one. No fight backdrop, and no place on the map.
