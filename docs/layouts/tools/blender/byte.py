# Byte — SolidBytes' chibi guide, built headless in Blender and exported as GLB for the layout mockups.
# Run:  /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/blender/byte.py -- assets/byte.glb
# Node names are what shared/sb-bot.js drives at runtime (same rig as the procedural fallback):
#   Body › Torso, UpperArm.R/L, UpperLeg.R/L, Neck › Head › Eye.R/L, Mouth, Pad.R/L (emissive)
# Coordinates in this file are given in three.js space (x right, y up, z toward the camera) and converted.
import bpy, bmesh, sys, math
from mathutils import Vector, Euler

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'byte.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------- helpers ----------
def P(x, y, z):  # three (x,y,z) -> blender (x,-z,y)
    return Vector((x, -z, y))

def srgb(hexv):
    c = [((hexv >> s) & 255) / 255 for s in (16, 8, 0)]
    lin = [((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c]
    return (*lin, 1.0)

MATS = {}
def mat(name, color, rough=0.6, metal=0.0, emit=None, emit_strength=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = srgb(color); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit is not None:
        b.inputs['Emission Color'].default_value = srgb(emit); b.inputs['Emission Strength'].default_value = emit_strength
    MATS[name] = m; return m

COL = dict(skin=0xa9b1e6, skinDark=0x8089c4, hair=0x171c2b, hoodie=0xece6da, hoodieDark=0x14171e, trim=0x1f8fd6, pad=0xf2b25c,
           cup=0x1b1f28, pants=0xb7bbc4, cuff=0x14171e, shoe=0xf1ece2, eye=0x111522, cheek=0xe79aa8, white=0xffffff, badge=0x14171e)
M = dict(
    skin=mat('Skin', COL['skin'], 0.55), skinDark=mat('SkinDark', COL['skinDark'], 0.6), hair=mat('Hair', COL['hair'], 0.42, 0.05),
    hoodie=mat('Hoodie', COL['hoodie'], 0.85), hoodieDark=mat('HoodieDark', COL['hoodieDark'], 0.75),
    trim=mat('Trim', COL['trim'], 0.4, 0.0, COL['trim'], 2.5), pad=mat('Pad', COL['pad'], 0.4, 0.0, COL['pad'], 3.0),
    cup=mat('Cup', COL['cup'], 0.35, 0.25), pants=mat('Pants', 0x5f646e, 0.9), cuff=mat('Cuff', COL['cuff'], 0.8),
    shoe=mat('Shoe', COL['shoe'], 0.5), eye=mat('Eye', COL['eye'], 0.25), cheek=mat('Cheek', COL['cheek'], 0.9),
    white=mat('White', COL['white'], 0.3, 0.0, COL['white'], 0.6), badge=mat('Badge', COL['badge'], 0.5),
)

def empty(name, pos, parent=None, scale=(1, 1, 1)):
    e = bpy.data.objects.new(name, None); e.empty_display_size = 0.05
    bpy.context.collection.objects.link(e); e.parent = parent; e.location = pos; e.scale = scale
    return e

def finish(obj, name, material, parent, pos, scale=(1, 1, 1), rot=(0, 0, 0), smooth=True, subsurf=0, bevel=0.0):
    obj.name = name; obj.data.name = name
    obj.data.materials.clear(); obj.data.materials.append(material)
    obj.parent = parent; obj.location = pos; obj.scale = scale; obj.rotation_euler = Euler(rot, 'XYZ')
    if bevel > 0:
        b = obj.modifiers.new('bevel', 'BEVEL'); b.width = bevel; b.segments = 4; b.limit_method = 'ANGLE'
    if subsurf > 0:
        s = obj.modifiers.new('subsurf', 'SUBSURF'); s.levels = subsurf; s.render_levels = subsurf
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def sphere(name, material, parent, pos, r=1.0, scale=(1, 1, 1), seg=32, ring=20, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=r)
    return finish(bpy.context.object, name, material, parent, pos, scale, rot)

def capsule(name, material, parent, pos, r, length, rot=(0, 0, 0), scale=(1, 1, 1)):
    # cylinder along local Z (blender) == local Y (three) after export; caps via subsurf of a tall cube is ugly, so build it: cylinder + 2 hemispheres joined
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=length)
    cyl = bpy.context.object
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=r, location=(0, 0, length / 2)); top = bpy.context.object
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=r, location=(0, 0, -length / 2)); bot = bpy.context.object
    for o in (cyl, top, bot): o.select_set(True)
    bpy.context.view_layer.objects.active = cyl; bpy.ops.object.join()
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=0.002); bpy.ops.object.mode_set(mode='OBJECT')
    # blender Z axis is three Y: a capsule standing up needs no rotation
    return finish(cyl, name, material, parent, pos, scale, rot)

def cylinder(name, material, parent, pos, r, depth, rot=(0, 0, 0), scale=(1, 1, 1), verts=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth)
    return finish(bpy.context.object, name, material, parent, pos, scale, rot)

