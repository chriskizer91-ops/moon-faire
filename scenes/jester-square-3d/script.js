// The film: "A Fool's Mercy" in 3D. The same story and timing as the painted
// version (scenes/jester-square/), staged in a night square built entirely in
// code, with the camera close on the Jester. Places are in metres: the well is
// at the middle, x runs east (screen right when looking at the chapel), z runs
// south toward the default camera, y is up.
//
//  0:00  A crane shot down over the town at night. Moonlit Forest Path.
//  0:09  Bells first, then the Jester, crossing the square to the well.
//  0:20  The chapel bell tolls; wisps come from the graveyard and the woods road.
//  0:29  Gilded Rebuke. Herbal Decay starts low under the wisps.
//  0:33  The wail, and Hush: the music stops with them.
//  0:41  The Shadow Wraith climbs out of the graveyard as the band comes in. Gravity.
//  0:48  The great wraith comes down the road and swallows every lamp.
//  0:55  Sealed Fate. The chapel bell counts the Doom down.
//  1:01  The stolen fire; Against All Odds.
//  1:15  Curtain Call; on frame 32 every soul goes home as a moth.
//  1:23  Moonlit Forest Path again; she walks up toward the chapel.

const DUR = 120;
const POSTER = 19.5;      // the frame shown before Play: a close shot of her at the well
const CLIPS = DATA.clips;
const clipLen = c => CLIPS[c].n / CLIPS[c].fps;
const releaseAt = (c, t0) => t0 + (CLIPS[c].release - 1) / CLIPS[c].fps;
const frameAt = (c, t0, k) => t0 + (k - 1) / CLIPS[c].fps;
const depthScale = () => 1;                  // in 3D, distance does the scaling
const JESTER_M = 1.95 / 370;                 // metres per pixel of her frames: 1.95 m to her hat tips

// ---------- the Jester ----------
// from/to are [x, z] on the cobbles.
const J = [];
function act(clip, t0, o = {}) {
  const cycles = o.cycles || 1;
  const a = {
    clip, t0, t1: o.until != null ? o.until : t0 + clipLen(clip) * cycles,
    from: o.from, to: o.to || o.from, loop: CLIPS[clip].loop || cycles > 1 || o.until != null,
    hold: o.hold, release: CLIPS[clip].release ? releaseAt(clip, t0) : null,
  };
  J.push(a);
  return a;
}
const P0 = [-13, 3.5], P1 = [-5.5, 3.5], P2 = [-2.5, 6.0], P3 = [-4.6, 6.0], P3b = [-4.0, 0.6], P4 = [-1.4, -9.4];

const enter   = act("walk_right", 9.5, { cycles: 2, from: P0, to: P1 });
const toward  = act("walk_toward", enter.t1, { cycles: 2, from: P1, to: P2 });
act("idle", toward.t1, { until: 29.4, from: P2 });
const rebuke  = act("gilded_rebuke", 29.4, { from: P2 });               // release 30.40
act("idle", rebuke.t1, { until: 35, from: P2 });
const hush    = act("hush", 35, { from: P2 });                          // release 37.67
act("idle", hush.t1, { until: 45.2, from: P2 });
const gravity = act("gravity", 45.2, { from: P2 });                     // release 46.31
act("idle", gravity.t1, { until: 54.8, from: P2 });
const seal    = act("sealed_fate", 54.8, { from: P2 });                 // release 57.80
act("idle", seal.t1, { until: 61, from: P2 });
const retreat = act("walk_left", 61, { from: P2, to: P3 });
const odds    = act("against_all_odds", retreat.t1, { from: P3 });      // release 65.17
act("idle", odds.t1, { until: 75, from: P3 });
const curtain = act("curtain_call", 75, { from: P3 });                  // release 80.17
act("idle", curtain.t1, { until: 96, from: P3 });
const away    = act("walk_away", 96, { cycles: 3, from: P3, to: P3b });   // up past the well
const away2   = act("walk_away", away.t1, { cycles: 3, from: P3b, to: P4 });
act("walk_away", away2.t1, { until: DUR + 1, from: P4, hold: 0 });

