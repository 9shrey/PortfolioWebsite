"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { A } from "./anim";
import { Labels } from "./labels";
import { U } from "./uniforms";
import { A0, INTERPOSER, IO0, L0, N0, SMALL_TOP, bd, bw, cx, cz } from "@/app/data/package";
import { skillGroups } from "@/app/data/skills";
import { nowItems } from "@/app/data/now";
import { posts } from "@/app/data/writing";
import { store } from "../ui/store";

const H = SMALL_TOP - INTERPOSER.top;
const dieMat = { color: "#1c2026", metalness: 0.85, roughness: 0.18 };

function useHoverLift(key: string) {
  const v = useRef(0);
  useFrame((_, dt) => {
    v.current = THREE.MathUtils.damp(v.current, store.get().hover === key ? 0.06 : 0, 8, dt);
  });
  return v;
}

/* --------------------------------------------------------------- A0 */

/** Control die: four quadrant plates = the four skill groups. Cells per
 *  plate = items in the group, all the same height (no fake ranking). */
function ControlDie({ low }: { low: boolean }) {
  const quads = useRef<(THREE.Group | null)[]>([]);
  const cells = useRef<(THREE.InstancedMesh | null)[]>([]);
  const lift = useHoverLift("about");
  const col = useMemo(() => new THREE.Color(), []);
  const W = bw(A0);
  const D = bd(A0);
  const qw = W / 2 - 0.06;
  const qd = D / 2 - 0.06;

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    skillGroups.forEach((g, gi) => {
      const mesh = cells.current[gi];
      if (!mesh) return;
      const n = g.items.length;
      const perRow = 5;
      g.items.forEach((_, k) => {
        m.makeTranslation(-qw / 2 + 0.2 + (k % perRow) * 0.17, H + 0.025, -qd / 2 + 0.35 + Math.floor(k / perRow) * 0.17);
        mesh.setMatrixAt(k, m);
        mesh.setColorAt(k, col.setRGB(0, 0, 0));
      });
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [qw, qd, col]);

  useFrame(() => {
    const k = A.a0;
    quads.current.forEach((q, i) => {
      if (!q) return;
      const sx = i % 2 ? 1 : -1;
      const sz = i < 2 ? -1 : 1;
      q.position.set(sx * (qw / 2 + 0.03 + 0.22 * k), 0.3 * k + lift.current, sz * (qd / 2 + 0.03 + 0.22 * k));
    });
    cells.current.forEach((mesh, gi) => {
      if (!mesh?.instanceColor) return;
      const v = A.a0Cells[gi];
      col.setRGB(0.07 + 0.36 * 1.6 * v, 0.09 + 0.95 * 1.6 * v, 0.12 + 1.6 * v);
      for (let k = 0; k < mesh.count; k++) mesh.setColorAt(k, col);
      mesh.instanceColor.needsUpdate = true;
    });
  });

  return (
    <group position={[cx(A0), INTERPOSER.top, cz(A0)]}>
      {skillGroups.map((g, i) => (
        <group key={g.label} ref={(el) => void (quads.current[i] = el)}>
          <mesh position={[0, H / 2, 0]} raycast={() => null}>
            <boxGeometry args={[qw, H, qd]} />
            {low ? (
              <meshStandardMaterial {...dieMat} />
            ) : (
              <meshPhysicalMaterial {...dieMat} iridescence={0.6} iridescenceThicknessRange={[250, 700]} />
            )}
          </mesh>
          <instancedMesh ref={(el) => void (cells.current[i] = el)} args={[undefined, undefined, 12]} raycast={() => null}>
            <boxGeometry args={[0.09, 0.05, 0.09]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </instancedMesh>
          <Labels
            defs={[
              // Read from the /about camera, which looks back from the north-east.
              { text: `A0.${i + 1}`, h: 0.08, pos: [qw / 2 - 0.08, H + 0.003, qd / 2 - 0.12], rot: [-Math.PI / 2, 0, Math.PI] },
              { text: `${g.label.toUpperCase()} (${g.items.length})`, h: 0.075, pos: [qw / 2 - 0.08, H + 0.003, -qd / 2 + 0.1], rot: [-Math.PI / 2, 0, Math.PI] },
            ]}
            max={512}
          />
        </group>
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- N0 */

/** Scratchpad: one bitcell row per /now item, a write head per row. */
function Scratchpad() {
  const bits = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<(THREE.Mesh | null)[]>([]);
  const lift = useHoverLift("now");
  const group = useRef<THREE.Group>(null);
  const W = bw(N0);
  const D = bd(N0);
  const rows = nowItems.length;
  const col = useMemo(() => new THREE.Color(), []);
  const rowZ = (r: number) => -D / 2 + 0.35 + (r * (D - 0.55)) / Math.max(1, rows - 1);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let b = 0; b < 32; b++) {
        m.makeTranslation(-W / 2 + 0.15 + b * ((W - 0.3) / 31), H + 0.02, rowZ(r));
        bits.current?.setMatrixAt(i, m);
        bits.current?.setColorAt(i, col.setRGB(0, 0, 0));
        i++;
      }
    }
    if (bits.current) {
      bits.current.instanceMatrix.needsUpdate = true;
      if (bits.current.instanceColor) bits.current.instanceColor.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, W, col]);

  useFrame((st) => {
    if (group.current) group.current.position.y = INTERPOSER.top + lift.current;
    const s = store.get();
    const t = st.clock.elapsedTime * (U.uReduced.value ? 0 : 1);
    const k = A.now;
    for (let r = 0; r < rows; r++) {
      const head = heads.current[r];
      const active = s.scene.id === "now" && s.activeLayer === r ? 1 : 0.45;
      const hx = ((t * 0.35 + r * 0.27) % 1) * (W - 0.3) - (W - 0.3) / 2;
      if (head) {
        head.visible = k > 0.02;
        head.position.x = hx;
        (head.material as THREE.MeshBasicMaterial).opacity = k * active;
      }
      if (bits.current?.instanceColor) {
        for (let b = 0; b < 32; b++) {
          const bx = -W / 2 + 0.15 + b * ((W - 0.3) / 31);
          const written = bx < hx ? 1 : 0.35;
          const v = k * active * written * (((b * 7 + r * 3) % 5) > 1 ? 1.4 : 0.4);
          bits.current.setColorAt(r * 32 + b, col.setRGB(0.06 + 0.36 * v, 0.08 + 0.95 * v, 0.11 + v));
        }
      }
    }
    if (bits.current?.instanceColor) bits.current.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={group} position={[cx(N0), INTERPOSER.top, cz(N0)]}>
      <mesh position={[0, H / 2, 0]} raycast={() => null}>
        <boxGeometry args={[W - 0.06, H, D - 0.06]} />
        <meshStandardMaterial {...dieMat} />
      </mesh>
      <instancedMesh ref={bits} args={[undefined, undefined, rows * 32]} raycast={() => null}>
        <boxGeometry args={[0.04, 0.03, 0.12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
      {Array.from({ length: rows }, (_, r) => (
        <mesh key={r} ref={(el) => void (heads.current[r] = el)} position={[0, H + 0.08, rowZ(r)]} raycast={() => null} visible={false}>
          <boxGeometry args={[0.03, 0.04, 0.24]} />
          <meshBasicMaterial color={new THREE.Color("#5cf2ff").multiplyScalar(2)} toneMapped={false} transparent />
        </mesh>
      ))}
      <Labels defs={[{ text: "N0 SCRATCHPAD", h: 0.09, pos: [-W / 2 + 0.08, H + 0.003, -D / 2 + 0.12] }]} max={512} />
    </group>
  );
}

/* --------------------------------------------------------------- L0 */

/** The log buffer is a DNP site — Do Not Populate. A ring of empty pads
 *  and nothing placed on it, because there are no posts yet. */
function DnpSite() {
  const pads = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const scan = useRef<THREE.Mesh>(null);
  const W = bw(L0);
  const D = bd(L0);
  const lift = useHoverLift("writing");
  const group = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    const per = 7;
    for (let s = 0; s < 4; s++) {
      for (let k = 0; k < per; k++) {
        const t = (k + 0.5) / per;
        let x = 0, z = 0, r = 0;
        if (s === 0) { x = -W / 2 + 0.3 + t * (W - 0.6); z = -D / 2 + 0.25; }
        if (s === 1) { x = -W / 2 + 0.3 + t * (W - 0.6); z = D / 2 - 0.25; }
        if (s === 2) { z = -D / 2 + 0.3 + t * (D - 0.6); x = -W / 2 + 0.22; r = Math.PI / 2; }
        if (s === 3) { z = -D / 2 + 0.3 + t * (D - 0.6); x = W / 2 - 0.22; r = Math.PI / 2; }
        m.compose(new THREE.Vector3(x, 0.006, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r), new THREE.Vector3(1, 1, 1));
        pads.current?.setMatrixAt(i++, m);
      }
    }
    if (pads.current) pads.current.instanceMatrix.needsUpdate = true;
  }, [W, D]);

  useFrame(() => {
    if (group.current) group.current.position.y = INTERPOSER.top + lift.current;
    if (mat.current) mat.current.emissiveIntensity = A.dnp * 0.6;
    if (scan.current) {
      scan.current.visible = A.dnpScan >= 0 && A.dnpScan <= 1;
      scan.current.position.x = -W / 2 + A.dnpScan * W;
    }
  });

  return (
    <group ref={group} position={[cx(L0), INTERPOSER.top, cz(L0)]}>
      <instancedMesh ref={pads} args={[undefined, undefined, 28]} raycast={() => null}>
        <boxGeometry args={[0.16, 0.01, 0.1]} />
        <meshStandardMaterial ref={mat} color="#e9c376" metalness={1} roughness={0.2} emissive="#ffb547" emissiveIntensity={0} />
      </instancedMesh>
      {posts.slice(0, 1).map((p) => (
        <mesh key={p.slug} position={[0, 0.06, 0]} raycast={() => null}>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial {...dieMat} />
        </mesh>
      ))}
      <mesh ref={scan} position={[0, 0.03, 0]} raycast={() => null} visible={false}>
        <boxGeometry args={[0.02, 0.04, D - 0.2]} />
        <meshBasicMaterial color={new THREE.Color("#ffb547").multiplyScalar(2)} toneMapped={false} />
      </mesh>
      <Labels
        defs={[
          { text: "LOG BUFFER", h: 0.11, pos: [0, 0.008, -0.12], anchor: "center", color: "#e9eef4" },
          { text: `DNP / ${posts.length} POSTS`, h: 0.09, pos: [0, 0.008, 0.12], anchor: "center", color: "#e9eef4" },
        ]}
        gain={0.9}
        max={512}
      />
    </group>
  );
}

/* --------------------------------------------------------------- IO0 */

/** The I/O die: 24 SerDes lanes. Origin of the power wave and every packet;
 *  on /contact the whole lane array flashes. */
function IoDie() {
  const lanes = useRef<THREE.InstancedMesh>(null);
  const col = useMemo(() => new THREE.Color(), []);
  const W = bw(IO0);
  const D = bd(IO0);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < 24; i++) {
      m.makeTranslation(-W / 2 + 0.4 + i * ((W - 0.8) / 23), 0.145, 0);
      lanes.current?.setMatrixAt(i, m);
      lanes.current?.setColorAt(i, col.setRGB(0.36 * 2, 0.95 * 2, 2));
    }
    if (lanes.current) {
      lanes.current.instanceMatrix.needsUpdate = true;
      if (lanes.current.instanceColor) lanes.current.instanceColor.needsUpdate = true;
    }
  }, [W, col]);
  useFrame((st) => {
    if (!lanes.current?.instanceColor) return;
    const on = Math.min(1, U.uPower.value / 4);
    const t = st.clock.elapsedTime;
    for (let i = 0; i < 24; i++) {
      const flick = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7) * (U.uReduced.value ? 0 : 1);
      const v = (0.22 + A.lanes * 3.4) * on * flick;
      lanes.current.setColorAt(i, col.setRGB(0.36 * v, 0.95 * v, v));
    }
    lanes.current.instanceColor.needsUpdate = true;
  });
  return (
    <group position={[cx(IO0), INTERPOSER.top, cz(IO0)]}>
      <mesh position={[0, 0.07, 0]} raycast={() => null}>
        <boxGeometry args={[W, 0.14, D]} />
        <meshStandardMaterial color="#12161c" metalness={0.8} roughness={0.25} />
      </mesh>
      <instancedMesh ref={lanes} args={[undefined, undefined, 24]} raycast={() => null}>
        <boxGeometry args={[0.12, 0.012, D - 0.4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Labels defs={[{ text: "IO0 · 24 SERDES LANES", h: 0.12, pos: [-W / 2 + 0.2, 0.152, D / 2 - 0.08] }]} max={512} />
    </group>
  );
}

export default function SmallDies({ low }: { low: boolean }) {
  return (
    <group>
      <ControlDie low={low} />
      <Scratchpad />
      <DnpSite />
      <IoDie />
    </group>
  );
}
