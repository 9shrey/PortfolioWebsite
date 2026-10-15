"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { A } from "./anim";
import { U, POWER_MAX } from "./uniforms";
import { live, store, type UIState } from "../ui/store";
import {
  CONTACT_BURST,
  POSE_INTRO_A,
  POSE_INTRO_B,
  POWER_ORIGIN,
  TOWERS,
  burstKeyFor,
  poseFor,
  routeIdFor,
  type Pose,
  type SceneState,
  type V3,
} from "@/app/data/package";

/* ==========================================================================
   The Director owns the camera and every scene-level animation. The URL
   (store.scene) is the only input: Links, 3D clicks, the terminal, Jev,
   back/forward all arrive here the same way. Flights re-seed from the live
   camera, so rapid navigation never makes the camera jump.
   ========================================================================== */

const v3 = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const C0_GAIN: Record<SceneState["id"], number> = {
  home: 1,
  work: 1.6,
  project: 1,
  experience: 0.5,
  about: 0.5,
  now: 0.5,
  writing: 0.5,
  contact: 0.5,
};

/** Time for the expo.out power wave to reach a lot. */
function waveArrival(x: number, z: number, start: number, dur: number) {
  const d = Math.hypot(x - POWER_ORIGIN[0], z - POWER_ORIGIN[1]);
  const y = Math.min(0.999, d / POWER_MAX);
  return start + dur * (-Math.log2(1 - y) / 10);
}

