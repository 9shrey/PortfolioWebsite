"""Builds the room in Blender, bakes its light, and exports it for the web.

  scripts/room/blender.sh --python scripts/room/build.py -- preview [out.png]   # a quick Cycles render from the home view
  scripts/room/blender.sh --python scripts/room/build.py -- bake [size]         # bake atlases + export public/room/

Blender is Z-up: x right, y away from the visitor (back wall at y = BACK), z up.
glTF export turns that into three.js Y-up (x, z, -y).
Run scripts/room/fetch.mjs and scripts/room/textures.py first.
"""
import bpy, bmesh, os, sys, math, json, glob
from mathutils import Vector, Matrix, Euler

os.chdir(os.environ.get("ROOM_REPO", os.getcwd()))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = ARGS[0] if ARGS else "preview"
SRC, GEN, OUT = "assets/room/src", "assets/room/src/gen", "public/room"
CARDS = json.load(open("assets/room/cards.json"))["cards"]

# Room box (metres)
X0, X1, Y0, BACK, H = -2.4, 2.4, -2.2, 2.0, 2.8
WIN = dict(x0=-1.15, x1=0.45, z0=1.0, z1=2.35)     # window hole in the back wall
DESK = dict(x0=-0.95, x1=1.05, y0=1.27, y1=1.99, top=0.76)
T = 0.12                                          # wall thickness

# ------------------------------------------------------------------ setup
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = kind; prefs.get_devices()
        if any(d.type == kind for d in prefs.devices): break
    except TypeError: pass
for d in prefs.devices: d.use = d.type != "CPU"
scene.cycles.device = "GPU"
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"

def link(o):
    scene.collection.objects.link(o); return o

