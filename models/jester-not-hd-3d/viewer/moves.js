// Her moves: when each one lands after its release moment, how hard it shoves, and what it leaves on what it hits.
// The movement is the clip of the same name inside jester.glb (which also carries each clip's release moment and label),
// and the look is the effect of the same name in fx.js. Together with core.js, which loads her, that is the whole of her.
// Nothing here is a number for a game. Damage, costs and turn order are in rules.js, and can change without touching her.
//   at:     seconds after the release moment
//   push:   how hard the target is shoved away from her (the training dummy rocks by this much)
//   squash: how far it is pressed flat, 0 to 1
//   leaves: 'doom'     marks the target; the mark counts down, and when it runs out Doom takes the target
//           'doom now' Doom takes a marked target at once
//           'hush'     wraps the target's head in quiet for a while
export const MOVES = {
  GildedRebuke:   { hits: [{ at: 0.12, push: 8 }] },
  SealedFate:     { hits: [{ at: 0.34, push: 1.5 }, { at: 1.0, push: 5, leaves: 'doom' }] },
  Hush:           { hits: [{ at: 0.4, push: 1.2, leaves: 'hush' }] },
  Gravity:        { hits: [{ at: 0.13, push: 0, squash: 0.5 }, { at: 0.4, push: 6 }] },
  AgainstAllOdds: { hits: [] },                    // on herself
  CurtainCall:    { hits: [{ at: 0.25, push: 5, leaves: 'doom now' }] },
};
export const DOOM = { count: 3, tick: 2.2, lands: 1.0, over: 2.4 };   // ticks of the mark, seconds between them, when the target is gone, when the effect ends
export const HUSH = { lasts: 5 };
