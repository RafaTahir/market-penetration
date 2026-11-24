"""Create the original decorative Dubai skyline for Flow with Blender 4.3.

Run: blender --background --factory-startup -t 4 --python scripts/art/render_dubai.py
The camera frames a stylized composite of landmarks, not their geographic positions.
"""
from math import cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
rng = Random(32)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 4
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 960, 320
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'


def linear(channel):
    return ((channel + .055) / 1.055) ** 2.4 if channel > .04045 else channel / 12.92


def rgb(value):
    return tuple(linear(int(value[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1,)


def paint(name, color):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = rgb(color)
    mat.node_tree.links.new(emission.outputs[0], nodes.get('Material Output').inputs['Surface'])
    return mat


def mesh(name, vertices, faces, materials, indices=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    for mat in materials:
        data.materials.append(mat)
    for face, index in zip(data.polygons, indices or ()):
        face.material_index = index
    return obj


def slab(name, x, y, z, w, h, material):
    return mesh(name, [(x-w/2, y, z), (x+w/2, y, z), (x+w/2, y, z+h), (x-w/2, y, z+h)], [(0, 1, 2, 3)], [material])


def prism(name, x, y, z, w, depth, h, sides, palette, taper=1):
    # Backlit faces are cooler; front faces pick up warm light from the right.
    vertices = []
    for scale, height in [(1, z), (taper, z+h)]:
        for j in range(sides):
            a = pi/4 + 2*pi*j/sides
            vertices.append((x+w*scale*cos(a), y+depth*scale*sin(a), height))
    faces, indices = [], []
    for j in range(sides):
        k = (j+1) % sides
        faces.append((j, k, k+sides, j+sides))
        a = pi/4 + 2*pi*(j+.5)/sides
        light = cos(a)*.8 - sin(a)*.35
        indices.append(2 if light > .5 else 1 if light > -.15 else 0)
    faces.append(tuple(range(sides, 2*sides)))
    indices.append(2)
    return mesh(name, vertices, faces, palette, indices)


sky = paint('Late afternoon haze', '946e64')
# Interpolate an original dusk palette over the height of the cyclorama.
slab('Sky cyclorama', 0, 9, -2, 48, 14, sky)
nodes, links = sky.node_tree.nodes, sky.node_tree.links
coords = nodes.new('ShaderNodeTexCoord')
axis = nodes.new('ShaderNodeSeparateXYZ')
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = rgb('ffd59e')
ramp.color_ramp.elements[1].color = rgb('324967')
for position, color in [(.32, 'dfaa82'), (.70, '6f7293')]:
    ramp.color_ramp.elements.new(position).color = rgb(color)
links.new(coords.outputs['Generated'], axis.inputs[0])
links.new(axis.outputs['Z'], ramp.inputs[0])
links.new(ramp.outputs[0], nodes.get('Emission').inputs['Color'])

sun = paint('Low sun', 'ffdba4')
outline = [(7.25+1.45*cos(a*2*pi/96), 7.8, 3.2+1.45*sin(a*2*pi/96)) for a in range(96)]
mesh('Setting sun', outline, [tuple(range(96))], [sun])


def palette(name, colors):
    return [paint(name+str(i), color) for i, color in enumerate(colors)]


far = palette('Distant haze', ('8b7d87', 'a58c8c', 'c09c88'))
near = palette('City glass', ('36465a', '506579', '9b8780'))
bronze = palette('Burj facets', ('47556a', '8990a0', 'ecc797'))
sail = palette('Sail facets', ('667a8c', 'e8cfab', 'ffdfaa'))
base = paint('Waterfront plinth', '283b50')
lights = paint('Quay lights', 'd8a778')
water = paint('Dusk water', '1f3b50')
ripples = paint('Water glints', '856f66')

for row, colors, y in [('far', far, 4.5), ('near', near, 2.4)]:
    x = -16
    while x < 16:
        w, h = rng.uniform(.3, .9), rng.uniform(.85, 2.55)
        prism(row+' skyline', x, y, 0, w, .44, h, 4, colors)
        if rng.random() < .4:
            prism(row+' parapet', x, y, h, w*.55, .28, rng.uniform(.18, .48), 4, colors)
        x += rng.uniform(.72, 1.65)

# A tapering cluster of fluted wings and stepped setbacks around a narrow spire.
cx = -.9
prism('Burj central shaft', cx, -.15, 0, .59, .49, 4.94, 8, bronze, .70)
for dx, h in [(-.45, 3.21), (.42, 4.09), (-.27, 4.67), (.22, 5.24)]:
    prism('Stepped tower wing', cx+dx, -.42, 0, .31, .32, h, 8, bronze, .66)
prism('Upper shaft', cx+.01, -.3, 4.65, .235, .22, 1.37, 8, bronze, .62)
prism('Crown', cx+.01, -.3, 6.02, .145, .15, .66, 8, bronze, .48)
prism('Spire', cx+.01, -.3, 6.66, .064, .07, .96, 6, bronze, .05)

# Triangulated sail with a swept edge, horizontal decks and a projecting platform.
sx, sy = 6.45, .1
mast = paint('Sail mast', '47566c')
slab('Sail mast', sx+.05, sy+.02, 0, .13, 3.93, mast)
levels = [(0.22, 1.10), (.73, 1.26), (1.22, 1.24), (1.72, 1.09), (2.25, .87), (2.8, .59), (3.51, .06)]
for (z, w), (z2, w2) in zip(levels, levels[1:]):
    left, right = sx-.99, sx+.06
    mesh('Folded sail deck', [(right, sy, z), (right-w, sy, z), (right-w2, sy, z2), (right, sy, z2),
                              (left+(1.20-w)*.5, sy-.22, z+.02)],
         [(0, 4, 3), (4, 2, 3), (4, 1, 2)], sail, [1, 2, 0])
    slab('Sail shadow line', right-w/2, sy-.24, z, w, .045, mast)
prism('Cantilevered deck', sx+.21, sy-.12, 2.93, .35, .32, .07, 16, bronze)

slab('Quay', 0, -1, -.13, 40, .45, base)
slab('Water', 0, -2, -9, 40, 9.11, water)
slab('Waterline', 0, -2.03, .08, 40, .025, lights)
for i in range(54):
    slab('Horizontal reflection', rng.uniform(-15, 15), -2.1, rng.uniform(-1.5, .045), rng.uniform(.07, 1.5), .018, ripples)

bpy.ops.object.camera_add(location=(0, -40, 5.65))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 3.65)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 30
scene.camera = camera
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.quality = 88
scene.render.filepath = str(ROOT/'public/art/dubai-skyline.webp')
bpy.ops.render.render(write_still=True)