# ------------------------------------------------------------------ materials
def principled(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, emit=None, strength=1.0, sheen=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sheen: b.inputs["Sheen Weight"].default_value = sheen
    if coat: b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

def srgb(h):
    """#rrggbb -> linear rgb"""
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

def image_node(m, path, non_color=False):
    n = m.node_tree.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(os.path.abspath(path), check_existing=True)
    if non_color: n.image.colorspace_settings.name = "Non-Color"
    return n

def pbr_box(name, folder, scale=1.0, tint=None, rough_mul=1.0):
    """Tiling PBR material with box projection in object space: needs no UVs of its own."""
    m = principled(name); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    for key, inp in (("diff", "Base Color"), ("rough", "Roughness"), ("nor", None)):
        p = f"{SRC}/textures/{folder}/{key}.jpg"
        if not os.path.exists(p): continue
        n = image_node(m, p, non_color=key != "diff"); n.projection = "BOX"; n.projection_blend = 0.25
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
        if key == "diff" and tint:
            mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            nt.links.new(n.outputs["Color"], mix.inputs["A"]); mix.inputs["B"].default_value = (*tint, 1)
            nt.links.new(mix.outputs["Result"], b.inputs[inp])
        elif key == "rough":
            mt = nt.nodes.new("ShaderNodeMath"); mt.operation = "MULTIPLY"; mt.inputs[1].default_value = rough_mul
            nt.links.new(n.outputs["Color"], mt.inputs[0]); nt.links.new(mt.outputs[0], b.inputs[inp])
        elif key == "nor":
            nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 0.6
            nt.links.new(n.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
        else:
            nt.links.new(n.outputs["Color"], b.inputs[inp])
    return m

def image_mat(name, path, rough=0.6, emit=0.0):
    m = principled(name, rough=rough); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    n = image_node(m, path); nt.links.new(n.outputs["Color"], b.inputs["Base Color"])
    if emit:
        nt.links.new(n.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = emit
    return m

M = dict(
    wall=pbr_box("wall", "beige_wall_001", 0.7, tint=(0.86, 0.80, 0.70)),
    floor=pbr_box("floor", "laminate_floor_02", 0.45, tint=(0.75, 0.62, 0.50)),
    desk=pbr_box("desk", "american_walnut_veneer", 1.2, tint=(1.35, 1.0, 0.72), rough_mul=0.7),
    ceiling=principled("ceiling", (0.62, 0.58, 0.52), 0.9),
    paint=principled("paint", (0.80, 0.78, 0.72), 0.35),            # window frame, skirting
    steel=principled("steel", (0.03, 0.03, 0.035), 0.45, 0.8),
    alu=principled("alu", (0.55, 0.56, 0.58), 0.3, 1.0),
    fabric=principled("curtain", srgb("#cdbfa6"), 0.95, sheen=0.6),
    felt=principled("felt", srgb("#2c2c30"), 1.0, sheen=0.3),
    kb_base=principled("kb_base", srgb("#2a2a2e"), 0.5, 0.3),
    kb_cap=principled("kb_cap", srgb("#e6e1d6"), 0.55),
    kb_accent=principled("kb_accent", srgb("#e2573b"), 0.5),
    mouse=principled("mouse", srgb("#e6e1d6"), 0.4),
    ceramic=principled("ceramic", srgb("#2442d8"), 0.15, coat=0.5),
    chai=principled("chai", srgb("#9a6a3c"), 0.08),
    pcb=principled("pcb", srgb("#14181a"), 0.55),
    slot=principled("slot", srgb("#0e0e10"), 0.6),
    gold=principled("gold", (0.9, 0.62, 0.25), 0.25, 1.0),
    ram=principled("ram", srgb("#1a1a1c"), 0.4, 0.6),
    fins=principled("fins", (0.7, 0.7, 0.72), 0.25, 1.0),
    fan=principled("fan", srgb("#111113"), 0.6),
    led=principled("led", (0.0, 0.0, 0.0), 0.5, emit=srgb("#5fd3ff"), strength=8.0),
    rack=pbr_box("rack", "american_walnut_veneer", 2.0, tint=(0.6, 0.5, 0.42)),
    phone=principled("phone", srgb("#121214"), 0.2, 0.2, coat=1.0),
    paper=principled("paper", srgb("#f1ede4"), 0.85),
    wire=principled("wire", srgb("#1c1c1e"), 0.35, 0.9),
    lanyard=principled("lanyard", srgb("#2442d8"), 0.8, sheen=0.4),
    foam=principled("foam", srgb("#f4f1ea"), 0.9),
    clip=principled("clip", srgb("#111111"), 0.3, 0.9),
)

# ------------------------------------------------------------------ geometry helpers
def mesh_obj(name, bm, mat=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    if mat: o.data.materials.append(mat)
    return o

def box(name, size, loc, mat=None, rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = mesh_obj(name, bm, mat); o.location = loc; o.rotation_euler = Euler([math.radians(r) for r in rot])
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL"); mod.width = bevel; mod.segments = 2; mod.limit_method = "ANGLE"
    return o

def span(name, x0, x1, y0, y1, z0, z1, mat=None, bevel=0.0):
    return box(name, (x1 - x0, y1 - y0, z1 - z0), ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), mat, bevel=bevel)

def cyl(name, r, depth, loc, mat=None, rot=(0, 0, 0), seg=32, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = mesh_obj(name, bm, mat); o.location = loc; o.rotation_euler = Euler([math.radians(a) for a in rot])
    return o

def plane(name, w, h, loc, rot=(90, 0, 0), mat=None):
    """A w x h rectangle with 0..1 UVs, standing up and facing -y by default."""
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    bmesh.ops.scale(bm, vec=Vector((w, h, 1)), verts=bm.verts)
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        for l in f.loops: l[uv].uv = (l.vert.co.x / w + 0.5, l.vert.co.y / h + 0.5)
    o = mesh_obj(name, bm, mat); o.location = loc; o.rotation_euler = Euler([math.radians(a) for a in rot])
    return o

def join(name, objs):
    objs = [o for o in objs if o]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        for m in o.modifiers: pass
    bpy.ops.object.convert(target="MESH")          # applies modifiers
    bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = name; o.data.name = name
    return o

def parent_keep(child, parent):
    bpy.context.view_layer.update()   # matrix_world is stale until the scene updates
    child.parent = parent; child.matrix_parent_inverse = parent.matrix_world.inverted()

def import_model(mid, loc=(0, 0, 0), rot_z=0.0, scale=1.0, keep=(), drop=(), name=None):
    """Imports a Poly Haven model, bakes the placement into its meshes and joins every part
    except `keep` (moving parts, named by suffix). Returns {"main": obj, <suffix>: obj}."""
    before = set(bpy.data.objects)
    path = glob.glob(f"{SRC}/models/{mid}/{mid}.gltf") + glob.glob(f"{SRC}/models/{mid}/{mid}.blend")
    if path[0].endswith(".gltf"):
        bpy.ops.import_scene.gltf(filepath=os.path.abspath(path[0]))
    else:
        with bpy.data.libraries.load(path[0]) as (src, dst): dst.objects = src.objects
        for o in dst.objects:
            if o and o.name not in scene.collection.objects: link(o)
    new = [o for o in bpy.data.objects if o not in before]
    place = Matrix.Translation(loc) @ Matrix.Rotation(math.radians(rot_z), 4, "Z") @ Matrix.Scale(scale, 4)
    meshes = []
    for o in new:
        if o.type != "MESH": continue
        w = o.matrix_world.copy(); o.parent = None; o.matrix_world = place @ w
        meshes.append(o)
    for o in new:
        if o.type != "MESH": bpy.data.objects.remove(o)
    meshes = [o for o in meshes if not any(o.name.endswith(d) for d in drop)]
    for o in list(bpy.data.objects):
        if o in new and o not in meshes and o.type == "MESH": bpy.data.objects.remove(o)
    out = {}
    for k in keep:
        hit = [o for o in meshes if o.name.endswith(k)]
        if hit: out[k] = hit[0]; meshes.remove(hit[0]); hit[0].name = f"{name or mid}_{k}"
    out["main"] = join(name or mid, meshes) if len(meshes) > 1 else meshes[0]
    if len(meshes) == 1: meshes[0].name = name or mid
    for o in [out["main"], *[v for k, v in out.items() if k != "main"]]:
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        o.select_set(False)
    return out

def decimate(o, ratio):
    m = o.modifiers.new("dec", "DECIMATE"); m.ratio = ratio
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)

def faces_with_material(o, sub):
    idx = [i for i, m in enumerate(o.data.materials) if m and sub in m.name]
    return [p for p in o.data.polygons if p.material_index in idx]

def material_centroid(o, sub):
    ps = faces_with_material(o, sub)
    if not ps: return None
    c = sum((o.matrix_world @ p.center for p in ps), Vector()); return c / len(ps)

def delete_material_faces(o, sub):
    bm = bmesh.new(); bm.from_mesh(o.data)
    idx = {i for i, m in enumerate(o.data.materials) if m and sub in m.name}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in idx], context="FACES")
    bm.to_mesh(o.data); bm.free()

def bounds(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return Vector(map(min, *pts)), Vector(map(max, *pts))

# Objects grouped by what they become on the web
STATIC_SHELL, STATIC_PROPS, MOVERS, DYN = [], [], [], []   # DYN: surfaces whose picture is drawn live

# ------------------------------------------------------------------ room shell
def wall_with_window():
    w = WIN
    parts = [
        span("w_back_l", X0, w["x0"], BACK, BACK + T, 0, H, M["wall"]),
        span("w_back_r", w["x1"], X1, BACK, BACK + T, 0, H, M["wall"]),
        span("w_back_b", w["x0"], w["x1"], BACK, BACK + T, 0, w["z0"], M["wall"]),
        span("w_back_t", w["x0"], w["x1"], BACK, BACK + T, w["z1"], H, M["wall"]),
        span("w_left", X0 - T, X0, Y0, BACK + T, 0, H, M["wall"]),
        span("w_right", X1, X1 + T, Y0, BACK + T, 0, H, M["wall"]),
        span("w_front", X0 - T, X1 + T, Y0 - T, Y0, 0, H, M["wall"]),
    ]
    return join("walls", parts)

walls = wall_with_window()
floor = span("floor", X0, X1, Y0, BACK, -0.02, 0, M["floor"])
ceiling = span("ceiling", X0, X1, Y0, BACK, H, H + 0.02, M["ceiling"])
skirt = join("skirting", [
    span("sk_l", X0, X0 + 0.015, Y0, BACK, 0, 0.09, M["paint"]),
    span("sk_r", X1 - 0.015, X1, Y0, BACK, 0, 0.09, M["paint"]),
    span("sk_b1", X0, WIN["x0"], BACK - 0.015, BACK, 0, 0.09, M["paint"]),
    span("sk_b2", WIN["x0"], X1, BACK - 0.015, BACK, 0, 0.09, M["paint"]),
])
# window: frame, two casements and a transom, and a sill
fw, fy0, fy1 = 0.055, BACK + 0.03, BACK + 0.09
xm = (WIN["x0"] + WIN["x1"]) / 2; zt = 2.0
win = join("window_frame", [
    span("f_l", WIN["x0"], WIN["x0"] + fw, fy0, fy1, WIN["z0"], WIN["z1"], M["paint"]),
    span("f_r", WIN["x1"] - fw, WIN["x1"], fy0, fy1, WIN["z0"], WIN["z1"], M["paint"]),
    span("f_b", WIN["x0"], WIN["x1"], fy0, fy1, WIN["z0"], WIN["z0"] + fw, M["paint"]),
    span("f_t", WIN["x0"], WIN["x1"], fy0, fy1, WIN["z1"] - fw, WIN["z1"], M["paint"]),
    span("f_m", xm - 0.03, xm + 0.03, fy0, fy1, WIN["z0"], zt, M["paint"]),
    span("f_tr", WIN["x0"], WIN["x1"], fy0, fy1, zt - 0.03, zt + 0.03, M["paint"]),
    span("sill", WIN["x0"] - 0.08, WIN["x1"] + 0.08, BACK - 0.07, BACK + 0.05, WIN["z0"] - 0.035, WIN["z0"], M["paint"], bevel=0.006),
])
STATIC_SHELL += [walls, floor, ceiling, skirt, win]

def curtain(name, outer, inner, open_w):
    """Modelled drawn shut (outer edge to the middle of the window) and gathered open by its x scale,
    with its origin on the outer edge so the page can draw it closed again."""
    bm = bmesh.new(); nx, nz = 96, 2
    w, h = inner - outer, 2.52
    folds = abs(w) * 12
    verts = [[bm.verts.new((w * i / nx, BACK - 0.11 + 0.03 * math.sin(i / nx * math.pi * folds) + 0.008 * math.sin(i * 1.7), 0.03 + h * j / nz))
              for j in range(nz + 1)] for i in range(nx + 1)]
    for i in range(nx):
        for j in range(nz):
            f = (verts[i][j], verts[i + 1][j], verts[i + 1][j + 1], verts[i][j + 1])
            bm.faces.new(f if w > 0 else f[::-1])
    o = mesh_obj(name, bm, M["fabric"])
    s = o.modifiers.new("solid", "SOLIDIFY"); s.thickness = 0.006
    o.location = (outer, 0, 0)
    o.scale = (open_w / abs(w), 1, 1)        # open, as it is baked
    o["closed"] = abs(w) / open_w            # how far it stretches to close
    return o

xm_ = (WIN["x0"] + WIN["x1"]) / 2
STATIC_SHELL += [
    curtain("curtain_l", WIN["x0"] - 0.55, xm_ + 0.02, 0.61),
    curtain("curtain_r", WIN["x1"] + 0.26, xm_ - 0.02, 0.32),
    cyl("curtain_rod", 0.012, X1 - X0 - 2.2, (xm, BACK - 0.11, 2.58), M["steel"], rot=(0, 90, 0)),
]

# ------------------------------------------------------------------ desk
d = DESK
desk_parts = [span("desk_top", d["x0"], d["x1"], d["y0"], d["y1"], d["top"] - 0.035, d["top"], M["desk"], bevel=0.004)]
for lx in (d["x0"] + 0.04, d["x1"] - 0.04):
    for ly in (d["y0"] + 0.05, d["y1"] - 0.05):
        desk_parts.append(span("leg", lx - 0.018, lx + 0.018, ly - 0.018, ly + 0.018, 0, d["top"] - 0.035, M["steel"]))
    desk_parts.append(span("rail", lx - 0.015, lx + 0.015, d["y0"] + 0.05, d["y1"] - 0.05, 0.08, 0.11, M["steel"]))
desk_parts.append(span("rail_b", d["x0"] + 0.04, d["x1"] - 0.04, d["y1"] - 0.065, d["y1"] - 0.035, 0.62, 0.66, M["steel"]))
STATIC_SHELL.append(join("desk", desk_parts))
TOP = d["top"]

# desk mat, keyboard, mouse
STATIC_PROPS.append(span("desk_mat", -0.08, 0.86, 1.31, 1.63, TOP, TOP + 0.003, M["felt"], bevel=0.002))
# A 65% keyboard. Each key is its own object, named key_<KeyboardEvent.code>, so the page can press
# the one you type. Widths in key units.
KB_ROWS = [
    [("Escape", 1)] + [(f"Digit{d}", 1) for d in "1234567890"] + [("Minus", 1), ("Equal", 1), ("Backspace", 2)],
    [("Tab", 1.5)] + [(f"Key{c}", 1) for c in "QWERTYUIOP"] + [("BracketLeft", 1), ("BracketRight", 1), ("Backslash", 1.5)],
    [("CapsLock", 1.75)] + [(f"Key{c}", 1) for c in "ASDFGHJKL"] + [("Semicolon", 1), ("Quote", 1), ("Enter", 2.25)],
    [("ShiftLeft", 2.25)] + [(f"Key{c}", 1) for c in "ZXCVBNM"] + [("Comma", 1), ("Period", 1), ("Slash", 1), ("ShiftRight", 1.75), ("ArrowUp", 1)],
    [("ControlLeft", 1.25), ("MetaLeft", 1.25), ("AltLeft", 1.25), ("Space", 6.25), ("AltRight", 1), ("ControlRight", 1), ("ArrowLeft", 1), ("ArrowDown", 1), ("ArrowRight", 1)],
]
def keyboard(cx, cy):
    z = TOP + 0.003
    pitch, gap = 0.0192, 0.0024
    W = 15 * pitch + 0.024
    KB = Matrix.Translation((cx, cy, z)) @ Matrix.Rotation(math.radians(-2), 4, "Z")
    base = box("kb_base", (W, 5 * pitch + 0.022, 0.02), (0, 0, 0.01), M["kb_base"], bevel=0.004)
    base.matrix_world = KB @ base.matrix_world
    base.name = "keyboard"; STATIC_PROPS.append(base)
    for r, row in enumerate(KB_ROWS):
        x = -W / 2 + 0.012
        for code, u in row:
            w = u * pitch - gap
            mat = M["kb_accent"] if code in ("Escape", "Enter") else M["kb_cap"]
            k = box(f"key_{code}", (w, pitch - gap, 0.011), (0, 0, 0), mat, bevel=0.0025)
            k.matrix_world = KB @ Matrix.Translation((x + w / 2 + gap / 2, 2 * pitch - r * pitch, 0.025))
            MOVERS.append(k)
            x += u * pitch
keyboard(0.30, 1.45)
mouse = cyl("mouse", 0.03, 0.03, (0.72, 1.44, TOP + 0.018), M["mouse"], seg=24, r2=0.022)
mouse.scale = (1, 1.8, 1); STATIC_PROPS.append(mouse)

# mug of chai (moves: a click lifts it)
def mug(cx, cy):
    body = cyl("mug_body", 0.041, 0.095, (cx, cy, TOP + 0.0475), M["ceramic"], seg=40)
    sol = body.modifiers.new("s", "SOLIDIFY"); sol.thickness = 0.004
    bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=32, radius=0.039)
    tea = mesh_obj("mug_tea", bm, M["chai"]); tea.location = (cx, cy, TOP + 0.08)
    bm = bmesh.new()
    t = bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0065, location=(cx + 0.046, cy, TOP + 0.05), rotation=(math.radians(90), 0, 0))
    handle = bpy.context.active_object; handle.data.materials.append(M["ceramic"]); handle.scale = (0.8, 1, 1.1)
    # remove the cap at the top of the body so the tea shows
    bmo = bmesh.new(); bmo.from_mesh(body.data)
    top = [f for f in bmo.faces if f.normal.z > 0.9]; bmesh.ops.delete(bmo, geom=top, context="FACES"); bmo.to_mesh(body.data); bmo.free()
    m = join("mug", [body, tea, handle]); return m
MOVERS.append(mug(0.95, 1.42))

# ------------------------------------------------------------------ GPU test bench + card rack
BENCH = Vector((-0.22, 1.72, TOP))
def bench():
    b = BENCH; parts = []
    parts.append(span("bench_tray", b.x - 0.19, b.x + 0.19, b.y - 0.17, b.y + 0.17, b.z, b.z + 0.006, M["alu"], bevel=0.003))
    for sx in (-1, 1):
        for sy in (-1, 1):
            parts.append(cyl("standoff", 0.005, 0.03, (b.x + sx * 0.11, b.y + sy * 0.11, b.z + 0.021), M["gold"], seg=12))
    zb = b.z + 0.036
    parts.append(span("mobo", b.x - 0.122, b.x + 0.122, b.y - 0.122, b.y + 0.122, zb, zb + 0.002, M["pcb"]))
    # RAM, a slot near the front edge for the card, VRM heatsinks
    for i in range(2):
        parts.append(span("ram", b.x + 0.07 + i * 0.012, b.x + 0.076 + i * 0.012, b.y - 0.02, b.y + 0.11, zb, zb + 0.032, M["ram"]))
    parts.append(span("pcie", b.x - 0.10, b.x + 0.0, b.y - 0.075, b.y - 0.067, zb, zb + 0.011, M["slot"]))
    parts.append(span("vrm", b.x - 0.11, b.x - 0.08, b.y + 0.0, b.y + 0.10, zb, zb + 0.018, M["fins"]))
    parts.append(span("led", b.x - 0.185, b.x + 0.185, b.y - 0.168, b.y - 0.164, b.z + 0.004, b.z + 0.008, M["led"]))
    # tower cooler with its fan facing the visitor
    parts.append(span("cooler_fins", b.x - 0.02, b.x + 0.04, b.y + 0.02, b.y + 0.07, zb, zb + 0.13, M["fins"]))
    parts.append(span("fan_frame", b.x - 0.05, b.x + 0.07, b.y - 0.005, b.y + 0.02, zb + 0.005, zb + 0.125, M["fan"], bevel=0.004))
    tray = join("bench", parts)
    blades = cyl("bench_fan", 0.052, 0.006, (b.x + 0.01, b.y - 0.008, zb + 0.065), M["fan"], rot=(90, 0, 0), seg=7)
    hub = cyl("hub", 0.018, 0.008, (b.x + 0.01, b.y - 0.012, zb + 0.065), M["kb_accent"], rot=(90, 0, 0))
    fan = join("bench_fan", [blades, hub])
    # cable from the bench to the projector, lying on the desk and down the leg
    return tray, fan
tray, fan = bench(); STATIC_PROPS.append(tray); MOVERS.append(fan)
SLOT = Vector((BENCH.x - 0.05, BENCH.y - 0.071, BENCH.z + 0.047))   # where an installed card's edge sits

def gpu_card(c):
    """One card, origin at the middle of its PCIe edge, backplate (with the label) facing -y."""
    L, Hh, D = 0.24, 0.105, 0.032
    shroud = principled(f"shroud_{c['id']}", srgb(c["shroud"]), 0.45, 0.25)
    label = image_mat(f"label_{c['id']}", f"{GEN}/card_{c['id']}.png", rough=0.45)
    parts = [
        span("pcb", -L / 2, L / 2, -0.0015, 0.0015, 0.006, 0.006 + Hh, M["pcb"]),
        span("shroud", -L / 2 + 0.005, L / 2, 0.0015, D, 0.008, Hh + 0.004, shroud, bevel=0.003),
        span("back", -L / 2 + 0.005, L / 2, -0.004, -0.0015, 0.008, Hh + 0.004, shroud),
        span("fingers", -0.06, 0.04, -0.001, 0.001, 0.0, 0.008, M["gold"]),
        span("bracket", -L / 2 - 0.002, -L / 2 + 0.0, -0.01, D, -0.015, Hh + 0.01, M["alu"]),
    ]
    for fx in (-0.055, 0.06):
        parts.append(cyl("fan", 0.043, 0.004, (fx, D + 0.001, 0.058), M["fan"], rot=(90, 0, 0), seg=9))
        parts.append(cyl("hub", 0.012, 0.005, (fx, D + 0.002, 0.058), principled(f"hub_{c['id']}", srgb(c["accent"]), 0.4), rot=(90, 0, 0)))
    o = join(f"gpu_{c['id']}", parts)
    o.data.transform(Matrix.Translation(o.location)); o.location = (0, 0, 0)   # origin = middle of the PCIe edge
    # the label band along the top of the backplate: drawn live (crisp up close), lit by its own baked shade
    lab = plane(f"label_{c['id']}", L - 0.012, 0.044, (0.0025, -0.0042, Hh + 0.004 - 0.024), mat=principled(f"label_white_{c['id']}", (0.8, 0.8, 0.8), 0.45))
    lab["image"] = f"card_{c['id']}.png"
    parent_keep(lab, o); DYN.append(lab)
    return o

# stepped rack: each card stands a step behind and above the one in front, so every label shows
RACK = Vector((-0.64, 1.58, TOP)); STEP_Y, STEP_Z = 0.05, 0.034; RACK_TURN = 22
RACK_M = Matrix.Translation(RACK) @ Matrix.Rotation(math.radians(RACK_TURN), 4, "Z")
rack_parts = []
for i in range(len(CARDS)):
    rack_parts.append(span("step", -0.135, 0.135, i * STEP_Y - 0.02, i * STEP_Y + 0.025, 0, 0.012 + i * STEP_Z, M["rack"], bevel=0.002))
rk = join("gpu_rack", rack_parts); rk.matrix_world = RACK_M; STATIC_PROPS.append(rk)
for i, c in enumerate(CARDS):
    o = gpu_card(c)
    o.matrix_world = RACK_M @ Matrix.Translation((0, i * STEP_Y, 0.012 + i * STEP_Z))
    MOVERS.append(o)

# ------------------------------------------------------------------ props from Poly Haven
lamp = import_model("desk_lamp_arm_01", (-0.88, 1.9, TOP), rot_z=150, name="lamp")["main"]
decimate(lamp, 0.4); STATIC_PROPS.append(lamp)
bulb = material_centroid(lamp, "_light")
notebook = import_model("binder_notebook", (0.80, 1.66, TOP), rot_z=196, drop=("_closed",), name="notebook")["main"]
decimate(notebook, 0.4); MOVERS.append(notebook)

plant = import_model("potted_plant_02", (1.95, 1.45, 0), rot_z=30, scale=1.15, name="plant")
decimate(plant["main"], 0.6); STATIC_PROPS.append(plant["main"])

shelf = import_model("steel_frame_shelves_03", (X1 - 0.27, 0.25, 0), rot_z=90, scale=0.72, name="shelves")["main"]
STATIC_SHELL.append(shelf)

def whiten(obj):
    """The projector in white enamel: its charcoal body (dark, grey pixels of the texture) becomes off-white,
    keeping the texture's wear; the cream panels and the bright parts stay as they are."""
    import numpy as np
    for slot in obj.material_slots:
        m = slot.material
        if not m or not m.node_tree: continue
        for n in m.node_tree.nodes:
            if n.type != "TEX_IMAGE" or not n.image or "diff" not in n.image.name: continue
            img = n.image.copy(); img.name = "projector_white"
            px = np.empty(len(img.pixels), dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(-1, 4)
            rgb = px[:, :3]; l = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
            sat = rgb.max(1) - rgb.min(1)
            w = (np.clip((0.36 - l) / 0.1, 0, 1) * np.clip((0.14 - sat) / 0.06, 0, 1))[:, None]
            enamel = np.array([0.93, 0.92, 0.89], dtype=np.float32) * np.clip(0.8 + (l[:, None] - 0.14) * 1.2, 0.7, 1.0)
            px[:, :3] = rgb * (1 - w) + enamel * w
            img.pixels.foreach_set(px.ravel()); img.pack()
            n.image = img
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        if bsdf and "film" not in m.name:   # enamel, not bare metal
            for l in list(bsdf.inputs["Metallic"].links): m.node_tree.links.remove(l)
            bsdf.inputs["Metallic"].default_value = 0.0

proj_table = import_model("side_table_01", (-1.85, -0.35, 0), rot_z=90, name="side_table")["main"]
STATIC_PROPS.append(proj_table)
proj = import_model("filmstrip_projector_8mm", (-1.85, -0.35, 0.551), rot_z=180, name="projector",
                    keep=("spool_takeup", "spool_feed"), drop=("_cable", "_schuko", "_connector"))
decimate(proj["main"], 0.35); whiten(proj["main"]); STATIC_PROPS.append(proj["main"]); MOVERS += [proj["spool_takeup"], proj["spool_feed"]]
screen = import_model("projector_screen", (-1.62, 1.35, 0), rot_z=200, name="screen_stand")["main"]
delete_material_faces(screen, "projector_screen") if False else None
STATIC_PROPS.append(screen)

# ------------------------------------------------------------------ books: the shelves and a stack on the desk
book_src = []
with bpy.data.libraries.load(glob.glob(f"{SRC}/models/decorative_book_set_01/*.blend")[0]) as (src, dst):
    dst.objects = src.objects
for o in dst.objects:
    if o and o.type == "MESH": book_src.append(o)
for o in book_src:
    for p in o.data.polygons: pass
ency = import_model("book_encyclopedia_set_01", (0, 0, 0), name="ency_src")["main"]

def shelf_boards():
    """z of each shelf board top, found from upward faces of the shelf mesh."""
    zs = {}
    for p in shelf.data.polygons:
        if p.normal.z > 0.95 and p.area > 0.02:
            z = round((shelf.matrix_world @ p.center).z, 2); zs[z] = zs.get(z, 0) + p.area
    return sorted(z for z, a in zs.items() if a > 0.05)

import random
random.seed(26)
sb_lo, sb_hi = bounds(shelf)
books = []
def place_book(src, along, z, x_wall, lean=0.0):
    b = src.copy(); b.data = src.data.copy(); link(b)
    dx, dy, dz = src.dimensions
    # books stand with their spine facing the room (-x), thickness along y
    b.matrix_world = Matrix.Translation((x_wall - dy / 2 - 0.02, along + dx / 2, z)) @ Matrix.Rotation(math.radians(-90 + lean), 4, "X" if False else "Z")
    books.append(b); return dx
boards = shelf_boards()
print("SHELF BOARDS", boards)
REAL_BOARD = min(boards, key=lambda z: abs(z - 1.26))   # eye level: the books that are really mine
for bz in boards[1:]:                                    # the bottom board holds the drawers
    if bz > sb_hi.z - 0.05 or bz == REAL_BOARD: continue
    y = sb_lo.y + 0.06
    while y < sb_hi.y - 0.12:
        if random.random() < 0.12: y += random.uniform(0.06, 0.16); continue
        src = random.choice(book_src)
        if src.dimensions.z > 0.3: continue
        y += place_book(src, y, bz, sb_hi.x - 0.03) + 0.002
books_obj = join("books", books)

# the real books, one object each with a live spine (title and author drawn crisp by the page)
real = json.load(open("assets/room/books.json"))["books"]
xb = sb_hi.x - 0.05
y = (sb_lo.y + sb_hi.y) / 2 + 0.05                      # just past the shelf's centre post
for i, bk in enumerate(real):
    t = 0.026 + 0.012 * random.random(); h = 0.2 + 0.035 * random.random(); dpt = 0.15
    cover = principled(f"cover_{i}", srgb(bk["color"]), 0.55)
    o = box(f"book_{i}", (dpt, t, h), (xb - dpt / 2, y + t / 2, REAL_BOARD + h / 2), cover, bevel=0.0015)
    STATIC_PROPS.append(o)
    bpy.context.view_layer.update()
    sp = plane(f"spine_{i}", t - 0.004, h - 0.008, (0, 0, 0), mat=principled(f"spine_white_{i}", (0.8, 0.8, 0.8), 0.5))
    sp.matrix_world = Matrix.Translation((xb - dpt - 0.0008, y + t / 2, REAL_BOARD + h / 2)) @ Matrix.Rotation(math.radians(-90), 4, "Z") @ Matrix.Rotation(math.radians(90), 4, "X")
    sp["image"] = f"spine_{i}.png"; parent_keep(sp, o); DYN.append(sp)
    y += t + 0.002
# a bookend after them
STATIC_PROPS.append(span("bookend", xb - 0.12, xb, y + 0.004, y + 0.01, REAL_BOARD, REAL_BOARD + 0.14, M["steel"]))

# ------------------------------------------------------------------ figurines next to the books
# Chunky vinyl-toy takes on two favourites (fan figurines, not replicas): a straw-hat pirate and a
# saiyan in an orange gi, and a four-star ball on a little stand.
def mat(name, hexc, rough=0.5, metal=0.0):
    return M.setdefault(name, principled(name, srgb(hexc), rough, metal))
def sphere(name, r, loc, m, scale=(1, 1, 1), seg=24):
    bm = bmesh.new(); bm.loops.layers.uv.new("UVMap")           # calc_uvs fills an existing layer only
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r, calc_uvs=True)
    for f in bm.faces: f.smooth = True
    o = mesh_obj(name, bm, m); o.location = loc; o.scale = scale; return o
def cone(name, r, d, loc, m, rot=(0, 0, 0)):
    return cyl(name, r, d, loc, m, rot=rot, seg=10, r2=0.0)

def figurine(name, at, kind):
    x, y, z = at
    skin = mat("fig_skin", "#f1c7a0", 0.45); black = mat("fig_black", "#121214", 0.35)
    parts = [cyl("stand", 0.034, 0.008, (x, y, z + 0.004), black, seg=28)]
    z0 = z + 0.008
    if kind == "pirate":
        shorts = mat("fig_blue", "#2f5fae", 0.5); vest = mat("fig_red", "#c8282d", 0.45)
        straw = mat("fig_straw", "#e2b84a", 0.6); band = mat("fig_band", "#b3141b", 0.5)
        for dy in (-0.009, 0.009):
            parts += [cyl("leg", 0.006, 0.03, (x, y + dy, z0 + 0.015), skin, seg=10),
                      cyl("sandal", 0.008, 0.004, (x - 0.003, y + dy, z0 + 0.002), mat("fig_brown", "#5b3a22"), seg=10)]
        parts += [cyl("shorts", 0.017, 0.022, (x, y, z0 + 0.039), shorts, seg=16),
                  cyl("chest", 0.015, 0.03, (x, y, z0 + 0.064), skin, seg=16),
                  cyl("vest", 0.016, 0.028, (x + 0.002, y, z0 + 0.065), vest, seg=16)]
        for dy, ang in ((-0.021, -14), (0.021, 14)):
            parts.append(cyl("arm", 0.005, 0.032, (x, y + dy, z0 + 0.062), skin, rot=(ang, 0, 0), seg=8))
        parts += [sphere("head", 0.017, (x, y, z0 + 0.097), skin),
                  sphere("hair", 0.0175, (x - 0.003, y, z0 + 0.102), black, scale=(1, 1, 0.8)),
                  cyl("brim", 0.034, 0.003, (x, y, z0 + 0.11), straw, seg=28),
                  cyl("crown", 0.018, 0.016, (x, y, z0 + 0.12), straw, seg=20),
                  cyl("band", 0.0185, 0.004, (x, y, z0 + 0.114), band, seg=20)]
    else:
        gi = mat("fig_orange", "#ee7a1c", 0.5); blue = mat("fig_navy", "#1d3f9a", 0.45)
        for dy in (-0.01, 0.01):
            parts += [cyl("boot", 0.007, 0.016, (x, y + dy, z0 + 0.008), blue, seg=10),
                      cyl("pants", 0.009, 0.026, (x, y + dy, z0 + 0.029), gi, seg=10)]
        parts += [cyl("belt", 0.018, 0.005, (x, y, z0 + 0.044), blue, seg=16),
                  cyl("torso", 0.018, 0.032, (x, y, z0 + 0.063), gi, seg=16),
                  cyl("collar", 0.012, 0.006, (x - 0.004, y, z0 + 0.078), blue, seg=12)]
        for dy, ang in ((-0.024, -16), (0.024, 16)):
            parts += [cyl("arm", 0.0055, 0.03, (x, y + dy, z0 + 0.06), skin, rot=(ang, 0, 0), seg=8),
                      cyl("cuff", 0.0065, 0.006, (x, y + dy * 1.12, z0 + 0.05), blue, rot=(ang, 0, 0), seg=8)]
        parts.append(sphere("head", 0.017, (x, y, z0 + 0.096), skin))
        # the spiky hair: cones fanned out from the crown
        hc = Vector((x - 0.002, y, z0 + 0.1))
        for ax, ay, ln in ((0, -25, 0.05), (-40, -20, 0.045), (40, -20, 0.045), (-75, -10, 0.04), (75, -10, 0.04), (-20, -55, 0.042), (20, -55, 0.042), (0, -80, 0.038)):
            rot = Euler((math.radians(ax), math.radians(ay), 0))
            d = (rot.to_matrix() @ Vector((0, 0, 1))).normalized()
            parts.append(cone("spike", 0.0085, ln, tuple(hc + d * (0.012 + ln / 2)), black, rot=(ax, ay, 0)))
        parts.append(sphere("hair_cap", 0.0178, (x - 0.004, y, z0 + 0.101), black, scale=(1, 1, 0.85)))
    for dy in (-0.006, 0.006):
        parts.append(sphere("eye", 0.0022, (x + 0.0158, y + dy, z0 + 0.097), black, seg=8))
    o = join(name, parts)
    bpy.context.view_layer.update()
    o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)             # into world space…
    o.data.transform(Matrix.Translation(-Vector((x, y, z)))); o.location = (x, y, z)   # …then the origin on the stand's centre
    o.rotation_euler.z = math.radians(180 + (12 if kind == "pirate" else -10))           # built facing +x; face the room
    return o

