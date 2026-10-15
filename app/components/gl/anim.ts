"use client";

import { TOWERS } from "@/app/data/package";

/** Animation state for the whole package. The Director tweens these with
 *  GSAP; every part reads them inside useFrame. Plain mutable numbers — no
 *  React state, so nothing re-renders mid-flight. */
export const A = {
  /** Package rotation about x: 0 die-up, π BGA-up (/contact). */
  flip: 0,
  /** Lid: 0 seated → 1 lifted away; opacity separately. */
  lid: 0,
  lidOpacity: 1,
  lidMounted: false,
  /** Intro metal layers peeling off C0 (0 on die → 1 gone). */
  m9: 1,
  m8: 1,
  /** HBM unstack 0..1 (/experience). */
  hbm: 0,
  /** A0 quadrant split 0..1 (/about). */
  a0: 0,
  /** A0 cell ignition 0..1 per group. */
  a0Cells: [0, 0, 0, 0],
  /** N0 rows lit 0..1 (/now). */
  now: 0,
  /** L0 DNP glow + scan (/writing). */
  dnp: 0,
  dnpScan: -1,
  /** BGA cluster pulse (/contact). */
  bga: 0,
  /** NoC hub pulse 0..1. */
  hub: 0,
  /** Per-tower: extrusion, window fill, selection rim, dim. */
  grow: TOWERS.map(() => 1),
  fill: TOWERS.map(() => 1),
  sel: TOWERS.map(() => 0),
  dim: TOWERS.map(() => 0),
  /** Delayer plates above the focused tower: 0 hidden → 1 in place. */
  plates: 0,
  platesTower: -1,
  /** Intro spotlight sweep x (null = off). */
  spot: null as number | null,
  /** Lane flash for the contact burst. */
  lanes: 0,
  /** Home drag: package yaw (radians), with inertia. */
  yaw: 0,
};
