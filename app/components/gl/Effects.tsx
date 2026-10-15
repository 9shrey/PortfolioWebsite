"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type ChromaticAberrationEffect } from "postprocessing";
import { live } from "../ui/store";

/** High tier only. Degrade levels (from the PerformanceMonitor in Stage):
 *  0 full · 1 bloom levels 7→5 · 2 drop CA + noise · 3 composer off. */
export default function Effects({ level }: { level: number }) {
  const ca = useRef<ChromaticAberrationEffect>(null);
  useFrame(() => {
    const k = Math.min(0.0022, live.camSpeed * 0.0022);
    ca.current?.offset.set(k, k);
  });
  if (level >= 3) return null;
  const levels = level >= 1 ? 5 : 7;
  return (
    <EffectComposer multisampling={0}>
      <Bloom key={`bloom-${levels}`} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.12} intensity={0.85} radius={0.72} levels={levels} />
      {level < 2 ? <ChromaticAberration ref={ca} radialModulation modulationOffset={0.35} offset={[0, 0]} /> : <></>}
      <Vignette offset={0.3} darkness={0.7} />
      {level < 2 ? <Noise premultiply opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} /> : <></>}
      <ToneMapping mode={ToneMappingMode.AGX} />
      <SMAA />
    </EffectComposer>
  );
}