fy = y + 0.07
fig_x = xb - 0.075
STATIC_PROPS.append(figurine("figure_pirate", (fig_x, fy, REAL_BOARD), "pirate")); fy += 0.085
STATIC_PROPS.append(figurine("figure_saiyan", (fig_x, fy, REAL_BOARD), "saiyan")); fy += 0.075
ball_m = image_mat("dragonball", f"{GEN}/dragonball.png", 0.12)
ball = sphere("dragonball", 0.022, (fig_x, fy, REAL_BOARD + 0.026), ball_m, seg=32)
ball.rotation_euler = (0, 0, math.radians(90))
ring = cyl("ball_stand", 0.016, 0.006, (fig_x, fy, REAL_BOARD + 0.003), M["steel"], seg=24)
STATIC_PROPS += [join("dragonball", [ball, ring])]

# fan figurines from more series, the same chunky vinyl style: (series, who, colours and a hair shape)
ANIME = [
    ("figure_gon",      dict(hair="spiky", hair_c="#15161a", top="#2f7a3e", bottom="#2f7a3e", shoes="#c8282d")),
    ("figure_killua",   dict(hair="spiky", hair_c="#eceaf2", top="#5b4a8f", bottom="#d8d4cc", shoes="#2a2a30")),
    ("figure_gojo",     dict(hair="spiky_up", hair_c="#f2f2f5", top="#1a1d2e", bottom="#1a1d2e", shoes="#111114", blindfold=True)),
    ("figure_yuji",     dict(hair="short", hair_c="#e88aa0", top="#1b1e2c", bottom="#1b1e2c", shoes="#111114", hood="#c8282d")),
    ("figure_edward",   dict(hair="braid", hair_c="#e8c35a", top="#b3201f", bottom="#16161a", shoes="#16161a", coat=True)),
    ("figure_alphonse", dict(armor=True)),
    ("figure_mob",      dict(hair="bowl", hair_c="#121214", top="#15161c", bottom="#15161c", shoes="#111114", buttons=True)),
    ("figure_reigen",   dict(hair="short", hair_c="#a7865a", top="#8a8d93", bottom="#8a8d93", shoes="#2a1e16", tie="#e88aa0")),
]

