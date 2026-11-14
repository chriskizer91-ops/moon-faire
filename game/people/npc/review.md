# Look 1

## Review

**old-lamp-seller**: Good face and a well-worn apron. She is the same height and build as the other two women, so I am making her the shortest of the fair at 1.50 m. Her grey hair shows as pale bluish plates beside the face, like a helmet, so I am warming it and making it matt. The orange spotted kerchief looks like a bread bun, which needs a repaint.

**pie-seller**: The check blouse and floury handprint are lovely. "Sturdy" does not show, because she is the same size as the old woman and the girl, so I am making her broader and slightly taller. Her hair shines like black plastic, so I am making it matt.

**ballad-singer**: Pretty face and kerchief, and the skin matches. She is a young woman on a short, stout body, so I am making her 1.62 m and slimmer, with the head corrected so it does not shrink with the body.

**fortune-teller** (Fable): The best head of the two versions, with a clean black fall of hair and the gold band reading well. At 1.81 m plus headscarf she towers over the hero. I am bringing her to 1.73 m, still the tallest woman, and easing the stretched head.

**old-lamplighter** (Fable): The robe, patch and soot are good. An elderly man should not be the tallest person at the fair, so I am bringing him to 1.68 m. His hair is a pale flat sheet either side of the face and reads as a veil; I am making it darker, warmer and matt. In a robe, sash and headscarf he still reads as an old woman from a distance, which only a repaint or rebuild can cure.

**old-night-watchman** (Fable): Solid, with good coat, scarf and beard. He is a touch tall for an old man once the hat is added, so I am taking him to 1.67 m and making the hair matt.

**chestnut-roaster** (Fable): Cheerful face, and the beard sits well. From behind, the head under the hat is nearly skin colour and he looks bald, so I am giving him flat auburn hair as the other version has. He becomes 1.72 m so he and the watchman are not twins. The pink-tan hat looks like a flowerpot, which is a repaint.

**fair-baker** (Fable): Good apron and cap, and properly stout. The beard is a thick ring standing out from the chin like a horse collar. I am flattening it and pulling it back, but it is the wrong shape.

**ribbon-dyer** (Fable): The dye-stained apron is the best cloth in the set. He is as huge as the baker, which is wrong for an old, quiet man, so I am making him smaller and much less broad. The ring beard is showing neck colour, so I am painting it flat grey and flattening it. The hair plates get darker and matt, and the neck and hands are greyed to match his pale face.

**farm-lad** (Fable): Reads at once, and the hat is a sensible size. The hat sits on his eyebrows, so I am lifting it a little. I am also making him slightly taller and lankier so he is not the gate-keeper's twin.

**gate-keeper** (Fable): Stern, tidy, and the skin matches. Her hair shows as pale steel plates beside a dark face, so I am darkening it and making it matt.

**fortune-teller-opus**: The flared sleeves are nicer than the other version's. The side of the hair picks up the maroon scarf and a strip of skin colour, so I am painting it flat black. The scarf sits too low on the brow, so I am lifting it. Same height change as the other.

**old-lamplighter-opus**: Same faults as the Fable version (too tall, veil-like hair) and the same fixes. The sooty flared cuffs are good.

**old-night-watchman-opus**: The flared coat gives the best outline of the coat pair, and the painted hair and beard are better than flat ones. He is a little short at 1.62 m, so I am bringing him to 1.67 m.

**chestnut-roaster-opus**: Good coat. The flat orange beard is a block stuck on the chin. I am putting it back to the painted sheet, as on the watchman where that works, and will check it on the next look. Height to 1.72 m.

**fair-baker-opus**: The better baker, with a beard that looks like a beard. The apron hem has an odd notch in the middle, which is a shape matter. No changes.

**ribbon-dyer-opus**: The pale flat beard looks like a chin bandage and the hair like a helmet. I am darkening both, making them matt and trimming the beard block. Same size and skin changes as the other dyer.

