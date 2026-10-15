"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { A } from "./anim";
import { Labels } from "./labels";
import { HBM, HBM_BASE, HBM_GAP, HBM_LAYER, INTERPOSER, bd, bw, cx, cz, hbmLayers } from "@/app/data/package";
import { roles } from "@/app/data/experience";
import { store } from "../ui/store";

const OPEN_GAP = 0.34;

/** One HBM stack per role: a base logic die plus one DRAM layer per bullet
 *  point in that role. On /experience the stack lifts and unstacks so the
 *  layers (and the TSVs between them) can be read. */
function Stack({ i }: { i: number }) {
  const b = HBM[i];
  const n = hbmLayers(i);
  const w = bw(b) - 0.1;
  const d = bd(b) - 0.1;
  const group = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Mesh | null)[]>([]);
  const top = useRef<THREE.Group>(null);
  const tsv = useRef<THREE.InstancedMesh>(null);
  const edge = useRef<THREE.LineBasicMaterial>(null);
  const lift = useRef(0);
  const glow = useRef(0);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.04, 1, d + 0.04)), [w, d]);
  const edgeCol = useMemo(() => new THREE.Color("#5cf2ff"), []);
  const tsvCount = 24 * n;

  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame((_, dt) => {
    const s = store.get();
    const k = A.hbm;
    const gap = HBM_GAP + (OPEN_GAP - HBM_GAP) * k;
    const hov = s.hover === `role:${i}` || s.hover === "experience" ? 1 : 0;
    lift.current = THREE.MathUtils.damp(lift.current, hov * 0.06, 8, dt);
    if (group.current) group.current.position.y = INTERPOSER.top + 0.35 * k + lift.current;
    let y = HBM_BASE;
    for (let l = 0; l < n; l++) {
      y += gap;
      const mesh = layers.current[l];
      if (mesh) mesh.position.y = y + HBM_LAYER / 2;
      y += HBM_LAYER;
    }
    if (top.current) top.current.position.y = y + 0.002;
    // TSVs bridge every gap.
    if (tsv.current) {
      let idx = 0;
      let yy = HBM_BASE;
      for (let l = 0; l < n; l++) {
        for (let a = 0; a < 4; a++) {
          for (let c = 0; c < 6; c++) {
            m.compose(
              new THREE.Vector3(-w / 2 + 0.25 + (a * (w - 0.5)) / 3, yy + gap / 2, -d / 2 + 0.25 + (c * (d - 0.5)) / 5),
              new THREE.Quaternion(),
              new THREE.Vector3(1, gap, 1)
            );
            tsv.current.setMatrixAt(idx++, m);
          }
        }
        yy += gap + HBM_LAYER;
      }
      tsv.current.instanceMatrix.needsUpdate = true;
    }
    const active = s.scene.id === "experience" && s.activeLayer === i ? 1 : hov;
    glow.current = THREE.MathUtils.damp(glow.current, active, 6, dt);
    if (edge.current) {
      edge.current.color.copy(edgeCol).multiplyScalar(0.4 + glow.current * 2.2);
      edge.current.opacity = 0.25 + glow.current * 0.75;
    }
    const edges = group.current?.getObjectByName("edge");
    if (edges) {
      edges.scale.y = y + 0.02;
      edges.position.y = (y + 0.02) / 2;
    }
  });

  const company = roles[i]?.company ?? "";
  return (
    <group ref={group} position={[cx(b), INTERPOSER.top, cz(b)]}>
      <mesh position={[0, HBM_BASE / 2, 0]} raycast={() => null}>
        <boxGeometry args={[w, HBM_BASE, d]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: n }, (_, l) => (
        <mesh key={l} ref={(el) => void (layers.current[l] = el)} raycast={() => null}>
          <boxGeometry args={[w, HBM_LAYER, d]} />
          <meshPhysicalMaterial color="#2a2d33" metalness={0.75} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      ))}
      <instancedMesh ref={tsv} args={[undefined, undefined, tsvCount]} raycast={() => null} frustumCulled={false}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshStandardMaterial color="#c27a45" emissive="#ff9a4a" emissiveIntensity={0.6} />
      </instancedMesh>
      <lineSegments name="edge" geometry={edgeGeo} raycast={() => null}>
        <lineBasicMaterial ref={edge} color="#5cf2ff" transparent toneMapped={false} />
      </lineSegments>
      <group ref={top}>
        <Labels
          defs={[
            { text: `HBM-${String.fromCharCode(65 + i)}`, h: 0.13, pos: [-w / 2 + 0.12, 0, -d / 2 + 0.2] },
            { text: company.toUpperCase(), font: "display", h: 0.28, pos: [-w / 2 + 0.12, 0, -d / 2 + 0.52] },
            { text: `${n} DRAM LAYERS`, h: 0.11, pos: [-w / 2 + 0.12, 0, -d / 2 + 0.86] },
          ]}
          max={1024}
        />
      </group>
    </group>
  );
}

export default function Hbm() {
  return (
    <group>
      {HBM.map((_, i) => (
        <Stack key={i} i={i} />
      ))}
    </group>
  );
}