def anime_figure(name, at, f):
    x, y, z = at
    skin = mat("fig_skin", "#f1c7a0", 0.45); black = mat("fig_black", "#121214", 0.35)
    parts = [cyl("stand", 0.03, 0.008, (x, y, z + 0.004), black, seg=28)]
    z0 = z + 0.008
    if f.get("armor"):      # a suit of armour: boxy, bigger, a crest on the helmet
        steel = mat("fig_armor", "#8e9196", 0.35, 0.6); red = mat("fig_crest", "#b3201f", 0.5)
        for dy in (-0.011, 0.011):
            parts.append(span("leg", x - 0.008, x + 0.008, y + dy - 0.008, y + dy + 0.008, z0, z0 + 0.04, steel, bevel=0.002))
        parts += [span("hips", x - 0.012, x + 0.012, y - 0.02, y + 0.02, z0 + 0.038, z0 + 0.05, steel, bevel=0.002),
                  span("chest", x - 0.016, x + 0.016, y - 0.026, y + 0.026, z0 + 0.05, z0 + 0.094, steel, bevel=0.004),
                  span("pauldron_l", x - 0.012, x + 0.012, y - 0.036, y - 0.02, z0 + 0.08, z0 + 0.096, steel, bevel=0.004),
                  span("pauldron_r", x - 0.012, x + 0.012, y + 0.02, y + 0.036, z0 + 0.08, z0 + 0.096, steel, bevel=0.004),
                  span("helmet", x - 0.014, x + 0.014, y - 0.014, y + 0.014, z0 + 0.096, z0 + 0.124, steel, bevel=0.004),
                  cone("spike", 0.004, 0.02, (x - 0.004, y, z0 + 0.134), steel),
                  span("crest", x - 0.016, x - 0.012, y - 0.003, y + 0.003, z0 + 0.1, z0 + 0.13, red)]
        for dy in (-0.004, 0.004):
            parts.append(span("eye", x + 0.014, x + 0.0146, y + dy - 0.002, y + dy + 0.002, z0 + 0.108, z0 + 0.112, mat("fig_eyeglow", "#ffcf6b", 0.3)))
        for dy, ang in ((-0.03, -10), (0.03, 10)):
            parts.append(cyl("arm", 0.0065, 0.036, (x, y + dy, z0 + 0.064), steel, rot=(ang, 0, 0), seg=10))
    else:
        top = mat(f"fig_{f['top']}", f["top"], 0.5); bottom = mat(f"fig_{f['bottom']}", f["bottom"], 0.5)
        hair = mat(f"fig_{f['hair_c']}", f["hair_c"], 0.4); shoes = mat(f"fig_{f['shoes']}", f["shoes"], 0.45)
        for dy in (-0.009, 0.009):
            parts += [cyl("shoe", 0.007, 0.008, (x, y + dy, z0 + 0.004), shoes, seg=10),
                      cyl("leg", 0.0072, 0.03, (x, y + dy, z0 + 0.023), bottom, seg=10)]
        torso_len = 0.05 if f.get("coat") else 0.032
        parts.append(cyl("torso", 0.017, torso_len, (x, y, z0 + 0.078 - torso_len / 2), top, seg=16))
        if f.get("coat"): parts.append(cyl("coat_hem", 0.02, 0.012, (x, y, z0 + 0.034), top, seg=16))
        if f.get("hood"): parts.append(cyl("hood", 0.016, 0.008, (x - 0.004, y, z0 + 0.08), mat("fig_hood", f["hood"], 0.5), seg=14))
        if f.get("tie"): parts.append(span("tie", x + 0.0165, x + 0.0175, y - 0.003, y + 0.003, z0 + 0.052, z0 + 0.076, mat("fig_tie", f["tie"], 0.5)))
        if f.get("buttons"):
            for k in range(3): parts.append(sphere("button", 0.0018, (x + 0.017, y, z0 + 0.054 + k * 0.009), mat("fig_gold", "#d9a441", 0.3, 0.8), seg=8))
        for dy, ang in ((-0.022, -12), (0.022, 12)):
            parts.append(cyl("arm", 0.0052, 0.032, (x, y + dy, z0 + 0.064), top, rot=(ang, 0, 0), seg=8))
            parts.append(sphere("hand", 0.0055, (x, y + dy * 1.15, z0 + 0.047), skin, seg=10))
        parts.append(sphere("head", 0.017, (x, y, z0 + 0.097), skin))
        hc = Vector((x - 0.002, y, z0 + 0.1))
        style = f["hair"]
        if style in ("spiky", "spiky_up"):
            spikes = ((0, -15, 0.04), (-35, -15, 0.036), (35, -15, 0.036), (-60, 0, 0.03), (60, 0, 0.03), (0, -50, 0.034), (-25, -45, 0.03), (25, -45, 0.03))
            if style == "spiky_up": spikes = tuple((ax * 0.5, ay * 0.4, ln * 1.1) for ax, ay, ln in spikes)
            for ax, ay, ln in spikes:
                d = (Euler((math.radians(ax), math.radians(ay), 0)).to_matrix() @ Vector((0, 0, 1))).normalized()
                parts.append(cone("spike", 0.008, ln, tuple(hc + d * (0.012 + ln / 2)), hair, rot=(ax, ay, 0)))
            parts.append(sphere("hair_cap", 0.0178, (x - 0.004, y, z0 + 0.101), hair, scale=(1, 1, 0.85)))
        elif style == "bowl":     # a straight-cut bowl, low over the eyes
            parts.append(sphere("hair_cap", 0.0186, (x - 0.001, y, z0 + 0.1), hair, scale=(1, 1, 0.9)))
            parts.append(cyl("fringe", 0.0186, 0.006, (x, y, z0 + 0.103), hair, seg=24))
        else:
            parts.append(sphere("hair_cap", 0.018, (x - 0.004, y, z0 + 0.103), hair, scale=(1, 1, 0.8)))
            if style == "braid":
                parts.append(cyl("braid", 0.0035, 0.03, (x - 0.019, y, z0 + 0.078), hair, rot=(0, 15, 0), seg=8))
                parts.append(cone("ahoge", 0.003, 0.014, (x, y, z0 + 0.122), hair, rot=(0, -20, 0)))
        if f.get("blindfold"):
            parts.append(cyl("blindfold", 0.0175, 0.008, (x, y, z0 + 0.1), black, seg=24))
        else:
            for dy in (-0.006, 0.006):
                parts.append(sphere("eye", 0.0022, (x + 0.0158, y + dy, z0 + 0.097), black, seg=8))
    o = join(name, parts)
    bpy.context.view_layer.update()
    o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
    o.data.transform(Matrix.Translation(-Vector((x, y, z)))); o.location = (x, y, z)
    o.rotation_euler.z = math.radians(180 + random.uniform(-14, 14))      # built facing +x; face the room
    return o