export default function Director({ mobile }: { mobile: boolean }) {
  const { camera, size, invalidate } = useThree();
  const cam = useRef({ pos: v3([7.6, 10.8, 14.6]), target: v3([-0.4, 0.5, 0.2]), fov: 30 });
  const off = useRef({ x: 0, y: 0 });
  const flight = useRef<{ t: number; from: Pose; to: Pose; ctrl: THREE.Vector3; active: boolean; dur: number }>({
    t: 1,
    from: POSE_INTRO_B,
    to: POSE_INTRO_B,
    ctrl: new THREE.Vector3(),
    active: false,
    dur: 1,
  });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const actions = useRef<gsap.core.Timeline | null>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const scroll = useRef(0);
  const roll = useRef(0);
  const parallax = useRef(new THREE.Vector3());
  const lastInput = useRef(0);
  const settled = useRef(false);
  const prevPos = useRef(new THREE.Vector3());
  const yawVel = useRef(0);
  const drag = useRef<{ x: number; active: boolean } | null>(null);
  const yawIdle = useRef(0);

  const aspect = () => size.width / Math.max(1, size.height);
  const poseNow = (sc: SceneState) => poseFor(sc, { p: scroll.current, aspect: aspect(), mobile });

  /* ------------------------------------------------------ scene states */

  /** Put every part into the state a scene wants, either tweened (with a
   *  0.7·dur delay for the destination action) or snapped. */
  const applyScene = (sc: SceneState, opts: { snap: boolean; delay: number }) => {
    actions.current?.kill();
    const t = gsap.timeline();
    actions.current = t;
    const d = opts.snap ? 0 : 1;
    const ti = sc.id === "project" ? TOWERS.findIndex((x) => x.slug === sc.slug) : -1;

    // Collapse whatever the previous scene opened.
    t.to(A, { hbm: sc.id === "experience" ? A.hbm : 0, duration: 0.45 * d, ease: "power2.in" }, 0);
    t.to(A, { a0: sc.id === "about" ? A.a0 : 0, duration: 0.4 * d }, 0);
    t.to(A.a0Cells, { 0: 0, 1: 0, 2: 0, 3: 0, duration: 0.3 * d }, 0);
    t.to(A, { now: 0, dnp: 0, bga: 0, duration: 0.3 * d }, 0);
    if (A.platesTower !== ti) t.to(A, { plates: 0, duration: 0.3 * d }, 0);
    TOWERS.forEach((_, i) => {
      t.to(A.sel, { [i]: 0, duration: 0.4 * d }, 0);
      t.to(A.dim, { [i]: ti >= 0 && i !== ti ? 0.3 : 0, duration: 0.5 * d }, 0);
    });
    t.to(U.uC0Gain, { value: C0_GAIN[sc.id], duration: 0.8 * d }, 0);

    // Destination action.
    const at = opts.snap ? 0 : opts.delay;
    switch (sc.id) {
      case "work":
        t.fromTo(A, { hub: 1 }, { hub: 0, duration: 1.2 * d, ease: "power2.out" }, at);
        TOWERS.forEach((_, i) => t.fromTo(A.sel, { [i]: 0.9 }, { [i]: 0, duration: 0.6 * d, immediateRender: false }, at + i * 0.12 * d));
        break;
      case "project":
        if (ti >= 0) {
          t.set(A, { platesTower: ti }, at);
          t.to(A.sel, { [ti]: 1, duration: 0.4 * d }, at);
          t.fromTo(A.fill, { [ti]: 0 }, { [ti]: 1, duration: 0.9 * d, ease: "power2.out", immediateRender: false }, at);
          t.to(A, { plates: 1, duration: 0.9 * d, ease: "power2.out" }, at + 0.1 * d);
        }
        break;
      case "experience":
        t.to(A, { hbm: 1, duration: 0.8 * d, ease: "power3.out" }, at);
        break;
      case "about":
        t.to(A, { a0: 1, duration: 0.7 * d, ease: "power3.out" }, at);
        [0, 1, 2, 3].forEach((g) => t.to(A.a0Cells, { [g]: 1, duration: 0.4 * d }, at + 0.2 * d + g * 0.08 * d));
        break;
      case "now":
        t.to(A, { now: 1, duration: 0.6 * d }, at);
        break;
      case "writing":
        t.to(A, { dnp: 0.6, duration: 0.5 * d }, at);
        if (!opts.snap) t.fromTo(A, { dnpScan: 0 }, { dnpScan: 1, duration: 2.4, ease: "none", immediateRender: false, onComplete: () => void (A.dnpScan = -1) }, at);
        break;
      case "contact":
        t.to(A, { bga: 1, duration: 0.5 * d }, at);
        break;
    }
    if (opts.snap) t.progress(1);
  };

  /** Packet burst along the destination's route (contact: every lane). */
  const burst = (sc: SceneState) => {
    const key = burstKeyFor(sc);
    if (sc.id === "contact") {
      U.uBurstRoute.value = CONTACT_BURST;
      gsap.fromTo(A, { lanes: 1 }, { lanes: 0, duration: 1.1, ease: "power2.out" });
      return;
    }
    if (!key) return;
    U.uBurstRoute.value = routeIdFor(key);
    gsap.fromTo(U.uBurstT, { value: 0 }, { value: 1.1, duration: 0.6, ease: "none" });
  };

  /* --------------------------------------------------------- navigation */

  /** `tour` = the scene changed because the home tour scrolled, not because
   *  of navigation: fly short, flat and front-loaded so the camera keeps up
   *  with the wheel instead of trailing a chapter behind. */
  const go = (sc: SceneState, prev: SceneState | null, tour = false) => {
    const reduced = store.get().reduced;
    tl.current?.kill();
    settled.current = false;
    const to = poseNow(sc);

    if (reduced || !prev) {
      // Cut (reduced) or snap (first frame / deep link).
      cam.current.pos.copy(v3(to.pos));
      cam.current.target.copy(v3(to.target));
      cam.current.fov = to.fov;
      A.flip = sc.flipped ? Math.PI : 0;
      flight.current.active = false;
      applyScene(sc, { snap: true, delay: 0 });
      settled.current = true;
      invalidate();
      return;
    }

    const from: Pose = {
      pos: cam.current.pos.toArray() as V3,
      target: cam.current.target.toArray() as V3,
      fov: cam.current.fov,
    };
    const d = v3(to.pos).distanceTo(cam.current.pos);
    const dur = tour ? THREE.MathUtils.clamp(0.45 + 0.03 * d, 0.55, 0.9) : THREE.MathUtils.clamp(0.9 + 0.07 * d, 1.1, 2.0);
    const mid = v3(from.pos).add(v3(to.pos)).multiplyScalar(0.5);
    mid.y += tour ? 0.2 + 0.05 * d : 1.0 + 0.2 * d;
    const f = flight.current;
    Object.assign(f, { t: 0, from, to, ctrl: mid, active: true, dur });

    const t = gsap.timeline();
    tl.current = t;
    const leavingContact = prev.id === "contact" && sc.id !== "contact";
    const k = tour ? 0.6 : 1;
    const start = leavingContact ? 0.5 * k : 0.05 * k;
    if (leavingContact) t.to(A, { flip: 0, duration: 0.9 * k, ease: "power3.inOut" }, 0);
    if (sc.id === "contact") t.to(A, { flip: Math.PI, duration: 1.3 * k, ease: "power3.inOut" }, start);
    t.call(() => burst(sc), [], 0);
    t.to(f, {
      t: 1,
      duration: dur,
      ease: tour ? "power3.out" : "power2.inOut",
      onComplete: () => {
        f.active = false;
        settled.current = true;
      },
    }, start);
    t.fromTo(U.uTraffic, { value: 1 }, { value: 3, duration: dur / 2, ease: "sine.in", yoyo: true, repeat: 1 }, start);
    applyScene(sc, { snap: false, delay: start + (tour ? 0.25 : 0.7) * dur });
  };

  /* -------------------------------------------------------------- intro */

  const playIntro = () => {
    intro.current?.kill();
    const low = store.get().tier === "low";
    const t = gsap.timeline({
      onComplete: () => {
        if (store.get().intro !== "done") {
          delete document.documentElement.dataset.intro;
          store.set({ intro: "done" });
        }
      },
    });
    intro.current = t;
    // Initial state: sealed lid, dark die, towers flat, macro shot.
    A.lidMounted = true;
    A.lid = 0;
    A.lidOpacity = 1;
    A.m9 = low ? 1 : 0;
    A.m8 = low ? 1 : 0;
    U.uPower.value = 0;
    TOWERS.forEach((_, i) => (A.grow[i] = 0));
    cam.current.pos.copy(v3(POSE_INTRO_A.pos));
    cam.current.target.copy(v3(POSE_INTRO_A.target));
    cam.current.fov = POSE_INTRO_A.fov;
    settled.current = false;
    flight.current.active = false;

    const camObj = { k: 0 };
    t.to(camObj, {
      k: 1,
      duration: 1.4,
      ease: "power1.inOut",
      onUpdate: () => {
        cam.current.pos.lerpVectors(v3(POSE_INTRO_A.pos), v3(POSE_INTRO_B.pos), camObj.k);
      },
    }, 0.3);
    t.set(A, { spot: -9 }, 0.3);
    t.to(A, { spot: 9, duration: 1.4, ease: "power1.inOut" }, 0.3);
    t.set(A, { spot: null }, 1.75);
    t.to(A, { lid: 1, lidOpacity: 0, duration: 0.8, ease: "power2.in" }, 1.6);
    t.set(A, { lidMounted: false }, 2.4);
    if (!low) {
      t.to(A, { m9: 1, duration: 0.6, ease: "power2.in" }, 2.0);
      t.to(A, { m8: 1, duration: 0.6, ease: "power2.in" }, 2.15);
    }
    t.to(U.uPower, { value: POWER_MAX, duration: 1.4, ease: "expo.out" }, 2.2);
    TOWERS.forEach((tw, i) => {
      t.to(A.grow, { [i]: 1, duration: 0.7, ease: "power3.out" }, waveArrival(tw.x, tw.z, 2.2, 1.4));
    });
    // Pull back to the home pose.
    t.call(() => {
      const to = poseNow(store.get().scene);
      const from: Pose = { pos: cam.current.pos.toArray() as V3, target: cam.current.target.toArray() as V3, fov: cam.current.fov };
      const mid = v3(from.pos).add(v3(to.pos)).multiplyScalar(0.5);
      mid.y += 2.5;
      Object.assign(flight.current, { t: 0, from, to, ctrl: mid, active: true, dur: 1.6 });
    }, [], 2.4);
    t.to(flight.current, {
      t: 1,
      duration: 1.6,
      ease: "power2.inOut",
      onComplete: () => {
        flight.current.active = false;
        settled.current = true;
      },
    }, 2.4);
    // HTML hero extrudes as the camera lands.
    t.call(() => void delete document.documentElement.dataset.intro, [], 3.4);
  };

  const finishIntro = () => {
    const t = intro.current;
    if (t && t.progress() < 1) t.progress(1);
    A.spot = null;
    A.lidMounted = false;
  };

  /* -------------------------------------------------------- subscriptions */

  // Dev-only handle for inspecting the scene from the console.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__ss26 = {
      A,
      U,
      store,
      live,
      camera,
      cam: cam.current,
      flight: flight.current,
      settled,
      /** Replay the intro and freeze it at t seconds. */
      seekIntro: (t: number) => {
        if (!intro.current || intro.current.progress() >= 1) playIntro();
        intro.current?.pause();
        intro.current?.seek(t);
      },
      /** Jump every running timeline to its end (inspecting end states). */
      finish: () => {
        intro.current?.progress(1);
        tl.current?.progress(1);
        actions.current?.progress(1);
        gsap.globalTimeline.getChildren().forEach((c) => c.progress(1));
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useEffect(() => {
    let prev: UIState = store.get();
    let started = false;

    const start = (s: UIState) => {
      started = true;
      if (s.intro === "playing" && s.scene.id === "home" && !s.reduced) {
        go(s.scene, null);
        playIntro();
      } else {
        // Deep link / reload: snap, then a 0.9 s power wave only.
        go(s.scene, null);
        A.lidMounted = false;
        if (s.reduced) U.uPower.value = POWER_MAX;
        else gsap.fromTo(U.uPower, { value: 0 }, { value: POWER_MAX, duration: 0.9, ease: "power2.out" });
      }
    };

    const onChange = () => {
      const s = store.get();
      U.uReduced.value = s.reduced ? 1 : 0;
      if (!started && s.ready) start(s);
      else if (started) {
        // The scene changes on navigation *or* when the home tour scrolls
        // into a new chapter — both fly the camera the same way.
        const key = (sc: SceneState) => `${sc.id}:${sc.slug ?? ""}`;
        if (key(s.scene) !== key(prev.scene)) {
          if (s.intro !== "done" && s.path !== prev.path) finishIntro();
          go(s.scene, prev.scene, s.path === prev.path);
        }
        if (prev.intro !== "done" && s.intro === "done") finishIntro();
      }
      if (s.reduced) invalidate();
      prev = s;
    };
    const unsub = store.subscribe(onChange);
    onChange();
    return () => {
      unsub();
      tl.current?.kill();
      actions.current?.kill();
      intro.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pointer: parallax, patrol idle clock, home drag (fine pointer only).
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      lastInput.current = performance.now();
      live.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      live.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      live.pointer.active = true;
      const dg = drag.current;
      if (dg?.active && fine) {
        const dx = e.clientX - dg.x;
        dg.x = e.clientX;
        yawVel.current = dx * 0.004;
        A.yaw = THREE.MathUtils.clamp(A.yaw + dx * 0.004, -0.44, 0.44);
        yawIdle.current = performance.now();
      }
    };
    const onDown = (e: PointerEvent) => {
      lastInput.current = performance.now();
      const ui = (e.target as Element | null)?.closest?.("[data-ui]");
      if (fine && !ui && store.get().scene.id === "home" && store.get().intro === "done") drag.current = { x: e.clientX, active: true };
    };
    const onUp = () => {
      if (drag.current) drag.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", () => void (lastInput.current = performance.now()), { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* --------------------------------------------------------------- frame */

  const tmpPos = useRef(new THREE.Vector3());
  const tmpTarget = useRef(new THREE.Vector3());
  useFrame((st, rawDt) => {
    const camera = st.camera as THREE.PerspectiveCamera;
    const size = st.size;
    const dt = Math.min(rawDt, 0.05);
    const s = store.get();
    const reduced = s.reduced;
    if (!reduced) U.uTime.value += dt;
    scroll.current = THREE.MathUtils.damp(scroll.current, live.scroll, 8, dt);

    const c = cam.current;
    const f = flight.current;
    if (f.active) {
      const t = f.t;
      // Quadratic Bezier body, gaze leads the body.
      const a = v3(f.from.pos);
      const b = v3(f.to.pos);
      const omt = 1 - t;
      c.pos.set(
        omt * omt * a.x + 2 * omt * t * f.ctrl.x + t * t * b.x,
        omt * omt * a.y + 2 * omt * t * f.ctrl.y + t * t * b.y,
        omt * omt * a.z + 2 * omt * t * f.ctrl.z + t * t * b.z
      );
      const g = easeInOutCubic(Math.min(1, 1.12 * t));
      c.target.lerpVectors(v3(f.from.target), v3(f.to.target), g);
      c.fov = THREE.MathUtils.lerp(f.from.fov, f.to.fov, g) + 4 * Math.sin(Math.PI * t);
      live.camSpeed = Math.sin(Math.PI * t);
    } else {
      live.camSpeed = THREE.MathUtils.damp(live.camSpeed, 0, 6, dt);
      if (settled.current && s.ready) {
        // Settled: follow the (scroll-dependent) pose.
        const goal = poseNow(s.scene);
        const k = reduced ? 1000 : 6;
        c.pos.x = THREE.MathUtils.damp(c.pos.x, goal.pos[0], k, dt);
        c.pos.y = THREE.MathUtils.damp(c.pos.y, goal.pos[1], k, dt);
        c.pos.z = THREE.MathUtils.damp(c.pos.z, goal.pos[2], k, dt);
        c.target.x = THREE.MathUtils.damp(c.target.x, goal.target[0], k, dt);
        c.target.y = THREE.MathUtils.damp(c.target.y, goal.target[1], k, dt);
        c.target.z = THREE.MathUtils.damp(c.target.z, goal.target[2], k, dt);
        c.fov = THREE.MathUtils.damp(c.fov, goal.fov, k, dt);
      }
    }

    // Parallax (home + /work), patrol (home), all off for reduced/touch.
    const pos = tmpPos.current.copy(c.pos);
    const target = tmpTarget.current.copy(c.target);
    const fine = live.pointer.active && !mobile && !reduced;
    const wantPar = fine && (s.scene.id === "home" || s.scene.id === "work") && s.intro === "done";
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, wantPar ? live.pointer.x * 0.3 : 0, 4, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, wantPar ? live.pointer.y * 0.15 : 0, 4, dt);
    target.x += parallax.current.x;
    target.y += parallax.current.y;
    if (s.scene.id === "home" && !reduced && s.intro === "done" && performance.now() - lastInput.current > 6000) {
      const az = (6 * Math.PI) / 180 * Math.sin((st.clock.elapsedTime * 2 * Math.PI) / 40);
      pos.sub(target).applyAxisAngle(new THREE.Vector3(0, 1, 0), az).add(target);
    }

    // Home drag inertia + spring back after 2.5 s idle.
    if (!drag.current?.active) {
      if (Math.abs(yawVel.current) > 1e-4) {
        A.yaw = THREE.MathUtils.clamp(A.yaw + yawVel.current, -0.44, 0.44);
        yawVel.current *= 0.92;
      } else if (performance.now() - yawIdle.current > 2500 || s.scene.id !== "home") {
        A.yaw = THREE.MathUtils.damp(A.yaw, 0, 3, dt);
      }
    }

    camera.position.copy(pos);
    camera.lookAt(target);
    // Roll from lateral velocity, damped back to 0.
    const vel = pos.clone().sub(prevPos.current).divideScalar(Math.max(dt, 1e-3));
    prevPos.current.copy(pos);
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const lat = f.active ? vel.dot(right) : 0;
    roll.current = THREE.MathUtils.damp(roll.current, THREE.MathUtils.clamp(lat * 0.04 * 0.1, -0.06, 0.06), 5, dt);
    camera.rotateZ(roll.current);

    const pc = camera;
    if (Math.abs(pc.fov - c.fov) > 1e-3) {
      pc.fov = c.fov;
      pc.updateProjectionMatrix();
    }

    // View offset: subject beside the sheet (desktop), nudged up on home.
    const ox = mobile ? 0 : s.scene.sheet ? live.sheetFrac / 2 : 0;
    const oy = mobile ? 0 : s.scene.id === "home" ? 0.05 : 0;
    off.current.x = THREE.MathUtils.damp(off.current.x, ox, reduced ? 1000 : 3, dt);
    off.current.y = THREE.MathUtils.damp(off.current.y, oy, reduced ? 1000 : 3, dt);
    const W = size.width;
    const H = size.height;
    pc.setViewOffset(W, H, off.current.x * W, off.current.y * H, W, H);

    if (reduced && (f.active || Math.abs(live.camSpeed) > 0.001)) invalidate();
  });

  return null;
}
