// Downloads the room's CC0 source assets from Poly Haven into assets/room/src (gitignored).
// node scripts/room/fetch.mjs
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const OUT = "assets/room/src";
const MODELS = [
  "desk_lamp_arm_01", "potted_plant_02", "filmstrip_projector_8mm", "projector_screen",
  "steel_frame_shelves_03", "decorative_book_set_01", "book_encyclopedia_set_01",
  "hanging_picture_frame_01", "binder_notebook", "side_table_01",
];
const TEXTURES = ["laminate_floor_02", "beige_wall_001", "american_walnut_veneer"];
const RES = "1k";

async function exists(p) { try { await stat(p); return true; } catch { return false; } }
async function get(url, to) {
  if (await exists(to)) return;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, Buffer.from(await r.arrayBuffer()));
}
const files = async (id) => (await fetch(`https://api.polyhaven.com/files/${id}`)).json();

for (const id of MODELS) {
  const f = await files(id);
  // most models ship as glTF; a few (the book sets) only as .blend
  const kind = f.gltf ? "gltf" : "blend";
  const g = f[kind][RES][kind];
  const dir = join(OUT, "models", id);
  await get(g.url, join(dir, `${id}.${kind}`));
  for (const [rel, f] of Object.entries(g.include)) await get(f.url, join(dir, rel));
  console.log("model", id);
}
for (const id of TEXTURES) {
  const f = await files(id);
  const pick = { diff: f.Diffuse, nor: f.nor_gl, rough: f.Rough };
  for (const [k, v] of Object.entries(pick)) {
    const e = v?.[RES]?.jpg; if (!e) continue;
    await get(e.url, join(OUT, "textures", id, `${k}.jpg`));
  }
  console.log("texture", id);
}
