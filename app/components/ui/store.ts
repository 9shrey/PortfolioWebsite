"use client";

import { useSyncExternalStore } from "react";
import { resolveScene, type SceneState } from "@/app/data/package";

/** The one store the DOM overlay and the GL stage share. They live in
 *  separate React roots (R3F reconciles the Canvas itself), so this is a
 *  module store rather than context. Reactive fields go through `set`;
 *  per-frame values live on `live` and are read inside useFrame. */

export type Tier = "high" | "low" | "none";
export type IntroState = "pending" | "playing" | "done";

export interface UIState {
  path: string;
  scene: SceneState;
  /** Hovered part key: work, project:<slug>, role:0|1, about, now, writing, contact, bga:<ch>. */
  hover: string | null;
  /** Section in view on long sheets (project M5…M1, experience roles, now rows). */
  activeLayer: number;
  tier: Tier;
  reduced: boolean;
  intro: IntroState;
  ready: boolean;
  jevPhase: string | null;
  /** Work filter (a filterTag, or "All"). */
  filter: string;
  paused: boolean;
}

let state: UIState = {
  path: "/",
  scene: resolveScene("/"),
  hover: null,
  activeLayer: 0,
  tier: "high",
  reduced: false,
  intro: "pending",
  ready: false,
  jevPhase: null,
  filter: "All",
  paused: false,
};
const server = state;
const subs = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<UIState>) {
    let changed = false;
    for (const k in patch) {
      if (!Object.is(patch[k as keyof UIState], state[k as keyof UIState])) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export function useStore<T>(pick: (s: UIState) => T): T {
  return useSyncExternalStore(store.subscribe, () => pick(state), () => pick(server));
}

/** Non-reactive, read every frame. */
export const live = {
  /** Sheet scroll 0..1. */
  scroll: 0,
  /** Sheet width as a fraction of the viewport. */
  sheetFrac: 0,
  pointer: { x: 0, y: 0, active: false },
  camSpeed: 0,
  /** Screen position for the hover tag, written by the GL pointer. */
  tag: { x: 0, y: 0, visible: false, text: "" },
};
