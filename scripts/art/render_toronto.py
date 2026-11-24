"""Generate Flow's original Toronto lakefront illustration with Blender 4.3+.

blender -b --factory-startup -t 4 --python-exit-code 1 --python scripts/art/render_toronto.py
"""
from math import cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
rng = Random(416)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 2560, 320
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'


def rgb(code):
    channels = [int(code[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + .055) / 1.055) ** 2.4 if v > .04045 else v / 12.92 for v in channels) + (1,)


def paint(name, code):
    material = bpy.data.materials.new(name)
    material.diffuse_color = rgb(code)
    return material


def mesh(name, points, faces, material):
    shape = bpy.data.meshes.new(name)
    shape.from_pydata(points, [], faces)
    shape.materials.append(material)
    obj = bpy.data.objects.new(name, shape)
    scene.collection.objects.link(obj)
    return obj


def block(name, x, y, z, width, depth, height, material):
    points = [(x + dx * width / 2, y + dy * depth / 2, z + level * height)
              for level in (0, 1) for dx, dy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    return mesh(name, points, [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], material)


def revolve(name, x, y, profile, material, sides=40):
    points = [(x + radius * cos(2*pi*j/sides), y + radius * sin(2*pi*j/sides), z)
              for z, radius in profile for j in range(sides)]
    faces = [(k*sides+j, k*sides+(j+1)%sides, (k+1)*sides+(j+1)%sides, (k+1)*sides+j)
             for k in range(len(profile)-1) for j in range(sides)]
    faces += [tuple(reversed(range(sides))), tuple(range(len(points)-sides, len(points)))]
    return mesh(name, points, faces, material)


def stroke(name, coords, radius, material):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    spline = curve.splines.new('POLY')
    spline.points.add(len(coords)-1)
    for point, value in zip(spline.points, coords):
        point.co = (*value, 1)
    curve.materials.append(material)
    scene.collection.objects.link(bpy.data.objects.new(name, curve))


limestone = paint('Warm limestone', 'd7c3b8')
cream = paint('Warm metal trim', 'f1e3d4')
pod_glass = paint('Blue-black observation windows', '283d58')
red = paint('Signal red', 'bf434c')
core_glass = [paint('Curtain wall', color) for color in ('4f7387','476b7e','597689','82919f','57738a')]
mullion = paint('Silver-blue mullions','acb6c0')
roof_mat = paint('Pale stadium shell', 'd5dce3')
roof_seam = paint('Stadium shell ribs', '91a1ae')
quay = paint('Harbour granite', '959ba4')
brick = paint('Converted brick lofts', 'a86f62')
water = paint('Lake Ontario', '38839d')
ripple = paint('Lake highlights', '89bcca')
ferry_glass = paint('Marine blue glazing', '3b6777')
park_green = paint('Harbour foliage','628778')

# The tower rises over the domed stadium. Its three splayed feet taper to a
# slender hexagonal spine, observation ring, upper deck and striped antenna.
tx, ty = -1.65, 1.25
revolve('Concrete core', tx, ty, [(.3,.21),(3.6,.145),(4.79,.115)], limestone, 12)
for j in range(3):
    angle = j * 2*pi/3 + .42
    dx, dy = cos(angle), sin(angle)
    contour = [(.24,.49,.16),(1.3,.33,.13),(3.2,.18,.095),(4.78,.10,.08)]
    points = []
    for z, distance, width in contour:
        for side, depth in ((-1,0),(1,0),(1,-.15),(-1,-.15)):
            points.append((tx + (distance+depth)*dx - side*width*dy,
                           ty + (distance+depth)*dy + side*width*dx, z))
    faces = [(4*k+j,4*k+(j+1)%4,4*k+(j+1)%4+4,4*k+j+4) for k in range(3) for j in range(4)]
    mesh('Three-ribbed concrete leg', points, faces, cream)
revolve('Observation bowl',tx,ty,[(4.46,.155),(4.60,.23),(4.76,.48),(4.80,.50)],limestone)
revolve('Main lookout',tx,ty,[(4.80,.50),(4.96,.50),(5.01,.46)],pod_glass)
revolve('Lookout fascia',tx,ty,[(4.95,.51),(5.01,.51),(5.05,.46)],red)
revolve('Restaurant roof',tx,ty,[(5.04,.46),(5.12,.37),(5.16,.18)],cream)
revolve('Upper concrete shaft',tx,ty,[(5.15,.14),(5.83,.077)],limestone)
revolve('Small upper observation deck',tx,ty,[(5.77,.07),(5.81,.16),(5.89,.16),(5.94,.075)],pod_glass)
revolve('Slim antenna',tx,ty,[(5.92,.066),(6.45,.052),(6.91,.033),(7.02,.018)],cream,16)
for z, radius in ((6.23,.066),(6.46,.054),(6.67,.043),(6.89,.029)):
    revolve('Antenna band',tx,ty,[(z,radius),(z+.09,radius*.9)],red,16)

# Elliptical, ribbed roof over the stadium west of the tower.
sx, sy = -4.30, .65
drum = revolve('Elliptical stadium drum',0,0,[(.28,1),(.56,1)],roof_seam)
drum.location = (sx,sy,0)
drum.scale = (2.12,1.26,1)
segments, rings = 48, 10
ellipsoid = []
for k in range(rings+1):
    elevation = k*pi/(2*rings)
    for j in range(segments):
        a = 2*pi*j/segments
        ellipsoid.append((sx+2.12*cos(elevation)*cos(a),sy+1.26*cos(elevation)*sin(a),.55+.75*sin(elevation)))
shell_faces = [(k*segments+j,k*segments+(j+1)%segments,(k+1)*segments+(j+1)%segments,(k+1)*segments+j)
               for k in range(rings) for j in range(segments)]
mesh('Retractable stadium shell',ellipsoid,shell_faces,roof_mat)
for i in (4,8,12,16,20):
    j = i+segments//2
    stroke('Stadium roof seam', [ellipsoid[k*segments+j] for k in range(rings+1)], .014,roof_seam)

# The financial core sits east of the tower. Vertical fin spacing and stepped
# crowns vary, with an open patch of sky behind the observation decks.
for i in range(-25,26):
    x = i*1.52 + rng.uniform(-.26,.26)
    if -3.2 < x < -.55:
        continue
    y = rng.uniform(4.3,6.5)
    height = rng.uniform(1.2,3.0)
    if .1 < x < 8:
        height += rng.uniform(.9,2.05)
    w, d = rng.uniform(.89,1.37), rng.uniform(.82,1.34)
    material = rng.choice(core_glass)
    block('Downtown office',x,y,.23,w,d,height,material)
    if i%3:
        block('Setback crown',x,y,height+.23,w*.70,d*.75,.22,material)
    if i%2:
        for offset in (-.35,-.04,.27):
            block('Vertical facade fin',x+w*offset,y-d/2-.01,.23,.023,.024,height,mullion)
    else:
        for j in range(1,int(height/.33)):
            block('Horizontal floor line',x,y-d/2-.012,.23+j*.33,w,.024,.024,mullion)
    if i%4 == 1:
        crown_height = .22 if i%3 else 0
        block('Rooftop plant',x+.12,y,height+.23+crown_height,w*.32,d*.42,.20,mullion)

back_glass = [paint('Distant city glass', color) for color in ('8a98a6','8996aa','959fac')]
for i in range(-26,27):
    x = i*1.45+.7
    h = rng.uniform(.95,1.80)
    if 1 < x < 9:
        h += rng.uniform(.25,1.10)
    block('Second skyline',x,8.4,.21,rng.uniform(.92,1.69),1.1,h,rng.choice(back_glass))

block('Lake surface',0,-18.3,-.20,100,36,.20,water)
block('Land behind harbour',0,8.2,-.05,100,17,.25,quay)
block('Harbourfront retaining wall',0,3.6,-.01,100,8,.31,quay)
block('Waterside boardwalk',0,-.40,.25,100,.56,.09,limestone)
for i in range(-18,19):
    x = i*2.28
    if i%4==1 and abs(x)>5.0:
        block('Harbour loft',x,.8,.30,1.74,1.1,.83,brick)
        for dx in (-.57,-.2,.17,.54):
            block('Loft window',x+dx,.24,.52,.21,.025,.33,ferry_glass)
    elif i%3:
        stroke('Tree trunk',[(x,-.03,.3),(x,-.03,.79)],.055,quay)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.36, location=(x,-.03,.90))
        tree=bpy.context.object
        tree.name='Harbourfront tree'
        tree.scale=(1.18,.86,.87)
        tree.data.materials.append(park_green)

