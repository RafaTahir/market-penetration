"""Render Flow's original decorative study of Phnom Penh's Central Market.

From the project root:
blender -b --factory-startup -t 4 --python-exit-code 1 --python scripts/art/render_phnom_penh.py
"""
from math import atan2, cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
rng = Random(39)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 2560, 320
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'


def color(hex_color):
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((c + .055) / 1.055) ** 2.4 if c > .04045 else c / 12.92 for c in channels) + (1,)


def paint(name, hex_color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color(hex_color)
    return material


def surface(name, vertices, faces, material):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj


def box(name, center, size, material, angle=0):
    vertices = [(x / 2, y / 2, z / 2) for z in (-1, 1) for y in (-1, 1) for x in (-1, 1)]
    faces = [(0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (1, 3, 7, 5), (3, 2, 6, 7), (2, 0, 4, 6)]
    obj = surface(name, vertices, faces, material)
    obj.location, obj.scale, obj.rotation_euler.z = center, size, angle
    return obj


def drum(name, profile, material, sides=48):
    points = [(r * cos(2 * pi * j / sides), r * sin(2 * pi * j / sides), z)
              for r, z in profile for j in range(sides)]
    faces = []
    for level in range(len(profile) - 1):
        for j in range(sides):
            a = level * sides + j
            b = level * sides + (j + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    top = (len(profile) - 1) * sides
    faces.append(tuple(range(top, top + sides)))
    return surface(name, points, faces, material)


ochre = paint('Ochre plaster', 'e2ad55')
gold = paint('Sunlit cornice', 'efc573')
cream = paint('Limestone ribs', 'f9d999')
glass = paint('Deep shaded opening', '254c53')
awning = paint('Pale teal awning', '75b0a3')
paving = paint('Market forecourt', '708e86')
asphalt = paint('Deep teal street', '214856')

# Four barrel-vaulted halls meet at the concentric drum. Each hall is built in
# its own radial frame so the floor plan and arcades survive the angled view.
def wing(angle):
    def xyz(u, v, z):
        return (u * cos(angle) - v * sin(angle), u * sin(angle) + v * cos(angle), z)

    def block(name, u, v, z, length, width, height, material):
        box(name, xyz(u, v, z), (length, width, height), material, angle)

    def vault(name, start, end, width, material):
        profile = [(width * cos(i * pi / 16), 1.15 + .54 * sin(i * pi / 16)) for i in range(17)]
        vertices = [xyz(u, v, z) for u in (start, end) for v, z in profile]
        faces = [(i, i + 17, i + 18, i + 1) for i in range(16)]
        faces += [tuple(reversed(range(17))), tuple(range(17, 34))]
        surface(name, vertices, faces, material)

    block('Hall arcade', 5.53, 0, .58, 6.9, 2.13, 1.16, ochre)
    vault('Vaulted roof', 2.1, 9, 1.23, ochre)
    for index in range(8):
        u = 2.7 + index * .86
        vault('Segmented roof rib', u, u + .055, 1.26, cream)
        for side in (-1, 1):
            block('Arcade opening', u + .25, side * 1.071, .62, .49, .04, .63, glass)
            block('Arcade sill', u + .25, side * 1.11, .31, .56, .13, .075, cream)
    for side in (-1, 1):
        block('Long cornice', 5.58, side * 1.08, 1.12, 6.95, .29, .12, gold)
    block('End portal', 9.03, 0, .95, .30, 2.39, 1.90, ochre)
    block('Portal opening', 9.20, 0, .78, .04, 1.49, 1.37, glass)
    block('Entrance canopy', 9.45, 0, 1.51, .67, 2.52, .13, cream)
    for v in (-1.03, 1.03):
        block('Limestone pilaster', 9.21, v, .95, .10, .15, 1.9, gold)
    block('Stepped parapet', 9.04, 0, 1.99, .31, 1.68, .21, gold)
    block('Parapet crown', 9.04, 0, 2.15, .32, .85, .15, ochre)


for direction in range(4):
    wing(direction * pi / 2)

drum('Octagonal hall', [(3.13, 0), (3.13, 1.98), (3.23, 2.08), (3.23, 2.17)], ochre, 8)
drum('Clerestory', [(2.89, 2.16), (2.89, 3.35)], ochre, 32)
for j in range(48):
    a = 2 * pi * j / 48
    box('Clerestory louvre', (2.89 * cos(a), 2.89 * sin(a), 2.72),
        (.18, .06, .70), glass, a + pi / 2)
for z in (2.45, 3.00, 3.27):
    drum('Clerestory course', [(2.94, z), (2.94, z + .085)], cream)

roof = [(3.16, 3.34), (3.16, 3.47), (3.02, 3.5), (2.77, 3.88), (2.41, 4.19),
        (2.06, 4.47), (1.64, 4.72), (1.17, 4.90), (.59, 5.03), (.16, 5.07)]
drum('Faceted dome', roof, gold)
for j in range(16):
    a = j * pi / 8
    vertices = [((r + .025) * cos(a + delta), (r + .025) * sin(a + delta), z + .012)
                for r, z in roof for delta in (-.012, .012)]
    surface('Dome rib', vertices, [(i, i + 1, i + 3, i + 2) for i in range(0, len(vertices) - 2, 2)], cream)
drum('Low crown', [(.46, 5.00), (.46, 5.13), (.25, 5.13), (.25, 5.21)], cream)

# The street, shophouses and trees frame the market as an architectural study.
camera_side = Vector((.45, -.893, 0)).normalized()
right = Vector((-camera_side.y, camera_side.x, 0))
away = -camera_side
street_angle = atan2(right.y, right.x)


def street_point(x, depth, z):
    point = x * right + depth * away
    return (point.x, point.y, z)


box('Street', street_point(0, -5, -.30), (90, 36, .46), asphalt, street_angle)
box('Market forecourt', (0, 0, -.13), (20.1, 20.1, .24), paving)
shophouses = [paint('Misty shophouse', hue) for hue in ('52918c', '497b7c', '70aaa1')]
shutters = paint('Distant shutters', '487774')
for x in range(-40, 41, 2):
    h = rng.uniform(.75, 1.85)
    box('Shophouse', street_point(x, 11.6, h / 2), (1.87, 1.4, h), rng.choice(shophouses), street_angle)
    box('Shophouse parapet', street_point(x, 11.5, h), (1.95, 1.55, .13), awning, street_angle)
    for dx in (-.50, 0, .50):
        box('Shutter', street_point(x + dx, 10.88, h * .62), (.24, .04, .39), shutters, street_angle)

# Extra frontage to either side completes the panorama for the single-city banner.
# The narrower market cards naturally crop to the dome and four halls.
plaster = [paint('Arcade plaster', hue) for hue in ('9cb3a1', 'b7b69b', '8caa9a')]
for x in (-33, -29, -25, -19, -15, 16, 20, 27, 31, 35):
    h = rng.uniform(1.4, 2.1)
    depth = rng.uniform(3.8, 5.2)
    box('Corner shophouse', street_point(x, depth, h / 2), (3.3, 2.2, h), rng.choice(plaster), street_angle)
    box('Arcade canopy', street_point(x, depth - 1.23, h * .59), (3.5, .85, .13), awning, street_angle)
    box('Roof ledge', street_point(x, depth, h), (3.49, 2.42, .11), awning, street_angle)
    for dx in (-1.06, 0, 1.06):
        box('Arcade bay', street_point(x + dx, depth - 1.11, h * .32), (.60, .04, h * .5), shutters, street_angle)
        box('Upper window', street_point(x + dx, depth - 1.11, h * .80), (.46, .04, h * .23), shutters, street_angle)

# Sparse, tiered foliage gives a softer silhouette against the Art Deco geometry.
leaf_colors = [paint('Tree canopy', hue) for hue in ('326863', '427f71', '559581')]
trunk = paint('Tree trunk', '3b615a')
for x, depth in [(-34.4, 1), (-31, .70), (-23, 1.5), (-12, 2), (-10.8, 3.2), (10.8, 2.4), (12, 1), (23.4, 1.6), (34.2, .8)]:
    box('Tree trunk', street_point(x, depth, .60), (.17, .18, 1.25), trunk)
    for dx, z, radius in [(-.48, 1.40, .75), (.5, 1.56, .85), (0, 1.94, .90)]:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=street_point(x + dx, depth, z))
        canopy = bpy.context.object
        canopy.name = 'Faceted canopy'
        canopy.scale.z = .83
        canopy.data.materials.append(rng.choice(leaf_colors))

# A self-lit painted cyclorama, with physical sunlight reserved for the model.
sky = paint('Morning sky', '7da9aa')
sky.use_nodes = True
nodes, links = sky.node_tree.nodes, sky.node_tree.links
coords = nodes.new('ShaderNodeTexCoord')
axis = nodes.new('ShaderNodeSeparateXYZ')
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = color('bacfc0')
ramp.color_ramp.elements[1].color = color('336981')
emission = nodes.new('ShaderNodeEmission')
links.new(coords.outputs['Generated'], axis.inputs[0])
links.new(axis.outputs['Z'], ramp.inputs['Fac'])
links.new(ramp.outputs[0], emission.inputs['Color'])
links.new(emission.outputs[0], nodes.get('Material Output').inputs['Surface'])
surface('Sky', [street_point(-42, 20, -4), street_point(42, 20, -4),
                street_point(42, 20, 7.8), street_point(-42, 20, 7.8)], [(0, 1, 2, 3)], sky)

scene.world.use_nodes = True
world = scene.world.node_tree.nodes.get('Background')
world.inputs['Color'].default_value = color('c2dbe6')
world.inputs['Strength'].default_value = .8
bpy.ops.object.light_add(type='SUN', location=(-8, -12, 19))
sun = bpy.context.object
sun.rotation_euler = (-sun.location).to_track_quat('-Z', 'Y').to_euler()
sun.data.energy, sun.data.angle = 2.2, .075
sun.data.color = (1.0, .91, .75)

target = Vector((0, 0, 1.9))
bpy.ops.object.camera_add(location=target + 32 * camera_side + Vector((0, 0, 5.6)))
camera = bpy.context.object
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 27.5 * scene.render.resolution_x / 960
scene.camera = camera
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.quality = 82
scene.render.filepath = str(ROOT / 'public/art/phnom-penh-market.webp')
bpy.ops.render.render(write_still=True)
