# Flow Blender artwork

The abstract orbital sculpture in the explorer hero was created for Flow in cloud Blender 4.3.2 using `scripts/art/render_flow_orbits.py`. The editable scene is `scripts/art/flow-orbits.blend`; the transparent static render is `public/art/flow-orbits.png`. From the repository root, regenerate it with `blender -b --threads 4 --python scripts/art/render_flow_orbits.py`.

It is decoration, not an observation, location marker, score or ranking. The geographic overlay and its existing source limitations remain separate. A static image keeps the experience usable without WebGL, animation or a 3D runtime.

The Dubai market and city cards use an original skyline illustration rendered in cloud Blender 4.3.2. The static 960 × 320 WebP depicts a stylized arrangement of towers along the waterfront. The generator models the scene from primitives and fixes the random seed for decorative buildings. From the repository root, regenerate the image with `blender --background --factory-startup -t 4 --python scripts/art/render_dubai.py`.
