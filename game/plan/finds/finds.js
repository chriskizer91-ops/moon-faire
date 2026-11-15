// The finds for the bigger game (task board S5): 18, three in each of the six rings beyond the fair.
// In each ring one lies on the way, one is off the path, and one is hidden.
// The five that already exist keep their cards from game/world/world.json (their "code" says which).
// Chris, November 15, 2026: "The names and cards work good", and "half strength for the power of the found items".
// So every percentage here is HALF of what was first proposed (5% became 2.5%, 2% became 1%), and that goes for the
// five old cards too: their "does" lines in world.json still say the old numbers and change when these are merged in.
// The fourth Bloom and the ghost's third blow add a whole thing and stay as they were.
// His aim for the strength is in target.js: only an expert who has found everything should just barely win the last fight
// with its foes two levels above. That is to be tuned again once fights carry HP and MP over and the big bad exists.
// "kind" names the same change in candidates.js, where each.js measures it alone.
// "changes" are the numbers a find alters in the approved engine's RULES. Nothing else about a fight changes.
const { all, HP, MP, HEAL, FOXMP } = require('./lib.js');
const EASY = 'on the way', OFF = 'off the path', HID = 'hidden';
module.exports = [
  // ring 1, party level 2 to 5
  { id: 'cold-lantern-glass', kind: 'mp5', ring: 1, how: EASY, code: 'W4-f', name: 'Cold lantern glass', does: 'All four have 2.5% more MP.', changes: all(MP, 1.025) },
  { id: 'stubborn-candle', kind: 'hp2', ring: 1, how: OFF, isNew: true, name: 'The stubborn candle', does: 'All four have 1% more HP.', changes: all(HP, 1.01),
    card: 'A candle stub from a fair stall, dropped in the heather half a mile out. The call took it this far and no further. It is still lit, and it leans the wrong way.',
    picture: 'a short, fat tallow candle stub in a dented tin holder, burning with a small steady gold flame that leans a little to the left' },
  { id: 'straight-spark', kind: 'ranger5', ring: 1, how: HID, isNew: true, name: 'The straight spark', witch: 'Ranger', does: "The Ranger's arrows and gem shots hit 2.5% harder.", changes: all(['r.plain', 'r.lit'], 1.025),
    card: 'A flint arrowhead, wedged in a crack of the drystone wall. Struck on steel it throws one spark, and the spark flies dead straight. Nothing else out here does.',
    picture: 'one knapped grey flint arrowhead lying flat, its edges finely chipped, with a single bright white-gold spark and a short straight trail of light leaving its point' },
  // ring 2, party level 5 to 8
  { id: 'cut-thread', kind: 'foxmp5', ring: 2, how: EASY, code: 'W5-e', name: 'The cut thread', witch: 'Fox', does: "The Fox's spells cost 2.5% less MP.", changes: all(FOXMP, 0.975) },
  { id: 'idle-needle', kind: 'fox5', ring: 2, how: OFF, isNew: true, name: 'The idle needle', witch: 'Fox', does: "The Fox's Stitch and Pins and Needles hit 2.5% harder.", changes: all(['f.stitch', 'f.needles'], 1.025),
    card: 'A long steel needle, stuck in the wood of a dead lamp post with nothing through its eye. The Fox says it is the one thing on this moor that is not being pulled anywhere.',
    picture: 'one long bright steel sewing needle lying at a slant, unthreaded, with a cold blue glint along its length and at its eye' },
  { id: 'brass-snuffer', kind: 'fate5', ring: 2, how: HID, isNew: true, name: 'The brass snuffer', witch: 'Jester', does: 'Every blow the Jester takes lays 2.5% more Fate on the foe.', changes: [{ path: 'fate.perBlow', mul: 1.025 }],
    card: 'A candle snuffer: a small brass cap on a long handle, made for one job. It gives a flame its ending, gently, and all at once. The Jester would not let anyone else carry it.',
    picture: 'one old brass candle snuffer, a small cone-shaped cap on a long thin twisted handle, lying at a slant, the brass worn bright at the rim, with a thin curl of pale smoke rising from under the cap' },
  // ring 3, party level 8 to 11
  { id: 'warm-stone', kind: 'hp5', ring: 3, how: EASY, code: 'W6-f', name: 'The warm stone', witch: 'Io', does: 'All four have 2.5% more HP.', changes: all(HP, 1.025) },
  { id: 'winter-blackthorn', kind: 'io5', ring: 3, how: OFF, isNew: true, name: 'The winter blackthorn', witch: 'Io', does: "Io's Thorn and her Deity hit 2.5% harder.", changes: all(['i.thorn', 'i.deity'], 1.025),
    card: 'A sprig of blackthorn in full white flower, long out of season. It grew where a wisp lay down and was warm for a while. Io keeps it in her hat band.',
    picture: 'one short dark sprig of blackthorn with long sharp thorns and a cluster of small white five-petalled flowers, faintly luminous' },
  { id: 'hollow-amulet', kind: 'heal5', ring: 3, how: HID, code: 'W7-b', name: 'The hollow amulet', witch: 'Io', does: 'All healing is 2.5% stronger.', changes: all(HEAL, 1.025) },
  // ring 4, party level 11 to 14
  { id: 'warm-oil-flask', kind: 'hp2', ring: 4, how: EASY, isNew: true, name: 'The warm oil flask', does: 'All four have 1% more HP.', changes: all(HP, 1.01),
    card: 'A tin flask of lamp oil, left at the foot of a post. Its lamp went east long ago. The oil stayed, and it has never gone cold.',
    picture: 'one small dented tin oil flask with a cork stopper and a wire handle, standing upright, a soft amber warmth showing through a worn seam and on the cloth beside it' },
  { id: 'fourth-seed', kind: 'bloom4', ring: 4, how: OFF, isNew: true, name: 'The fourth seed', witch: 'Io', does: "Io's Bloom opens 4 times, up from 3.", changes: [{ path: 'i.bloomTicks', add: 1 }],
    card: 'A twist of brown paper from a seed-seller at some other fair, in some other year. The writing says three. There are four.',
    picture: 'a small twist of brown paper lying open, with four round pale seeds spilled on it, one of them just splitting to show a thread of green' },
  { id: 'paired-amulet', kind: 'heal5', ring: 4, how: HID, isNew: true, name: 'The paired amulet', witch: 'Io', does: 'All healing is 2.5% stronger.', changes: all(HEAL, 1.025),
    card: 'The same grey-green stone as the hollow amulet, and the same spiral, cut the other way round. Laid side by side the two carvings run into each other like one line.',
    picture: 'a round pendant of pale grey-green stone carved with one spiral that turns the opposite way to its twin, rimmed in worn silver, on a looped leather cord, with a soft rose-gold sheen' },
  // ring 5, party level 14 to 17
  { id: 'spare-outline', kind: 'decoy3', ring: 5, how: EASY, isNew: true, name: 'The spare outline', witch: 'Fox', does: "The Fox's ghost eats 3 blows, up from 2.", changes: [{ path: 'f.decoy', add: 1 }],
    card: 'The shape of a person, cut out of an old fair handbill and pinned to a post. Nobody is printed on it. The Fox folded it very carefully and said it would do.',
    picture: 'a flat paper cut-out in the plain shape of a standing person, cut from a faded printed handbill, slightly curled at the edges, with one brass pin through the top' },
  { id: 'keepers-glove', kind: 'hp2', ring: 5, how: OFF, isNew: true, name: "The keeper's glove", does: 'All four have 1% more HP.', changes: all(HP, 1.01),
    card: 'One thick wool glove, scorched across the palm, the kind a lamp keeper wears to lift hot glass. There is only the one. It is a comfort to hold.',
    picture: 'one thick grey wool work glove lying palm up, the palm scorched brown and patched with leather' },
  { id: 'curtain-weight', kind: 'splash', ring: 5, how: HID, isNew: true, name: 'The curtain weight', witch: 'Jester', does: 'Sealed Fate takes 22.5% of their Life from the other foes, up from 20%.', changes: [{ path: 'fate.splash', add: 0.025 }],
    card: 'A lead weight from the hem of a stage curtain. It is what makes a curtain fall straight, and fall everywhere at once. The Jester laughed for a long time when she found it.',
    picture: 'one small heavy teardrop of dull grey lead, still stitched into a torn corner of deep midnight-blue velvet with a gold cord edge' },
  // ring 6, party level 17 to 20
  { id: 'lit-taper', kind: 'revive40', ring: 6, how: EASY, isNew: true, name: 'The lit taper', witch: 'Io', does: "Io's Revive brings a friend back at 35% HP, up from 30%.", changes: [{ path: 'i.revive', add: 0.05 }],
    card: 'A long wax taper, the kind used to carry a flame from one lamp to the next. It was left burning in a crack of the rock, out of the wind. One flame can always light another.',
    picture: 'one long thin cream wax taper lying at a slant, its tip burning with a small clear gold flame, a few drips of wax along its length' },
  { id: 'keepers-charm', kind: 'jhp5', ring: 6, how: OFF, code: 'W9-b', name: "The keeper's charm", witch: 'Jester', does: 'The Jester takes 2.5% less damage.', changes: [{ path: 'heroes.jester.hp', mul: 1 / 0.975 }], measuredAs: 'The Jester has 2.6% more HP, which is the same thing against blows and very slightly less with healing.' },
  { id: 'far-amulet', kind: 'heal5', ring: 6, how: HID, isNew: true, name: 'The far amulet', witch: 'Io', does: 'All healing is 2.5% stronger.', changes: all(HEAL, 1.025),
    card: 'The third spiral. Whoever carved the three left them a long walk apart, like markers on a road nobody remembers. This one was the furthest, and the hardest to reach.',
    picture: 'a round pendant of pale grey-green stone carved with three small spirals joined at the middle, rimmed in worn silver gone dark, on a looped leather cord, with a soft rose-gold sheen' },
];
