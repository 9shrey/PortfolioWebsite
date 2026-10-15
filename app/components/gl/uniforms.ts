"use client";

import * as THREE from "three";
import { DIE_TOP, POWER_ORIGIN } from "@/app/data/package";

/** Uniforms shared by every patched material and the traffic shader. One
 *  object each, so updating `.value` here updates every program at once. */
export const U = {
  uTime: { value: 0 },
  /** Radius of the power wave from the I/O die (0 = dark, 18 = all on). */
  uPower: { value: 0 },
  uPowerOrigin: { value: new THREE.Vector2(POWER_ORIGIN[0], POWER_ORIGIN[1]) },
  /** Traffic speed multiplier (1 ambient, 3 mid-flight). */
  uTraffic: { value: 1 },
  /** Compute-die window gain (brighter on /work). */
  uC0Gain: { value: 1 },
  uBurstRoute: { value: -1 },
  uBurstT: { value: 2 },
  uPreviewRoute: { value: -1 },
  uPreviewT: { value: 0 },
  uReduced: { value: 0 },
  uDieTop: { value: DIE_TOP },
};

export const POWER_MAX = 18;
