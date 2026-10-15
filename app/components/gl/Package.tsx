"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { A } from "./anim";
import { interposer, substrate } from "./textures";
import { Labels } from "./labels";
import { INTERPOSER, SUBSTRATE } from "@/app/data/package";
import type { Tier } from "../ui/store";

/** BGA: 24×18 at 0.65 pitch with a 6×4 centre keep-out → 408 balls. The
 *  four 3×3 corner clusters are the contact channels on /contact. */
export const BGA_CLUSTERS = [
  { key: "email", label: "EMAIL", href: "mailto:9shrey@gmail.com", corner: [-1, -1] },
  { key: "linkedin", label: "LINKEDIN", href: "https://linkedin.com/in/9shrey", corner: [1, -1] },
  { key: "github", label: "GITHUB", href: "https://github.com/9shrey", corner: [-1, 1] },
  { key: "resume", label: "RESUME", href: "/Shrey_Singh_Resume.pdf", corner: [1, 1] },
] as const;

const PITCH = 0.65;

export function bgaLayout(tier: Tier) {
  const cols = tier === "low" ? 10 : 24;
  const rows = tier === "low" ? 6 : 18;
  const pitch = tier === "low" ? (PITCH * 24) / 10 : PITCH;
  const balls: [number, number][] = [];
  const cluster: number[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const ci = i - (cols - 1) / 2;
      const cj = j - (rows - 1) / 2;
      if (tier !== "low" && Math.abs(ci) < 3 && Math.abs(cj) < 2) continue;
      const x = ci * pitch;
      const z = cj * pitch;
      balls.push([x, z]);
      // Corner 3×3 clusters.
      let c = -1;
      BGA_CLUSTERS.forEach((cl, k) => {
        const inX = cl.corner[0] < 0 ? i < 3 : i >= cols - 3;
        const inZ = cl.corner[1] < 0 ? j < 3 : j >= rows - 3;
        if (inX && inZ) c = k;
      });
      cluster.push(c);
    }
  }
  return { balls, cluster };
}

export function clusterCentre(k: number, tier: Tier): [number, number] {
  const cols = tier === "low" ? 10 : 24;
  const rows = tier === "low" ? 6 : 18;
  const pitch = tier === "low" ? (PITCH * 24) / 10 : PITCH;
  const cl = BGA_CLUSTERS[k];
  return [cl.corner[0] * ((cols - 1) / 2 - 1) * pitch, cl.corner[1] * ((rows - 1) / 2 - 1) * pitch];
}

/** The flip group pivots about the package centre plane, so /contact turns
 *  the whole chip over in place. */
