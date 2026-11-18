# The light models (about 50,000 triangles per outfit)

Each outfit gets a second, light version of her: her body, the outfit and her bun thinned to one mesh with the full model's look
baked into four pictures (colour, glow, roughness/metal, rim), and her face as its own small mesh that keeps her live face (blinks,
talk, feelings). Both hang on her own skeleton, so every move, the skirt's swing and the outfit's own hooks work as on the full model.
See-through pieces (C3's wings) are not baked: the light model shows the outfit's own.

Run from a working folder holding these scripts (node_modules: `npm install meshoptimizer`; python: `pip install xatlas`):

    ./run_one.sh CODE        # export.py (the full model's visible meshes at rest) -> npz2raw.py -> simplify.mjs (one geometric error
                             # over every part, her face fixed at 6,000) -> unwrap.py (xatlas, one 2048 picture) -> bake.py (bake_page.js
                             # in test_doll.html: every full mesh drawn flat into the light model's picture) -> compare.py (full | light)
    ./rebake.sh CODE ...     # bake and compare again only (after a change to bake_page.js or to the outfit's paintings)

Writes /home/claude/io/wardrobe_light/CODE_light.js. The page loads it with wardrobe_light/light_loader.js (DOLLLIGHT_USE).
Notes: the bake sees every surface head-on (view-dependent shading is taken as seen straight on); her nails and the bun's fine edge
are not kept as shapes (their look is laid onto what is under them).
