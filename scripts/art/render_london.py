"""Render Flow's original Tower Bridge panorama with Blender 4.3+.

blender -b --factory-startup -t 4 --python-exit-code 1 --python scripts/art/render_london.py
"""
from math import cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
rng = Random(73)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 14
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 2560, 320
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'


def rgb(code):
    channels = [int(code[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((c + .055) / 1.055) ** 2.4 if c > .04045 else c / 12.92 for c in channels) + (1,)


def paint(name, code):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = rgb(code)
    return mat


def mesh(name, points, faces, mat):
    shape = bpy.data.meshes.new(name)
    shape.from_pydata(points, [], faces)
    shape.materials.append(mat)
    obj = bpy.data.objects.new(name, shape)
    scene.collection.objects.link(obj)
    return obj


facets = [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7), (3, 2, 1, 0)]


def block(name, x, y, z, width, depth, height, mat, taper=1):
    # z is the bottom elevation. taper shrinks just the upper level for spires.
    points = [(x + dx * width * scale / 2, y + dy * depth * scale / 2, elevation)
              for elevation, scale in ((z, 1), (z + height, taper))
              for dx, dy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    return mesh(name, points, facets, mat)


def beam(name, path, radius, mat):
    shape = bpy.data.curves.new(name, 'CURVE')
    shape.dimensions = '3D'
    shape.resolution_u = 1
    shape.bevel_depth, shape.bevel_resolution = radius, 1
    line = shape.splines.new('POLY')
    line.points.add(len(path) - 1)
    for point, xyz in zip(line.points, path):
        point.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, shape)
    shape.materials.append(mat)
    scene.collection.objects.link(obj)


stone = paint('Portland stone', 'ccb99c')
trim = paint('Limestone cornices', 'f3dcb5')
dark_stone = paint('Grey granite', '6d7481')
glass = paint('Deep window recesses', '3a5362')
steel = paint('Blue suspension chains', '439abd')
crown = paint('Slate tower roof', '485869')
bus = paint('London bus red', 'e05345')
river = paint('Thames', '477780')
glints = paint('Water highlights', '93aa9f')

block('River surface', 0, -2, -.4, 78, 35, .4, river)
for x in (-2.25, 2.25):
    block('Cutwater plinth', x, 0, -.05, 1.70, 2.26, .44, dark_stone, taper=.90)
    block('Masonry pier', x, 0, .37, 1.38, 1.84, .78, stone)
    block('Road cornice', x, 0, 1.09, 1.51, 1.94, .13, trim)
    block('Tower', x, 0, 1.22, 1.26, 1.48, 2.76, stone)
    for dx in (-.53, .53):
        for dy in (-.64, .64):
            block('Corner turret', x + dx, dy, 1.28, .31, .31, 2.95, trim)
            block('Pinnacle', x + dx, dy, 4.21, .41, .41, .56, crown, taper=.03)
    block('High cornice', x, 0, 3.89, 1.42, 1.65, .15, trim)
    block('Pyramidal roof', x, 0, 4.03, 1.30, 1.55, .92, crown, taper=.16)
    block('Crown finial', x, 0, 4.94, .13, .13, .22, trim, taper=.10)
    for dx in (-.26, 0, .26):
        for z in (1.45, 2.14, 3.15):
            block('Tall mullioned opening', x + dx, -.746, z, .13, .024, .43, glass)
            block('Pointed arch', x + dx, -.746, z + .43, .13, .024, .11, glass, taper=.05)
    for z in (2.0, 2.9):
        block('String course', x, 0, z, 1.33, 1.55, .08, trim)

# An open truss at road level and two high walkways link the two stone towers.
block('Bridge deck', 0, 0, 1.05, 19, 1.08, .16, steel)
for y in (-.46, .46):
    block('High walkway', 0, y, 3.22, 4.48, .31, .20, steel)
    block('Walkway glazing', 0, y, 3.42, 4.48, .22, .24, glass)
    block('Walkway trim', 0, y, 3.66, 4.48, .30, .05, trim)
    for i in range(-6, 7):
        block('Walkway mullion', i * .29, y - .12, 3.42, .04, .04, .24, trim)
    for direction in (-1, 1):
        def suspension(t):
            return (direction * (2.8 + 5.3 * t), y, 1.36 + 2.04 * (1 - t) ** 1.8)
        beam('Curved suspension chain', [suspension(i / 20) for i in range(21)], .065, steel)
        for i in range(1, 9):
            x, _, top = suspension(i / 10)
            beam('Suspender', [(x, y, 1.21), (x, y, top)], .023, trim)
    for i in range(-38, 38):
        x = i * .24
        beam('Parapet lattice', [(x,y,1.21), (x+.12,y,1.34), (x+.24,y,1.21)], .011, trim)
    beam('Top rail', [(-9.5,y,1.35), (9.5,y,1.35)], .017, steel)
for x in (-8.35, 8.35):
    block('Anchor pier', x, 0, -.02, .68, 1.25, 1.22, dark_stone)
block('Double-decker bus', -.36, -.17, 1.23, .88, .29, .44, bus)
for z in (1.31, 1.52):
    for i in range(4):
        block('Bus window', -.63+i*.18, -.319, z, .14, .014, .083, glass)

# Stone approaches continue the deck into both quays. Steps and mooring rings
# on the near edge keep the river legible in the very wide research banner.
for direction in (-1, 1):
    block('Stone approach', direction * 23.5, 1.1, -.02, 30, 4.4, 1.09, dark_stone)
    block('Quay coping', direction * 23.5, 1.1, 1.03, 30, 4.5, .09, stone)
    block('Road surface', direction * 23.5, 0, 1.12, 30, 1.15, .07, crown)
    for i in range(3):
        x = direction * (8.7 + .22 * i)
        block('Cut stone step', x, -1.18, .01, .24, .9 - .19 * i, .22 + .18 * i, dark_stone)
    for i in range(15):
        x = direction * (9.95 + i * 1.55)
        block('Quay bollard', x, -.87, 1.11, .11, .11, .18, crown)
        if i % 2 == 0:
            beam('Lamp standard', [(x,.80,1.12),(x,.80,1.98)], .022, crown)
            block('Lamplight', x,.80,1.93,.14,.14,.18,trim)
            block('Lamp cap',x,.80,2.11,.20,.20,.11,crown,taper=.12)

# A low embankment, layered wharves and a faceted tower complete the river view.
brick = [paint('Riverside brick', code) for code in ('a18a86','956f69','af8d78','89919b')]
distant = [paint('Distant roofs', code) for code in ('9292a1','a3a0ad','949ea5')]
block('Embankment', 0, 6.3, -.02, 68, 1, .48, dark_stone)
for i in range(-22, 23):
    x = i * 1.32
    h = rng.uniform(.85,1.85)
    if i % 6 == 2 or i % 9 == 4:
        continue
    block('Wharf',x,7,.42,1.24,1.11,h,rng.choice(brick))
    block('Roof',x,7,h+.42,1.32,1.19,.19,crown,taper=.79)
    for dx in (-.39,-.13,.13,.39):
        for z in (.71,1.08):
            block('Wharf window',x+dx,6.44,z,.12,.03,.18,glass)
    h = rng.uniform(1.0,2.2)
    block('Skyline',x+.71,10,.39,1.30,1.4,h,rng.choice(distant))
block('Glass river spire', -8.5, 9, .4, 1.55, 1.52, 3.70, distant[0], taper=.08)
block('Offset glass shard', -8.75, 9.1, .4, .81, 1.12, 4.20, distant[2], taper=.015)
for i in range(470):
    x, y = rng.uniform(-27,27), rng.uniform(-8,5)
    block('Faceted ripple', x, y, .009, rng.uniform(.10,.83), rng.uniform(.016,.060), .003, glints)

sky = paint('Apricot sky', 'a99093')
sky.use_nodes = True
nodes, links = sky.node_tree.nodes, sky.node_tree.links
coord = nodes.new('ShaderNodeTexCoord')
axis = nodes.new('ShaderNodeSeparateXYZ')
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = rgb('fbd2aa')
ramp.color_ramp.elements[1].color = rgb('697d98')
ramp.color_ramp.elements.new(.6).color = rgb('c8908d')
emission = nodes.new('ShaderNodeEmission')
links.new(coord.outputs['Generated'], axis.inputs[0])
links.new(axis.outputs['Z'], ramp.inputs[0])
links.new(ramp.outputs[0], emission.inputs['Color'])
links.new(emission.outputs[0], nodes.get('Material Output').inputs['Surface'])
mesh('Painted evening sky', [(-42,16,-4),(42,16,-4),(42,16,7),(-42,16,7)], [(0,1,2,3)], sky)

# A softly lit sun beyond the wharves picks up the warm stone of the towers.
sun_disk = paint('Low sun', 'ffd6af')
sun_disk.use_nodes = True
sun_nodes = sun_disk.node_tree.nodes
sun_emission = sun_nodes.new('ShaderNodeEmission')
sun_emission.inputs[0].default_value = rgb('ffdbb5')
sun_disk.node_tree.links.new(sun_emission.outputs[0], sun_nodes.get('Material Output').inputs['Surface'])
points = [(5.7 + .60 * cos(2*pi*i/48), 15, 2.22 + .60 * sin(2*pi*i/48)) for i in range(48)]
mesh('Evening sun', points, [tuple(range(48))], sun_disk)

scene.world.use_nodes = True
world = scene.world.node_tree.nodes.get('Background')
world.inputs['Color'].default_value = rgb('d6e2f0')
world.inputs['Strength'].default_value = .70
bpy.ops.object.light_add(type='SUN', location=(-8,-12,15))
sun = bpy.context.object
sun.rotation_euler = (-sun.location).to_track_quat('-Z', 'Y').to_euler()
sun.data.energy, sun.data.angle = 2.4, .08
sun.data.color = (1,.90,.78)
target = Vector((0,0,2.64))
bpy.ops.object.camera_add(location=target + Vector((6,-38,5.2)))
camera = bpy.context.object
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type, camera.data.ortho_scale = 'ORTHO', 49
scene.camera = camera
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.quality = 83
scene.render.filepath = str(ROOT / 'public/art/london-thames.webp')
bpy.ops.render.render(write_still=True)