**farm-lad-opus**: The hat is a cartwheel, three heads wide. I am narrowing the hat and band together, and making him a little taller and less broad.

**gate-keeper-opus**: Same oversized hat, and the brim cuts across her brow and hides the face. I am narrowing it, lifting it slightly, and darkening and matting the hair.

## Fixes

```js
const FIXES = {
  'old-lamp-seller': {
    person: { height: 0.91, build: [1.08, 1.06], head: [1.04, 0.99, 1.0] },
    SKIN: {
      flat: { hair: '#6f6a64', sleeve: '#465034', soles: '#2a1d16' },
      rough: { belt: 0.45, boots: 0.55, hair: 0.95 }
    }
  },
  'pie-seller': {
    person: { height: 0.95, build: [1.15, 1.12], head: [0.98, 0.99, 0.96] },
    SKIN: { rough: { hair: 0.9 } }
  },
  'ballad-singer': {
    person: { height: 0.98, build: [0.98, 0.97], head: [1.04, 1.0, 1.03] }
  },
  'fortune-teller': {
    person: { height: 1.05, build: [0.93, 0.94], head: [1.0, 1.0, 1.0] },
    SKIN: { rough: { gold: 0.35, boots: 0.5, hair: 0.85 } }
  },
  'old-lamplighter': {
    person: { height: 1.02, build: [0.96, 0.96], head: [1.0, 1.0, 1.0] },
    SKIN: { flat: { hair: '#7a736a' }, rough: { hair: 0.95 } }
  },
  'old-night-watchman': {
    person: { height: 1.01, build: [1.1, 1.08], head: [1.0, 1.0, 1.0] },
    SKIN: { rough: { boots: 0.5, belt: 0.45, brass: 0.35, hair: 0.95 } }
  },
  'chestnut-roaster': {
    person: { height: 1.04, build: [1.1, 1.08], head: [1.0, 1.0, 1.0] },
    SKIN: {
      flat: { hair: '#7c4528', soles: '#2a1d16' },
      rough: { boots: 0.5, belt: 0.5, brass: 0.35, boot: 0.5, hair: 0.9 }
    }
  },
  'fair-baker': {
    SKIN: {
      size: { beard: [0.9, 0.88, 0.72] },
      move: { cap: [0, -0.045, 0], capband: [0, -0.045, 0], beard: [0, 0.005, -0.012] }
    }
  },
  'ribbon-dyer': {
    person: { height: 0.97, build: [1.12, 1.12], head: [1.06, 1.0, 1.04] },
    SKIN: {
      skin: '#a8917f',
      flat: { hair: '#4e4a47', beard: '#857f78', soles: '#2a2522' },
      rough: { boots: 0.5, hair: 0.95, beard: 0.95 },
      size: { beard: [0.9, 0.88, 0.72] },
      move: { cap: [0, -0.035, 0], capband: [0, -0.035, 0], beard: [0, 0.005, -0.012] }
    }
  },
  'farm-lad': {
    person: { height: 1.01, build: [1.0, 0.98], head: [1.02, 1.0, 1.0] },
    SKIN: {
      rough: { boots: 0.6, straw: 0.9 },
      move: { straw: [0, -0.035, 0], band: [0, -0.035, 0] }
    }
  },
  'gate-keeper': {
    SKIN: {
      flat: { hair: '#2f2b29', button: '#8c6b3c', patch: '#4d5238', soles: '#2a2523' },
      rough: { boots: 0.5, hair: 0.95 }
    }
  },
  'fortune-teller-opus': {
    person: { height: 1.05, build: [0.92, 0.95], head: [1.0, 1.0, 1.0] },
    SKIN: {
      flat: { hair: '#17131a', soles: '#1c1618' },
      rough: { boots: 0.5, gold: 0.35, sash: 0.8, hair: 0.85 },
      move: { scarf: [0, -0.018, 0], gold: [0, -0.018, 0] }
    }
  },
  'old-lamplighter-opus': {
    person: { height: 1.02, build: [0.96, 0.96], head: [1.0, 1.0, 1.0] },
    SKIN: { flat: { hair: '#7a736a' }, rough: { hair: 0.95 } }
  },
  'old-night-watchman-opus': {
    person: { height: 1.01, build: [1.1, 1.08], head: [1.0, 1.0, 1.0] }
  },
  'chestnut-roaster-opus': {
    person: { height: 1.04, build: [1.1, 1.08], head: [1.0, 1.0, 1.0] },
    SKIN: {
      flat: { hair: '#7c4528', beard: null, soles: '#2a1d16' },
      rough: { boots: 0.5, belt: 0.5, brass: 0.3, hair: 0.9 }
    }
  },
  'ribbon-dyer-opus': {
    person: { height: 0.97, build: [1.12, 1.1], head: [1.06, 1.0, 1.04] },
    SKIN: {
      skin: '#a8917f',
      flat: { hair: '#4e4a47', beard: '#857f78', soles: '#231c18' },
      rough: { boots: 0.5, apron: 0.8, hair: 0.95, beard: 0.95 },
      size: { beard: [0.94, 0.85, 0.9] }
    }
  },
  'farm-lad-opus': {
    person: { height: 1.01, build: [1.03, 1.0], head: [1.04, 1.0, 1.0] },
    SKIN: {
      size: { straw: [0.8, 1, 0.8], band: [0.8, 1, 0.8] }
    }
  },
  'gate-keeper-opus': {
    SKIN: {
      flat: { hair: '#2f2b29', soles: '#2a2522' },
      rough: { boots: 0.5, brass: 0.35, hair: 0.95 },
      size: { straw: [0.8, 1, 0.8], band: [0.8, 1, 0.8] },
      move: { straw: [0, -0.025, 0], band: [0, -0.025, 0] }
    }
  }
};
```

