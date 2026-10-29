"""Render Flow's decorative orbital sculpture with Blender 4.3+."""
import bpy
import os
from math import radians
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = False
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (0.045, 0.06, 0.08)

def material(name, color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return mat

blue = material('Ocean blue', (0.018, 0.19, 0.48), 0.75, 0.3)
teal = material('Teal', (0.018, 0.46, 0.41), 0.65, 0.25)
for radius, minor, rotation, mat in [(2.4, .055, (18, 16, -18), blue), (2.08, .032, (48, -28, 25), teal), (1.73, .025, (5, 49, -35), blue)]:
    bpy.ops.mesh.primitive_torus_add(major_segments=128, minor_segments=12, major_radius=radius, minor_radius=minor, rotation=tuple(radians(v) for v in rotation))
    obj = bpy.context.object
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons: polygon.use_smooth = True

def aim(obj, point): obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(1, -4, 6))
bpy.context.object.data.energy = 700
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 5
aim(bpy.context.object, (0, 0, 0))
bpy.ops.object.light_add(type='AREA', location=(-4, 1, 1))
bpy.context.object.data.energy = 500
bpy.context.object.data.color = (.1, .7, 1)
bpy.context.object.data.size = 4
aim(bpy.context.object, (0, 0, 0))
bpy.ops.object.camera_add(location=(0, -7, 5))
scene.camera = bpy.context.object
scene.camera.data.type = 'ORTHO'
scene.camera.data.ortho_scale = 6.2
aim(scene.camera, (0, 0, 0))
scene.render.filepath = os.path.abspath('public/art/flow-orbits.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('scripts/art/flow-orbits.blend'))
bpy.ops.render.render(write_still=True)
