# Jester 3D, pass 21: a page of only her moves in the game

November 13, 2026. This follows `claude/jester-3d-pass20-charge-as-dust.md`.

- **The new page:** "Jester Witch 3D: her game moves", https://claude.ai/artifact/MnovyvRW8qZj9DnUMwUP4n
- **Left exactly as it was:** "Jester Witch 3D: the night square", https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh. Chris: "I want to keep this artifact as it is." Never republish to that link. The first page (https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M) is untouched too.
- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`, commit `31b6351`. Its README has a section for this pass.
- **Single offline file:** `Jester_Witch_3D_game_moves.html` (2.9 MB), sent to Chris in the chat.

## What Chris asked for

- The moves and spells each character uses in the game are now settled (`lore/combat-balance.md`).
- A **new page** of the Jester with **only the spells she uses in the game**, plus **every Move and every Body state**.
- Add to her moves where the new lore asks for it. **Remove nothing she can do.**
- Keep the night square page as it is.

## For every model: the Flipbook look

Chris, the same day: "I want the flipbook look to be a feature of all of the models." He is still undecided whether he wants models shown with it or without it.

- Keep it as a **switch on every witch's page**.
- **Make the model look right without it first.** A model that looks good without it looks really good with it on.
- **Do not use it to hide a model that does not look good.** His words: "if you use the flipbook to hide it not looking good, without it doesn't look good."

This belongs in `claude/HOW-TO-3d-witch-models.md` (sections 7 and 12). It has not been added there, because that guide is edited by other sessions and can only be replaced whole.

## Her five moves in the game, and what each is on the model

| In the game (`combat-balance.md`) | On the model | What this pass added |
|---|---|---|
| **Gilded Rebuke:** 40 to one foe | `g_rebuke`: her flipbook's Gilded Rebuke played whole | The chain draws a thin gold ring. The blow is thrown from the bells to the foe as a thread of gold, so it reaches a foe standing a few meters off |
| **Attack taunt:** 50, and she catches the next 3 blows | `taunt_attack`, as it was in pass 19 | Three small new moons circle her, one for each blow she will still catch. One goes out with each blow; they all go when she makes her next move |
| **Heal taunt:** 10 MP, heals her 120, and taunts | `taunt_heal`, as it was in pass 19 | The same three moons |
| **Sealed Fate:** ends a sealed foe; every other foe loses 20% of the ended foe's full Life | `g_seal`: pass 19's big spell played whole | The foe is drawn into the seal and goes out as the rings shut, its dust settling where it stood. A streak runs along the ground to each other foe |
| **Curtain Call:** the same cast when it leaves no foe standing; fainted friends stand at 25% HP | `g_curtain`: pass 19's ending played whole | The splash, the other foes taken with the first, and at her bow a light stands up where each of her three fainted friends lay |

Nothing older was changed. Her ten spells, the lore's moves from pass 19 and all her body moves are still in the model and still on the night square page. The model now has 31 moves.

## Fate, and what happened to the charge

Pass 20 built the rule Chris gave on November 12: her big spell charged by the damage aimed at her, full at 75% of her own HP, shown as dust round her. The combat rules of November 13 replaced that rule:

- **Fate is on each foe, not on her.** A blow a foe lands on her gives that foe 500 Fate; a heavy one gives 1,000; a friend dropping below half gives every foe 5% of its Life, three times at most.
- **A foe is sealed when its Fate covers all the Life it has left.** Only then can Sealed Fate end it.

On the page:
- **Each foe wears its own Fate as dust** that falls round it like sand and thickens as Fate grows. Sealed, the fall stops, the dust locks into a tilted ring, and a small eclipse hangs over the foe.
- **The dust round her is kept,** as Chris liked it. It now follows the foe nearest its seal, so it still thickens and still becomes the rings when she casts.
- Each foe also has a bar: the Life it has left in red, with Fate growing over it from the other end.

**Open, for Chris:** dust on the foes and on her, or only one of the two.

## The page

- The same model, stage and night square as the night square page. Rows: Body (8 states and Walk around), Moves (10 and Take a hit), Spells in the game (5), The fight, Views, Switches.
- **Two practice foes:** sacks on posts with a knight's numbers (1,000 Life) and a wisp's (300). The words and numbers are data at the top of `viewer/game.js` (`GAME`, `RULES`, `FOES`, `FRIENDS`, `WORDS`).
- **The fight buttons:** Target, A foe hits her, A heavy blow, A friend in peril, Stand the foes up. A line under them gives her HP, her MP and how many blows she will still catch.
- **The buttons always work,** so any move can be watched at any time. Sealed Fate seals its foe first if it was not sealed. It switches to Curtain Call by itself when the cast would leave no foe standing, as the game does. The Curtain Call button takes every foe.
- The camera takes in the foes while she casts at them and for a moment after a blow, then goes back to her.
- Switches as before, with **Flipbook look** among them. The small flipbook picture is on the left on this page, because the foes are on the right.

## For the next session

- **Model:** `src/89b_game.js` (new) and one line in `src/90_api.js`. The host tells the model the game's state through `J.game`: `fates` (one entry for each foe, kept in the same place in the list), `others`, `friends`, `catches`. `J.charge` from pass 20 still works.
- **Page:** `viewer/game.js`, `viewer/game.tpl.html`, `build_game.sh`, then `python3 build_single.py game`. `viewer/app.js` is untouched, so the night square page still builds as it was.
- **Tools:** `fight_shots.py` takes stills of a whole fight; `smoke.py` runs a built file on its own clock and presses its buttons; `PAGE=out/game/test_local.html` points `shoot_page.py` and `seq.py` at this page.

## Not built

- The three friends themselves. Lights stand in for them.
- Her fainting. On this page her HP stops at 1.
- The turn bar, and the Fox's and Io's moves that feed Fate.
- The swing of up to 25% on damage and heals, left out so the numbers can be read.
- Sound.
- Still waiting on Chris from pass 20: which "make it feel final" idea to try first, and whether "use the full animations from the different sources" means playing each source whole.

## Checked, and not

- Every move over every stance: 186 pairs, no errors or broken numbers.
- Stills of a whole fight at phone size: blows, Gilded Rebuke, both taunts, Sealed Fate with its splash, the cast that runs on into Curtain Call, and new foes standing up.
- The little theatre, the Flipbook look, and a laptop-sized window.
- The single file run on its own clock with its buttons pressed: no errors.
- **Not checked:** at real speed, or on a real phone. The test browser runs at under two frames a second, so timing and feel are Chris's to judge.
