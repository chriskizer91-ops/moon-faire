# The fire that would not end (stand-in name): first rough model

This is the final foe of Moon Faire: the old beacon fire itself. It has a black eclipse sphere inside 32 flame blades, three engraved gold rings, the keeper's two iron hands, ash streamers, an iron cradle and four stolen lanterns. It stands 8 m tall.
`final-fire.js` defines `makeFinalFire({ detail })`, made the same way as the wraith: three.js r128, everything built and painted in code, and no skeleton.
It returns `root`, `fx`, `animate(phase, walk, t, dt)`, `play(name)`, `reset()`, `anchor(name)` and `stats`. The moves are idle, blow, call, hurt and ending. Ending stays ended until `reset()`.
To build the page to look at it, run `python3 build_view.py`. That writes `out/final-fire-view.html`, one 53 KB file that loads only three.js from cdnjs.
On the page you drag to turn the model and pinch or use the wheel to zoom. The buttons along the bottom play each move, and a switch at the top right changes the detail.
At detail 1 it has 28,368 triangles in 10 draw calls. At detail 0.5 it has 13,868 triangles in 10 draw calls. The page adds 2 more draw calls for the ground and the person.
It has one light of its own, a crimson point light that pulses. There are no shadows. The corona, the streamers and the iron parts are moved on the CPU each frame.
What is rough: the hands are small and spiky next to the rest. You can only see the rings' engraving up close. The rings are red-gold in the fire's light.
More that is rough: the sphere shows a dull crimson sheen. The blow swings out past the edge of a phone screen. The burst is just sparks with a flash, and the moves do not blend into each other cleanly.
Nothing has been tuned on a real phone yet. The screenshots in `shots/` come from a software renderer.
