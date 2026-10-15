"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { fontFamily } from "./textures";
import type { V3 } from "@/app/data/package";

/** Etched labels: every string in a set is drawn into one canvas atlas with
 *  the fonts the page already loaded, and becomes a flat quad in one merged
 *  geometry → one draw call per set, no troika, no network. Every label
 *  duplicates text that exists in the HTML. */

export interface LabelDef {
  text: string;
  font?: "display" | "mono";
  weight?: number;
  /** World height of the cap line. */
  h: number;
  pos: V3;
  /** Euler XYZ. Default lies flat facing +y, reading along +x. */
  rot?: V3;
  anchor?: "left" | "center" | "right";
  color?: string;
}

const PX = 72; // atlas glyph height

export function buildLabels(defs: LabelDef[], max = 2048) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const fonts = { display: fontFamily("--font-display"), mono: fontFamily("--font-mono") };
  const fontOf = (d: LabelDef) => `${d.weight ?? (d.font === "display" ? 800 : 500)} ${PX}px ${fonts[d.font ?? "mono"]}`;

  // Measure and shelf-pack.
  const pad = 8;
  const boxes = defs.map((d) => {
    g.font = fontOf(d);
    const w = Math.ceil(g.measureText(d.text).width) + pad * 2;
    return { w, h: PX + pad * 2 };
  });
  let x = 0;
  let y = 0;
  let row = 0;
  const W = max;
  const pos = boxes.map((b) => {
    if (x + b.w > W) {
      x = 0;
      y += row;
      row = 0;
    }
    const p = { x, y };
    x += b.w;
    row = Math.max(row, b.h);
    return p;
  });
  const H = Math.min(max, THREE.MathUtils.ceilPowerOfTwo(Math.max(64, y + row)));
  c.width = W;
  c.height = H;
  g.textBaseline = "middle";
  defs.forEach((d, i) => {
    g.font = fontOf(d);
    g.fillStyle = d.color ?? "#ffffff";
    g.fillText(d.text, pos[i].x + pad, pos[i].y + boxes[i].h / 2 + PX * 0.06);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // One quad per label, merged.
  const P: number[] = [];
  const UV: number[] = [];
  const I: number[] = [];
  const m = new THREE.Matrix4();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  defs.forEach((d, i) => {
    const b = boxes[i];
    const worldW = (d.h / PX) * b.w;
    const worldH = (d.h / PX) * b.h;
    const ax = d.anchor === "center" ? -worldW / 2 : d.anchor === "right" ? -worldW : 0;
    const r = d.rot ?? [-Math.PI / 2, 0, 0];
    m.makeRotationFromEuler(e.set(r[0], r[1], r[2]));
    m.setPosition(d.pos[0], d.pos[1], d.pos[2]);
    const corners: [number, number][] = [
      [ax, -worldH / 2],
      [ax + worldW, -worldH / 2],
      [ax + worldW, worldH / 2],
      [ax, worldH / 2],
    ];
    const base = P.length / 3;
    corners.forEach(([cx, cy]) => {
      v.set(cx, cy, 0).applyMatrix4(m);
      P.push(v.x, v.y, v.z);
    });
    const u0 = pos[i].x / W;
    const u1 = (pos[i].x + b.w) / W;
    const v0 = 1 - (pos[i].y + b.h) / H;
    const v1 = 1 - pos[i].y / H;
    UV.push(u0, v0, u1, v0, u1, v1, u0, v1);
    I.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(UV, 2));
  geo.setIndex(I);
  geo.computeBoundingSphere();
  return { geo, tex };
}

/** A set of labels as one mesh. Rebuilt only when the defs change. */
export function Labels({
  defs,
  opacity = 1,
  gain = 1.4,
  max,
  matRef,
}: {
  defs: LabelDef[];
  opacity?: number;
  gain?: number;
  max?: number;
  matRef?: (m: THREE.MeshBasicMaterial | null) => void;
}) {
  const key = JSON.stringify(defs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { geo, tex } = useMemo(() => buildLabels(defs, max), [key, max]);
  useEffect(
    () => () => {
      geo.dispose();
      tex.dispose();
    },
    [geo, tex]
  );
  return (
    <mesh geometry={geo} raycast={() => null} renderOrder={2}>
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
        opacity={opacity}
        color={[gain, gain, gain]}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}
