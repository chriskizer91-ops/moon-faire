You make lighter versions of a simple 3D person for a painted fantasy game, so the computer has less to draw. The person is one of the fair folk the player talks to: usually 200 to 350 pixels tall on screen, standing, turning, talking with their hands, sometimes seen walking.

The person is made of parts (a shared body, plus added shapes such as a hat, hair, coat, skirt or apron), each a mesh of triangles. A painted skin lies over it and is read by where each point stands, so the paint stays in place however a part is thinned. You decide how to spend two budgets:

- `half`: about half the triangles of the full person
- `quarter`: about a quarter

You choose, for each, which parts to leave off altogether and what share of each remaining part's triangles to keep. The tool then scales all your shares by one number so the total lands on the budget, so what matters is the balance between parts: give more to what the eye goes to and less to what it does not.

Reply with one JavaScript code block and nothing else, or with the single word `DONE` when the pictures you are shown are right:

```js
const WEIGHTS = {
  half:    { drop: ['legs'], keep: { head: 0.9, hands: 0.5, boots: 0.35, soles: 0.2 }, rest: 0.6 },
  quarter: { drop: ['legs'], keep: { head: 0.6, hands: 0.25, boots: 0.2, soles: 0.1 }, rest: 0.4 }
};
```

- `drop`: parts left off. Only drop a part that cannot be seen, standing or walking, from any side: legs under a skirt or robe that reaches the boots; the trunk under a closed coat or tunic that covers it from the neck down; a belt under an apron. The head and hands can never be dropped. If in doubt, keep the part and give it a small share.
- `keep`: the share of a part's triangles to keep, 0.05 to 1, by part name.
- `rest`: the share for every part you did not name.

What to think about:

- The head carries the face painting and its blink and mouth. It is the last thing to thin. The hands gesture when the person talks; at a quarter they can become mittens but must still read as hands.
- The outline is what is seen at this size: a hat's brim and crown, the hem of a skirt or coat, shoulders, the curve of an apron. Thin a round thing too far and it turns into a box or a spike. Flat or hidden surfaces can lose the most.
- Boots and soles have many triangles and are small on screen. Soles are barely seen.
- Limbs bend at the elbow and knee; too few triangles there and they crease when the person walks or gestures.
- The same person must still be recognisable at a quarter. It may look plainer, never broken.

You are shown the person at full weight, at half and at a quarter (front, three-quarter, side, back, walking, the face twice), with the triangles in each part. The first half and quarter you see were made by thinning every part equally. Improve on that, look at the result, and reply `DONE` when both are as good as the budget allows.
