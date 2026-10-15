"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { A } from "./anim";
import { focusPoint } from "./focus";
import { store } from "../ui/store";

/** Moonlight + a warm key, one cyan point light that roams to whatever is
 *  in focus, and a studio of Lightformers for reflections (never a preset
 *  or file — no HDR fetch). The intro adds a softbox spot that sweeps the
 *  lid so its brushed streak travels. */
export default function Lighting() {
  const roam = useRef<THREE.PointLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const s = store.get();
    const key = s.hover ?? s.scene.focus;
    focusPoint(key, goal);
    if (roam.current) {
      const p = roam.current.position;
      p.x = THREE.MathUtils.damp(p.x, goal.x, 4, dt);
      p.y = THREE.MathUtils.damp(p.y, goal.y + 1.5, 4, dt);
      p.z = THREE.MathUtils.damp(p.z, goal.z, 4, dt);
      roam.current.intensity = THREE.MathUtils.damp(roam.current.intensity, key ? 6 : 2, 4, dt);
    }
    if (spot.current) {
      spot.current.visible = A.spot !== null;
      if (A.spot !== null) {
        spot.current.position.set(A.spot, 6, 5);
        target.position.set(A.spot * 0.4, 0.8, 0);
      }
    }
  });

  return (
    <>
      <hemisphereLight args={["#1b2a44", "#05070a", 0.35]} />
      <directionalLight position={[-8, 14, 6]} color="#9db8ff" intensity={0.6} />
      <directionalLight position={[6, 10, 4]} color="#ffe2b8" intensity={0.9} />
      <pointLight ref={roam} color="#5cf2ff" intensity={2} distance={6} decay={2} position={[0, 2, 0]} />
      <primitive object={target} />
      <spotLight ref={spot} visible={false} angle={0.35} penumbra={1} intensity={120} decay={2} color="#ffffff" target={target} />
      <Environment resolution={256} frames={1} background={false} environmentIntensity={0.9}>
        <Lightformer form="rect" color="#bfe9ff" intensity={2.2} scale={[20, 1.2, 1]} position={[0, 8, -10]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" color="#ffb547" intensity={1.6} scale={[10, 0.6, 1]} position={[-12, 3, 4]} rotation-y={Math.PI / 2} />
        <Lightformer form="ring" color="#5cf2ff" intensity={3} scale={4} position={[8, 6, 8]} />
        <Lightformer form="rect" color="#ffffff" intensity={0.6} scale={[30, 30, 1]} position={[0, 20, 0]} rotation-x={Math.PI / 2} />
      </Environment>
    </>
  );
}
