"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { A } from "./anim";
import { Labels } from "./labels";
import { copperStripes } from "./textures";
import { LOT, TOWERS } from "@/app/data/package";
import { store } from "../ui/store";

/** The delayer: above the core you're reading, its metal stack lifts off as
 *  five plates — M5…M1, one per section of the case study. Scrolling the
 *  sheet lights the plate for the section in view. */
const PLATES = [
  ["M5", "PROBLEM"],
  ["M4", "SYSTEM"],
  ["M3", "WHY IT'S INTERESTING"],
  ["M2", "CHALLENGES"],
  ["M1", "RETROSPECT"],
] as const;

export default function DelayerStack() {
  const group = useRef<THREE.Group>(null);
  const plates = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.Material | null)[]>([]);
  const edges = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const labelMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const glow = useRef(PLATES.map(() => 0));
  const stripesX = useMemo(() => copperStripes(256, true), []);
  const stripesZ = useMemo(() => copperStripes(256, false), []);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(LOT, 0.04, LOT)), []);
  const amber = useMemo(() => new THREE.Color("#ffb547"), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const ti = A.platesTower;
    const k = A.plates;
    g.visible = ti >= 0 && k > 0.01;
    if (!g.visible) return;
    const t = TOWERS[ti];
    g.position.set(t.x, 0, t.z);
    const active = store.get().activeLayer; // layer 4 = M5 … 0 = M1
    PLATES.forEach((_, i) => {
      const p = plates.current[i];
      // Stagger: each plate fades/rises in 0.07 behind the previous.
      const local = THREE.MathUtils.clamp(k * 1.35 - i * 0.07, 0, 1);
      const yTarget = t.crownY + 0.6 + (PLATES.length - 1 - i) * 0.3;
      if (p) p.position.y = yTarget - (1 - local) * 0.6;
      const on = 4 - i === active ? 1 : 0;
      glow.current[i] = THREE.MathUtils.damp(glow.current[i], on, 6, dt);
      const m = mats.current[i] as THREE.MeshStandardMaterial | null;
      if (m) {
        m.opacity = local * (i % 2 === 0 ? 1 : 0.18);
        if ("emissiveIntensity" in m) m.emissiveIntensity = glow.current[i] * 1.2;
      }
      const e = edges.current[i];
      if (e) {
        e.opacity = local * (0.15 + 0.85 * glow.current[i]);
        e.color.copy(amber).multiplyScalar(1 + glow.current[i] * 1.5);
      }
      const lm = labelMats.current[i];
      if (lm) lm.opacity = local * (0.45 + 0.55 * glow.current[i]);
    });
  });

  return (
    <group ref={group} visible={false}>
      {PLATES.map(([code, name], i) => (
        <group key={code} ref={(el) => void (plates.current[i] = el)}>
          <mesh raycast={() => null} renderOrder={1}>
            <boxGeometry args={[LOT, 0.04, LOT]} />
            {i % 2 === 0 ? (
              <meshStandardMaterial
                ref={(m) => void (mats.current[i] = m)}
                color="#b0703e"
                metalness={1}
                roughness={0.32}
                alphaMap={i % 4 === 0 ? stripesX : stripesZ}
                alphaTest={0.5}
                transparent
                emissive="#ffb547"
                emissiveIntensity={0}
              />
            ) : (
              <meshPhysicalMaterial
                ref={(m) => void (mats.current[i] = m)}
                color="#9fb7c9"
                transparent
                opacity={0.18}
                roughness={0.1}
                depthWrite={false}
              />
            )}
          </mesh>
          <lineSegments geometry={edgeGeo} raycast={() => null}>
            <lineBasicMaterial ref={(m) => void (edges.current[i] = m)} color="#ffb547" transparent toneMapped={false} />
          </lineSegments>
          <group position={[0, 0.025, 0]}>
            <Labels
              defs={[{ text: `${code} ${name}`, h: 0.1, pos: [-LOT / 2 + 0.08, 0, LOT / 2 - 0.1] }]}
              max={512}
              matRef={(m) => void (labelMats.current[i] = m)}
            />
          </group>
        </group>
      ))}
    </group>
  );
}
