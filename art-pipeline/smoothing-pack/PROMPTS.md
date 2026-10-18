# Ranger, Herbal Witch and Fox: smoothing pack

This pack makes all nine of their moves smooth, at the speeds Chris picked. It works like the Jester's: the boxes labelled **key** are her real frames, and the generator fills only the empty numbered boxes. Most strips cover two gaps that share a middle key.

| Move | Now | After | Plays at | Strips |
|---|---|---|---|---|
| Fox: Blue Mischief | 8 @ 2 fps | 22 frames | 6 fps | 4 |
| Fox: Borrowed Face | 8 @ 2 fps | 22 frames | 6 fps | 4 |
| Fox: Hemline Fangs | 8 @ 4 fps | 12 frames | 6 fps | 2 |
| Witch: Silverleaf Salve | 8 @ 2 fps | 22 frames | 6 fps | 4 |
| Witch: Elderwood Guardian | 8 @ 2 fps | 22 frames | 6 fps | 4 |
| Witch: Harvest Crescent | 8 @ 4 fps | 12 frames | 6 fps | 2 |
| Ranger: Moonsteel Draw | 8 @ 6 fps | 10 frames | 6 fps | 1 |
| Ranger: Silver Arrow | 8 @ 6 fps | 10 frames | 6 fps | 1 |
| Ranger: Silverglass Ward | 8 @ 4 fps | 11 frames | 4 fps | 1 |

Total: 23 strips, 70 new poses.

