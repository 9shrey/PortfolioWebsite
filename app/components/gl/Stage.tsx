"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Backdrop from "./Backdrop";
import Lighting from "./Lighting";
import Package from "./Package";
import ComputeDie from "./ComputeDie";
import Towers from "./Towers";
import Hbm from "./Hbm";
import SmallDies from "./SmallDies";
import Traffic from "./Traffic";
import DelayerStack from "./DelayerStack";
import Lid from "./Lid";
import Director from "./Director";
import Pointer from "./Pointer";
import Effects from "./Effects";
import { A } from "./anim";
import { disposeTextures, fontFamily } from "./textures";
import { store, useStore } from "../ui/store";

/** Warm every program up front, then declare the stage ready two frames
 *  later — so the intro never starts on a half-compiled scene. */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    (async () => {
      try {
        await gl.compileAsync(scene, camera);
      } catch {}
      if (cancelled) return;
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => !cancelled && store.set({ ready: true }));
      });
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [gl, scene, camera]);
  return null;
}

/** Package yaw from the home drag. */
function Yaw({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = A.yaw;
  });
  return <group ref={ref}>{children}</group>;
}

/** Reduced motion renders on demand; re-render when anything changes. */
function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => store.subscribe(() => invalidate()), [invalidate]);
  return null;
}

/** Lost context → HTML-only tier for the rest of the session. */
function ContextGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const c = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      store.set({ tier: "none", ready: false });
    };
    c.addEventListener("webglcontextlost", lost);
    return () => c.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  return null;
}

export default function Stage({ eventSource, navigate }: { eventSource: RefObject<HTMLDivElement | null>; navigate: (href: string) => void }) {
  const tier = useStore((s) => s.tier);
  const reduced = useStore((s) => s.reduced);
  const [fontsReady, setFontsReady] = useState(false);
  const [degrade, setDegrade] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const low = tier === "low";

  // Canvas labels draw with the page's fonts — wait for them.
  useEffect(() => {
    const fams = [fontFamily("--font-display"), fontFamily("--font-mono")];
    Promise.all([document.fonts.load(`800 72px ${fams[0]}`), document.fonts.load(`500 72px ${fams[1]}`)])
      .catch(() => {})
      .then(() => setFontsReady(true));
    return () => disposeTextures();
  }, []);

  // Phones: the canvas band pauses once the sheet scrolls over it.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setMobile(mq.matches);
      setPaused(mq.matches && window.scrollY > window.innerHeight * 0.46);
    };
    update();
    const onVis = () => setPaused(document.hidden);
    window.addEventListener("scroll", update, { passive: true });
    mq.addEventListener("change", update);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!fontsReady) return null;

  const dprMax = low ? 1 : [1.25, 1.0][Math.min(degrade, 1)];
  return (
    <Canvas
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={[1, dprMax]}
      gl={{ antialias: low, powerPreference: "high-performance", stencil: false, alpha: false }}
      camera={{ fov: 30, near: 0.1, far: 120, position: [7.6, 10.8, 14.6] }}
      frameloop={reduced ? "demand" : paused ? "never" : "always"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <Suspense fallback={null}>
        <Backdrop />
        <Lighting />
        <Yaw>
          <Package tier={tier}>
            <ComputeDie tier={tier} />
            <Towers />
            <Hbm />
            <SmallDies low={low} />
            <Traffic />
            <DelayerStack />
            <Lid />
            <Pointer navigate={navigate} interactive={!mobile && !low} />
          </Package>
        </Yaw>
        <Director mobile={mobile} />
        <Warmup />
      </Suspense>
      {!low && <Effects level={Math.max(0, degrade - 2)} />}
      {!low && (
        <PerformanceMonitor
          bounds={() => [45, 58]}
          flipflops={3}
          onDecline={() => setDegrade((d) => Math.min(d + 1, 5))}
          onFallback={() => store.set({ tier: "low" })}
        />
      )}
      {reduced && <Invalidator />}
      <ContextGuard />
    </Canvas>
  );
}