const STEP_FRAMES = { walk_right: [1, 9], walk_left: [1, 9], walk_toward: [1, 3], walk_away: [1, 4] };
const STEPS = [];
for (const a of J) {
  const fr = STEP_FRAMES[a.clip];
  if (!fr || a.hold != null) continue;
  const c = CLIPS[a.clip], cyc = c.n / c.fps;
  for (let k = 0; a.t0 + k * cyc < a.t1; k++)
    for (const f of fr) { const t = a.t0 + k * cyc + (f - 1) / c.fps; if (t < a.t1) STEPS.push({ t, clip: a.clip }); }
}
// Spell points on her, in frame pixels from her soles (screen right, up).
const HAND = {
  flail: [250, -275], hush: [140, -285], orb: [90, -270], sigil: [-55, -330],
  pendant: [0, -255], chest: [0, -215], sky: [-70, -390], waist: [0, -165],
};

// ---------- the foes (Envoi's) ----------
// path: [t, x, y, z] keys. A wraith's y is 0 (its hem on the cobbles); a wisp's
// y is the height of its middle. h: height in metres. poses: [t, pose].
const HIT = frameAt("gilded_rebuke", rebuke.t0, 5) + 0.06;
const HUSH_LAND = [hush.release + 0.42, hush.release + 0.58];
const GRAV_HIT = gravity.release + 0.42;
const SEAL_LAND = [seal.release + 0.42, seal.release + 0.56, seal.release + 0.7];
const CC = curtain.release;
const BREATH = [61.15, 65.3];
const RELEASE_ALL = CC + 0.1;

const FOES = [
  { id: "w3", kind: "wisp", h: 1.35, seed: 3, rise: 22.6, hit: HIT, release: HIT + 0.75,
    path: [[22.6, 17, 2.4, -8], [24.6, 12, 2.8, -7.5], [27.4, 4.5, 3.25, 5.0], [28.6, 4.4, 3.2, 4.9], [30.3, -1.1, 1.5, 5.6], [HIT, -1.1, 1.5, 5.6], [HIT + 0.5, 0.2, 1.9, 4.8]],
    poses: [[22.6, "idle"], [27.4, "cling"], [28.6, "flicker"], [HIT, "hurt"], [HIT + 0.75, "released"]] },
  { id: "w1", kind: "wisp", h: 1.35, seed: 7, rise: 21.4, hushed: HUSH_LAND[0], wail: [33.6, HUSH_LAND[0]],
    path: [[21.4, 8.5, 1.2, -15], [23.6, 6.5, 2.6, -9], [25.6, 5.0, 3.25, -5.0], [31.6, 5.0, 3.25, -5.0], [33.4, -0.4, 1.7, 3.1], [69, -0.5, 1.7, 3.1]],
    poses: [[21.4, "idle"], [25.6, "cling"], [31.6, "idle"], [33.6, "wail"], [HUSH_LAND[0], "idle"]] },
  { id: "w2", kind: "wisp", h: 1.35, seed: 11, rise: 23.2, hushed: HUSH_LAND[1], wail: [33.9, HUSH_LAND[1]], seal: SEAL_LAND[2],
    path: [[23.2, 17, 2.6, -6.5], [25.2, 11.5, 3.25, -8.5], [31.8, 11.5, 3.25, -8.5], [33.6, 1.6, 2.5, 3.2], [69, 1.5, 2.5, 3.15]],
    poses: [[23.2, "idle"], [25.2, "cling"], [31.8, "idle"], [33.9, "wail"], [HUSH_LAND[1], "idle"]] },
  { id: "wr", kind: "wraith", h: 2.34, seed: 17, rise: 41.0, gravity: GRAV_HIT, seal: SEAL_LAND[1],
    path: [[41.0, 8.0, 0, -14.0], [42.6, 7.0, 0, -8], [44.4, 5.4, 0, 0.6], [69, 5.36, 0, 0.6]],
    poses: [[41.0, "idle"], [44.4, "idle_turn"], [44.9, "raise"], [GRAV_HIT, "kneel"]] },
  { id: "gw", kind: "great", h: 4.4, seed: 29, rise: 48.3, seal: SEAL_LAND[0],
    path: [[48.3, 24, 0, -8], [50.2, 15, 0, -8], [52.4, 10.7, 0, -2.3], [69, 10.7, 0, -2.3]],
    poses: [[48.3, "front"], [52.6, "swallow"], [54.7, "front"], [61.0, "breath"], [BREATH[1] + 0.2, "front"]] },
];
const DOOM_TICKS = [[64.0, 2], [72.0, 1], [CC, 0]];

