"use client";

import * as THREE from "three";
import { A0, C0, DIE_TOP, HBM, IO0, L0, N0, NOC_HUB, cx, cz, towerBySlug } from "@/app/data/package";

/** World point for a part key — used by the roaming light and hover tag. */
export function focusPoint(key: string | null, out: THREE.Vector3) {
  if (!key) return out.set(-0.4, 0.5, 0.2);
  if (key.startsWith("project:")) {
    const t = towerBySlug(key.slice(8));
    if (t) return out.set(t.x, t.crownY, t.z);
  }
  if (key.startsWith("role:")) {
    const b = HBM[Number(key.slice(5))] ?? HBM[0];
    return out.set(cx(b), 0.5, cz(b));
  }
  switch (key) {
    case "work":
      return out.set(NOC_HUB[0] - 1.2, DIE_TOP + 1, cz(C0));
    case "experience":
      return out.set(cx(HBM[0]), 0.5, (cz(HBM[0]) + cz(HBM[1])) / 2);
    case "about":
      return out.set(cx(A0), 0.4, cz(A0));
    case "now":
      return out.set(cx(N0), 0.4, cz(N0));
    case "writing":
      return out.set(cx(L0), 0.2, cz(L0));
    case "contact":
      return out.set(cx(IO0), 0.3, cz(IO0));
  }
  return out.set(-0.4, 0.5, 0.2);
}
