"""Render Flow's original Nairobi civic-centre study, in Blender 4.3+.

blender -b --factory-startup -t 4 --python-exit-code 1 --python scripts/art/render_nairobi.py
"""
from math import cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
rng = Random(51)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 2560, 320
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'


def rgb(hex_color):
    channels = [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((c + .055) / 1.055) ** 2.4 if c > .04045 else c / 12.92 for c in channels) + (1,)


def paint(name, value):
    material = bpy.data.materials.new(name)
    material.diffuse_color = rgb(value)
    return material


def mesh(name, verts, faces, material):
    shape = bpy.data.meshes.new(name)
    shape.from_pydata(verts, [], faces)
    shape.materials.append(material)
    obj = bpy.data.objects.new(name, shape)
    scene.collection.objects.link(obj)
    return obj


def box(name, x, y, z, width, depth, height, material):
    verts = [(x+dx*width/2, y+dy*depth/2, z+layer*height)
             for layer in (0,1) for dx,dy in ((-1,-1),(1,-1),(1,1),(-1,1))]
    faces = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    return mesh(name, verts, faces, material)


def drum(name, x, y, profile, material, sides=40):
    verts = [(x+r*cos(j*2*pi/sides), y+r*sin(j*2*pi/sides), z)
             for z,r in profile for j in range(sides)]
    faces = []
    for k in range(len(profile)-1):
        for j in range(sides):
            p, q = k*sides+j, k*sides+(j+1)%sides
            faces.append((p,q,q+sides,p+sides))
    faces += [tuple(reversed(range(sides))), tuple(range(len(verts)-sides,len(verts)))]
    return mesh(name, verts, faces, material)


def line(name, coords, width, material):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = width
    spline = curve.splines.new('POLY')
    spline.points.add(len(coords)-1)
    for point, coord in zip(spline.points, coords):
        point.co = (*coord, 1)
    obj = bpy.data.objects.new(name, curve)
    curve.materials.append(material)
    scene.collection.objects.link(obj)


glass = paint('Smoked bronze glass','524841')
sand = paint('Sunlit concrete','dbc29b')
terracotta = paint('Terracotta ribs','b87552')
roof = paint('Copper pavilion roof','ac6748')
steel = paint('Cool anodized frames','53747c')
paving = paint('Sandstone paving','baa996')
lawn = paint('Planted terrace','739479')
road = paint('Slate street','52626c')
leaf = paint('Blue-green leaves','537e70')
petals = [paint('Jacaranda flowers',tone) for tone in ('9384b7','af94c3','b89dcf')]
bark = paint('Street tree bark','755e58')

# Layered drums, recessed glazing and continuous vertical fins give the
# conference tower its silhouette even when the artwork is cropped narrowly.
tx,ty=-1.15,.42
drum('Entrance plinth',tx,ty,[(.10,1.16),(.27,1.16),(.30,1.05)],sand)
drum('Podium glazing',tx,ty,[(.30,.97),(.70,.97)],glass)
drum('Round podium',tx,ty,[(.62,1.10),(.76,1.15),(.83,1.06)],sand)
drum('Tower glazing',tx,ty,[(.76,.66),(4.53,.67)],glass)
for floor in range(19):
    z=.80+floor*.19
    drum('Terraced concrete sunshade',tx,ty,[(z,.695),(z+.035,.73),(z+.065,.73)],terracotta)
for j in range(14):
    angle=2*pi*j/14
    fin=box('Continuous fin',0,0,.75,.105,.17,3.86,sand)
    fin.location=(tx+.72*cos(angle),ty+.72*sin(angle),0)
    fin.rotation_euler.z=angle-pi/2
drum('Stepped crown',tx,ty,[(4.48,.70),(4.54,.83),(4.62,.88),(4.70,.80)],sand)
drum('Crown glazing',tx,ty,[(4.69,.78),(4.89,.86)],glass)
drum('Round roof deck',tx,ty,[(4.87,.86),(4.94,1.02),(5.00,1.03),(5.03,.94)],terracotta)
drum('Deck rim',tx,ty,[(4.99,1.045),(5.035,1.045)],sand)
drum('Roof service block',tx,ty,[(5.03,.23),(5.14,.19)],steel)
line('Roof mast',[(tx,ty,5.14),(tx,ty,5.43)],.016,steel)

# Beside the tower, a radial meeting hall with a ribbed, flared roof.
hx,hy=1.55,.45
drum('Hall steps',hx,hy,[(.10,1.65),(.20,1.65),(.20,1.54),(.30,1.54)],sand)
drum('Circular foyer',hx,hy,[(.30,1.42),(.94,1.42)],glass)
for j in range(20):
    a=j*2*pi/20
    line('Foyer pier',[(hx+1.43*cos(a),hy+1.43*sin(a),.30),
                       (hx+1.43*cos(a),hy+1.43*sin(a),.96)],.042,sand)
profile=[(.91,1.70),(1.02,1.74),(1.16,1.30),(1.42,.83),(1.83,.17),(1.95,.055)]
drum('Tented auditorium',hx,hy,profile,roof)
for j in range(24):
    a=j*2*pi/24
    line('Radial roof seam',[(hx+r*cos(a),hy+r*sin(a),z+.008) for z,r in profile[1:]],.017,terracotta)