// ---------- the square ----------
const CHAPEL = { x: 0, z: -17 };
const BELL3 = { x: 0, y: 11.2, z: -19.6 };          // the bell in the chapel tower
const MOON3 = { x: 130, y: 135, z: -260, r: 16 };    // far off, high over the graveyard
// Lamps: lantern position and the post's foot.
const LAMPS = [
  { id: "left", at: [-6.5, 3.05, 1.0], gone: 52.75, back: RELEASE_ALL + 0.45 },
  { id: "well", at: [0, 2.55, 0.0], gone: 53.05, back: RELEASE_ALL + 0.6, small: true },
  { id: "front", at: [4.5, 3.05, 5.0], gone: 53.35, back: RELEASE_ALL + 0.75, gutter: [27.4, 29.0] },
  { id: "right", at: [5.0, 3.05, -5.0], gone: 53.65, back: RELEASE_ALL + 0.9, gutter: [25.6, 31.6] },
  { id: "road", at: [11.5, 3.05, -8.5], gone: 53.95, back: RELEASE_ALL + 1.05, gutter: [25.2, 31.8] },
  { id: "forge", at: [-12.4, 1.1, -6.2], gone: 54.25, back: RELEASE_ALL + 1.2, forge: true },
];

const ENV = {
  dark:    [[0, 0], [20, 0], [24, 0.15], [29, 0.2], [52.6, 0.25], [54.4, 0.55], [80.2, 0.55], [81.8, 0.05], [DUR, 0]],
  moon:    [[0, 1], [20, 1], [28, 0.75], [54, 0.6], [80, 0.6], [83, 1.2], [92, 1.1]],
  newMoon: [[0, 0], [78.1, 0], [78.7, 1], [83.2, 1], [85, 0]],
  flies:   [[0, 0.7], [20, 0.7], [23, 0], [86, 0], [92, 0.8], [DUR, 0.8]],
  theatre: [[0, 0], [75.3, 0], [77.2, 0.85], [80.1, 0.92], [80.35, 0.15], [82.6, 0.1], [84.5, 0]],
  curtains:[[0, 0], [78.9, 0], [80.0, 1], [CC, 1], [CC + 0.35, 0]],
  bars:    [[0, 0]],
  fade:    [[0, 1], [2.0, 0], [117.2, 0], [119.8, 1]],
  ward:    [[0, 0], [CC, 0], [CC + 0.3, 1], [85, 0.6], [89, 0]],
  fog:     [[0, 0.012], [20, 0.012], [26, 0.02], [55, 0.025], [81, 0.018], [90, 0.011], [DUR, 0.011]],
};