# A small double-ended island ferry gives the lake a human scale.
fx, fy = 2.35,-4.10
hull_profile = [(-1.37,0),(-.99,-.27),(.99,-.27),(1.37,0),(.99,.27),(-.99,.27)]
hull_points = [(fx+dx*scale,fy+dy*scale,z) for z,scale in ((.012,.82),(.20,1)) for dx,dy in hull_profile]
hull_faces = [(j,(j+1)%6,(j+1)%6+6,j+6) for j in range(6)] + [tuple(range(6,12))]
mesh('Ferry hull',hull_points,hull_faces,ferry_glass)
for z,length in ((.20,2.26),(.42,1.77)):
    block('Ferry deck',fx,fy,z,length,.43,.06,cream)
    block('Glazed ferry cabin',fx,fy,z+.06,length-.30,.32,.14,ferry_glass)
    for j in range(8):
        dx=(j/7-.5)*(length-.28)
        block('Cabin window post',fx+dx,fy-.166,z+.06,.028,.015,.14,cream)
block('Ferry canopy',fx,fy,.62,1.67,.43,.042,cream)
block('Ferry stack',fx+.05,fy,.662,.16,.16,.16,red)
for j in range(410):
    x, y = rng.uniform(-38,38),rng.uniform(-11,-.78)
    block('Wind ripple',x,y,.008,rng.uniform(.10,.65),rng.uniform(.025,.085),.004,ripple)
