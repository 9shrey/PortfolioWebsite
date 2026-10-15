"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { BGA_CLUSTERS, clusterCentre } from "./Package";
import { focusPoint } from "./focus";
import { live, store, useStore } from "../ui/store";
import { A0, C0, HBM, INTERPOSER, IO0, L0, N0, NOC_HUB, SUBSTRATE, TOWERS, bd, bw, cx, cz, towerBySlug, PARTS } from "@/app/data/package";
import { roles } from "@/app/data/experience";

/** Raycasting only ever hits these invisible boxes — every render mesh has
 *  raycast disabled. Handlers bail if the event started over HTML (the
 *  canvas listens on the whole shell). */

interface Hit {
  key: string;
  href: string;
  pos: [number, number, number];
  size: [number, number, number];
  external?: boolean;
}

function tagText(key: string) {
  if (key.startsWith("project:")) {
    const t = towerBySlug(key.slice(8));
    if (t) return `${t.code} ${t.name.toUpperCase()} / ${t.tests ? `${t.tests} TESTS` : "LIVE · NO TEST SUITE"}`;
  }
  if (key.startsWith("role:")) {
    const i = Number(key.slice(5));
    return `HBM-${String.fromCharCode(65 + i)} ${roles[i]?.company.toUpperCase()} / ${roles[i]?.points.length} LAYERS`;
  }
  if (key.startsWith("bga:")) return `BGA ${key.slice(4).toUpperCase()}`;
  if (key === "noc") return "C0.H NOC HUB / ROUTER, NOT A PROJECT";
  const p = PARTS.find((x) => x.key === key);
  return p ? `${p.code} ${p.label.toUpperCase()} / ${p.unit.toUpperCase()}` : key.toUpperCase();
}

export default function Pointer({ navigate, interactive }: { navigate: (href: string) => void; interactive: boolean }) {
  const { camera, size } = useThree();
  const scene = useStore((s) => s.scene);
  const hover = useStore((s) => s.hover);
  const tier = useStore((s) => s.tier);
  useCursor(!!hover && interactive);
  const down = useRef<{ x: number; y: number } | null>(null);
  const meshes = useRef(new Map<string, THREE.Mesh>());

  const hits = useMemo<Hit[]>(() => {
    const y0 = INTERPOSER.top;
    const list: Hit[] = [
      ...TOWERS.map<Hit>((t) => ({ key: `project:${t.slug}`, href: `/work/${t.slug}`, pos: [t.x, (y0 + t.crownY) / 2, t.z], size: [1.5, t.crownY - y0, 1.5] })),
      { key: "work", href: "/work", pos: [NOC_HUB[0], 0.5, NOC_HUB[1]], size: [1.4, 0.6, 1.4] },
      { key: "work", href: "/work", pos: [cx(C0), 0.24, cz(C0)], size: [bw(C0), 0.24, bd(C0)] },
      ...HBM.map<Hit>((b, i) => ({ key: `role:${i}`, href: "/experience", pos: [cx(b), 0.4, cz(b)], size: [bw(b), 0.6, bd(b)] })),
      { key: "about", href: "/about", pos: [cx(A0), 0.25, cz(A0)], size: [bw(A0), 0.35, bd(A0)] },
      { key: "now", href: "/now", pos: [cx(N0), 0.25, cz(N0)], size: [bw(N0), 0.35, bd(N0)] },
      { key: "writing", href: "/writing", pos: [cx(L0), 0.15, cz(L0)], size: [bw(L0), 0.2, bd(L0)] },
      { key: "contact", href: "/contact", pos: [cx(IO0), 0.2, cz(IO0)], size: [bw(IO0), 0.25, bd(IO0)] },
    ];
    return list;
  }, []);

  const bgaHits = useMemo<Hit[]>(
    () =>
      BGA_CLUSTERS.map((c, k) => {
        const [x, z] = clusterCentre(k, tier);
        return { key: `bga:${c.key}`, href: c.href, pos: [x, -SUBSTRATE.h - 0.12, z], size: [2.2, 0.5, 2.2], external: !c.href.startsWith("/") || c.href.endsWith(".pdf") };
      }),
    [tier]
  );

  const guard = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const t = e.nativeEvent.target as Element | null;
    return !interactive || !!t?.closest?.("[data-ui]") || store.get().intro !== "done";
  };

  const handlers = (h: Hit) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (guard(e)) return;
      e.stopPropagation();
      if (e.pointerType !== "touch") store.set({ hover: h.key });
    },
    onPointerOut: () => {
      if (store.get().hover === h.key) store.set({ hover: null });
    },
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (guard(e)) return;
      e.stopPropagation();
      const d = down.current;
      if (d && Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > 6) return; // drag
      if (h.external) window.open(h.href, "_blank", "noopener");
      else if (h.href.startsWith("mailto:")) window.location.href = h.href;
      else navigate(h.href);
    },
  });

  // Hover tag follows the hovered part on screen.
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const key = store.get().hover;
    const t = live.tag;
    if (!key || !interactive) {
      t.visible = false;
      return;
    }
    const m = key.startsWith("bga:") ? meshes.current.get(key) : undefined;
    if (m) m.getWorldPosition(p);
    else focusPoint(key, p);
    p.project(camera);
    t.x = ((p.x + 1) / 2) * size.width;
    t.y = ((1 - p.y) / 2) * size.height;
    t.text = tagText(key);
    t.visible = true;
  });

  const onContact = scene.id === "contact";
  const mat = useMemo(() => new THREE.MeshBasicMaterial(), []);
  return (
    <group>
      {!onContact &&
        hits.map((h, i) => (
          <mesh key={`${h.key}-${i}`} position={h.pos} material={mat} visible={false} {...handlers(h)}>
            <boxGeometry args={h.size} />
          </mesh>
        ))}
      {onContact &&
        bgaHits.map((h) => (
          <mesh
            key={h.key}
            ref={(el) => void (el ? meshes.current.set(h.key, el) : meshes.current.delete(h.key))}
            position={h.pos}
            material={mat}
            visible={false}
            {...handlers(h)}
          >
            <boxGeometry args={h.size} />
          </mesh>
        ))}
    </group>
  );
}
