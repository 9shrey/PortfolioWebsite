"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { A } from "./anim";
import { patchCity } from "./shaders";
import { copperStripes, dieFloor } from "./textures";
import { C0, DIE_TOP, INTERPOSER, NOC_HUB, bd, bw, cx, cz, generateCells } from "@/app/data/package";
import type { Tier } from "../ui/store";

const C0W = bw(C0);
const C0D = bd(C0);
const BODY_H = DIE_TOP - INTERPOSER.top;

/** C0 — the compute die, lit like a city at night. Filler standard cells are
 *  one instanced mesh with the city patch (windows + power wave). */
export default function ComputeDie({ tier }: { tier: Tier }) {
  const low = tier === "low";
  const cells = useMemo(() => generateCells(2026, low ? 500 : 1400), [low]);
  const filler = useRef<THREE.InstancedMesh>(null);
  const floorMap = useMemo(() => dieFloor(low ? 1024 : 2048), [low]);

  const fillerMat = useMemo(
    () => patchCity(new THREE.MeshStandardMaterial({ color: "#0d1118", roughness: 0.55, metalness: 0.4 }), { variant: "filler", floor: 0.07 }),
    []
  );
  useEffect(() => () => fillerMat.dispose(), [fillerMat]);

  const boxGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(cells.seeds, 1));
    return g;
  }, [cells]);
  useEffect(() => () => boxGeo.dispose(), [boxGeo]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < cells.count; i++) {
      const o = i * 5;
      m.compose(new THREE.Vector3(cells.data[o], DIE_TOP, cells.data[o + 1]), q, new THREE.Vector3(cells.data[o + 2], cells.data[o + 4], cells.data[o + 3]));
      filler.current?.setMatrixAt(i, m);
    }
    if (filler.current) {
      filler.current.instanceMatrix.needsUpdate = true;
      filler.current.computeBoundingSphere();
    }
  }, [cells]);

  return (
    <group>
      {/* Die body sides */}
      <mesh position={[cx(C0), INTERPOSER.top + BODY_H / 2, cz(C0)]} raycast={() => null}>
        <boxGeometry args={[C0W, BODY_H, C0D]} />
        <meshStandardMaterial color="#07090d" roughness={0.6} />
      </mesh>
      {/* Iridescent top (separate plane, slightly above the body). */}
      <mesh position={[cx(C0), DIE_TOP + 0.001, cz(C0)]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[C0W, C0D]} />
        {low ? (
          <meshStandardMaterial color="#0b0f16" map={floorMap} roughnessMap={floorMap} metalness={0.7} roughness={0.35} />
        ) : (
          <meshPhysicalMaterial
            color="#0b0f16"
            map={floorMap}
            roughnessMap={floorMap}
            metalness={0.75}
            roughness={0.32}
            iridescence={0.6}
            iridescenceIOR={1.45}
            iridescenceThicknessRange={[180, 520]}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.1}
          />
        )}
      </mesh>

      <instancedMesh ref={filler} args={[boxGeo, fillerMat, cells.count]} raycast={() => null} frustumCulled={false} />

      <NocHub />
      {!low && <MetalLayers />}
    </group>
  );
}

/** The on-die router where every packet converges — a low crossbar with an
 *  emissive grid that pulses on bursts. A real interconnect block, not a
 *  fake project. */
function NocHub() {
  const grid = useRef<THREE.MeshBasicMaterial>(null);
  const base = useMemo(() => new THREE.Color("#5cf2ff"), []);
  useFrame(() => {
    if (grid.current) grid.current.color.copy(base).multiplyScalar(1.0 + A.hub * 2.6);
  });
  const [x, z] = NOC_HUB;
  const bars = [-0.45, -0.15, 0.15, 0.45];
  return (
    <group position={[x, DIE_TOP, z]}>
      <mesh position={[0, 0.03, 0]} raycast={() => null}>
        <boxGeometry args={[1.3, 0.06, 1.3]} />
        <meshStandardMaterial color="#10161f" roughness={0.4} metalness={0.6} />
      </mesh>
      {bars.map((b) => (
        <group key={b}>
          <mesh position={[b, 0.1, 0]} raycast={() => null}>
            <boxGeometry args={[0.08, 0.08, 1.2]} />
            <meshStandardMaterial color="#141c27" roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.16, b]} raycast={() => null}>
            <boxGeometry args={[1.2, 0.04, 0.08]} />
            <meshStandardMaterial color="#141c27" roughness={0.35} metalness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[1.26, 1.26, 8, 8]} />
        <meshBasicMaterial ref={grid} color="#5cf2ff" wireframe toneMapped={false} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/** M9 / M8 copper — cover the city during the intro and peel away. */
function MetalLayers() {
  const m9 = useRef<THREE.Mesh>(null);
  const m8 = useRef<THREE.Mesh>(null);
  const mat9 = useRef<THREE.MeshStandardMaterial>(null);
  const mat8 = useRef<THREE.MeshStandardMaterial>(null);
  const a9 = useMemo(() => copperStripes(512, true), []);
  const a8 = useMemo(() => copperStripes(512, false), []);
  useFrame(() => {
    const set = (mesh: THREE.Mesh | null, mat: THREE.MeshStandardMaterial | null, k: number, y: number, rise: number) => {
      if (!mesh || !mat) return;
      mesh.visible = k < 0.99;
      mesh.position.y = y + k * rise;
      mat.opacity = 1 - k;
    };
    set(m9.current, mat9.current, A.m9, 0.42, 2.2);
    set(m8.current, mat8.current, A.m8, 0.36, 1.4);
  });
  return (
    <group position={[cx(C0), 0, cz(C0)]}>
      <mesh ref={m8} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[C0W, C0D]} />
        <meshStandardMaterial ref={mat8} color="#b87333" metalness={1} roughness={0.28} alphaMap={a8} alphaTest={0.4} transparent />
      </mesh>
      <mesh ref={m9} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[C0W, C0D]} />
        <meshStandardMaterial ref={mat9} color="#b87333" metalness={1} roughness={0.28} alphaMap={a9} alphaTest={0.4} transparent />
      </mesh>
    </group>
  );
}
