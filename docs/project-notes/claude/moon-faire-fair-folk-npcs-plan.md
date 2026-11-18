# Fair folk and other people who are not the party: how to make them (proposal)

November 13, 2026, from the starter-world session. **Nothing here is decided. Chris asked the question; this is Claude's
answer and a test to settle it.**

## What Chris asked

After walking the Jester round the painted fair square: if the village and town need believable people quickly, should they be

1. real flipbook characters (a couple of images each), "as long as that's not too big of a file";
2. simple animated 3D people; or
3. copies of the witches' 3D models at the lightest weight, changed "just a little bit" to "make them different people"?

He can generate images from prompts for any of these.

## The short answer

**Paint them.** For people who stand in one place, a painted figure is the right tool in this game, and it is nearly free.
Keep lightest-weight witch copies for the rare person who has to walk or turn, and use them sparingly.

## Why painting works here in particular

Two rules the starter world already follows make a still person cheap:

- **The camera never moves in a walking scene.** A person who stands still is only ever seen from one angle.
- **Every scene is lit by the same house light.** So a figure painted in that light matches every scene it stands in.

So a fair-folk figure is one painting, made from the scene's camera angle, cut out and stood in the scene as a flat card.
Because the card sits in the 3D scene, a witch can walk in front of it and behind it, as she does with the well.

## The three ways, compared

| | Painted figure (flipbook) | Lightest witch copy, changed a little | New simple 3D person |
|---|---|---|---|
| What Chris makes | 1 to 3 paintings and a portrait card | Nothing for a recolour; a face set for a new face | A whole reference set |
| What Claude makes | A cut-out and a place in the scene | New colours quickly; a new face is a bake; a new costume is most of a witch's work | A model: many sessions |
| Cost while playing | One draw and one small picture each | About 19k triangles, 33 draws, 1,076 points of cloth and 21 MB of pictures each (the Jester's Lightest) | Depends |
| File size | Tens of KB a frame at walking size (estimate, until one is made) | None beyond the witch already loaded, if her pictures are shared | Its own |
| Can it walk and turn? | No. A small idle only: 2 or 3 frames | Yes, with every body move the witch has | Yes |
| Looks like | Whoever is painted: any age, build, dress or culture | The witch it came from | Whoever is built |

- **The catch with witch copies is the one Chris found on the Fox:** "it's still the Jester." A recolour with another hat
  reads as that witch at walking size, because her outline and costume are what you see. The fair is meant to be the most
  mixed crowd in the world, and copies of four women built from one person will not look like that.
- **Speed is not the problem.** On Chris's laptop the pilot ran at 144 pictures a second, with 2.3 ms spent moving a Trim
  witch and 1.3 ms a Light one. A few Lightest copies would fit. Memory and sameness are the costs, not speed.
- **Talking already needs a picture.** Chris wants a picture card beside the text box, as in Envoi. One ChatGPT chat per
  person can make both: the standing figure for the scene and the portrait for the card.

## How a painted person would be made

1. **An angle guide from the game.** Claude renders the finished Jester through the scene's walking camera, large, on flat
   plum. It shows the exact angle, the light and how tall a person is.
2. **One prompt per person.** "Paint a different person from this same camera, in this same light, at this same size":
   whole figure, feet showing, on flat plum (`#3B2F43`, as the witches' reference paintings are), no ground shadow, no
   lettering. Then one or two more of the same person for a small idle (weight on the other foot, head turned), and a
   portrait for the talk card.
3. **Cut out and place.** The plum is keyed out; the figure stands on a card tilted to face the camera, feet on the ground,
   with a soft patch under it. Its place and its words go in the scene's data.
4. **Stallkeepers** can be painted from the waist up and stood behind the painted counters.

## What witch copies are good for

- Someone who must walk a path, turn round or perform: a troupe on the floor cloth, a child running between tents.
- People far off, where only movement shows.
- A quick change is colours and a hat. A new face is a face painting set and a bake (`claude/HOW-TO-3d-witch-faces.md`).
  A new costume is most of the work of a witch.
- The weights are in `claude/HOW-TO-3d-light-levels.md`. Only the Jester is finished, so only she can be copied today.
- If copies are used, freeze the cloth of one who is standing still, and share one set of pictures between copies.

## The test that settles it

Two painted fair folk in the pilot's fair square, beside the Jester: a stallkeeper behind a counter, and one person
standing in the open. Claude writes the two prompts with the angle guide; Chris runs them; they go into the pilot page; he
judges by eye whether a painted person and a 3D witch can stand in one picture. If they can, the rest of the fair's people
are a prompt each.

## Not known yet

- Whether a painted person sits well beside a 3D witch. That is what the test is for.
- Real file sizes, until one is cut out.
- How many fair folk the starter world wants. The plan so far had only voices from the stalls.