## For the maker

1. **The old lamplighter reads as an old woman.** He is on the fortune-teller's shapes: long robe, sash, headscarf and straight hair to the shoulders. He needs his own shapes (short coat or smock, cap, short hair or a bald crown) or at least a repaint with a beard and a man's cap.
2. **Hair shapes are flat plates beside the face.** On every grey-haired person they read as a helmet or veil. They need rounder shapes that hug the skull, with painted strands rather than flat colour. I have only darkened and matted them.
3. **The Fable baker and dyer beard is a ring that stands off the chin.** Rebuild it as a beard that follows the jaw, or drop that version. The Opus dyer's beard is a plain box and needs painting.
4. **The three hand-made women share one silhouette.** I have varied height and width, but the old lamp-seller wants a stoop and a shawl, and the singer a slimmer skirt and no work apron.
5. **Repaints.**
   - The chestnut-roaster's pink-tan hat looks like a flowerpot; make it brown or green felt.
   - The lamp-seller's orange spotted kerchief looks like a bun.
   - Both straw hats are flat yellow and need a painted weave.
   - The dyer's face is much greyer than his painted forearms and neck.
6. **Opus shapes.** The straw hat is built far too wide (I have narrowed it, but the brim should be rebuilt and made solid, as the gate-keeper's looks see-through). The baker's apron hem has a notch in the middle.
7. **The gate-keeper shares the farm lad's body.** She would be better with her own outline, such as a long coat or skirt.

**Which version to keep:**

| Person | Keep | Why |
|---|---|---|
| Fortune-teller | Fable | Cleaner headscarf and gold band, separate hem. The Opus flared sleeves are worth borrowing. |
| Old lamplighter | Fable | To match the fortune-teller, until he is rebuilt. |
| Night-watchman | Opus | Flared coat, trim, better hat band. |
| Chestnut-roaster | Opus | Same coat; this depends on the beard holding up on the next look. |
| Fair baker | Opus | Real beard. |
| Ribbon dyer | Opus | Same shapes as the better baker. |
| Farm lad | Fable | Hat is the right size, neater waistcoat. |
| Gate-keeper | Fable | Same reasons. |

# Look 2

## Review

The heights now read properly: the old lamp-seller is the smallest, the fortune-teller is tall without dwarfing the Jester, and no two neighbours are twins. Two things are worth one more pass; everything not listed stays as it is.

**ribbon-dyer** (Fable): Size, hair and skin are now right. Painted grey, the ring beard is worse: it shows as a hoop with two balls at the mouth corners, like a headset. The face painting already has his moustache and beard, so I am shrinking the ring to nothing and tucking it inside the jaw.

**gate-keeper-opus**: The hat is a sensible width now, but the brim still cuts across her brow because her head is built slightly taller than the lad's. I am lifting it a little more.

**Worked as hoped:**
- **chestnut-roaster-opus**: the painted beard is back and looks natural, so the chin block is gone.
- **farm-lad-opus**: the hat is a hat again.
- **pie-seller**: she now looks sturdy.
- **ballad-singer**: she now looks young.
- **fair-baker** (Fable): the beard reads as a chin fringe; passable, though still a ring.

**Did not work:**
- **old-lamp-seller**, **old-lamplighter**, **old-lamplighter-opus**: the grey hair still shows as pale lilac plates whatever colour or roughness I give it. I am leaving this for the maker.
- **ribbon-dyer-opus**: the beard is still a pale box. It matches the painted moustache in colour, so the fault is the shape.

## Fixes

```js
const FIXES = {
  'ribbon-dyer': {
    SKIN: {
      size: { beard: [0.05, 0.05, 0.05] },
      move: { cap: [0, -0.035, 0], capband: [0, -0.035, 0], beard: [0, 0.04, -0.06] }
    }
  },
  'gate-keeper-opus': {
    SKIN: {
      move: { straw: [0, -0.012, 0], band: [0, -0.012, 0] }
    }
  }
};
```

## For the maker

Additions to the earlier list, most valuable first:

1. **Grey hair plates render pale lilac under the scene light whatever flat colour they are given.** This affects the lamp-seller and both lamplighters most. Darker hair (dyer, gate-keeper) did respond. The hair needs painted strands and rounder shapes, or the hair material itself needs looking at.
2. **The ring beard on the Fable baker and dyer shapes should be removed or rebuilt.** I have hidden it on the dyer and thinned it on the baker. The Opus dyer's box beard needs to be a shaped, painted beard.
3. **The Opus gate-keeper's head is built taller than the farm lad's while the hat is shared.** The hat should be fitted per person.

Which version to keep is unchanged:

| Person | Keep |
|---|---|
| Fortune-teller | Fable |
| Old lamplighter | Fable, until he gets his own shapes |
| Night-watchman | Opus |
| Chestnut-roaster | Opus |
| Fair baker | Opus |
| Ribbon dyer | Opus |
| Farm lad | Fable |
| Gate-keeper | Fable |

# Look 3

DONE

Last notes:

- **ribbon-dyer** (Fable): with the ring hidden, the painted moustache and beard on the face carry him, and he no longer looks broken. His chin and neck below the face are now bare skin colour, so a properly shaped beard would still improve him.
- **gate-keeper-opus**: the brim now sits on the forehead and the eyes are clear. The brim still looks thin and slightly see-through at the edge, which is a shape and material matter for the maker.
- **Heights**: the fair folk now run from 1.50 m (old lamp-seller) to 1.73 m (fortune-teller), with the men's hats topping out near 1.8 m. The Jester at 1.65 m sits in the middle and is not dwarfed.
- **Still for the maker, in order:**
  1. Give the old lamplighter his own shapes; he still reads as an old woman.
  2. Rebuild the hair plates, and look at why grey hair renders pale lilac.
  3. Rebuild the ring beard and the box beard.
  4. Give the three women different outlines.
  5. Repaint the roaster's flowerpot hat, the lamp-seller's bun kerchief and the flat straw hats.
- **Versions to keep**: Fable for the fortune-teller, lamplighter, farm lad and gate-keeper; Opus for the night-watchman, chestnut-roaster, fair baker and ribbon dyer.
