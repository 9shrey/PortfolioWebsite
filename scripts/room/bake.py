# Bake + export: run by build.py (exec'd at its end, sharing its names). Not a standalone script.
#
# Two atlases hold the room's finished, lit look (COMBINED bake, AgX-tonemapped like the preview):
#   shell  - walls, floor, desk, shelves and their books, curtains, window
#   props  - everything on the desk and around it, including the parts that move
# Live surfaces (calendar, projector screen, posters, card labels, badge, résumé) each get a small
# "shade" bake of a white stand-in instead; the page draws their picture and multiplies it by that shade.
#
# Output in public/room/: room.glb (geometry only), atlas_shell.webp, atlas_props.webp,
# shade_<name>.webp, posters/, labels/ and scene.json (camera, slots, anchors) in three.js coordinates.
import time, shutil

SIZE = int(ARGS[1]) if len(ARGS) > 1 else 4096
SAMPLES = int(ARGS[2]) if len(ARGS) > 2 else 256
os.makedirs(OUT, exist_ok=True)
t0 = time.time()

def log(*a): print(f"[bake {time.time() - t0:6.0f}s]", *a, flush=True)

scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = False
scene.render.bake.margin = 6
scene.render.bake.margin_type = "EXTEND"
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.quality = 90
scene.render.image_settings.color_mode = "RGB"

def three(v):
    """Blender Z-up -> three.js Y-up"""
    return [round(v[0], 4), round(v[2], 4), round(-v[1], 4)]

def select_only(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]

# ---------------------------------------------------------------- denoise via the compositor
def denoise_and_save(img, path):
    """Runs the image through the compositor's Denoise node and saves it with the scene's view
    transform (AgX), so the atlas looks like the preview render. Falls back to a plain save."""
    try:
        tree = bpy.data.node_groups.new("denoise", "CompositorNodeTree")
        tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        n_img = tree.nodes.new("CompositorNodeImage"); n_img.image = img
        n_dn = tree.nodes.new("CompositorNodeDenoise")
        n_out = tree.nodes.new("NodeGroupOutput")
        tree.links.new(n_img.outputs["Image"], n_dn.inputs["Image"])
        tree.links.new(n_dn.outputs["Image"], n_out.inputs[0])
        scene.compositing_node_group = tree
        scene.render.use_compositing = True
        engine = scene.render.engine; scene.render.engine = "BLENDER_WORKBENCH"
        scene.render.resolution_x, scene.render.resolution_y = img.size
        scene.render.resolution_percentage = 100
        hidden = [o for o in scene.objects if not o.hide_render]
        for o in hidden: o.hide_render = True
        bpy.ops.render.render()
        for o in hidden: o.hide_render = False
        scene.render.engine = engine
        bpy.data.images["Render Result"].save_render(os.path.abspath(path), scene=scene)
        bpy.data.node_groups.remove(tree); scene.compositing_node_group = None
        return True
    except Exception as e:   # older/newer compositor API: keep going without denoising
        log("denoise skipped:", e)
        img.save_render(os.path.abspath(path), scene=scene)
        return False

# ---------------------------------------------------------------- bake helpers
def prep_bake_targets(objs, img):
    """Every material on these objects gets an active image node pointing at img."""
    seen = set()
    for o in objs:
        for slot in o.material_slots:
            m = slot.material
            if not m or m.name in seen: continue
            seen.add(m.name)
            n = m.node_tree.nodes.new("ShaderNodeTexImage"); n.image = img; n.name = "__bake"
            for x in m.node_tree.nodes: x.select = False
            n.select = True; m.node_tree.nodes.active = n

def clear_bake_targets(objs):
    for o in objs:
        for slot in o.material_slots:
            m = slot.material
            if m and "__bake" in m.node_tree.nodes: m.node_tree.nodes.remove(m.node_tree.nodes["__bake"])

def bake(objs, img):
    prep_bake_targets(objs, img); select_only(objs)
    bpy.ops.object.bake(type="COMBINED", margin=scene.render.bake.margin, use_clear=True)
    clear_bake_targets(objs)

def unique_materials(groups):
    """A material used by two bake groups would get two image targets; copy it per group."""
    owner = {}
    for gi, objs in enumerate(groups):
        for o in objs:
            for slot in o.material_slots:
                m = slot.material
                if not m: continue
                if owner.setdefault(m.name, gi) != gi:
                    slot.material = m.copy()
                    owner[slot.material.name] = gi

def atlas_uvs(objs, margin, angle=60):
    for o in objs:
        uv = o.data.uv_layers.get("bake") or o.data.uv_layers.new(name="bake")
        o.data.uv_layers.active = uv
    select_only(objs)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=margin, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.uv.pack_islands(margin=margin, rotate=True)
    bpy.ops.object.mode_set(mode="OBJECT")

