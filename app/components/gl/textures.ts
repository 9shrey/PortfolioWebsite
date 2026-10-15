"use client";

import * as THREE from "three";
import { C0, INTERPOSER, LOT, NOC_HUB, SUBSTRATE, TOTALS, TOWERS, generateCells } from "@/app/data/package";

/** Every texture on the package is drawn here, once, from seeded noise —
 *  nothing is fetched. Cached per (name, size) and disposed on unmount. */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function finish(key: string, c: HTMLCanvasElement, srgb: boolean, opts: { repeat?: [number, number] } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  cache.set(key, t);
  return t;
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}

/** Display + mono families as the page loaded them (next/font hashes the
 *  names), so canvas text uses the real fonts with no network fallback. */
export function fontFamily(v: "--font-display" | "--font-sans" | "--font-mono") {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return raw || (v === "--font-mono" ? "monospace" : "sans-serif");
}

/* ---------------------------------------------------------------- substrate */

export function substrate(size: number) {
  const key = `substrate:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = size;
  const H = Math.round((size * SUBSTRATE.d) / SUBSTRATE.w);
  const [c, g] = canvas(W, H);
  const u = W / SUBSTRATE.w;
  const rand = mulberry32(17);
  g.fillStyle = "#0b120f";
  g.fillRect(0, 0, W, H);
  // Gold fan-out traces radiating from the interposer edge to the margin.
  g.strokeStyle = "rgba(184,144,47,0.55)";
  g.lineWidth = Math.max(1, u * 0.03);
  const ix0 = (SUBSTRATE.w - INTERPOSER.w) / 2;
  const iz0 = (SUBSTRATE.d - INTERPOSER.d) / 2;
  for (let i = 0; i < 160; i++) {
    const side = i % 4;
    const t = rand();
    let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    if (side === 0) { x0 = (ix0 + t * INTERPOSER.w) * u; y0 = iz0 * u; x1 = x0 + (rand() - 0.5) * u * 1.4; y1 = 0.35 * u; }
    if (side === 1) { x0 = (ix0 + t * INTERPOSER.w) * u; y0 = (iz0 + INTERPOSER.d) * u; x1 = x0 + (rand() - 0.5) * u * 1.4; y1 = H - 0.35 * u; }
    if (side === 2) { y0 = (iz0 + t * INTERPOSER.d) * u; x0 = ix0 * u; y1 = y0 + (rand() - 0.5) * u * 1.4; x1 = 0.35 * u; }
    if (side === 3) { y0 = (iz0 + t * INTERPOSER.d) * u; x0 = (ix0 + INTERPOSER.w) * u; y1 = y0 + (rand() - 0.5) * u * 1.4; x1 = W - 0.35 * u; }
    g.beginPath();
    g.moveTo(x0, y0);
    const mx = side < 2 ? x0 : (x0 + x1) / 2;
    const my = side < 2 ? (y0 + y1) / 2 : y0;
    g.lineTo(mx, my);
    g.lineTo(x1, y1);
    g.stroke();
    g.fillStyle = "rgba(233,195,118,0.8)";
    g.beginPath();
    g.arc(x1, y1, u * 0.05, 0, Math.PI * 2);
    g.fill();
  }
  // Silkscreen.
  g.fillStyle = "rgba(220,226,214,0.55)";
  g.font = `600 ${Math.round(u * 0.32)}px ${fontFamily("--font-mono")}`;
  g.textBaseline = "alphabetic";
  g.fillText("SS-26", u * 0.5, H - u * 0.5);
  g.font = `500 ${Math.round(u * 0.18)}px ${fontFamily("--font-mono")}`;
  g.fillText(`${TOTALS.projects} CORES · ${TOTALS.tests} TESTS`, u * 0.5, H - u * 0.25);
  // Pin-1 triangle.
  g.beginPath();
  g.moveTo(u * 0.3, u * 0.3);
  g.lineTo(u * 0.75, u * 0.3);
  g.lineTo(u * 0.3, u * 0.75);
  g.closePath();
  g.fill();
  return finish(key, c, true);
}

/* --------------------------------------------------------------- interposer */

export function interposer(size: number) {
  const key = `interposer:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = size;
  const H = Math.round((size * INTERPOSER.d) / INTERPOSER.w);
  const [c, g] = canvas(W, H);
  const rand = mulberry32(5);
  g.fillStyle = "#6b7280";
  g.fillRect(0, 0, W, H);
  // Dense redistribution routing — fine horizontal/vertical runs.
  for (let i = 0; i < 900; i++) {
    const v = 90 + rand() * 70;
    g.strokeStyle = `rgba(${v},${v + 6},${v + 14},0.5)`;
    g.lineWidth = 1 + rand() * 1.5;
    const x = rand() * W;
    const y = rand() * H;
    const len = (20 + rand() * 160) * (W / 1024);
    g.beginPath();
    g.moveTo(x, y);
    if (rand() > 0.5) g.lineTo(x + len, y);
    else g.lineTo(x, y + len);
    g.stroke();
  }
  return finish(key, c, true);
}

/* ---------------------------------------------------------------- die floor */

/** C0 top: standard-cell rows with the city's footprints baked in as soft
 *  contact shadows, so the buildings sit *on* the silicon. */