def torus(name, material, parent, pos, R, r, rot=(0, 0, 0), scale=(1, 1, 1), arc=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=40, minor_segments=10)
    o = bpy.context.object
    if arc is not None:  # keep only the half of the ring with local y >= 0 (blender) — the exporter rotates it with the node
        bm = bmesh.new(); bm.from_mesh(o.data)
        geom = [v for v in bm.verts if (v.co.y if arc == 'y+' else -v.co.y if arc == 'y-' else v.co.x if arc == 'x+' else -v.co.x) < -1e-4]
        bmesh.ops.delete(bm, geom=geom, context='VERTS'); bm.to_mesh(o.data); bm.free()
    return finish(o, name, material, parent, pos, scale, rot)

def box(name, material, parent, pos, size, rot=(0, 0, 0), bevel=0.0, subsurf=0):
    bpy.ops.mesh.primitive_cube_add(size=1)
    return finish(bpy.context.object, name, material, parent, pos, (size[0], size[2], size[1]), rot, smooth=bevel > 0 or subsurf > 0, subsurf=subsurf, bevel=bevel)

# ---------- scene ----------
root = empty('Byte', Vector((0, 0, 0)))
body = empty('Body', Vector((0, 0, 0)), root)

# torso: a soft rounded block (hoodie), dark hem band, glowing trim, zip, hood, badge
torso = box('Torso', M['hoodie'], body, P(0, 0.72, 0), (0.6, 0.42, 0.52), bevel=0.2, subsurf=2)
box('Hem', M['hoodieDark'], body, P(0, 0.49, 0), (0.6, 0.13, 0.52), bevel=0.06, subsurf=1)
torus('Trim', M['trim'], body, P(0, 0.555, 0), 0.3, 0.012)
box('Zip', M['hoodieDark'], body, P(0, 0.74, 0.265), (0.02, 0.24, 0.012))
torus('Hood', M['hoodie'], body, P(0, 0.9, -0.06), 0.2, 0.07, rot=(0, 0, 0), arc='y-')
box('Badge', M['badge'], body, P(0.12, 0.74, 0.262), (0.11, 0.11, 0.012), rot=(0, 0.18, 0), bevel=0.02)
bpy.ops.object.text_add(); txt = bpy.context.object; txt.data.body = 'SB'; txt.data.extrude = 0.003; txt.data.size = 0.062; txt.data.align_x = 'CENTER'; txt.data.align_y = 'CENTER'
bpy.ops.object.convert(target='MESH'); finish(txt, 'BadgeMark', M['hoodie'], body, P(0.12, 0.735, 0.27), rot=(math.pi / 2, 0, 0.18), smooth=False)
# pockets
for s in (1, -1):
    box(f'Pocket.{"R" if s > 0 else "L"}', M['hoodieDark'], body, P(0.14 * s, 0.6, 0.258), (0.13, 0.07, 0.012), bevel=0.01)

# arms (pivot at the shoulder; capsules hang straight down, runtime rotates the pivots)
for s, side in ((1, 'R'), (-1, 'L')):
    piv = empty(f'UpperArm.{side}', P(0.29 * s, 0.78, 0), body)
    capsule(f'Sleeve.{side}', M['hoodieDark'], piv, P(0, -0.16, 0), 0.075, 0.2)
    torus(f'Cuff.{side}', M['trim'], piv, P(0, -0.27, 0), 0.075, 0.012)
    sphere(f'Hand.{side}', M['skin'], piv, P(0, -0.33, 0), 0.085)
    # legs + sneakers
    lp = empty(f'UpperLeg.{side}', P(0.15 * s, 0.44, 0), body)
    capsule(f'Leg.{side}', M['pants'], lp, P(0, -0.1, 0), 0.085, 0.1)
    cylinder(f'LegCuff.{side}', M['cuff'], lp, P(0, -0.21, 0), 0.09, 0.06)
    sphere(f'Shoe.{side}', M['shoe'], lp, P(0, -0.33, 0.05), 0.105, scale=(1.05, 1.6, 0.8))  # ellipsoid sneaker (blender scale: x, depth, height)
    box(f'Stripe.{side}', M['trim'], lp, P(0, -0.33, 0.05), (0.23, 0.025, 0.14))

# head
neck = empty('Neck', P(0, 1.0, 0), body)
head = empty('Head', Vector((0, 0, 0)), neck)
skull = sphere('Skull', M['skin'], head, P(0, 0.4, 0), 0.42, scale=(1, 0.95, 0.97), seg=48, ring=32)  # blender scale (x, y=-z_three, z=y_three)
# hair: a bigger sphere with the face region cut away, plus bangs tufts and a sheen
hair = sphere('Hair', M['hair'], head, P(0, 0.4, 0), 0.452, seg=48, ring=26)
bm = bmesh.new(); bm.from_mesh(hair.data)
fringe = lambda x: 0.1 + 0.04 * math.cos(x * 15.0)  # soft zigzag lower edge of the bangs
cut = [v for v in bm.verts if (v.co.z < fringe(v.co.x) and -v.co.y > 0.1 and abs(v.co.x) < 0.37) or (v.co.z < -0.3) or (v.co.z < -0.08 and -v.co.y > 0.3)]  # face window; bob stays at the sides/back
bmesh.ops.delete(bm, geom=cut, context='VERTS'); bm.to_mesh(hair.data); bm.free()
hair.modifiers.new('solid', 'SOLIDIFY').thickness = 0.03
# brows
for s, side in ((1, 'R'), (-1, 'L')):
    box(f'Brow.{side}', M['hair'], head, P(0.15 * s, 0.565, 0.365), (0.09, 0.014, 0.02), rot=(0, 0, 0.1 * s), bevel=0.004)