# ---------------------------------------------------------------- groups
# Organic, many-island meshes (books, the plant) get atlases of their own, so they can't
# shrink the islands of everything else when packed.
def named(objs, *names): return [o for o in objs if o.name in names]
everything = [o for o in STATIC_SHELL + STATIC_PROPS + MOVERS if o and o.type == "MESH"]
GROUPS = [
    ("books", named(everything, "books", "desk_books"), SIZE // 2, 80),
    ("plant", named(everything, "plant"), SIZE // 4, 80),
]
taken = {o for _, objs, _, _ in GROUPS for o in objs}
GROUPS = [("shell", [o for o in STATIC_SHELL if o in everything and o not in taken], SIZE // 2, 60),
          ("props", [o for o in STATIC_PROPS + MOVERS if o in everything and o not in taken], SIZE, 60)] + GROUPS
for o in everything + DYN:            # every mesh needs its own data for its own UVs
    if o.data.users > 1: o.data = o.data.copy()
unique_materials([objs for _, objs, _, _ in GROUPS])

def coverage(img):
    import array
    px = array.array("f", [0.0]) * (img.size[0] * img.size[1] * 4); img.pixels.foreach_get(px)
    lit = sum(1 for i in range(0, len(px), 64) if px[i] + px[i + 1] + px[i + 2] > 1e-4)
    return lit / (len(px) / 64)

atlases = {}
for name, objs, size, angle in GROUPS:
    atlas_uvs(objs, 0.002, angle)
    img = bpy.data.images.new(f"atlas_{name}", size, size, float_buffer=True)
    log("baking", name, f"{len(objs)} objects, {sum(len(o.data.polygons) for o in objs)} faces, {size}px x {SAMPLES} samples")
    bake(objs, img)
    log("  coverage", round(coverage(img), 2))
    denoise_and_save(img, f"{OUT}/atlas_{name}.webp")
    atlases[name] = objs
    log("baked", name)

# live surfaces: a shade map each, over their own 0..1 UVs
shade = {}
for o in DYN:
    o.data.uv_layers.active = o.data.uv_layers["UVMap"]
    w, h = max(o.dimensions.x, 0.01), max(o.dimensions.y, 0.01)   # plane's own width and height
    side = 256 if max(w, h) < 0.3 else 512
    px = (side, max(16, round(side * h / w))) if w >= h else (max(16, round(side * w / h)), side)
    img = bpy.data.images.new(f"shade_{o.name}", *px, float_buffer=True)
    bake([o], img)
    img.save_render(os.path.abspath(f"{OUT}/shade_{o.name}.webp"), scene=scene)
    shade[o.name] = o.get("image")
log("baked", len(DYN), "live surfaces")

# ---------------------------------------------------------------- export
def flatten(objs, mat_name):
    m = bpy.data.materials.get(mat_name) or principled(mat_name)
    for o in objs:
        o.data.materials.clear(); o.data.materials.append(m)
        for uv in [u for u in o.data.uv_layers if u.name != "bake"]: o.data.uv_layers.remove(uv)
for name, objs in atlases.items(): flatten(objs, f"atlas_{name}")
for o in DYN:
    o.data.materials.clear(); o.data.materials.append(principled(f"live_{o.name}"))

keep = set(o for objs in atlases.values() for o in objs) | set(DYN)
for o in list(scene.objects):
    if o not in keep: bpy.data.objects.remove(o)

select_only(list(keep))
bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(f"{OUT}/room.glb"), export_format="GLB", use_selection=True,
    export_image_format="NONE", export_materials="EXPORT", export_normals=False,
    export_apply=True, export_yup=True,
)
log("exported room.glb")

# ---------------------------------------------------------------- pictures + scene.json
os.makedirs(f"{OUT}/posters", exist_ok=True); os.makedirs(f"{OUT}/labels", exist_ok=True)
for o in DYN:
    src = o.get("image")
    if not src: continue
    p = f"assets/room/posters/{src}" if os.path.exists(f"assets/room/posters/{src}") else f"{GEN}/{src}"
    shutil.copy(p, f"{OUT}/{'posters' if 'poster' in o.name else 'labels'}/{src}")

def anchor(o):
    mw = o.matrix_world
    return dict(pos=three(mw.translation), normal=three((mw.to_3x3() @ Vector((0, 0, 1))).normalized()),
                size=[round(o.dimensions.x, 4), round(o.dimensions.y, 4)])

info = dict(
    home=dict(pos=three(HOME["pos"]), look=three(HOME["look"]), fov=HOME["fov"]),
    slot=three(SLOT),
    bench=three(BENCH),
    bulb=three(bulb),
    lens=three(lens),
    window=dict(x0=WIN["x0"], x1=WIN["x1"], z0=WIN["z0"], z1=WIN["z1"], back=BACK),
    cards=[c["id"] for c in CARDS],
    live={o.name: dict(image=o.get("image"), **anchor(o)) for o in DYN},
    atlas=dict(size=SIZE, samples=SAMPLES),
)
json.dump(info, open(f"{OUT}/scene.json", "w"), indent=1)
log("done")