box('Plaza',0,1,-.25,80,35,.35,paving)
box('Street',0,-4,.103,80,2.26,.03,road)
for x in range(-36,37,2):
    box('Lane marking', x,-4,.134,.84,.052,.005,sand)
for x in (4,4.34,4.68,5.02,5.36):
    box('Crossing', x,-4,.134,.17,1.8,.007,sand)
for x in (-10,-6,6,12):
    box('Planter',x,-1.65,.10,2.12,.63,.11,sand)
    box('Planting',x,-1.65,.212,1.98,.50,.04,lawn)

# A regular spacing of offices keeps the centre legible in a full-width panorama.
facades=[paint('Office glass',c) for c in ('68878a','678694','859696','68868a')]
masonry=[paint('Street frontage',c) for c in ('ceaa85','c29a81','c5b09b')]
for i in range(-14,15):
    x=i*2.12+rng.uniform(-.16,.16)
    y=rng.uniform(5.7,7.0)
    h=rng.uniform(1.10,2.18)
    box('Business frontage',x,y,.10,1.84,1.20,h,rng.choice(masonry))
    box('Street awning',x,y-.64,.83,1.92,.46,.08,leaf)
    for dx in (-.57,-.19,.19,.57):
        box('Shop window',x+dx,y-.608,.22,.29,.025,.55,glass)
        box('Office window',x+dx,y-.608,1.02,.25,.025,.20,steel)
    if i%3!=0:
        y+=2.45
        height=rng.uniform(1.9,3.35)
        box('Commercial tower',x+.2,y,.10,1.77,1.64,height,rng.choice(facades))
        for k in range(1,int(height/.39)):
            box('Curtain-wall sill',x+.2,y-.83,k*.39,1.77,.03,.036,steel)

def jacaranda(x,y,scale):
    def pos(dx,dy,z):
        return (x+dx*scale,y+dy*scale,.10+z*scale)
    line('Jacaranda trunk',[pos(0,0,0),pos(.03,.02,.83),pos(-.04,-.03,1.16)],.09*scale,bark)
    branches=[(-.52,0,1.48),(.54,.05,1.60),(.05,.37,1.74),(-.09,-.15,1.95)]
    for dx,dy,z in branches:
        line('Forked bough',[pos(.02,.01,.72),pos(dx*.44,dy*.7,1.13),pos(dx,dy,z)],.041*scale,bark)
        for n in range(3):
            center=pos(dx+rng.uniform(-.18,.18),dy+rng.uniform(-.16,.16),z+.11*n)
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=scale*.49,location=center)
            obj=bpy.context.object
            obj.name='Jacaranda crown'
            obj.scale=(rng.uniform(.97,1.26),rng.uniform(.85,1.09),rng.uniform(.66,.89))
            obj.rotation_euler.z=rng.uniform(0,pi)
            obj.data.materials.append(leaf if n==0 else rng.choice(petals))
for x,y,scale in [(-23,-1.3,1.08),(-15,1,1.38),(-10,-1.6,.93),(-6,-1.6,1.04),
                   (6,-1.6,.98),(12,-1.6,1.13),(19,.2,1.34),(24,-.8,1.25)]:
    jacaranda(x,y,scale)

# Painted morning atmosphere behind a sunlit physical model.
sky=paint('Morning haze','d1bdb0')
sky.use_nodes=True
nodes,links=sky.node_tree.nodes,sky.node_tree.links
coordinates=nodes.new('ShaderNodeTexCoord')
separate=nodes.new('ShaderNodeSeparateXYZ')
ramp=nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color=rgb('f3d6af')
ramp.color_ramp.elements.new(.6).color=rgb('c7c9ba')
ramp.color_ramp.elements[-1].color=rgb('729ca9')
emission=nodes.new('ShaderNodeEmission')
links.new(coordinates.outputs['Generated'],separate.inputs[0])
links.new(separate.outputs['Z'],ramp.inputs[0])
links.new(ramp.outputs[0],emission.inputs[0])
links.new(emission.outputs[0],nodes.get('Material Output').inputs[0])
mesh('Sky',[(-50,16,-5),(50,16,-5),(50,16,9),(-50,16,9)],[(0,1,2,3)],sky)
scene.world.use_nodes=True
background=scene.world.node_tree.nodes.get('Background')
background.inputs['Color'].default_value=rgb('cfdde3')
background.inputs['Strength'].default_value=.77
bpy.ops.object.light_add(type='SUN',location=(-9,-11,16))
sun=bpy.context.object
sun.rotation_euler=(-sun.location).to_track_quat('-Z','Y').to_euler()
sun.data.energy,sun.data.angle=2.4,.095
sun.data.color=(1,.90,.77)
target=Vector((0,0,2.52))
bpy.ops.object.camera_add(location=target+Vector((4,-38,5.4)))
camera=bpy.context.object
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type,camera.data.ortho_scale='ORTHO',53
scene.camera=camera
scene.render.image_settings.file_format='WEBP'
scene.render.image_settings.color_mode='RGB'
scene.render.image_settings.quality=82
scene.render.filepath=str(ROOT/'public/art/nairobi-civic-centre.webp')
bpy.ops.render.render(write_still=True)