# on the eye-level shelf, in a row before the books
ay0, ay1 = sb_lo.y + 0.09, (sb_lo.y + sb_hi.y) / 2 - 0.06   # the bay before the post
step = (ay1 - ay0) / (len(ANIME) - 1)
def surface_below(x, y, z_from):
    """The top of whatever is under (x, y): this bay's board sits lower than the books' one."""
    bpy.context.view_layer.update()
    hit, loc, *_ = scene.ray_cast(bpy.context.evaluated_depsgraph_get(), Vector((x, y, z_from)), Vector((0, 0, -1)), distance=0.5)
    return loc.z if hit else REAL_BOARD
# The shelf's boards are staggered: the eye-level one only spans the books' bay. Give the figurines' bay a
# board of its own, the same plank mirrored about the centre post, in the shelf's own material.
def eye_board():
    faces = [p for p in shelf.data.polygons if p.normal.z > 0.95 and abs((shelf.matrix_world @ p.center).z - REAL_BOARD) < 0.01]
    pts = [shelf.matrix_world @ shelf.data.vertices[v].co for p in faces for v in p.vertices]
    lo, hi = Vector(map(min, *pts)), Vector(map(max, *pts))
    mat = shelf.material_slots[max(set(p.material_index for p in faces), key=[p.material_index for p in faces].count)].material
    return lo, hi, mat