// Camera: [t, position, look-at, lens (vertical degrees)]. "moon" aims at the moon.
const SHOTS = [
  // the moon over the town, then down into the square
  [0, [-3, 14, 38], [25, 32, -45], 46], [2.6, [-3, 14, 38], [25, 32, -45], 46], [8.6, [-0.2, 5, 15], [-4, 2, 0], 46],
  // she comes in from the west and walks down to the well
  [8.6, [-9.5, 1.6, 9.4], [-12, 1.1, 3], 40], [14.8, [-4.2, 1.5, 10.2], [-5.4, 1.1, 3.6], 40],
  [18.8, [-1.4, 1.45, 10.2], [-2.4, 1.15, 6.0], 36], [21.0, [-1.4, 1.45, 10.2], [-2.4, 1.15, 6.0], 36],
  // the wisps come from the east; Gilded Rebuke
  [23.0, [0.5, 2.2, 12], [0.5, 3, -6], 48], [27.4, [0.5, 2.0, 12], [0.5, 2.5, -2], 46],
  [29.0, [-0.6, 1.45, 10.4], [-1.8, 1.35, 5.8], 38], [31.6, [-2.0, 2.0, 12.5], [1.5, 1.6, 0], 46], [35.0, [-2.0, 2.0, 12.5], [1.5, 1.6, 0], 46],
  // Hush
  [35.8, [-1.2, 1.8, 8.8], [-2.4, 1.6, 6.0], 30], [37.3, [-1.2, 1.8, 8.8], [-2.4, 1.6, 6.0], 30],
  [37.9, [-3.5, 2.1, 12], [1.5, 1.8, 2], 44], [40.2, [-3.0, 2.2, 12], [4, 2.5, -6], 46],
  // the Shadow Wraith climbs out of the graveyard; Gravity
  [41.2, [-1.5, 2.0, 10], [7, 1.5, -12], 34], [44.6, [-2.0, 1.9, 12.5], [1.5, 1.6, 0], 46],
  [47.6, [-2.2, 1.7, 12], [1.5, 1.4, 0], 46],
  // the great wraith comes down the road and swallows the lamps
  [48.6, [-1, 2.4, 10], [14, 3, -6], 44], [52.4, [-3.2, 2.1, 13], [4, 2.6, -2], 50], [54.6, [-3.2, 2.1, 13], [4, 2.6, -2], 50],
  // Sealed Fate
  [55.4, [-1.2, 1.7, 8.8], [-2.4, 1.65, 6.0], 32], [57.3, [-1.2, 1.7, 8.8], [-2.4, 1.65, 6.0], 32],
  [58.0, [-3.0, 2.4, 12.4], [3.5, 2.4, -1], 48], [60.8, [-3.0, 2.3, 12.4], [3.5, 2.4, -1.5], 48],
  // the stolen fire; Against All Odds
  [63.7, [-3.4, 1.15, 10.4], [-3, 1.75, 2], 40], [66.6, [-3.6, 2.1, 13], [1, 2.2, -1], 50],
  [71.7, [-4.4, 1.9, 12], [0, 1.8, 0], 46],
  // Curtain Call: the moon goes new, the curtains close, every soul goes home
  [75.0, [-3.4, 1.5, 9.6], [-4.6, 1.3, 6.0], 36], [77.6, [-3.4, 1.35, 10.6], [-4.6, 1.6, 6.0], 40],
  [78.4, [-4.0, 1.2, 10.4], "moon", 46], [79.4, [-4.0, 1.2, 10.4], "moon", 46], [80.0, [-5.0, 2.5, 13.8], [3, 1.8, -2], 52],
  [83.2, [-5.4, 2.5, 13], [2, 3, -4], 48], [86.6, [-3.5, 1.75, 8.9], [-4.6, 1.5, 6.0], 30],
  [91.4, [-3.5, 1.75, 8.9], [-4.6, 1.5, 6.0], 30], [95, [-7.2, 2.1, 12.4], [-3, 2, 0], 46],
  // she walks up to the chapel; the camera rises to the bell
  [104, [-4.4, 1.9, 9.4], [-1, 1.6, -6], 44], [109.5, [-3, 3.2, 7], [0, 10.5, -19.5], 50], [DUR, [-3, 3.6, 6.6], [0, 11, -19.5], 50],
];
const SHAKES = [[HIT, 0.05, 0.35], [GRAV_HIT, 0.16, 0.9], [BREATH[1], 0.07, 0.5], [CC, 0.22, 1.3], [52.6, 0.03, 2]];
const FLASHES = [[HIT, 0.12, 0.18], [GRAV_HIT, 0.18, 0.3], [CC, 0.45, 0.9]];
const BANNERS = [
  [rebuke.t0, "Gilded Rebuke"], [hush.t0, "Hush"], [gravity.t0, "Gravity"],
  [seal.t0, "Sealed Fate"], [odds.t0, "Against All Odds"], [curtain.t0, "Curtain Call"],
];
const TITLES = [
  { t0: 1.4, t1: 7.6, title: "Moon Faire", sub: "A Fool's Mercy" },
  { t0: 111.5, t1: 118.6, title: "Moon Faire", sub: "A Fool's Mercy" },
];
const CHAPTERS = [
  [0, "The town"], [9, "The Jester"], [20, "Wisps"], [29.4, "Gilded Rebuke"], [33.5, "Hush"], [41, "The wraith"],
  [48.3, "The great wraith"], [54.8, "Sealed Fate"], [61, "Against All Odds"], [75, "Curtain Call"], [81, "Home"], [96, "Exit"],
];
