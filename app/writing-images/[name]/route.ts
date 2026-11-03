import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/* Serves the images Obsidian pastes into writing/images/, so posts can embed them. */
const DIR = join(process.cwd(), "writing", "images");
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    return (await readdir(DIR)).map((name) => ({ name }));
  } catch {
    return [];
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const type = TYPES[name.split(".").pop()?.toLowerCase() ?? ""];
  if (!type || name.includes("/") || name.includes("..")) return new Response("Not found", { status: 404 });
  try {
    return new Response(await readFile(join(DIR, name)), { headers: { "Content-Type": type } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
