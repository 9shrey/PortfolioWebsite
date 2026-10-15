"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { blob } from "./textures";
import { SUBSTRATE } from "@/app/data/package";

/** A dark radial dome (dithered so it doesn't band), a faint floor glow,
 *  the package's soft shadow, and fog that matches the page's void colour. */
export default function Backdrop() {
  const dome = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main() {
            float t = smoothstep(-0.2, 0.9, vDir.y);
            vec3 c = mix(vec3(0.043, 0.055, 0.078), vec3(0.012, 0.02, 0.035), t);
            c += (hash(gl_FragCoord.xy) - 0.5) / 255.;
            gl_FragColor = vec4(c, 1.);
          }
        `,
      }),
    []
  );
  const shadow = useMemo(() => blob(), []);
  return (
    <>
      <color attach="background" args={["#030509"]} />
      <fog attach="fog" args={["#030509", 24, 60]} />
      <mesh material={dome} raycast={() => null}>
        <sphereGeometry args={[40, 32, 16]} />
      </mesh>
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#0f1a24" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[SUBSTRATE.w * 1.3, SUBSTRATE.d * 1.3]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.8} />
      </mesh>
    </>
  );
}