# eyes (empties so the runtime can blink by scaling)
for s, side in ((1, 'R'), (-1, 'L')):
    e = empty(f'Eye.{side}', P(0.15 * s, 0.42, 0.37), head)
    sphere(f'EyeBall.{side}', M['eye'], e, Vector((0, 0, 0)), 0.048, scale=(1, 0.35, 1.5))
    sphere(f'EyeHL1.{side}', M['white'], e, P(0.02 * s, 0.035, 0.03), 0.018)
    sphere(f'EyeHL2.{side}', M['white'], e, P(-0.015 * s, -0.025, 0.03), 0.01)
    # cheeks
    cyl = cylinder(f'Cheek.{side}', M['cheek'], head, P(0.25 * s, 0.33, 0.33), 0.045, 0.004, rot=(math.pi / 2, 0, 0.55 * s), verts=24)
# mouth: a small smile arc; runtime scales the empty (scale.y pulses while talking)
mouth = empty('Mouth', P(0, 0.29, 0.405), head, scale=(1, 0.5, 0.5))
torus('Smile', M['skinDark'], mouth, Vector((0, 0, 0)), 0.04, 0.011, rot=(math.pi / 2, 0, 0), arc='x+')  # placeholder orientation, fixed below
# headphones: band over the top, cups on the sides, glowing pads
torus('Band', M['cup'], head, P(0, 0.42, 0), 0.47, 0.028, rot=(math.pi / 2, 0, 0), arc='x+')  # fixed below
for s, side in ((1, 'R'), (-1, 'L')):
    cylinder(f'Cup.{side}', M['cup'], head, P(0.44 * s, 0.4, 0), 0.13, 0.1, rot=(0, math.pi / 2, 0))
    torus(f'Pad.{side}', M['pad'], head, P(0.5 * s, 0.4, 0), 0.095, 0.02, rot=(0, math.pi / 2, 0))

# orientation fixes for the two half-tori: the smile opens upward (∪) and the band arcs over the top (∩)
smile = bpy.data.objects['Smile']; smile.rotation_euler = Euler((math.pi / 2, 0, 0), 'XYZ')  # ring in the XZ(blender) plane = XY(three)
bm = bmesh.new(); bm.from_mesh(smile.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 1e-4], context='VERTS'); bm.to_mesh(smile.data); bm.free()
band = bpy.data.objects['Band']; band.rotation_euler = Euler((math.pi / 2, 0, 0), 'XYZ')
bm = bmesh.new(); bm.from_mesh(band.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -1e-4], context='VERTS'); bm.to_mesh(band.data); bm.free()
# NOTE: the torus() 'arc' pre-cut above may have removed the wrong half for these two; rebuild them cleanly instead
for o in (smile, band): bpy.data.objects.remove(o, do_unlink=True)
def half_torus(name, material, parent, pos, R, r, keep_up):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=40, minor_segments=10)
    o = bpy.context.object
    bm = bmesh.new(); bm.from_mesh(o.data)
    # torus lies in blender XY; rotate it to stand in XZ (blender) == XY (three) by rotating the mesh data itself
    for v in bm.verts: v.co = Vector((v.co.x, -v.co.z, v.co.y))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if (v.co.z < -1e-4) if keep_up] + [v for v in bm.verts if (v.co.z > 1e-4) if not keep_up], context='VERTS')
    bm.to_mesh(o.data); bm.free()
    return finish(o, name, material, parent, pos)
half_torus('Smile', M['skinDark'], mouth, Vector((0, 0, 0)), 0.04, 0.011, keep_up=False)
half_torus('Band', M['cup'], head, P(0, 0.42, 0), 0.47, 0.028, keep_up=True)
# hood: half torus standing behind the neck (open side forward)
hood = bpy.data.objects['Hood']; bpy.data.objects.remove(hood, do_unlink=True)
bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.07, major_segments=40, minor_segments=14)
hood = bpy.context.object
bm = bmesh.new(); bm.from_mesh(hood.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -1e-4], context='VERTS'); bm.to_mesh(hood.data); bm.free()  # keep back half (blender +y = three -z)
finish(hood, 'Hood', M['hoodie'], body, P(0, 0.9, -0.02))

# ---------- export ----------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_apply=True, export_yup=True, export_lights=False, export_cameras=False,
                          export_animations=False, export_skins=False, export_morph=False, export_texcoords=False, export_normals=True,
                          export_image_format='NONE', export_extras=False, export_hierarchy_flatten_bones=False)
print('WROTE', OUT)
