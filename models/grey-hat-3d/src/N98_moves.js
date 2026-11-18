  // ---------- stage 7, part A: his face moves, three talking loops, fourteen emotes, fidgets ----------
  // Chris: "give him ... all of the animations that the NPCs have". The list, the names and the timing are the fair folk's
  // (witches/people/npc/emotes.js, written for the Jester's skeleton); every move here is his own, written for his body, his stance
  // and his clothes: a showman in heavy boots and a big hat, unhurried, generous with his hands.
  //
  // HOW A MOVE IS WRITTEN. ACTS[name] = { dur, keys: [{ t, channel: value, ... }, ...] }. Each channel glides (smoothstep) from its
  // value at one key to its value at the next key that names it; before its first key it starts from rest at t 0; after its last
  // key it holds. 'rest' means "nothing from this move".
  //   hd  [nod down, turn to his left, tip toward his right shoulder]  radians, added to his head (and a third of it to his neck)
  //   sp  [lean forward, turn to his left, tip]                         radians, spread over the three spine bones
  //   sh  [right, left]                                                 shoulders up (radians at the collarbone)
  //   hip [x, y, z]                                                     metres, his hips moved; his feet stay where they are
  //   R, L  a hand: { p: [x, y, z], f: 'head' (p is on the head) or left out (p is on the chest), el, pa, wr, c, i }
  //         p is where the WRIST goes, in his own space as he rests in the A-pose (metres; +x his left, +z forward), carried by his
  //         chest (or head) wherever they have gone; the arm is solved to reach it (reachQuat). el: which way the elbow goes from
  //         the line shoulder to wrist (a direction on his chest; left out: out, down and back), pa: the hand turned toward palm up,
  //         wr: bent back at the wrist, c: finger curl (0 open, 1.4 a fist),
  //         i: index finger's curl (left out: as the others). 'rest' gives the arm back to whatever the legs and the stance want.
  //   eyes  0 open .. 1 shut (0.5 half shut)                  mouth  'rest' | 'open' | 'oo' | 'smile'  (held from its key on)
  //   say   a talking mouth from here on: 'calm' | 'lively' | 'gruff', or '' to stop (the shapes come from C2, chosen by a fixed
  //         sequence, so a picture at a given moment is always the same)
  // Every move ends with all its channels back at rest, so it returns him to whatever the legs are doing: standing now, seated later.
  const ACTS = {
    // ----- talking loops -----
    // calm: the right hand lifts a little and turns open, offers, settles; slow nods; weight easy
    talk_calm: { dur: 7.2, keys: [
      { t: 0.10, say: 'calm' }, { t: 0.60, hd: [0.04, 0.05, 0.02] }, { t: 1.20, sp: [0.02, 0.02, 0] },
      { t: 1.40, hd: [-0.02, -0.03, -0.02] }, { t: 2.10, hd: [0.05, 0.08, 0] }, { t: 2.30, say: '' },
      { t: 2.50, R: 'rest' }, { t: 2.70, say: 'calm' },
      { t: 3.30, R: { p: [-0.25, 1.06, 0.20], pa: 1.20, wr: 0.15, c: 0.30 }, hd: [-0.04, 0.03, -0.03], sp: [-0.02, 0.03, 0] },
      { t: 4.10, R: { p: [-0.27, 1.08, 0.22], pa: 1.30, wr: 0.25, c: 0.25 } },
      { t: 4.50, hd: [0.03, 0.08, 0.02] }, { t: 4.80, R: { p: [-0.25, 1.06, 0.21], pa: 1.20, wr: 0.15, c: 0.30 }, say: '' },
      { t: 5.00, say: 'calm' }, { t: 5.50, R: 'rest', sp: [0.01, 0, 0] }, { t: 5.90, hd: [0.02, 0.04, 0] },
      { t: 6.50, say: '' }, { t: 6.90, hd: 'rest', sp: 'rest' } ] },
    // lively: his stage 5 talk (talkArms, below in N99_static.js: offers with the right hand, opens both, marks a point with the left),
    // with a quicker mouth. Its hands are not keyed here: `lively` tells body() to run talkArms on this move's clock.
    talk_lively: { dur: 9.6, lively: true, keys: [
      { t: 0.10, say: 'lively' }, { t: 3.30, say: '' }, { t: 3.55, say: 'lively', mouth: 'rest' }, { t: 6.45, say: '' },
      { t: 6.70, say: 'lively' }, { t: 9.30, say: '' } ] },
    // gruff: his left hand rests on the front of his belt by the dagger, chin down, weight back; the right hand chops twice, low and short;
    // a slow sideways look between
    talk_gruff: { dur: 7.0, keys: [
      { t: 0.45, L: { p: [0.150, 1.060, 0.125], el: [1, -0.3, -0.5], pa: -0.15, wr: 0.10, c: 0.85, i: 0.55 }, sp: [-0.04, 0, 0], hd: [0.07, 0, 0] },
      { t: 0.40, say: 'gruff' }, { t: 1.40, say: '' },
      { t: 1.60, R: { p: [-0.20, 1.10, 0.25], pa: 0.40, wr: 0.10, c: 0.75 }, hd: [0.10, 0.06, 0.02], say: 'gruff' },
      { t: 1.85, R: { p: [-0.20, 1.02, 0.25], pa: 0.40, wr: -0.05, c: 0.75 }, hd: [0.13, 0.06, 0.02] },
      { t: 2.15, R: { p: [-0.20, 1.10, 0.25], pa: 0.40, wr: 0.10, c: 0.75 }, hd: [0.08, 0.04, 0.02] },
      { t: 2.40, R: { p: [-0.20, 1.01, 0.25], pa: 0.40, wr: -0.05, c: 0.75 }, hd: [0.13, 0.04, 0.02] },
      { t: 2.80, say: '' }, { t: 3.10, R: 'rest' },
      { t: 3.40, hd: [0.06, -0.22, -0.03], sp: [-0.04, -0.04, 0] }, { t: 3.60, say: 'gruff' }, { t: 4.60, say: '' },
      { t: 4.90, hd: [0.08, 0.02, 0] , sp: [-0.04, 0, 0] }, { t: 5.10, say: 'gruff' }, { t: 6.00, say: '' },
      { t: 6.10, L: { p: [0.150, 1.060, 0.125], el: [1, -0.3, -0.5], pa: -0.15, wr: 0.10, c: 0.85, i: 0.55 } },
      { t: 6.80, L: 'rest', hd: 'rest', sp: 'rest' } ] },
    // ----- emotes -----
    nod: { dur: 1.6, keys: [
      { t: 0.30, hd: [0.24, 0, 0], sp: [0.035, 0, 0] }, { t: 0.62, hd: [0.03, 0, 0], sp: [0.01, 0, 0] },
      { t: 0.92, hd: [0.18, 0, 0], sp: [0.025, 0, 0] }, { t: 1.35, hd: 'rest', sp: 'rest' } ] },
    shake_head: { dur: 2.0, keys: [
      { t: 0.25, hd: [0.04, 0.26, 0] }, { t: 0.62, hd: [0.04, -0.26, 0] }, { t: 0.98, hd: [0.04, 0.20, 0] },
      { t: 1.30, hd: [0.03, -0.12, 0] }, { t: 1.70, hd: 'rest' } ] },
    // wave: a big open right hand up beside his hat brim, swung from the elbow, and a smile
    wave: { dur: 2.8, keys: [
      { t: 0.45, R: { p: [-0.42, 1.64, 0.14], el: [-1, -0.45, 0.05], pa: 0.35, wr: 0.10, c: 0.10 }, hd: [-0.04, -0.06, -0.04], sp: [0, -0.03, 0.02], mouth: 'smile' },
      { t: 0.75, R: { p: [-0.34, 1.65, 0.16], el: [-1, -0.45, 0.05], pa: 0.35, wr: 0.10, c: 0.10 } },
      { t: 1.05, R: { p: [-0.48, 1.62, 0.12], el: [-1, -0.45, 0.05], pa: 0.35, wr: 0.10, c: 0.10 } },
      { t: 1.35, R: { p: [-0.34, 1.65, 0.16], el: [-1, -0.45, 0.05], pa: 0.35, wr: 0.10, c: 0.10 } },
      { t: 1.65, R: { p: [-0.42, 1.64, 0.14], el: [-1, -0.45, 0.05], pa: 0.35, wr: 0.10, c: 0.10 }, hd: [-0.04, -0.06, -0.04] },
      { t: 2.30, R: 'rest', hd: 'rest', sp: 'rest' }, { t: 2.45, mouth: 'rest' } ] },
    // greet_bow, his: a showman's bow. The right forearm folds across his waist, the left arm sweeps out low with the palm up, and he
    // bows from the waist, eyes lowered, smiling. (Fingers to the hat brim was tried: it needs the elbow folded so far that it came out
    // through the sleeve, measured and seen; so the hat is left alone.)
    greet_bow: { dur: 3.0, keys: [
      { t: 0.30, R: { p: [-0.22, 1.10, 0.28], pa: 0.40, wr: 0.10, c: 0.50 } },
      { t: 0.60, R: { p: [0.02, 1.13, 0.22], el: [-0.6, -1, -0.2], pa: 0.30, wr: 0.10, c: 0.45 }, hd: [0.03, 0, 0], mouth: 'smile' },
      { t: 1.10, sp: [0.30, 0.02, 0], hd: [0.14, 0, 0], eyes: 0.55, L: { p: [0.38, 1.03, 0.20], pa: 1.20, wr: 0.10, c: 0.30 } },
      { t: 1.60, sp: [0.31, 0.02, 0], hd: [0.15, 0, 0], eyes: 0.55, L: { p: [0.385, 1.03, 0.20], pa: 1.25, wr: 0.15, c: 0.25 } },
      { t: 2.15, sp: 'rest', hd: 'rest', eyes: 0, L: 'rest', R: { p: [0.02, 1.13, 0.22], el: [-0.6, -1, -0.2], pa: 0.30, wr: 0.10, c: 0.45 } },
      { t: 2.40, R: { p: [-0.22, 1.10, 0.28], pa: 0.40, wr: 0.10, c: 0.50 } },
      { t: 2.75, R: 'rest' }, { t: 2.85, mouth: 'rest' } ] },
    // shrug: both hands out at his belt, palms up, shoulders up, head tipped
    shrug: { dur: 2.2, keys: [
      { t: 0.45, sh: [0.13, 0.13], R: { p: [-0.36, 1.03, 0.16], pa: 1.40, wr: 0.20, c: 0.20 }, L: { p: [0.36, 1.03, 0.16], pa: 1.40, wr: 0.20, c: 0.20 }, hd: [0, 0.02, 0.11], mouth: 'oo' },
      { t: 1.15, sh: [0.11, 0.11], R: { p: [-0.37, 1.04, 0.16], pa: 1.40, wr: 0.20, c: 0.20 }, L: { p: [0.37, 1.04, 0.16], pa: 1.40, wr: 0.20, c: 0.20 }, hd: [0, 0.02, 0.10] },
      { t: 1.30, mouth: 'rest' }, { t: 1.80, sh: 'rest', R: 'rest', L: 'rest', hd: 'rest' } ] },
    // laugh: head back, left hand to his belly, shoulders shaking, eyes creased
    laugh: { dur: 2.8, keys: [
      { t: 0.30, hd: [-0.13, 0.02, 0.03], sp: [-0.05, 0, 0], L: { p: [0.10, 1.12, 0.20], pa: 0.20, wr: 0.20, c: 0.35 }, eyes: 0.6, mouth: 'open' },
      { t: 0.45, sh: [0.10, 0.10], mouth: 'smile' }, { t: 0.62, sh: [0.02, 0.02], mouth: 'open' },
      { t: 0.80, sh: [0.10, 0.10], mouth: 'smile' }, { t: 0.98, sh: [0.02, 0.02], mouth: 'open' },
      { t: 1.16, sh: [0.08, 0.08], mouth: 'smile', hd: [0.04, 0.02, 0.03], sp: [0.04, 0, 0] },
      { t: 1.34, sh: [0.02, 0.02], mouth: 'open' }, { t: 1.52, sh: [0.06, 0.06], mouth: 'smile', eyes: 0.5 },
      { t: 2.20, hd: 'rest', sp: 'rest', sh: 'rest', L: 'rest', eyes: 0 }, { t: 2.50, mouth: 'rest' } ] },
    // point: the right arm out ahead of him and to his right, one finger; he looks along it
    point: { dur: 2.6, keys: [
      { t: 0.55, R: { p: [-0.38, 1.30, 0.38], pa: 0.20, wr: 0.05, c: 1.20, i: 0.0 }, hd: [0.02, -0.30, 0], sp: [-0.02, -0.10, 0] },
      { t: 0.90, R: { p: [-0.385, 1.31, 0.385], pa: 0.20, wr: 0.10, c: 1.20, i: 0.0 } },
      { t: 1.60, R: { p: [-0.38, 1.30, 0.38], pa: 0.20, wr: 0.05, c: 1.20, i: 0.0 }, hd: [0.02, -0.30, 0], sp: [-0.02, -0.10, 0] },
      { t: 2.15, R: 'rest', hd: 'rest', sp: 'rest' } ] },
    // think: left hand up to his beard, right forearm across under it, head tipped, eyes narrowed
    think: { dur: 3.4, keys: [
      { t: 0.30, R: { p: [-0.22, 1.10, 0.28], pa: 0.40, wr: 0.10, c: 0.50 } },
      { t: 0.65, L: { p: [0.035, 1.395, 0.165], pa: 1.80, wr: 0.10, c: 1.05, i: 0.70 }, R: { p: [0.06, 1.10, 0.19], pa: 0.40, wr: 0.10, c: 0.60 }, hd: [0.06, -0.10, 0.07], eyes: 0.35 },
      { t: 2.20, L: { p: [0.035, 1.40, 0.165], pa: 1.80, wr: 0.20, c: 1.05, i: 0.70 }, hd: [0.04, -0.08, 0.09], eyes: 0.35 },
      { t: 2.55, R: { p: [-0.22, 1.10, 0.28], pa: 0.40, wr: 0.10, c: 0.50 } }, { t: 2.95, L: 'rest', R: 'rest', hd: 'rest', eyes: 0 } ] },
    surprised: { dur: 1.8, keys: [
      { t: 0.16, hd: [-0.09, 0, 0], sp: [-0.06, 0, 0], sh: [0.09, 0.09], mouth: 'open', R: { p: [-0.27, 1.18, 0.22], pa: 0.60, wr: 0.35, c: 0.10 }, L: { p: [0.27, 1.18, 0.22], pa: 0.60, wr: 0.35, c: 0.10 } },
      { t: 0.95, hd: [-0.07, 0, 0], sp: [-0.04, 0, 0], sh: [0.06, 0.06], R: { p: [-0.27, 1.17, 0.22], pa: 0.60, wr: 0.30, c: 0.15 }, L: { p: [0.27, 1.17, 0.22], pa: 0.60, wr: 0.30, c: 0.15 } },
      { t: 1.05, mouth: 'oo' }, { t: 1.45, hd: 'rest', sp: 'rest', sh: 'rest', R: 'rest', L: 'rest' }, { t: 1.55, mouth: 'rest' } ] },
    sad: { dur: 3.4, keys: [
      { t: 0.90, hd: [0.30, 0, 0.05], sp: [0.04, 0, 0], sh: [-0.02, -0.02], eyes: 0.55, R: { p: [-0.30, 0.93, 0.02], c: 0.55 }, L: { p: [0.29, 0.94, 0.04], c: 0.55 } },
      { t: 2.20, hd: [0.32, 0.03, 0.06], sp: [0.045, 0, 0], sh: [-0.025, -0.025], eyes: 0.6 },
      { t: 2.90, hd: 'rest', sp: 'rest', sh: 'rest', eyes: 0, R: 'rest', L: 'rest' } ] },
    // cross: a raised right forefinger, wagged; chin down, a hard look
    cross: { dur: 2.2, keys: [
      { t: 0.35, R: { p: [-0.25, 1.38, 0.28], pa: 0.10, wr: 0.10, c: 1.20, i: 0.0 }, hd: [0.08, 0, 0], sp: [0.04, 0, 0], mouth: 'open' },
      { t: 0.55, R: { p: [-0.20, 1.38, 0.29], pa: 0.10, wr: 0.10, c: 1.20, i: 0.0 }, mouth: 'rest' },
      { t: 0.75, R: { p: [-0.29, 1.38, 0.28], pa: 0.10, wr: 0.10, c: 1.20, i: 0.0 } },
      { t: 0.95, R: { p: [-0.20, 1.38, 0.29], pa: 0.10, wr: 0.10, c: 1.20, i: 0.0 } },
      { t: 1.15, R: { p: [-0.26, 1.38, 0.28], pa: 0.10, wr: 0.10, c: 1.20, i: 0.0 }, hd: [0.08, 0, 0], sp: [0.04, 0, 0] },
      { t: 1.70, R: 'rest', hd: 'rest', sp: 'rest' } ] },
    // beckon: right hand forward, palm up, fingers drawing in twice
    beckon: { dur: 2.6, keys: [
      { t: 0.45, R: { p: [-0.25, 1.14, 0.30], pa: 1.35, wr: 0.10, c: 0.15 }, hd: [0.03, -0.06, -0.05] },
      { t: 0.70, R: { p: [-0.25, 1.15, 0.27], pa: 1.35, wr: 0.40, c: 1.10 } },
      { t: 0.95, R: { p: [-0.25, 1.14, 0.30], pa: 1.35, wr: 0.10, c: 0.15 } },
      { t: 1.20, R: { p: [-0.25, 1.15, 0.27], pa: 1.35, wr: 0.40, c: 1.10 } },
      { t: 1.50, R: { p: [-0.25, 1.14, 0.30], pa: 1.35, wr: 0.10, c: 0.15 }, hd: [0.03, -0.06, -0.05] },
      { t: 2.05, R: 'rest', hd: 'rest' } ] },
    // refuse: left palm up and out toward whoever it is, a small shake of the head
    refuse: { dur: 2.4, keys: [
      { t: 0.40, L: { p: [0.22, 1.30, 0.32], pa: 0.40, wr: 0.55, c: 0.10 }, hd: [-0.06, 0.06, 0.03], sp: [-0.03, 0.03, 0] },
      { t: 0.65, hd: [-0.05, -0.10, 0.02] }, { t: 0.90, hd: [-0.05, 0.10, 0.02] }, { t: 1.15, hd: [-0.05, -0.05, 0.02] },
      { t: 1.40, L: { p: [0.22, 1.30, 0.33], pa: 0.40, wr: 0.55, c: 0.10 }, hd: [-0.04, 0.03, 0.02], sp: [-0.03, 0.03, 0] },
      { t: 1.90, L: 'rest', hd: 'rest', sp: 'rest' } ] },
    // thanks: right hand flat on his heart, a small bow of the head, a smile
    thanks: { dur: 2.6, keys: [
      { t: 0.55, R: { p: [0.0, 1.27, 0.21], el: [-0.5, -1, 0], pa: 0.10, wr: 0.25, c: 0.20 }, mouth: 'smile' },
      { t: 0.95, hd: [0.20, 0, 0], sp: [0.07, 0, 0], eyes: 0.5 },
      { t: 1.45, R: { p: [0.0, 1.27, 0.21], el: [-0.5, -1, 0], pa: 0.10, wr: 0.25, c: 0.20 }, hd: [0.03, 0, 0], sp: [0.01, 0, 0], eyes: 0 },
      { t: 2.05, R: 'rest', hd: 'rest', sp: 'rest' }, { t: 2.20, mouth: 'rest' } ] },
    // ----- fidgets (he does these on his own now and then; they can be started by name too) -----
    fidget_shift: { dur: 3.6, keys: [
      { t: 0.80, hip: [0.030, -0.006, 0], sp: [0, 0, -0.03], hd: [0, 0, 0.02] }, { t: 1.50, hip: [0.030, -0.006, 0], sp: [0, 0, -0.03], hd: [0, 0, 0.02] },
      { t: 2.20, hip: [-0.012, -0.002, 0], sp: [0, 0, 0.02], hd: [0, 0, -0.01] }, { t: 3.10, hip: 'rest', sp: 'rest', hd: 'rest' } ] },
    fidget_look: { dur: 3.6, keys: [
      { t: 1.00, hd: [-0.02, 0.45, 0], sp: [0, 0.08, 0] }, { t: 1.80, hd: [-0.03, 0.47, 0.02], sp: [0, 0.08, 0] },
      { t: 2.50, hd: [0.02, -0.15, 0] }, { t: 3.20, hd: 'rest', sp: 'rest' } ] },
    fidget_hands: { dur: 3.6, keys: [
      { t: 0.55, R: { p: [-0.075, 1.12, 0.24], pa: 0.60, wr: 0.10, c: 0.50 }, L: { p: [0.075, 1.12, 0.24], pa: 0.60, wr: 0.10, c: 0.50 }, hd: [0.10, 0, 0] },
      { t: 0.90, R: { p: [-0.065, 1.13, 0.25], pa: 0.60, wr: 0.15, c: 0.55 }, L: { p: [0.085, 1.11, 0.23], pa: 0.60, wr: 0.05, c: 0.45 } },
      { t: 1.25, R: { p: [-0.085, 1.11, 0.23], pa: 0.60, wr: 0.05, c: 0.45 }, L: { p: [0.065, 1.13, 0.25], pa: 0.60, wr: 0.15, c: 0.55 } },
      { t: 1.60, R: { p: [-0.065, 1.13, 0.25], pa: 0.60, wr: 0.15, c: 0.55 }, L: { p: [0.085, 1.11, 0.23], pa: 0.60, wr: 0.05, c: 0.45 } },
      { t: 1.95, R: { p: [-0.075, 1.12, 0.24], pa: 0.60, wr: 0.10, c: 0.50 }, L: { p: [0.075, 1.12, 0.24], pa: 0.60, wr: 0.10, c: 0.50 }, hd: [0.10, 0, 0] },
      { t: 2.70, R: 'rest', L: 'rest', hd: 'rest' } ] }
  };
  const ACT_TALK = ['talk_calm', 'talk_lively', 'talk_gruff'], ACT_EMOTES = ['nod', 'shake_head', 'wave', 'greet_bow', 'shrug', 'laugh', 'point', 'think', 'surprised', 'sad', 'cross', 'beckon', 'refuse', 'thanks'], ACT_FIDGETS = ['fidget_shift', 'fidget_look', 'fidget_hands'];
  // each move's keys sorted into channels once: CH[name][channel] = [[t, value], ...]
  const ACT_CH = {};
  for (const n in ACTS) { const C = ACT_CH[n] = {}; for (const k of ACTS[n].keys.slice().sort((a, b) => a.t - b.t)) for (const c in k) if (c !== 't') (C[c] || (C[c] = [])).push([k.t, k[c]]); }
  // the layer a move gives, filled by actSample and read by body() (N99_static.js)
  const mkLayer = () => ({ hd: [0, 0, 0], sp: [0, 0, 0], sh: [0, 0], hip: [0, 0, 0], eyes: 0, mouth: 'rest', say: '', lively: 0, livelyT: 0,
    R: { k: 0, p: V3(), pp: [V3(), V3()], f: ['', ''], kk: 0, el: V3(), pa: 0, wr: 0, c: 0.4, i: 0.32 }, L: { k: 0, p: V3(), pp: [V3(), V3()], f: ['', ''], kk: 0, el: V3(), pa: 0, wr: 0, c: 0.4, i: 0.32 } });
  const LAY = mkLayer(), LAY_OLD = mkLayer();
  const ACT = { name: '', t: 0, old: '', oldT: 0, fade: 0, loop: '', ends: 0 };
  // where in a channel's keys time T falls: [index of the key before (-1: before the first), smooth share toward the next]
  function seg(K, T) { let i = -1; while (i + 1 < K.length && K[i + 1][0] <= T) i++; if (i < 0) return [-1, sm(0, K[0][0], T)]; if (i >= K.length - 1) return [i, 0]; const a = K[i][0], b = K[i + 1][0]; return [i, sm(a, b, T)]; }
  const restOf = (c) => (c === 'sh' ? [0, 0] : [0, 0, 0]);
  function vecAt(K, T, c) { const [i, u] = seg(K, T), A = i < 0 ? 'rest' : K[i][1], B = i < 0 ? K[0][1] : i + 1 < K.length ? K[i + 1][1] : A, a = A === 'rest' ? restOf(c) : A, b = B === 'rest' ? restOf(c) : B; return a.map((v, j) => lerp(v, b[j], u)); }
  function numAt(K, T) { const [i, u] = seg(K, T), a = i < 0 ? 0 : K[i][1], b = i < 0 ? K[0][1] : i + 1 < K.length ? K[i + 1][1] : a; return lerp(a === 'rest' ? 0 : a, b === 'rest' ? 0 : b, u); }
  function heldAt(K, T, d) { let v = d; for (const k of K) { if (k[0] <= T) v = k[1]; else break; } return v === 'rest' ? d : v; }
  // a hand: the two keys it is between and the share. Positions are resolved to his chest in body() (they may be on the head).
  function handAt(K, T, o) {
    const [i, u] = seg(K, T), A = i < 0 ? 'rest' : K[i][1], B = i < 0 ? K[0][1] : i + 1 < K.length ? K[i + 1][1] : A;
    const a = A === 'rest' ? null : A, b = B === 'rest' ? null : B;
    o.k = lerp(a ? 1 : 0, b ? 1 : 0, u); const x = a || b, y = b || a; if (!x) { o.k = 0; return o; }
    o.pp[0].fromArray(x.p); o.pp[1].fromArray(y.p); o.f[0] = x.f || ''; o.f[1] = y.f || ''; o.kk = a && b ? u : (a ? 0 : 1);
    const m = (n, d) => lerp(x[n] == null ? d : x[n], y[n] == null ? d : y[n], o.kk);
    const s = o === LAY.L || o === LAY_OLD.L ? 1 : -1, dx = s * 0.55, ea = x.el || [dx, -0.7, -0.35], eb = y.el || [dx, -0.7, -0.35];
    o.el.set(lerp(ea[0], eb[0], o.kk), lerp(ea[1], eb[1], o.kk), lerp(ea[2], eb[2], o.kk)); o.pa = m('pa', 0); o.wr = m('wr', 0); o.c = m('c', 0.4); o.i = lerp(x.i == null ? (x.c == null ? 0.4 : x.c) * 0.8 : x.i, y.i == null ? (y.c == null ? 0.4 : y.c) * 0.8 : y.i, o.kk);
    return o;
  }
  function actSample(name, T, o) {
    const C = ACT_CH[name] || {};
    o.hd = C.hd ? vecAt(C.hd, T, 'hd') : [0, 0, 0]; o.sp = C.sp ? vecAt(C.sp, T, 'sp') : [0, 0, 0]; o.sh = C.sh ? vecAt(C.sh, T, 'sh') : [0, 0]; o.hip = C.hip ? vecAt(C.hip, T, 'hip') : [0, 0, 0];
    o.eyes = C.eyes ? numAt(C.eyes, T) : 0; o.mouth = C.mouth ? heldAt(C.mouth, T, 'rest') : 'rest'; o.say = C.say ? heldAt(C.say, T, '') : '';
    o.lively = ACTS[name] && ACTS[name].lively ? sm(0, 0.5, T) * (1 - sm(ACTS[name].dur - 0.5, ACTS[name].dur, T)) : 0; o.livelyT = T;
    for (const S of ['R', 'L']) { if (C[S]) handAt(C[S], T, o[S]); else o[S].k = 0; }
    return o;
  }
  const scaleLayer = (o, f) => { for (const c of ['hd', 'sp', 'sh', 'hip']) o[c] = o[c].map((v) => v * f); o.eyes *= f; o.lively *= f; o.R.k *= f; o.L.k *= f; if (f < 0.5) { o.mouth = 'rest'; o.say = ''; } return o; };
  // start a move by name. A move already playing is not cut dead: it is held where it was and melts away over 0.3 s.
  function act(name) {
    if (!name) { stopAct(); return false; }
    if (!ACTS[name]) return false;
    if (ACT.name) { ACT.old = ACT.name; ACT.oldT = ACT.t; ACT.fade = 1; }
    ACT.name = name; ACT.t = 0; return ACTS[name].dur;
  }
  function stopAct() { if (ACT.name) { ACT.old = ACT.name; ACT.oldT = ACT.t; ACT.fade = 1; } ACT.name = ''; ACT.t = 0; }
  // keep a talking loop going until talkLoop(null). Emotes started meanwhile play out, then the loop picks up again.
  function talkLoop(name) { ACT.loop = name && ACTS[name] ? name : ''; if (!ACT.loop && /^talk_/.test(ACT.name)) stopAct(); else if (ACT.loop && !ACT.name) act(ACT.loop); return ACT.loop; }
  // what he does on his own: blink, and now and then a fidget when nothing else is asked of him
  const AUTO = { blink: true, fidget: true, fidgets: ACT_FIDGETS.slice() };
  let fidgetIn = 6, fidgetN = 0, blinkAt = 2.4, blinkT = -9, facePainted = '0|rest';
  const FACE_FIX = { on: false, eyes: 0, mouth: 'rest' };      // setFace(eyes, mouth) holds a state for pictures; setFace(null) lets him go again
  // one frame of the move layer (called from body() with its dt; idle tells it whether he is standing about with nothing to do)
  function actFrame(dt, idle) {
    if (ACT.name) { ACT.t += dt; if (ACT.t >= ACTS[ACT.name].dur) { ACT.name = ''; ACT.t = 0; } }
    if (!ACT.name && ACT.loop) act(ACT.loop);
    if (!ACT.name && AUTO.fidget && idle && AUTO.fidgets.length) { fidgetIn -= dt; if (fidgetIn <= 0) { act(AUTO.fidgets[fidgetN++ % AUTO.fidgets.length]); fidgetIn = 7 + 6 * frac(fidgetN * 0.618); } } else if (ACT.name) fidgetIn = Math.max(fidgetIn, 4);
    if (ACT.fade > 0) ACT.fade = Math.max(0, ACT.fade - dt / 0.3);
    if (ACT.name) actSample(ACT.name, ACT.t, LAY); else scaleLayer(actSample('', 0, LAY), 0);
    if (ACT.fade > 0 && ACT.old) scaleLayer(actSample(ACT.old, ACT.oldT, LAY_OLD), ACT.fade * ACT.fade * (3 - 2 * ACT.fade)); else scaleLayer(LAY_OLD, 0);
    return LAY;
  }
  // ----- reaching: an arm turned so that its wrist is at a point -----
  // Two bones, solved exactly (no search): the elbow lies on the circle the two lengths allow, on the side the move's elbow hint (el)
  // points to. His elbow's hinge is the forearm bone's own X, which is not square to his arm as it rests in the A-pose (the arm is 27
  // degrees out), so a bend of e turns the forearm on a cone: the bend that gives the angle the two bones need is worked out on that cone
  // (it cannot fold closer than about 54 degrees, so a wrist is never asked to come nearer the shoulder than REACH_MIN). The upper arm is
  // then the one turn that lays the resting arm and the bent forearm onto the two lines found. Out: the upper arm's and forearm's turns.
  const _pa = V3(), _pc = V3(), _mi = new THREE.Matrix4(), _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _e1 = V3(), _e2 = V3(), _e3 = V3(), _u = V3(), _v = V3(), _n = V3(), _pole = V3(), _El = V3();
  const SA = Math.sin(A_POSE), CA = Math.cos(A_POSE), E_MAX = 2.95, COS_MIN = SA * SA + CA * CA * Math.cos(E_MAX);
  function frameOf(a, b, m) { _e1.copy(a).normalize(); _e2.copy(b).addScaledVector(_e1, -_e1.dot(b)).normalize(); _e3.crossVectors(_e1, _e2); return m.makeBasis(_e1, _e2, _e3); }
  function reachQuat(S, s, target, pole, qU, qF) {
    const U = SK['uarm' + S], a = SK['farm' + S].position.length(), b = SK['hand' + S].position.length();
    _n.copy(target).sub(U.position); let dist = _n.length(); _n.multiplyScalar(1 / Math.max(dist, 1e-6));
    const dMin = Math.sqrt(a * a + b * b + 2 * a * b * COS_MIN) + 1e-4; dist = cl(dist, dMin, a + b - 1e-4);
    const cosT = cl((dist * dist - a * a - b * b) / (2 * a * b), COS_MIN, 1), e = Math.acos(cl((cosT - SA * SA) / (CA * CA), -1, 1));
    const x = (a * a - b * b + dist * dist) / (2 * dist), r = Math.sqrt(Math.max(0, a * a - x * x));
    _pole.copy(pole).addScaledVector(_n, -_n.dot(pole)); if (_pole.lengthSq() < 1e-8) _pole.set(0, -1, 0).addScaledVector(_n, -_n.y); _pole.normalize();
    _El.copy(U.position).addScaledVector(_n, x).addScaledVector(_pole, r);
    _u.copy(_El).sub(U.position); _v.copy(U.position).addScaledVector(_n, dist).sub(_El);
    qF.setFromAxisAngle(AX7, -e); const d = armDir[S], f = _pa.copy(d).applyQuaternion(qF);
    frameOf(d, f, _m1); frameOf(_u, _v, _m2); _m2.multiply(_m1.transpose()); qU.setFromRotationMatrix(_m2);
    return e;
  }
  const AX7 = V3(1, 0, 0);
  // a direction a move names (on his chest, as he rests) to the collarbone's frame as the bones are now
  const _qd = new THREE.Quaternion(), _qe = new THREE.Quaternion();
  function dirToClav(S, d, o) { SK.spine3.getWorldQuaternion(_qd); SK['clav' + S].getWorldQuaternion(_qe); return o.copy(d).applyQuaternion(_qd).applyQuaternion(_qe.invert()); }
  // a point a move names (on his chest or his head, as he rests) to the collarbone's frame as the bones are now (their matrices must be fresh)
  function toClav(S, p, f, o) {
    const B = f === 'head' ? SK.head : SK.spine3; o.copy(p).sub(B.userData.rest).applyMatrix4(B.matrixWorld);
    return o.applyMatrix4(_mi.copy(SK['clav' + S].matrixWorld).invert());
  }
  // the wrist's target for a hand of the layer, in the collarbone's frame
  function layerTarget(S, h, o) { toClav(S, h.pp[0], h.f[0], _pc); toClav(S, h.pp[1], h.f[1], o); return o.sub(_pc).multiplyScalar(h.kk).add(_pc); }
  // the talking mouth: a fixed sequence of C2's shapes, a syllable at a time, each voice with its own speed and mix
  const SAY = { calm: { len: 0.19, mix: [0.30, 0.72, 1.0, 1.0] }, lively: { len: 0.14, mix: [0.22, 0.66, 0.84, 1.0] }, gruff: { len: 0.16, mix: [0.42, 0.92, 1.0, 1.0] } };
  function sayMouth(style, T) { const v = SAY[style]; if (!v) return 'rest'; const r = h1(Math.floor(T / v.len) * 3.17 + style.length * 11.3); return r < v.mix[0] ? 'rest' : r < v.mix[1] ? 'open' : r < v.mix[2] ? 'oo' : 'smile'; }
  // his face for this frame: blink on his own, eyes and mouth from the move layer
  function faceFrame(dt, on) {
    if (!on && !FACE_FIX.on) { if (facePainted !== '0|rest') { paintFace(0, 'rest'); facePainted = '0|rest'; } return; }
    if (clock > blinkAt && mv.name !== 'stand') { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT, bl = AUTO.blink ? (bt < 0.04 ? 0.5 : bt < 0.10 ? 1 : bt < 0.15 ? 0.5 : 0) : 0;
    const L = LAY, e = Math.max(bl, L.eyes, LAY_OLD.eyes), eyes = e >= 0.75 ? 1 : e >= 0.25 ? 0.5 : 0, mouth = L.say ? sayMouth(L.say, ACT.t) : L.mouth !== 'rest' ? L.mouth : LAY_OLD.mouth;
    const tm = mv.name === 'talk' && !L.say && L.mouth === 'rest' ? sayMouth('lively', mv.t) : mouth;
    const want = FACE_FIX.on ? FACE_FIX.eyes + '|' + FACE_FIX.mouth : eyes + '|' + tm;      // the canvas is painted again only when the state changes
    if (want !== facePainted) { const [a, b] = want.split('|'); paintFace(+a, b); facePainted = want; }
  }