b_lo, b_hi, b_mat = eye_board()
post = (sb_lo.y + sb_hi.y) / 2
print("EYE BOARD", [round(v, 3) for v in (*b_lo, *b_hi)], "post", round(post, 3))
plank = span("fig_board", b_lo.x, b_hi.x, 2 * post - b_hi.y, min(2 * post - b_lo.y, b_lo.y - 0.002), REAL_BOARD - 0.022, REAL_BOARD, b_mat)
STATIC_SHELL.append(plank)
BAY_BOARD = REAL_BOARD
for k, (nm, spec) in enumerate(ANIME):
    STATIC_PROPS.append(anime_figure(nm, (xb - 0.07 - (0.02 if k % 2 else 0), ay0 + k * step, BAY_BOARD), spec))

desk_books = []
zb = TOP
for k, src in enumerate(sorted(book_src, key=lambda o: -o.dimensions.y * o.dimensions.z)[:7]):
    if src.dimensions.z > 0.3: continue
    b = src.copy(); b.data = src.data.copy(); link(b)
    dx, dy, dz = src.dimensions
    # lying flat: spine toward the visitor, a little twist each
    b.matrix_world = Matrix.Translation((0.86 + random.uniform(-0.012, 0.012), 1.86, zb + dx / 2)) @ Matrix.Rotation(math.radians(random.uniform(-7, 7)), 4, "Z") @ Matrix.Rotation(math.radians(90), 4, "Z") @ Matrix.Rotation(math.radians(90), 4, "Y")
    zb += dx; desk_books.append(b)
db = join("desk_books", desk_books); decimate(db, 0.15); STATIC_PROPS.append(db)
for o in book_src + [ency]: bpy.data.objects.remove(o)
decimate(books_obj, 0.1)
STATIC_SHELL.append(books_obj)