How to use: attach one strip (plus that character's two `reference/*_ref.png` images if your generator takes more than one image). Paste her base block, then the motion line for that strip. Keep a result only if the key boxes come back unchanged. If a strip's figures come out very small, split it into two shorter strips at the middle key.

## Fox

Base block (paste first every time):
```
Fill in EVERY empty numbered box in the attached sprite strip with animation in-between frames. Boxes labelled 'key' are fixed keyframes: reproduce them exactly and do not change them. Each new frame sits evenly between the keys on either side of it, like traditional animation in-betweens: when two empty boxes sit between two keys, the first is one third of the way and the second two thirds of the way. Same character, pixel art style, scale, colours and lighting as the keys: adult woman with curly light-brown hair and two fox ears with dark tips, round glasses, big mischievous grin; pink choker with a small gold bell; emerald-green puffed sleeves; red floral corset; very wide patchwork pants gathered at the ankle; brown combat boots. EXACTLY two arms and two hands in every frame. Keep her boots on the same baseline and her body centred in its box, exactly like the keys. Keep her whole body AND every spell effect inside its own box; nothing may cross into the next box. Flat backdrop #383043, soft oval ground shadow, no new text, no borders, keep the number labels. Output the full strip at the same layout as the attached image.
```

### Blue Mischief (`fox_blue_mischief/`)

**strip_01_F08-to-F10.png** · 4 new
```
From standing ready to hooking a finger under her collar bell: her right hand rises to the bell, a tiny blue spark appears; then the spark skips onto her raised fingertip and grows into a small fox-shaped flame.
```

**strip_02_F10-to-F12.png** · 4 new
```
The small fox flame on her fingertip settles into her open palm and grows; then she winds up, turning her body and drawing her arm back with the flame crouched ready to leap.
```

**strip_03_F12-to-F14.png** · 4 new
```
She throws her arm forward; the blue fox spirit leaps off her hand and arcs up through the air above her, trailing blue wisps; then it bounds away to the right and thins into drifting sparks.
```

**strip_04_F14-to-F15.png** · 2 new
```
The last blue sparks fade beside her as she relaxes back into her standing ready pose.
```

### Borrowed Face (`fox_borrowed_face/`)

**strip_01_F16-to-F18.png** · 4 new
```
From standing ready, her hand rises and covers one eye with a sly wink; then a faint translucent blue copy of her begins to shimmer into view just behind her shoulder.
```

**strip_02_F18-to-F20.png** · 4 new
```
The blue ghost double steps out beside her (picture-right), growing more solid; then it strikes a dramatic pose, mirroring her grin.
```

**strip_03_F20-to-F22.png** · 4 new
```
The double leans back toward her and touches her shoulder; then it begins to unravel from the feet up into blue wisps that swirl toward her right hand.
```

**strip_04_F22-to-F23.png** · 2 new
```
The last wisps curl into her palm and fade as she returns to her standing ready pose.
```

### Hemline Fangs (`fox_hemline_fangs/`)

**strip_01_Q03-to-Q05.png** · 2 new
```
From standing with a dagger in each hand to a deep lunge to the right: she sinks into the lunge, drawing both daggers back (one in-between). Then from the lunge into the first slash: her right dagger sweeps forward and a blue arc starts to form (one in-between).
```

**strip_02_Q05-to-Q07.png** · 2 new
```
From the first slash into the second crossing slash: the blue arc finishes and her left dagger begins its counter-swing (one in-between). Then from the second slash she rises out of the lunge, bringing the daggers together toward each other (one in-between).
```

## Herbal Witch

Base block (paste first every time):
```
Fill in EVERY empty numbered box in the attached sprite strip with animation in-between frames. Boxes labelled 'key' are fixed keyframes: reproduce them exactly and do not change them. Each new frame sits evenly between the keys on either side of it, like traditional animation in-betweens: when two empty boxes sit between two keys, the first is one third of the way and the second two thirds of the way. Same character, pixel art style, scale, colours and lighting as the keys: adult woman with long, very wavy dark brown hair, round glasses; wine-red witch hat with a drooping point, two small cream horns and a gold band; wine-red velvet robe with huge ruffled gold-trimmed sleeves over a black corset dress; gold crescent pendant; long black tiered skirt with a slit; black lace-up boots. Her old brown leather spellbook stays in her LEFT hand in every frame. EXACTLY two arms and two hands in every frame. Keep her boots on the same baseline and her body centred in its box, exactly like the keys. Keep her whole body AND every spell effect inside its own box; nothing may cross into the next box. Flat backdrop #383043, soft oval ground shadow, no new text, no borders, keep the number labels. Output the full strip at the same layout as the attached image.
```

### Silverleaf Salve (`witch_silverleaf_salve/`)

**strip_01_N01-to-N03.png** · 4 new
```
From standing ready with the book to picking a dried leaf from between its pages with her right fingers; then she lifts the leaf as it starts to glow silver-green.
```

**strip_02_N03-to-N05.png** · 4 new
```
The glowing leaf floats up above her right palm; then she brings it down over the open book as the gold light gathers around it.
```

**strip_03_N05-to-N07.png** · 4 new
```
The leaf dissolves into a swirl of gold motes and small leaves; then she sweeps her right arm outward to the right, sending the swirl away. The swirl stays inside its box.
```

**strip_04_N07-to-N08.png** · 2 new
```
The last motes drift and fade as her right hand comes back to the book and she returns to her ready pose.
```

### Elderwood Guardian (`witch_elderwood_guardian/`)

**strip_01_P01-to-P03.png** · 4 new
```
From standing ready, her right hand lifts and a seed of golden light forms above her palm; then she lowers the seed toward the ground on her right side (picture-left), where a green shoot begins.
```

**strip_02_P03-to-P05.png** · 4 new
```
The shoot grows into a twisting sapling, then into a small wooden fawn with leafy antlers curled on the ground; then the fawn rises and grows taller, legs unfolding, as she reaches toward it.
```

**strip_03_P05-to-P07.png** · 4 new
```
The grown wooden deer stands beside her with her hand on its head; then it begins to unravel into a spiral of vines and leaves that whirls upward.
```

**strip_04_P07-to-P08.png** · 2 new
```
The last leaves settle to the ground and fade as she returns to her standing ready pose.
```

### Harvest Crescent (`witch_harvest_crescent/`)

**strip_01_M02-to-M04.png** · 2 new
```
From holding the small glowing sickle at her shoulder to raising it high overhead as a large golden crescent arc trails behind it (one in-between). Then from overhead she starts the downward sweep, her robe and hair swinging (one in-between).
```

**strip_02_M04-to-M06.png** · 2 new
```
From the low sweeping slash (a golden arc curving across in front of her) into the follow-through (one in-between). Then from the follow-through, with the small sickle low at her side, she starts to fold it back into the pendant (one in-between).
```

## Ranger

Base block (paste first every time):
```
Fill in EVERY empty numbered box in the attached sprite strip with animation in-between frames. Boxes labelled 'key' are fixed keyframes: reproduce them exactly and do not change them. Each new frame sits evenly between the keys on either side of it, like traditional animation in-betweens: when two empty boxes sit between two keys, the first is one third of the way and the second two thirds of the way. Same character, pixel art style, scale, colours and lighting as the keys: adult woman with silver-grey hair in a high bun, round glasses, royal-blue headband with a blue gem; royal-blue brocade corset, black lace sleeves; beaded necklaces; right-hip satchel; black trousers with lace leggings; grey-black lace-up combat boots, both identical. EXACTLY two arms and two hands in every frame. Keep her boots on the same baseline and her body centred in its box, exactly like the keys. Keep her whole body AND every spell effect inside its own box; nothing may cross into the next box. Flat backdrop #383043, soft oval ground shadow, no new text, no borders, keep the number labels. Output the full strip at the same layout as the attached image.
```

### Moonsteel Draw (`ranger_moonsteel_draw/`)

**strip_01_R05-to-R07.png** · 2 new
```
Finishing the move. From the release (arm extended, bow upright) the bow begins to fold and lower toward her hip, sparkles trailing (one in-between). Then from the folded bow at her hip she relaxes back toward her standing ready pose (one in-between).
```

### Silver Arrow (`ranger_silver_arrow/`)

**strip_01_R12-to-R14.png** · 2 new
```
Finishing the move. From the arrow release (arrow flying off to the right) into the follow-through, drawing hand near her face (one in-between). Then from the follow-through the bow lowers and folds toward her right side (one in-between).
```

### Silverglass Ward (`ranger_silverglass_ward/`)

**strip_01_R19-to-R22.png** · 2 new
```
Box 05: the shield of light is building: halfway between the half-formed crescent shield and the full round shield, more crystal facets lighting up. Box 08: the shield is dispersing: halfway between the shattering shield and the drifting crystal shards, shards spreading outward and fading. The two keys in the middle (06 and 07) stay as they are.
```

## Coming back

Send the finished strips (any order, filenames kept). Claude cuts them, scales each new pose to the keys, lines them up, and puts all nine smoothed moves in the flipbook at these speeds. After that, the whole cast gets a game-ready export for the game build.