for side in (-1,1):
    stroke('Ferry wake',[(fx-1.21-.3*i,fy+side*(.17+.11*i),.018) for i in range(5)],.018,ripple)

# A gradient emissive backdrop controls the pale dawn independently of the key light.
sky=paint('Lake dawn','b7bbd5')
sky.use_nodes=True
nodes, links=sky.node_tree.nodes, sky.node_tree.links
coords=nodes.new('ShaderNodeTexCoord')
axis=nodes.new('ShaderNodeSeparateXYZ')
ramp=nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color=rgb('f0c3b3')
ramp.color_ramp.elements[1].color=rgb('7d9abb')
ramp.color_ramp.elements.new(.59).color=rgb('c4bfcd')
emission=nodes.new('ShaderNodeEmission')
links.new(coords.outputs['Generated'],axis.inputs[0])
links.new(axis.outputs['Z'],ramp.inputs[0])
links.new(ramp.outputs[0],emission.inputs[0])
links.new(emission.outputs[0],nodes.get('Material Output').inputs[0])
mesh('Painted sky',[(-55,14,-3),(55,14,-3),(55,14,8),(-55,14,8)],[(0,1,2,3)],sky)
scene.world.use_nodes=True
background=scene.world.node_tree.nodes.get('Background')
background.inputs['Color'].default_value=rgb('dbe5f0')
background.inputs['Strength'].default_value=.67
bpy.ops.object.light_add(type='SUN',location=(-12,-10,15))
sun=bpy.context.object
sun.rotation_euler=(-sun.location).to_track_quat('-Z','Y').to_euler()
sun.data.energy,sun.data.angle=2.4,.09
sun.data.color=(1,.87,.80)
focus=Vector((0,0,3.08))
bpy.ops.object.camera_add(location=focus+Vector((3.2,-40,5.9)))
camera=bpy.context.object
camera.rotation_euler=(focus-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type,camera.data.ortho_scale='ORTHO',70
scene.camera=camera
scene.render.image_settings.file_format='WEBP'
scene.render.image_settings.color_mode='RGB'
scene.render.image_settings.quality=83
scene.render.filepath=str(ROOT/'public/art/toronto-waterfront.webp')
bpy.ops.render.render(write_still=True)