# ------------------------------------------------------------------ paper things: badge, résumé tray, phone
def badge():
    card = box("badge_card", (0.054, 0.086, 0.0015), (0, 0, 0.001), M["paper"], bevel=0.002)
    face = None
    # lanyard: a ribbon curling off the top of the card
    pts = [(0, 0.05, 0.002), (0.03, 0.12, 0.002), (0.11, 0.15, 0.002), (0.17, 0.09, 0.002), (0.15, 0.02, 0.002)]
    cu = bpy.data.curves.new("lanyard", "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("NURBS"); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    sp.use_endpoint_u = True; sp.order_u = 3
    cu.extrude = 0.008; cu.resolution_u = 16
    rib = link(bpy.data.objects.new("lanyard", cu)); rib.data.materials.append(M["lanyard"])
    o = join("badge", [card, rib]); return o
b = badge(); b.location = (0.62, 1.40, TOP); b.rotation_euler.z = math.radians(-24); MOVERS.append(b)
bpy.context.view_layer.update()
bf = plane("badge_face", 0.052, 0.084, (0, 0, 0), rot=(0, 0, 0), mat=principled("badge_white", (0.8, 0.8, 0.8), 0.35))
bf.matrix_world = b.matrix_world @ Matrix.Translation((0, 0, 0.0019)); bf["image"] = "badge.png"; parent_keep(bf, b); DYN.append(bf)

def resume_tray(cx, cy):
    parts = [span("tray_b", cx - 0.125, cx + 0.125, cy - 0.165, cy + 0.165, TOP, TOP + 0.004, M["wire"])]
    for sx in (-1, 1):
        parts.append(span("tray_s", cx + sx * 0.125 - 0.003, cx + sx * 0.125 + 0.003, cy - 0.165, cy + 0.165, TOP, TOP + 0.035, M["wire"]))
    parts.append(span("tray_k", cx - 0.125, cx + 0.125, cy + 0.162, cy + 0.168, TOP, TOP + 0.035, M["wire"]))
    t = join("tray", parts)
    stack = span("paper_stack", cx - 0.104, cx + 0.104, cy - 0.147, cy + 0.147, TOP + 0.004, TOP + 0.010, M["paper"])
    stack.name = "resume"
    top = plane("resume_page", 0.21, 0.297, (cx, cy, TOP + 0.0105), rot=(0, 0, 0), mat=principled("resume_white", (0.8, 0.8, 0.8), 0.8))
    top["image"] = "resume.png"; parent_keep(top, stack); DYN.append(top)
    return t, stack
t, r = resume_tray(-0.74, 1.40); t.rotation_euler.z = r.rotation_euler.z = 0
STATIC_PROPS.append(t); MOVERS.append(r)

phone = box("phone", (0.074, 0.155, 0.008), (-0.42, 1.40, TOP + 0.004), M["phone"], rot=(0, 0, 11), bevel=0.006)
MOVERS.append(phone)
bpy.context.view_layer.update()
ps = plane("phone_screen", 0.066, 0.145, (0, 0, 0), rot=(0, 0, 0), mat=principled("phone_glass", (0.02, 0.02, 0.025), 0.15))
ps.matrix_world = phone.matrix_world @ Matrix.Translation((0, 0, 0.0042)); parent_keep(ps, phone); DYN.append(ps)

# ------------------------------------------------------------------ the laptop, open behind the keyboard
def crt(cx, cy):
    """An old beige CRT monitor on a swivel foot, like the one on Felix's desk: its screen is a live
    surface (the page draws a terminal on it, through a CRT shader), and it glows in the bake so the
    desk in front of it catches its light. A Polaroid is taped to the bezel."""
    C = Matrix.Translation((cx, cy, TOP)) @ Matrix.Rotation(math.radians(-4), 4, "Z")
    beige = principled("crt_beige", srgb("#d8cfbd"), 0.55)
    dark = principled("crt_dark", srgb("#2a2824"), 0.4)
    W, Hh, D = 0.37, 0.32, 0.05          # the front bezel
    z0 = 0.045                           # it stands on a swivel foot
    parts = [
        cyl("foot", 0.11, 0.018, (0, 0.06, 0.009), beige, seg=40),
        cyl("neck", 0.05, 0.03, (0, 0.06, 0.03), beige, seg=24),
        span("bezel", -W / 2, W / 2, -D / 2, D / 2, z0, z0 + Hh, beige, bevel=0.012),
        span("body", -0.15, 0.15, D / 2 - 0.005, D / 2 + 0.2, z0 + 0.025, z0 + Hh - 0.02, beige, bevel=0.02),
        span("tube", -0.1, 0.1, D / 2 + 0.19, D / 2 + 0.29, z0 + 0.07, z0 + Hh - 0.07, beige, bevel=0.02),
        # the recess around the glass, and the badge and buttons under it
        span("recess", -0.152, 0.152, -D / 2 - 0.002, -D / 2 + 0.006, z0 + 0.062, z0 + Hh - 0.022, dark, bevel=0.004),
        span("badge", -0.03, 0.03, -D / 2 - 0.003, -D / 2, z0 + 0.03, z0 + 0.042, dark),
        span("led", 0.13, 0.138, -D / 2 - 0.004, -D / 2, z0 + 0.034, z0 + 0.04, principled("crt_led", (0, 0, 0), emit=srgb("#ffb000"), strength=6)),
    ]
    for k in range(3):
        parts.append(cyl("knob", 0.006, 0.006, (0.08 + k * 0.016, -D / 2 - 0.002, z0 + 0.037), dark, rot=(90, 0, 0), seg=12))
    m = join("crt", parts); m.matrix_world = C @ m.matrix_world
    # the glass: 4:3, a little inside the recess; bright amber in the bake
    sw, sh = 0.284, 0.213
    scr = plane("crt_screen", sw, sh, (0, 0, 0), mat=principled("crt_glow", (0, 0, 0), emit=srgb("#ffb347"), strength=1.6))
    scr.matrix_world = C @ Matrix.Translation((0, -D / 2 - 0.0035, z0 + 0.062 + (Hh - 0.084) / 2)) @ Matrix.Rotation(math.radians(90), 4, "X")
    # a Polaroid taped to the bezel's top right corner, tilted
    pol = C @ Matrix.Translation((0.152, -D / 2 - 0.004, z0 + Hh - 0.035)) @ Matrix.Rotation(math.radians(-8), 4, "Y")
    frame = box("polaroid", (0.07, 0.0012, 0.084), (0, 0, 0), principled("polaroid_white", srgb("#f3f1ea"), 0.7))
    frame.matrix_world = pol @ frame.matrix_world
    tape = box("tape", (0.03, 0.0008, 0.012), (0, 0, 0), principled("tape", srgb("#e9e1c8"), 0.8))
    tape.matrix_world = pol @ Matrix.Translation((0, -0.0006, 0.041)) @ Matrix.Rotation(math.radians(6), 4, "Y")
    photo = plane("polaroid_photo", 0.06, 0.06, (0, 0, 0), mat=principled("photo_white", (0.8, 0.8, 0.8), 0.6))
    photo.matrix_world = pol @ Matrix.Translation((0, -0.0007, 0.008)) @ Matrix.Rotation(math.radians(90), 4, "X")
    photo["image"] = "me.png"
    STATIC_PROPS.extend([m, frame, tape]); DYN.extend([scr, photo])
crt(0.30, 1.80)

# ------------------------------------------------------------------ live surfaces: calendar, projector screen, posters
cal_x0, cal_x1, cal_z0, cal_z1 = 0.80, 1.80, 1.10, 2.20
STATIC_PROPS.append(span("calendar_board", cal_x0 - 0.015, cal_x1 + 0.015, BACK - 0.012, BACK, cal_z0 - 0.015, cal_z1 + 0.015, M["foam"], bevel=0.002))
for x in (cal_x0 + 0.1, cal_x1 - 0.1):
    STATIC_PROPS.append(span("clip", x - 0.025, x + 0.025, BACK - 0.02, BACK - 0.012, cal_z1 - 0.02, cal_z1 + 0.03, M["clip"]))
DYN.append(plane("calendar", cal_x1 - cal_x0, cal_z1 - cal_z0, ((cal_x0 + cal_x1) / 2, BACK - 0.013, (cal_z0 + cal_z1) / 2), mat=principled("cal_white", (0.8, 0.8, 0.8), 0.9)))

# the projector screen's own cloth is replaced by a clean rectangle the case studies are drawn on
lo, hi = bounds(screen)
sc_c = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, 0))
SCREEN_W, SCREEN_H, SCREEN_Z = 1.0, 0.75, 1.30
scr = plane("screen", SCREEN_W, SCREEN_H, (0, 0, 0), mat=principled("screen_white", (0.8, 0.8, 0.8), 0.95))
# the stand's cloth faces -y in its own frame, turned 200 degrees: the picture faces the room
scr.matrix_world = Matrix.Translation((-1.62, 1.35, SCREEN_Z)) @ Matrix.Rotation(math.radians(200), 4, "Z") @ Matrix.Translation((0, 0.012, 0)) @ Matrix.Rotation(math.radians(-90), 4, "X") @ Matrix.Rotation(math.radians(180), 4, "Z")
DYN.append(scr)