export default function Package({ tier, children }: { tier: Tier; children: ReactNode }) {
  const flip = useRef<THREE.Group>(null);
  const balls = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const ends = useRef<THREE.InstancedMesh>(null);
  const low = tier === "low";

  const subGeo = useMemo(() => new RoundedBoxGeometry(SUBSTRATE.w, SUBSTRATE.h, SUBSTRATE.d, 4, 0.2), []);
  const subMap = useMemo(() => substrate(low ? 1024 : 2048), [low]);
  const ipMap = useMemo(() => interposer(low ? 512 : 1024), [low]);
  const bga = useMemo(() => bgaLayout(tier), [tier]);
  const clusterIdx = useMemo(() => bga.cluster.map((c, i) => (c >= 0 ? i : -1)).filter((i) => i >= 0), [bga]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    bga.balls.forEach(([x, z], i) => {
      m.makeTranslation(x, -SUBSTRATE.h - 0.12, z);
      balls.current?.setMatrixAt(i, m);
    });
    if (balls.current) balls.current.instanceMatrix.needsUpdate = true;
    clusterIdx.forEach((bi, k) => {
      const [x, z] = bga.balls[bi];
      m.compose(new THREE.Vector3(x, -SUBSTRATE.h - 0.12, z), new THREE.Quaternion(), new THREE.Vector3(1.03, 1.03, 1.03));
      glow.current?.setMatrixAt(k, m);
    });
    if (glow.current) glow.current.instanceMatrix.needsUpdate = true;

    // 40 MLCC caps in the substrate margin.
    const spots: [number, number, number][] = [];
    for (let k = 0; k < 12; k++) {
      const x = -7.2 + k * 1.31;
      spots.push([x, -5.85, 0], [x, 5.85, 0]);
    }
    for (let k = 0; k < 8; k++) {
      const z = -4.2 + k * 1.2;
      spots.push([-7.75, z, Math.PI / 2], [7.75, z, Math.PI / 2]);
    }
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    spots.forEach(([x, z, r], n) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
      m.compose(new THREE.Vector3(x, 0.11, z), q, one);
      caps.current?.setMatrixAt(n, m);
      [-1, 1].forEach((side, s) => {
        const off = new THREE.Vector3(side * 0.24, 0, 0).applyQuaternion(q);
        m.compose(new THREE.Vector3(x + off.x, 0.11, z + off.z), q, one);
        ends.current?.setMatrixAt(n * 2 + s, m);
      });
    });
    if (caps.current) caps.current.instanceMatrix.needsUpdate = true;
    if (ends.current) ends.current.instanceMatrix.needsUpdate = true;
  }, [bga, clusterIdx]);

  useFrame((st) => {
    if (flip.current) flip.current.rotation.x = A.flip;
    const showBga = A.flip > 0.02;
    if (balls.current) balls.current.visible = showBga;
    if (glow.current) glow.current.visible = showBga && A.bga > 0.01;
    if (glowMat.current) glowMat.current.opacity = A.bga * (0.55 + 0.45 * Math.sin(st.clock.elapsedTime * 4));
  });

  return (
    <group ref={flip} position={[0, -SUBSTRATE.h / 2, 0]}>
      {/* Pivot: the substrate's mid-plane (y −0.25). */}
      <group position={[0, SUBSTRATE.h / 2, 0]}>
        <mesh geometry={subGeo} position={[0, -SUBSTRATE.h / 2, 0]} raycast={() => null}>
          <meshPhysicalMaterial color="#0b120f" map={subMap} roughness={0.55} metalness={0.25} clearcoat={0.8} clearcoatRoughness={0.22} />
        </mesh>
        <instancedMesh ref={caps} args={[undefined, undefined, 40]} raycast={() => null}>
          <boxGeometry args={[0.36, 0.2, 0.22]} />
          <meshStandardMaterial color="#3a2c22" roughness={0.7} />
        </instancedMesh>
        <instancedMesh ref={ends} args={[undefined, undefined, 80]} raycast={() => null}>
          <boxGeometry args={[0.1, 0.21, 0.23]} />
          <meshStandardMaterial color="#d8d8d8" metalness={1} roughness={0.3} />
        </instancedMesh>

        {/* Interposer */}
        <mesh position={[0, INTERPOSER.top / 2, 0]} raycast={() => null}>
          <boxGeometry args={[INTERPOSER.w, INTERPOSER.top, INTERPOSER.d]} />
          {low ? (
            <meshStandardMaterial color="#262b33" map={ipMap} metalness={0.7} roughness={0.3} />
          ) : (
            <meshPhysicalMaterial
              color="#262b33"
              map={ipMap}
              metalness={0.75}
              roughness={0.26}
              iridescence={1}
              iridescenceIOR={1.45}
              iridescenceThicknessRange={[180, 520]}
              clearcoat={0.4}
              envMapIntensity={1.2}
            />
          )}
        </mesh>

        <instancedMesh ref={balls} args={[undefined, undefined, bga.balls.length]} raycast={() => null} visible={false}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color="#c9ced4" metalness={1} roughness={0.22} />
        </instancedMesh>
        <instancedMesh ref={glow} args={[undefined, undefined, clusterIdx.length]} raycast={() => null} visible={false}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshBasicMaterial ref={glowMat} color={new THREE.Color("#ffb547").multiplyScalar(2.4)} toneMapped={false} transparent />
        </instancedMesh>

        {/* Channel names etched on the underside next to each cluster —
            they face down, so they read once the package flips. */}
        <Labels
          defs={BGA_CLUSTERS.map((c, k) => {
            const [x, z] = clusterCentre(k, tier);
            return {
              text: c.label,
              font: "display" as const,
              h: 0.42,
              pos: [x, -SUBSTRATE.h - 0.005, z + (c.corner[1] < 0 ? 1.35 : -1.35)] as [number, number, number],
              rot: [Math.PI / 2, 0, 0] as [number, number, number],
              anchor: "center" as const,
              color: "#ffb547",
            };
          })}
          gain={2}
          max={1024}
        />

        {children}
      </group>
    </group>
  );
}
