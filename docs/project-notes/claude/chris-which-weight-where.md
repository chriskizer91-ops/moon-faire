# Which weight of a witch is used where (Chris, November 14)

November 14, 2026, 7:36 am. This is Chris's current rule for the four weights of each witch (Full, Trim, Light, Lightest). It replaces his plan of November 13 in `claude/HOW-TO-3d-light-levels.md` (Trim for walking, Light for fights) and his leaning later that day in `claude/chris-on-flipbook-settings-light-weight-and-fight-camera.md` (Light for almost everything).

## His words

With a screenshot of the pilot on his phone, walking the fair square:

"At the level of zoom that this is depicting in the town Moon Faire centre, the lightest model selection works just fine. And my assumption would be that at the full fight distance is the same situation. The lightest is plenty sufficient. Then we only use the higher detail model for close-ups. I think even just the light model for most conversations and interactions that are closer, and then only using the full model in a view-my-character mode in the menu."

## The rule

| Where | Weight | How sure |
|---|---|---|
| Walking a place, at the pilot's walking distance | **Lightest** | He looked at it on his phone and it "works just fine" |
| A fight seen from the full fight distance | **Lightest** | His assumption. He has not said he looked at it |
| Close-ups, conversations, closer interactions | **Light** | His choice |
| The view-my-character mode in the menu | **Full** | His choice. The only place Full is used |
| Trim | no use named | |

## What his screenshot showed

The pilot copy with the cameras and the Flipbook look (https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg), on his phone:

- Walking the fair square, her detail set to Lightest, her size "50% larger".
- The Flipbook look on, pixel size at the fine end (1,440 rows), colours at 100%.
- The page's own count: 60 pictures a second, 20 thousand triangles, 58 draws, 2.7 ms to move her and 3.7 ms to draw.

This is the first speed reading of the pilot on a real device. Sixty is likely the most his phone's screen shows, so there may be room to spare. It is one witch with no foes and no fair folk.

## What follows for the builders

- **Lightest is now the weight seen most.** It was built as the floor, the one to fall back on. It should be checked as carefully as Light was, on every witch: walking, running, and at fight distance.
- **A fight needs two weights of each witch if the camera comes close.** The pilot's "Over the shoulder" and "Low and close" cameras (`claude/pilot-fight-cameras.md`) put the camera within a few meters of her. By this rule those shots are close-ups, so Light. That means both Lightest and Light of each witch are built for a fight, and the game swaps between them on the cut. The pilot already builds a weight the first time it is asked for and shows one at a time, so the swap exists. What it costs in memory with four witches has not been measured.
- **The pilot's "As planned" setting still follows the old plan** (Trim walking, Light fighting). It has not been changed to this rule.
- **The fight tests have numbers for Lightest**, four of a witch and 12 stand-in foes in the night square: the Jester 156 thousand triangles, the Fox 268 thousand, the Ranger 332 thousand (260 draws). Those are from the test browser's count, not a speed.

## Not yet known

- Whether Lightest holds at fight distance to his eye. He assumes so.
- Real speed with four witches, foes and fair folk on screen together, on his phone and his laptop.
- Whether Trim is wanted for anything. If not, it need not be built for Io or the Grey Hat.