posters = sorted(glob.glob("assets/room/posters/*.jpg"))
def poster(i, path, loc, rot_z, height):
    import struct
    img = bpy.data.images.load(os.path.abspath(path)); aspect = img.size[0] / img.size[1]
    fr = import_model("hanging_picture_frame_01", (0, 0, 0), name=f"poster_frame_{i}")["main"]
    delete_material_faces(fr, "_glass")
    s = height / 0.841; fr.scale = (height * aspect / 0.594 * 1.08, 1, s);
    bpy.context.view_layer.objects.active = fr; fr.select_set(True); bpy.ops.object.transform_apply(scale=True); fr.select_set(False)
    fr.matrix_world = Matrix.Translation(loc) @ Matrix.Rotation(math.radians(rot_z), 4, "Z")
    art = plane(f"poster_{i}", height * aspect * 0.86, height * 0.86, (0, 0, 0), mat=principled(f"poster_white_{i}", (0.8, 0.8, 0.8), 0.6))
    art.matrix_world = Matrix.Translation(loc) @ Matrix.Rotation(math.radians(rot_z), 4, "Z") @ Matrix.Translation((0, -0.0125, 0)) @ Matrix.Rotation(math.radians(90), 4, "X")
    art["image"] = os.path.basename(path)
    STATIC_PROPS.append(fr); DYN.append(art)
    # a brass picture light on a short arm above it, and its light
    brass = M.setdefault("brass", principled("brass", (0.62, 0.42, 0.18), 0.3, 1.0))
    pw = height * aspect * 0.9
    R_ = Matrix.Translation(loc) @ Matrix.Rotation(math.radians(rot_z), 4, "Z")
    top = height / 2 + 0.07
    bar = cyl(f"picture_light_{i}", 0.014, pw * 0.75, (0, 0, 0), brass, rot=(0, 90, 0), seg=20)
    bar.matrix_world = R_ @ Matrix.Translation((0, -0.11, top)) @ Matrix.Rotation(math.radians(90), 4, "Y")
    arm = cyl("arm", 0.004, 0.11, (0, 0, 0), brass, seg=10)
    arm.matrix_world = R_ @ Matrix.Translation((0, -0.055, top + 0.012)) @ Matrix.Rotation(math.radians(90), 4, "X")
    base_ = cyl("rose", 0.016, 0.01, (0, 0, 0), brass, seg=16)
    base_.matrix_world = R_ @ Matrix.Translation((0, -0.005, top + 0.012)) @ Matrix.Rotation(math.radians(90), 4, "X")
    STATIC_PROPS.append(join(f"picture_light_{i}", [bar, arm, base_]))
    ld = bpy.data.lights.new(f"pl_{i}", "AREA"); ld.shape = "RECTANGLE"; ld.size = pw * 0.7; ld.size_y = 0.02
    ld.energy = 9 * pw; ld.color = (1.0, 0.78, 0.55)
    lo = link(bpy.data.objects.new(f"pl_{i}", ld))
    lo.matrix_world = R_ @ Matrix.Translation((0, -0.1, top - 0.02)) @ Matrix.Rotation(math.radians(35), 4, "X")
# right wall above the shelves, left wall over the projector table
P = posters
spots = [((X1 - 0.005, -0.45, 2.12), -90, 0.52), ((X1 - 0.005, 0.25, 2.18), -90, 0.62), ((X1 - 0.005, 0.95, 2.12), -90, 0.52),
         ((X0 + 0.005, -1.15, 1.55), 90, 0.5), ((X0 + 0.005, -0.4, 1.62), 90, 0.62), ((X0 + 0.005, 0.35, 1.55), 90, 0.42)]
# the crude one hangs smallest, at the far edge
order = sorted(P, key=lambda p: "2cd6316f" in p)
for i, (path, (loc, rz, h)) in enumerate(zip(order, spots)):
    poster(i, path, loc, rz, h)

# ------------------------------------------------------------------ wall clock
def disc(name, r, mat=None, seg=64):
    """A flat disc in XY with 0..1 UVs across it."""
    bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=seg, radius=r)
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        for l in f.loops: l[uv].uv = (l.vert.co.x / (2 * r) + 0.5, l.vert.co.y / (2 * r) + 0.5)
    return mesh_obj(name, bm, mat)

CLOCK_C = Vector((X1 - 0.004, 1.42, 1.98)); CLOCK_R = 0.16
# the clock's own frame: local z out of the wall (towards -x), local y up
CLOCK_M = Matrix.Translation(CLOCK_C) @ Matrix(((0, 0, -1, 0), (-1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
rim = cyl("clock", CLOCK_R + 0.012, 0.042, (0, 0, 0), M["steel"], seg=64)
rim.matrix_world = CLOCK_M @ Matrix.Translation((0, 0, 0.021))
STATIC_PROPS.append(rim)
face = disc("clock_face", CLOCK_R, principled("clock_white", (0.8, 0.8, 0.8), 0.6))
face.matrix_world = CLOCK_M @ Matrix.Translation((0, 0, 0.0425)); face["image"] = "clock_face.png"; DYN.append(face)
red = principled("clock_red", srgb("#c8412d"), 0.4)
for name, length, width, zoff, mat in (("hour", 0.085, 0.009, 0.046, M["clip"]), ("minute", 0.13, 0.006, 0.049, M["clip"]), ("second", 0.14, 0.0022, 0.052, red)):
    hand = span(f"clock_{name}", -width / 2, width / 2, -0.025, length, -0.0012, 0.0012, mat)
    if name == "second":
        hand = join("clock_second", [hand, cyl("pin", 0.007, 0.003, (0, 0, 0.001), red, seg=20)])
    bpy.context.view_layer.update()
    hand.data.transform(hand.matrix_world); hand.matrix_world = CLOCK_M @ Matrix.Translation((0, 0, zoff))
    MOVERS.append(hand)
# its AA battery, hidden behind the face until a click knocks it out
bat = join("clock_battery", [cyl("bat", 0.007, 0.046, (0, 0, 0), principled("battery", srgb("#1c1c1e"), 0.35, 0.2), seg=20),
                             cyl("cap", 0.0045, 0.004, (0, 0, 0.025), M["gold"], seg=16)])
bat.matrix_world = CLOCK_M @ Matrix.Translation((0, -0.09, 0.02)) @ Matrix.Rotation(math.radians(90), 4, "Y")
MOVERS.append(bat)

# ------------------------------------------------------------------ lights
def light(name, kind, loc, energy, color, size=0.05, aim=None, spot=None, blend=0.3):
    ld = bpy.data.lights.new(name, kind); ld.energy = energy; ld.color = color
    if kind in ("POINT", "SPOT"): ld.shadow_soft_size = size
    if kind == "AREA": ld.size = size
    if spot: ld.spot_size = math.radians(spot); ld.spot_blend = blend
    o = link(bpy.data.objects.new(name, ld)); o.location = loc
    if aim: o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o

warm = (1.0, 0.70, 0.42)
light("lamp_spot", "SPOT", bulb + Vector((0, 0, -0.02)), 150, warm, 0.03, aim=(-0.2, 1.55, TOP), spot=130, blend=0.9)
light("lamp_glow", "POINT", bulb + Vector((0, 0, 0.04)), 8, warm, 0.05)
for m in lamp.data.materials:
    if m and "_light" in m.name:
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Emission Color"].default_value = (1, 0.8, 0.55, 1); bsdf.inputs["Emission Strength"].default_value = 30
lens = material_centroid(proj["main"], "projector") or Vector((-1.85, -0.2, 0.7))
lens = Vector((-1.85, -0.18, 0.66))
light("projector_beam", "SPOT", lens, 80, (0.92, 0.95, 1.0), 0.01, aim=scr.matrix_world.translation, spot=40, blend=0.25)
# the city: a glowing backdrop outside the window lights the room cold blue
city = plane("city_light", 6, 3.2, (xm, BACK + 1.2, 1.4), mat=None)
cm = principled("city_emit", (0, 0, 0), emit=srgb("#2c3f6e"), strength=1.4); city.data.materials.append(cm)
light("window_fill", "AREA", (xm, BACK + 0.15, 1.7), 10, srgb("#7d9bd6"), size=1.6, aim=(xm, 0, 0.9))
light("ambient", "AREA", (0, -0.8, H - 0.05), 6, (1.0, 0.80, 0.60), size=2.5, aim=(0, -0.8, 0))
light("shelf_lamp", "POINT", (X1 - 0.3, 1.6, 1.9), 18, warm, 0.1)        # a lamp on top of the shelves, off-camera
world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.005, 0.008, 0.02, 1)

# home view (shared with the runtime: three.js camera = this, Y-up)
HOME = dict(pos=(0.30, -0.55, 1.45), look=(0.22, 2.0, 1.2), fov=42)   # fov: vertical degrees
cam = link(bpy.data.objects.new("cam", bpy.data.cameras.new("cam")))
cam.location = HOME["pos"]; cam.rotation_euler = (Vector(HOME["look"]) - Vector(HOME["pos"])).to_track_quat("-Z", "Y").to_euler()
cam.data.sensor_fit = "VERTICAL"; cam.data.angle_y = math.radians(HOME["fov"])
scene.camera = cam

for o in list(scene.objects):
    if o.type in ("MESH", "CURVE") and o.modifiers:
        bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target="MESH"); o.select_set(False)

# ------------------------------------------------------------------ preview
if MODE == "preview":
    scene.render.resolution_x, scene.render.resolution_y = (int(ARGS[2]) if len(ARGS) > 2 else 1280), 720
    scene.cycles.samples = 96; scene.cycles.use_denoising = True
    scene.render.filepath = os.path.abspath(ARGS[1] if len(ARGS) > 1 else "/tmp/room_preview.png")
    if len(ARGS) > 3:   # a named view: x,y,z:lx,ly,lz
        p, l = (Vector(map(float, s.split(","))) for s in ARGS[3].split(":"))
        cam.location = p; cam.rotation_euler = (l - p).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.render.render(write_still=True)
    print("PREVIEW", scene.render.filepath)
    sys.exit(0)

# ------------------------------------------------------------------ bake + export (see bake section)
exec(open("scripts/room/bake.py").read())