export function dieFloor(size: number) {
  const key = `diefloor:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const dw = C0.x1 - C0.x0;
  const dd = C0.z1 - C0.z0;
  const W = size;
  const H = Math.round((size * dd) / dw);
  const [c, g] = canvas(W, H);
  const u = W / dw;
  const rand = mulberry32(11);
  g.fillStyle = "#0f141d";
  g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 6) {
    g.fillStyle = (y / 6) % 2 ? "#121925" : "#0f141d";
    g.fillRect(0, y, W, 3);
    let x = 0;
    while (x < W) {
      const w = 3 + rand() * 14;
      if (rand() > 0.5) {
        g.fillStyle = `rgba(40,52,70,${0.2 + rand() * 0.3})`;
        g.fillRect(x, y, w - 1, 3);
      }
      x += w;
    }
  }
  const toPx = (x: number, z: number) => [(x - C0.x0) * u, (z - C0.z0) * u] as const;
  const shadow = (x: number, z: number, w: number, d: number, a: number) => {
    const [px, pz] = toPx(x - w / 2, z - d / 2);
    try {
      g.filter = "blur(6px)";
      g.fillStyle = `rgba(0,0,0,${a})`;
      g.fillRect(px - 2, pz - 2, w * u + 4, d * u + 4);
      g.filter = "none";
    } catch {
      for (let k = 0; k < 3; k++) {
        g.fillStyle = "rgba(0,0,0,0.2)";
        g.fillRect(px - k * 2, pz - k * 2, w * u + k * 4, d * u + k * 4);
      }
    }
  };
  const cells = generateCells();
  for (let i = 0; i < cells.count; i++) {
    const o = i * 5;
    shadow(cells.data[o], cells.data[o + 1], cells.data[o + 2], cells.data[o + 3], 0.55);
  }
  for (const t of TOWERS) shadow(t.x, t.z, LOT, LOT, 0.75);
  shadow(NOC_HUB[0], NOC_HUB[1], 1.4, 1.4, 0.6);
  return finish(key, c, true);
}

/* ---------------------------------------------------------------------- lid */

export function lidBrushed(size: number) {
  const key = `lidbrushed:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(size, size);
  const rand = mulberry32(3);
  g.fillStyle = "#7f7f7f";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 4; i++) {
    const y = rand() * size;
    const v = 96 + rand() * 72;
    g.strokeStyle = `rgba(${v},${v},${v},${0.18 + rand() * 0.3})`;
    g.lineWidth = rand() * 1.3;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(size, y + (rand() - 0.5) * 2);
    g.stroke();
  }
  return finish(key, c, false, { repeat: [2, 1] });
}

/** Laser etch on the lid — white = etched. Only true statements. */
export function lidEtch(size: number) {
  const key = `lidetch:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = size;
  const H = Math.round((size * 7) / 12);
  const [c, g] = canvas(W, H);
  const u = W / 12;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff";
  const disp = fontFamily("--font-display");
  const mono = fontFamily("--font-mono");
  g.textBaseline = "alphabetic";
  g.font = `600 ${Math.round(u * 0.42)}px ${mono}`;
  g.fillText("SS-26", u * 0.8, u * 1.3);
  g.font = `900 ${Math.round(u * 1.55)}px ${disp}`;
  g.fillText("SHREY SINGH", u * 0.75, u * 3.4);
  g.font = `500 ${Math.round(u * 0.3)}px ${mono}`;
  g.fillText("AI/ML ENGINEER · BENGALURU", u * 0.8, u * 4.25);
  g.fillText(`${TOTALS.projects} PROJECTS · ${TOTALS.tests} TESTS · ${TOTALS.roles} ROLES`, u * 0.8, u * 4.8);
  // Pin-1 ▲ and a decorative seeded 18×18 dot matrix.
  g.beginPath();
  g.moveTo(u * 0.35, H - u * 0.35);
  g.lineTo(u * 0.75, H - u * 0.35);
  g.lineTo(u * 0.35, H - u * 0.75);
  g.closePath();
  g.fill();
  const rand = mulberry32(2026);
  const s = u * 0.11;
  for (let i = 0; i < 18; i++) {
    for (let j = 0; j < 18; j++) {
      if (rand() > 0.5) g.fillRect(W - u * 3 + i * s, H - u * 3 + j * s, s * 0.7, s * 0.7);
    }
  }
  return finish(key, c, false);
}

/* ------------------------------------------------------------- copper / misc */

export function copperStripes(size: number, horizontal: boolean) {
  const key = `copper:${size}:${horizontal}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(size, size);
  g.fillStyle = "#000";
  g.fillRect(0, 0, size, size);
  g.fillStyle = "#fff";
  const pitch = size / 64;
  for (let i = 0; i < 64; i++) {
    if (horizontal) g.fillRect(0, i * pitch, size, pitch * 0.55);
    else g.fillRect(i * pitch, 0, pitch * 0.55, size);
  }
  return finish(key, c, false);
}

/** Soft radial blob for fake contact shadows under parts. */
export function blob(size = 128) {
  const key = `blob:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(size, size);
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, "rgba(0,0,0,0.85)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return finish(key, c, false);
}
