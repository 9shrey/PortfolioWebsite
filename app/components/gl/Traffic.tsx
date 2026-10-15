"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { trafficMaterial } from "./shaders";
import { C0, DIE_TOP, ROUTES, TOWERS, NOC_HUB, type V3 } from "@/app/data/package";

/** Ribbon quads along polylines. Each ribbon carries aS (distance), aSN
 *  (0..1 along its route, for the burst head), aDir (lane), aSeed, aRoute. */
function ribbons(lines: { pts: V3[]; width: number; route: number; dir: number; seed: number }[]) {
  const P: number[] = [];
  const S: number[] = [];
  const SN: number[] = [];
  const DIR: number[] = [];
  const SEED: number[] = [];
  const RT: number[] = [];
  const I: number[] = [];
  for (const l of lines) {
    let total = 0;
    for (let i = 1; i < l.pts.length; i++) {
      const a = l.pts[i - 1];
      const b = l.pts[i];
      total += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    }
    let acc = 0;
    for (let i = 1; i < l.pts.length; i++) {
      const a = l.pts[i - 1];
      const b = l.pts[i];
      const dx = b[0] - a[0];
      const dz = b[2] - a[2];
      const len = Math.hypot(dx, b[1] - a[1], dz);
      if (len < 1e-4) continue;
      // Perpendicular in the xz plane.
      const hl = Math.hypot(dx, dz) || 1;
      const nx = (-dz / hl) * (l.width / 2);
      const nz = (dx / hl) * (l.width / 2);
      const base = P.length / 3;
      P.push(a[0] + nx, a[1], a[2] + nz, a[0] - nx, a[1], a[2] - nz, b[0] - nx, b[1], b[2] - nz, b[0] + nx, b[1], b[2] + nz);
      const s0 = acc;
      const s1 = acc + len;
      S.push(s0, s0, s1, s1);
      SN.push(s0 / total, s0 / total, s1 / total, s1 / total);
      for (let k = 0; k < 4; k++) {
        DIR.push(l.dir);
        SEED.push(l.seed);
        RT.push(l.route);
      }
      I.push(base, base + 1, base + 2, base, base + 2, base + 3);
      acc = s1;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(S, 1));
  g.setAttribute("aSN", new THREE.Float32BufferAttribute(SN, 1));
  g.setAttribute("aDir", new THREE.Float32BufferAttribute(DIR, 1));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(SEED, 1));
  g.setAttribute("aRoute", new THREE.Float32BufferAttribute(RT, 1));
  g.setIndex(I);
  g.computeBoundingSphere();
  return g;
}

/** C0 avenues: between the lot columns and rows, plus the die ring. */
function streets(): V3[][] {
  const y = DIE_TOP + 0.004;
  const xs = Array.from(new Set(TOWERS.map((t) => t.x))).sort((a, b) => a - b);
  const zs = Array.from(new Set(TOWERS.map((t) => t.z))).sort((a, b) => a - b);
  const out: V3[][] = [];
  // Avenues between columns.
  for (let i = 0; i < xs.length - 1; i++) {
    const x = (xs[i] + xs[i + 1]) / 2;
    out.push([[x, y, C0.z0 + 0.1], [x, y, C0.z1 - 0.1]]);
  }
  // Cross street between the rows, and the outer ring.
  const zMid = (zs[0] + zs[zs.length - 1]) / 2;
  out.push([[C0.x0 + 0.1, y, zMid], [C0.x1 - 0.1, y, zMid]]);
  out.push([
    [C0.x0 + 0.1, y, C0.z0 + 0.1],
    [C0.x1 - 0.1, y, C0.z0 + 0.1],
    [C0.x1 - 0.1, y, C0.z1 - 0.1],
    [C0.x0 + 0.1, y, C0.z1 - 0.1],
    [C0.x0 + 0.1, y, C0.z0 + 0.1],
  ]);
  // Spokes into the NoC hub.
  out.push([[NOC_HUB[0], y, zMid], [NOC_HUB[0], y, NOC_HUB[1] - 0.7]]);
  return out;
}

export default function Traffic() {
  const geo = useMemo(() => {
    const lines: { pts: V3[]; width: number; route: number; dir: number; seed: number }[] = [];
    streets().forEach((pts, i) => {
      // Two lanes, opposite directions (cyan out, amber back).
      const off = (k: number): V3[] =>
        pts.map((p, j) => {
          const q = pts[Math.min(j + 1, pts.length - 1)];
          const r = pts[Math.max(j - 1, 0)];
          const dx = q[0] - r[0];
          const dz = q[2] - r[2];
          const hl = Math.hypot(dx, dz) || 1;
          return [p[0] + (-dz / hl) * k, p[1], p[2] + (dx / hl) * k];
        });
      lines.push({ pts: off(0.035), width: 0.05, route: -1, dir: 1, seed: i * 0.37 });
      lines.push({ pts: off(-0.035), width: 0.05, route: -1, dir: -1, seed: i * 0.53 + 0.2 });
    });
    ROUTES.forEach((r) => lines.push({ pts: r.pts, width: 0.12, route: r.id, dir: 1, seed: r.id * 0.29 }));
    return ribbons(lines);
  }, []);
  const mat = useMemo(() => trafficMaterial(), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );
  return <mesh geometry={geo} material={mat} raycast={() => null} renderOrder={3} frustumCulled={false} />;
}
