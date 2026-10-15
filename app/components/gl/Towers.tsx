"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { A } from "./anim";
import { patchCity, type TowerUniforms } from "./shaders";
import { DIE_TOP, LOT, TOWERS, TOWER_BASE, type Tower } from "@/app/data/package";
import { store } from "../ui/store";

/** Setback tiers: 1.0 / 0.8 / 0.6 of the footprint, merged per tower. */
function towerGeometry(visH: number) {
  const fp = LOT * 0.78;
  const tiers: [number, number, number][] = [
    [1.0, 0, 0.55],
    [0.8, 0.55, 0.85],
    [0.6, 0.85, 1.0],
  ];
  const parts = tiers.map(([w, a, b]) => {
    const h = (b - a) * visH;
    const g = new THREE.BoxGeometry(fp * w, h, fp * w);
    g.translate(0, a * visH + h / 2, 0);
    return g;
  });
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

function TowerMesh({ t }: { t: Tower }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => towerGeometry(t.h), [t]);
  const mat = useMemo(() => {
    const u: TowerUniforms = {
      uFill: { value: 1 },
      uSel: { value: 0 },
      uDim: { value: 0 },
      uSeed: { value: t.index * 13.7 + 3 },
      uBase: { value: TOWER_BASE },
      uVisH: { value: t.h },
    };
    const m = patchCity(
      new THREE.MeshPhysicalMaterial({
        color: "#0e131b",
        metalness: 0.9,
        roughness: 0.18,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.4,
      }),
      { variant: `tower-${t.index}`, floor: 0.05, tower: true },
      u
    );
    m.userData.u = u;
    return m;
  }, [t]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  // Hover lift (damped) on top of the honest height.
  const lift = useRef(0);
  useFrame((_, dt) => {
    const i = t.index;
    const s = store.get();
    const hov = s.hover === `project:${t.slug}` ? 1 : 0;
    lift.current = THREE.MathUtils.damp(lift.current, hov * 0.06, 8, dt);
    // Filter dimming (Jev's "filter the work by…", or the chips).
    const filtered = s.filter !== "All" && !t.filterTags.includes(s.filter) ? 0.75 : 0;
    const u = (mesh.current?.material as THREE.Material | undefined)?.userData.u as TowerUniforms | undefined;
    if (u) {
      u.uFill.value = A.fill[i];
      u.uSel.value = Math.max(A.sel[i], hov * 0.6);
      u.uDim.value = Math.max(A.dim[i], filtered);
    }
    if (group.current) {
      group.current.scale.y = Math.max(0.0001, A.grow[i]);
      group.current.position.y = TOWER_BASE + lift.current;
    }
  });

  return (
    <group ref={group} position={[t.x, TOWER_BASE, t.z]}>
      <mesh ref={mesh} geometry={geo} material={mat} raycast={() => null} />
    </group>
  );
}

/** Jev has no test suite (it's live on this site), so it's a plaza with a
 *  1.2 mast and voice rings — never a fake bar. The rings speed up while
 *  Jev is listening; a beam rises while it's thinking. */
function JevPlaza({ t }: { t: Tower }) {
  const rings = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null);
  const mast = useRef<THREE.Group>(null);
  const phase = useRef(0);
  useFrame((st, dt) => {
    const jev = store.get().jevPhase;
    const speed = jev === "listening" ? 2 : 1;
    phase.current += dt * 0.6 * speed;
    const g = A.grow[t.index];
    if (mast.current) mast.current.scale.y = Math.max(0.0001, g);
    rings.current?.children.forEach((c, i) => {
      const p = (phase.current + i / 3) % 1;
      c.scale.setScalar(0.3 + p * 1.6);
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.9 * g;
    });
    const thinking = jev === "thinking" ? 1 : 0;
    if (beamMat.current) beamMat.current.opacity = THREE.MathUtils.damp(beamMat.current.opacity, thinking * 0.7, 6, dt);
    if (beam.current) beam.current.visible = beamMat.current ? beamMat.current.opacity > 0.01 : false;
  });
  const ringCol = useMemo(() => new THREE.Color("#5cf2ff").multiplyScalar(2.2), []);
  return (
    <group position={[t.x, TOWER_BASE, t.z]}>
      <group ref={mast}>
        <mesh position={[0, 0.6, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.035, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#1a222e" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.22, 0]} raycast={() => null}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshBasicMaterial color={ringCol} toneMapped={false} />
        </mesh>
      </group>
      <group ref={rings} position={[0, 0.012, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[0.5, 0.53, 64]} />
            <meshBasicMaterial color={ringCol} toneMapped={false} transparent depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={beam} position={[0, 2.2, 0]} raycast={() => null} visible={false}>
        <cylinderGeometry args={[0.12, 0.2, 4.4, 16, 1, true]} />
        <meshBasicMaterial ref={beamMat} color={ringCol} toneMapped={false} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Every lot gets a podium; then a tower (or Jev's plaza). */
export default function Towers() {
  return (
    <group>
      {TOWERS.map((t) => (
        <mesh key={`p-${t.slug}`} position={[t.x, DIE_TOP + 0.03, t.z]} raycast={() => null}>
          <boxGeometry args={[LOT, 0.06, LOT]} />
          <meshStandardMaterial color="#10151d" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {TOWERS.map((t) => (t.h > 0 ? <TowerMesh key={t.slug} t={t} /> : <JevPlaza key={t.slug} t={t} />))}
    </group>
  );
}
