"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { A } from "./anim";
import { lidBrushed, lidEtch } from "./textures";

const LW = 14;
const LD = 9.6;

/** The integrated heat spreader: brushed nickel, laser-etched with only
 *  true statements (name, role, counts from the data). Lifts away in the
 *  intro; never mounted on deep links. */
export default function Lid() {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshPhysicalMaterial>(null);
  const skirt = useRef<THREE.MeshPhysicalMaterial>(null);
  const etch = useRef<THREE.MeshStandardMaterial>(null);
  const geo = useMemo(() => new RoundedBoxGeometry(LW, 0.3, LD, 3, 0.12), []);
  const rough = useMemo(() => lidBrushed(1024), []);
  const alpha = useMemo(() => lidEtch(2048), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = A.lidMounted && A.lidOpacity > 0.01;
    const k = A.lid;
    g.position.y = k * 5;
    g.rotation.x = -0.25 * k;
    const o = A.lidOpacity;
    if (body.current) body.current.opacity = o;
    if (skirt.current) skirt.current.opacity = o;
    if (etch.current) etch.current.opacity = o;
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geo} position={[0, 0.65, 0]} raycast={() => null}>
        <meshPhysicalMaterial
          ref={body}
          color="#cfd2d6"
          metalness={1}
          roughness={0.3}
          roughnessMap={rough}
          anisotropy={0.8}
          anisotropyRotation={0}
          envMapIntensity={1.15}
          transparent
        />
      </mesh>
      {/* Skirt down to the substrate. */}
      <mesh position={[0, 0.25, 0]} raycast={() => null}>
        <boxGeometry args={[LW - 0.1, 0.5, LD - 0.1]} />
        <meshPhysicalMaterial ref={skirt} color="#b8bcc2" metalness={1} roughness={0.35} transparent side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 0.802, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial ref={etch} color="#6f747b" metalness={0.6} roughness={0.75} alphaMap={alpha} alphaTest={0.5} transparent />
      </mesh>
    </group>
  );
}
