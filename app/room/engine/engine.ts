import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { buildCity } from "./city";
import { buildBeam, buildPost } from "./fx";
import type { Drawn, Region } from "./cards";
import type { SceneInfo, View } from "../types";

/* The room: loads public/room (built by scripts/room), paints the baked atlases on, keeps the live
   surfaces (calendar, projector screen, posters, labels) drawn, moves the camera between views and
   tells the page what the pointer is over. No React in here; RoomApp talks to it. */

const BASE = "/room/";
const ATLAS: Record<string, string> = { shell: "atlas_shell", props: "atlas_props", books: "atlas_books", plant: "atlas_plant" };

export type Hit =
  | { kind: "action"; action: string; label: string }
  | { kind: "card"; id: string }
  | { kind: "view"; view: View; label: string }
  | { kind: "toy"; name: string; label: string };

export interface Settings {
  quality: "auto" | "full" | "smooth";
  glow: boolean;
  grain: boolean;
  motion: boolean;
  fps: boolean;
}
export const DEFAULT_SETTINGS: Settings = { quality: "auto", glow: true, grain: true, motion: true, fps: false };

export interface EngineEvents {
  progress(p: number): void;
  key(code: string): void;
  fps(fps: number): void;
  ready(): void;
  hover(hit: Hit | null, x: number, y: number): void;
  click(hit: Hit): void;
  installed(id: string): void;
}

type Pose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

/** how far the visitor can turn from the desk: enough for the projector and the shelves, never the back wall */
const YAW = 1.2;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class RoomEngine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  info!: SceneInfo;
  private ev: Partial<EngineEvents>;
  private raf = 0;
  private clock = new THREE.Clock();
  private city?: ReturnType<typeof buildCity>;
  private pickables: THREE.Object3D[] = [];
  private nodes = new Map<string, THREE.Object3D>();
  private live = new Map<string, THREE.MeshBasicMaterial>();
  private ray = new THREE.Raycaster();
  private pointer = new THREE.Vector2(9, 9);
  private sway = new THREE.Vector2();
  private pose!: Pose;
  private from!: Pose;
  private to!: Pose;
  private tween = 1;
  private tweenDur = 1.4;
  private cardHome = new Map<string, THREE.Matrix4>();
  private installedId: string | null = null;
  private anims: { t: number; dur: number; step(k: number): void; done?(): void }[] = [];
  private toys = new Map<string, number>();     // toy name -> time it was clicked
  private reduced = false;
  private dpr = 1;
  private slowFrames = 0;
  private hovered: Hit | null = null;
  private disposed = false;
  private canvas: HTMLCanvasElement;
  private post?: ReturnType<typeof buildPost>;
  private beam?: ReturnType<typeof buildBeam>;
  /** hover glow per clickable thing: its own copies of its materials, and how lit up it is */
  private glow = new Map<THREE.Object3D, { mats: THREE.Material[]; k: number }>();
  private gloss: (THREE.MeshPhysicalMaterial)[] = [];
  private hoverRoot: THREE.Object3D | null = null;
  private moving = new Set<THREE.Object3D>();
  /** looking around from the home spot: radians off the home direction, and how fast it's turning */
  private look = { yaw: 0, pitch: 0 };
  private dragging: { x: number; y: number; moved: boolean } | null = null;
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private clockStopped: number | null = null;   // the time the battery came out
  private keyBase = new Map<string, number>();
  private pressed = new Set<string>();
  private frames = 0; private fpsT = 0;
  private regions = new Map<string, { regions: Region[]; w: number; h: number; flipY: boolean }>();
  /** the laptop's screen: real HTML, placed on the lid with a CSS 3D transform */
  private css?: CSS3DRenderer;
  private cssScene = new THREE.Scene();
  private cssScreen?: CSS3DObject;

  /** Makes its own canvas inside `host`: two engines must never share a WebGL context
   *  (React mounts twice in development, and the first one may still be loading). */
  constructor(host: HTMLElement, events: Partial<EngineEvents>) {
    this.ev = events;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "room-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    host.prepend(this.canvas);
    const canvas = this.canvas;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.dpr = Math.min(devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.02, 200);
    this.scene.background = new THREE.Color("#05060a");
  }

  /** Replace or add event handlers after construction (the page's click handler changes with state). */
  setEvents(ev: Partial<EngineEvents>) { Object.assign(this.ev, ev); }

  // ------------------------------------------------------------------ loading
  async load() {
    this.info = await (await fetch(BASE + "scene.json")).json();
    const tl = new THREE.TextureLoader();
    let done = 0;
    const total = 6;
    const tick = () => this.ev.progress?.(++done / total);
    const tex = (url: string, srgb = true) =>
      tl.loadAsync(url).then((t) => {
        t.flipY = false;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return t;
      });

    const gltfP = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(BASE + "room.glb").then((g) => (tick(), g));
    const atlasP = Promise.all(Object.entries(ATLAS).map(async ([k, f]) => [k, await tex(`${BASE}${f}.webp`).then((t) => (tick(), t))] as const));
    const [gltf, atlases] = await Promise.all([gltfP, atlasP]);
    if (this.disposed) return;
    const atlasMat = Object.fromEntries(atlases.map(([k, t]) => [k, new THREE.MeshBasicMaterial({ map: t })]));

    const liveLoads: Promise<void>[] = [];
    gltf.scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) { if (o.name) this.nodes.set(o.name, o); return; }
      this.nodes.set(o.name, o);
      const mname: string = (o.material as THREE.Material).name || "";
      if (mname.startsWith("atlas_")) {
        o.material = atlasMat[mname.slice(6)];
      } else if (mname.startsWith("live_")) {
        const name = mname.slice(5);
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, lightMapIntensity: 1.25 });
        o.material = m; this.live.set(name, m);
        if (name.endsWith("_screen") && name !== "screen") {   // the phone and the laptop give off their own light
          if (name === "laptop_screen") m.color.set("#1b2233");
          return;
        }
        liveLoads.push((async () => {
          const shade = await tex(`${BASE}shade_${name}.webp`);
          shade.channel = 0;
          m.lightMap = shade;
          const img = this.info.live[name]?.image;
          if (img) m.map = await tex(`${BASE}${name.startsWith("poster") ? "posters" : "labels"}/${img}`);
          m.needsUpdate = true;
        })());
      }
    });
    await Promise.all(liveLoads); tick();
    if (this.disposed) return;
    this.scene.add(gltf.scene);

    // the city outside and rain on the glass
    const [ex, ey, ez] = this.info.home.pos;
    this.city = buildCity(this.info.window, { x: ex, y: ey, z: ez });
    this.scene.add(this.city.group);

    // the projector's beam, from the lens to the screen
    const scr = this.info.live.screen;
    this.beam = buildBeam(new THREE.Vector3(...this.info.lens), new THREE.Vector3(...scr.pos),
      new THREE.Vector3(...scr.normal).normalize(), scr.size[0], scr.size[1]);
    this.scene.add(this.beam.group);
    this.post = buildPost(this.renderer, this.scene, this.camera);
    this.scene.add(this.camera);


    // glossy things keep their baked look and gain real reflections (Felix's trick: lightmap + env map)
    this.glossify();

    // pickables: the things that do something
    const pick = (name: string, hit: Hit) => {
      const n = this.nodes.get(name);
      if (!n) return;
      const mats: THREE.MeshBasicMaterial[] = [];
      n.traverse((c) => {
        c.userData.hit = hit; c.userData.root = n;
        if (c instanceof THREE.Mesh && (c.material instanceof THREE.MeshBasicMaterial || c.material instanceof THREE.MeshPhysicalMaterial)) {
          // atlas materials are shared: copy one so only this thing lights up. Live and glossy ones are already its own.
          const own = [...this.live.values()].includes(c.material as THREE.MeshBasicMaterial) || c.material instanceof THREE.MeshPhysicalMaterial;
          if (!own && !c.material.name.startsWith("own:")) { c.material = c.material.clone(); c.material.name = "own:" + c.material.name; }
          mats.push(c.material);
        }
      });
      this.glow.set(n, { mats, k: 0 });
      this.pickables.push(n);
    };
    for (const id of this.info.cards) {
      const n = this.nodes.get(`gpu_${id}`);
      if (!n) continue;
      this.cardHome.set(id, n.matrix.clone());
      pick(`gpu_${id}`, { kind: "card", id });
    }
    pick("screen", { kind: "view", view: { kind: "work", card: "" }, label: "Projector" });
    pick("screen_stand", { kind: "view", view: { kind: "work", card: "" }, label: "Projector" });
    pick("badge", { kind: "view", view: { kind: "about" }, label: "About me" });
    pick("notebook", { kind: "view", view: { kind: "writing" }, label: "Writing" });
    pick("phone", { kind: "view", view: { kind: "contact" }, label: "Contact" });
    pick("laptop", { kind: "view", view: { kind: "about" }, label: "" });
    pick("laptop_lid", { kind: "view", view: { kind: "about" }, label: "" });
    pick("calendar", { kind: "view", view: { kind: "year" }, label: "This year" });
    pick("resume", { kind: "view", view: { kind: "resume" }, label: "Résumé" });
    pick("tray", { kind: "view", view: { kind: "resume" }, label: "Résumé" });
    pick("mug", { kind: "toy", name: "mug", label: "Chai" });
    pick("clock", { kind: "toy", name: "clock", label: "" });
    pick("clock_face", { kind: "toy", name: "clock", label: "" });
    pick("clock_battery", { kind: "toy", name: "clock", label: "" });
    for (let i = 0; this.nodes.has(`book_${i}`); i++) pick(`book_${i}`, { kind: "view", view: { kind: "books", book: i }, label: `book:${i}` });
    for (const [name, n] of this.nodes) if (name.startsWith("key_")) this.keyBase.set(name.slice(4), n.position.y);
    pick("plant", { kind: "toy", name: "plant", label: "" });
    pick("bench_fan", { kind: "toy", name: "fan", label: "" });
    pick("bench", { kind: "toy", name: "fan", label: "" });
    pick("keyboard", { kind: "toy", name: "keyboard", label: "" });
    pick("lamp", { kind: "toy", name: "lamp", label: "" });
    for (let i = 0; i < 6; i++) pick(`poster_${i}`, { kind: "toy", name: `poster_${i}`, label: "" });

    // the camera starts back by the door and walks in to the desk
    const h = this.info.home;
    this.pose = { pos: new THREE.Vector3(...h.pos).add(new THREE.Vector3(0.35, 0.3, 1.7)), look: new THREE.Vector3(...h.look).add(new THREE.Vector3(-0.3, 0.35, 0)), fov: h.fov + 6 };
    this.from = this.clonePose(this.pose); this.to = this.clonePose(this.pose);
    this.applyPose(this.pose);
    this.go({ kind: "home" }, false, 3.6);
    this.listen();
    this.resize();
    this.ev.ready?.();
    this.raf = requestAnimationFrame(this.frame);
    setTimeout(() => !this.disposed && this.captureEnv(), 1500);
  }

  // ------------------------------------------------------------------ live surfaces
  /** Draw on a live surface (calendar, screen): the page hands over a canvas. */
  setSurface(name: string, canvas: HTMLCanvasElement) {
    const m = this.live.get(name);
    if (!m) return;
    if (m.map instanceof THREE.CanvasTexture && m.map.image === canvas) { m.map.needsUpdate = true; return; }
    const t = new THREE.CanvasTexture(canvas);
    t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    m.map?.dispose(); m.map = t; m.needsUpdate = true;
  }

  // ------------------------------------------------------------------ views
  private clonePose(p: Pose): Pose { return { pos: p.pos.clone(), look: p.look.clone(), fov: p.fov }; }

  /** Camera pose that looks at `center` from direction `n` (unit, object -> camera), far enough to
   *  fit a w x h area, with the object nudged clear of the panel: left of it on wide screens, above
   *  the bottom sheet on narrow ones. */
  private frame3(center: THREE.Vector3, n: THREE.Vector3, w: number, h: number, fov = 40): Pose {
    const aspect = this.camera.aspect;
    const t = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    // the thing fills ~84% of the height, or ~92% of the width on a narrow screen
    const dist = Math.max(h / 2 / t / 0.84, w / 2 / (t * aspect) / 0.92);
    return { pos: center.clone().addScaledVector(n, dist), look: center.clone(), fov };
  }

  private faceOn(name: string, fill = 1.1): Pose {
    const s = this.info.live[name];
    const n = new THREE.Vector3(...s.normal).normalize();
    if (n.y > 0.9) n.add(new THREE.Vector3(0, 0, 0.32)).normalize();   // lying on the desk: lean back a little, as a head does
    return this.frame3(new THREE.Vector3(...s.pos), n, s.size[0] * fill, s.size[1] * fill);
  }

  /** Looking down at something on the desk from above and in front. */
  private desk(name: string, size: number, tilt = 0.55): Pose {
    const n = this.nodes.get(name)!;
    const c = new THREE.Box3().setFromObject(n).getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3(0, 1, tilt).normalize();
    return this.frame3(c, dir, size, size * 0.75);
  }

  poseFor(v: View): Pose {
    const h = this.info.home;
    switch (v.kind) {
      case "home": return { pos: new THREE.Vector3(...h.pos), look: new THREE.Vector3(...h.look), fov: h.fov };
      case "work": return this.faceOn("screen", 1.08);
      case "year": return this.faceOn("calendar", 1.05);
      case "about": case "writing": case "online": return this.faceOn("laptop_screen", 1.08);
      case "contact": return this.faceOn("phone_screen", 1.25);
      case "resume": return this.faceOn("resume_page", 1.08);
      case "books": {
        const sp = Object.entries(this.info.live).filter(([k]) => k.startsWith("spine_")).map(([, v]) => v);
        const c = sp.reduce((a, v) => a.add(new THREE.Vector3(...v.pos)), new THREE.Vector3()).divideScalar(Math.max(sp.length, 1));
        const ys = sp.map((v) => v.pos[2]);
        const w = Math.max(...ys) - Math.min(...ys) + 0.12;
        return this.frame3(c, new THREE.Vector3(...sp[0].normal).normalize(), w * 1.3, 0.34);
      }
    }
  }

  go(v: View, instant = false, dur?: number) {
    this.look.yaw = 0; this.look.pitch = 0;
    this.from = this.clonePose(this.pose);
    this.to = this.poseFor(v);
    const d = this.from.pos.distanceTo(this.to.pos);
    this.tweenDur = this.reduced || instant ? 0.001 : dur ?? THREE.MathUtils.clamp(0.9 + d * 0.35, 1.0, 2.2);
    this.tween = 0;
  }

  // ------------------------------------------------------------------ cards
  /** Moves a card from the rack into the bench slot (and the one there back to the rack). */
  install(id: string, instant = false) {
    if (id === this.installedId) return;
    const prev = this.installedId;
    this.installedId = id;
    const slot = new THREE.Matrix4().makeTranslation(...(this.info.slot as [number, number, number]));
    const parentInv = (n: THREE.Object3D) => new THREE.Matrix4().copy(n.parent!.matrixWorld).invert();
    const move = (n: THREE.Object3D, toLocal: THREE.Matrix4, delay: number, then?: () => void) => {
      const a = { p: n.position.clone(), q: n.quaternion.clone() };
      const b = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() };
      toLocal.decompose(b.p, b.q, b.s);
      const lift = 0.16;
      const dur = instant || this.reduced ? 0.001 : 1.1;
      this.moving.add(n);
      this.anims.push({
        t: -delay, dur,
        step: (k) => {
          const e = ease(k);
          n.position.lerpVectors(a.p, b.p, e);
          n.position.y += Math.sin(Math.PI * Math.min(1, k * 1.15)) * lift;
          n.quaternion.slerpQuaternions(a.q, b.q, ease(Math.min(1, k * 1.3)));
        },
        done: () => { this.moving.delete(n); then?.(); },
      });
    };
    if (prev) {
      const n = this.nodes.get(`gpu_${prev}`)!;
      move(n, this.cardHome.get(prev)!.clone(), 0);
    }
    const n = this.nodes.get(`gpu_${id}`)!;
    n.updateWorldMatrix(true, false);
    move(n, parentInv(n).multiply(slot), prev ? 0.45 : 0, () => {
      this.toys.set("fan", this.clock.elapsedTime);
      this.ev.installed?.(id);
    });
  }

  // ------------------------------------------------------------------ input
  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (e.pointerType === "mouse") this.sway.set(this.pointer.x, this.pointer.y);
    const hit = this.pick();
    if (hit !== this.hovered || hit) this.ev.hover?.(hit, e.clientX, e.clientY);
    this.hoverRoot = this.lastRoot;
    this.hovered = hit;
    this.canvas.style.cursor = hit ? "pointer" : "";
  };
  private onLeave = () => { this.pointer.set(9, 9); this.hovered = null; this.hoverRoot = null; this.ev.hover?.(null, 0, 0); this.canvas.style.cursor = ""; };
  private down = { x: 0, y: 0 };
  private onDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY };
    this.dragging = { x: e.clientX, y: e.clientY, moved: false };
  };
  private onDrag = (e: PointerEvent) => {
    if (!this.dragging || !this.atHome()) return;
    const dx = e.clientX - this.dragging.x, dy = e.clientY - this.dragging.y;
    if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 8) this.dragging.moved = true;
    this.look.yaw = THREE.MathUtils.clamp(this.look.yaw + dx * 0.0045, -YAW, YAW); this.look.pitch = THREE.MathUtils.clamp(this.look.pitch + dy * 0.003, -0.6, 0.5);
    this.dragging.x = e.clientX; this.dragging.y = e.clientY;
  };
  private onDragEnd = () => { this.dragging = null; };
  private onKey = (e: KeyboardEvent, down: boolean) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (!this.keyBase.has(e.code)) return;
    if (down) { if (!this.pressed.has(e.code)) this.ev.key?.(e.code); this.pressed.add(e.code); }
    else this.pressed.delete(e.code);
  };
  private onKeyDown = (e: KeyboardEvent) => this.onKey(e, true);
  private onKeyUp = (e: KeyboardEvent) => this.onKey(e, false);
  private onBlur = () => this.pressed.clear();
  private atHome() { return this.tween >= 1 && this.isHome(); }
  private onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 8) return;
    this.onMove(e);
    const hit = this.pick();
    if (this.clockStopped !== null && this.lastRoot?.name === "clock_battery") { this.toys.set("clock", this.clock.elapsedTime); this.clickClock(); return; }
    if (!hit) return;
    if (hit.kind === "toy") this.toys.set(hit.name, this.clock.elapsedTime);
    if (hit.kind === "toy" && hit.name === "clock") return this.clickClock(), this.ev.click?.(hit);
    if (hit.kind === "toy" && hit.name === "keyboard") { for (let i = 0; i < 6; i++) setTimeout(() => this.tapRandomKey(), i * 90); }
    this.ev.click?.(hit);
  };

  private lastRoot: THREE.Object3D | null = null;
  /** Which region of a drawn surface (card or projector screen) a hit landed on. */
  private regionAt(name: string, uv?: THREE.Vector2): Hit | null {
    const r = this.regions.get(name);
    if (!r || !uv) return null;
    const x = uv.x * r.w, y = (r.flipY ? 1 - uv.y : uv.y) * r.h;
    const hit = r.regions.find((g) => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h);
    return hit ? { kind: "action", action: hit.action, label: hit.label } : null;
  }

  private pick(): Hit | null {
    this.ray.setFromCamera(this.pointer, this.camera);
    const hits = this.ray.intersectObjects(this.pickables, true);
    // links drawn on live surfaces work once you're looking at them
    const on = hits[0]?.object.name;
    if (on && this.regions.has(on) && !this.atHome()) {
      const r = this.regionAt(on, hits[0].uv);
      if (r) { this.lastRoot = null; return r; }
    }
    this.lastRoot = (hits[0]?.object.userData.root as THREE.Object3D) ?? null;
    return (hits[0]?.object.userData.hit as Hit) ?? null;
  }

  private listen() {
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerleave", this.onLeave);
    this.canvas.addEventListener("pointerdown", this.onDown);
    this.canvas.addEventListener("pointerup", this.onUp);
    addEventListener("pointermove", this.onDrag);
    addEventListener("pointerup", this.onDragEnd);
    addEventListener("keydown", this.onKeyDown);
    addEventListener("keyup", this.onKeyUp);
    addEventListener("blur", this.onBlur);
    addEventListener("resize", this.resize);
  }

  resize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.post?.setSize(w, h, this.dpr);
    this.css?.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ------------------------------------------------------------------ frame
  private applyPose(p: Pose) {
    // the home view widens on narrow screens so the desk still fits
    const narrow = THREE.MathUtils.clamp((1.5 - this.camera.aspect) / 1.0, 0, 1);
    this.camera.fov = p.fov + narrow * 18 * (this.tween >= 1 && this.isHome() ? 1 : 0);
    this.camera.position.copy(p.pos);
    const down = new THREE.Vector3().subVectors(p.look, p.pos).normalize().y < -0.97;
    this.camera.up.set(0, down ? 0 : 1, down ? -1 : 0);
    this.camera.lookAt(p.look);
    this.camera.updateProjectionMatrix();
  }
  private isHome() { return this.to.pos.distanceTo(new THREE.Vector3(...this.info.home.pos)) < 0.01; }

  private frame = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    // camera: tween between views, then a little sway toward the pointer
    if (this.tween < 1) {
      this.tween = Math.min(1, this.tween + dt / this.tweenDur);
      // the look turns first, as a head does, then the body follows, rising a little on the way
      const kl = ease(Math.min(1, this.tween * 1.6));
      const k = ease(Math.max(0, (this.tween - 0.12) / 0.88));
      this.pose.pos.lerpVectors(this.from.pos, this.to.pos, k);
      this.pose.pos.y += Math.sin(Math.PI * k) * Math.min(0.08, this.from.pos.distanceTo(this.to.pos) * 0.05);
      this.pose.look.lerpVectors(this.from.look, this.to.look, kl);
      this.pose.fov = THREE.MathUtils.lerp(this.from.fov, this.to.fov, k);
    }
    // looking around from the home spot: drag, or rest the pointer near an edge and the view turns
    if (this.atHome()) {
      if (!this.dragging && !this.hovered && Math.abs(this.pointer.x) <= 1) {
        const edge = (v: number, from = 0.62) => Math.sign(v) * Math.pow(Math.max(0, (Math.abs(v) - from) / (1 - from)), 2);
        this.look.yaw = THREE.MathUtils.clamp(this.look.yaw - edge(this.pointer.x) * dt * 1.5, -YAW, YAW);
        this.look.pitch = THREE.MathUtils.clamp(this.look.pitch + edge(this.pointer.y, 0.7) * dt * 0.8, -0.6, 0.5);
      }
      const h = this.info.home;
      const base = new THREE.Vector3(...h.look).sub(new THREE.Vector3(...h.pos));
      const len = base.length();
      const dir = base.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.look.yaw);
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      dir.applyAxisAngle(right, this.look.pitch);
      this.pose.look.copy(this.pose.pos).addScaledVector(dir, len);
    }
    const p = this.clonePose(this.pose);
    if (this.settings.motion && !this.reduced) {
      const amt = this.isHome() ? 0.06 : 0.012;
      p.pos.x += this.sway.x * amt; p.pos.y += this.sway.y * amt * 0.6;
      p.pos.y += Math.sin(t * 0.4) * 0.003;
    }
    this.applyPose(p);

    // card moves
    for (const a of this.anims) {
      a.t += dt;
      if (a.t >= 0) a.step(Math.min(1, a.t / a.dur));
    }
    for (const a of this.anims.filter((a) => a.t >= a.dur)) a.done?.();
    this.anims = this.anims.filter((a) => a.t < a.dur);

    // toys
    const since = (name: string) => t - (this.toys.get(name) ?? -99);
    const fan = this.nodes.get("bench_fan");
    if (fan) fan.rotation.z += dt * (this.installedId ? 7 + 30 * Math.exp(-since("fan") * 0.6) : 2);
    for (const s of ["projector_spool_takeup", "projector_spool_feed"]) {
      const n = this.nodes.get(s); if (n) n.rotation.x -= dt * 1.4;
    }
    const mug = this.nodes.get("mug");
    if (mug) {
      const k = since("mug");
      const lift = k < 2.2 ? Math.sin(Math.min(1, k / 2.2) * Math.PI) : 0;
      mug.userData.base ??= mug.position.y;
      mug.position.y = mug.userData.base + lift * 0.09;
      mug.rotation.z = lift * 0.5;
    }
    const plant = this.nodes.get("plant");
    if (plant) {
      const k = since("plant");
      plant.rotation.z = Math.sin(t * 0.9) * 0.004 + (k < 3 ? Math.sin(k * 14) * Math.exp(-k * 1.6) * 0.04 : 0);
    }
    for (let i = 0; i < 6; i++) {
      const k = since(`poster_${i}`);
      const n = this.nodes.get(`poster_frame_${i}`), a = this.nodes.get(`poster_${i}`);
      const r = k < 4 ? Math.sin(k * 7) * Math.exp(-k * 1.4) * 0.05 : 0;
      for (const o of [n, a]) if (o) { o.userData.rz ??= o.rotation.z; o.rotation.z = o.userData.rz + r; }
    }

    // hover: the thing under the pointer brightens; a card in the rack slides up a little
    for (const [root, g] of this.glow) {
      const target = root === this.hoverRoot ? 1 : 0;
      g.k += (target - g.k) * Math.min(1, dt * 10);
      const lift = (m: THREE.Material, v: number) => {
        if (m instanceof THREE.MeshPhysicalMaterial) m.emissiveIntensity = v; else (m as THREE.MeshBasicMaterial).color.setScalar(v);
      };
      if (g.k < 0.002 && target === 0) { if (g.k !== 0) { g.k = 0; for (const m of g.mats) lift(m, 1); } continue; }
      for (const m of g.mats) lift(m, 1 + 0.16 * g.k);
      const id = root.name.startsWith("gpu_") ? root.name.slice(4) : null;
      if (id && id !== this.installedId && !this.moving.has(root)) {
        const home = this.cardHome.get(id)!;
        root.position.setFromMatrixPosition(home).y += 0.024 * g.k;
      }
    }

    this.tickClock();
    for (const [code, y0] of this.keyBase) {
      const n = this.nodes.get(`key_${code}`)!;
      const target = y0 - (this.pressed.has(code) ? 0.0035 : 0);
      n.position.y += (target - n.position.y) * Math.min(1, dt * 30);
    }

    this.city?.tick(t);
    this.beam?.tick(t, this.renderer.getPixelRatio() * this.canvas.clientHeight * 0.0016);
    if (this.post) this.post.render(t); else this.renderer.render(this.scene, this.camera);
    if (this.css) this.css.render(this.cssScene, this.camera);
    this.frames++;
    if (t - this.fpsT > 0.5) { if (this.settings.fps) this.ev.fps?.(Math.round(this.frames / (t - this.fpsT))); this.frames = 0; this.fpsT = t; }
    if (this.settings.quality === "auto") this.adapt(dt);
  };

  /** Draws fewer pixels when frames drag, like Felix's Auto setting. */
  private adapt(dt: number) {
    if (dt > 1 / 40) this.slowFrames++; else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames < 45) return;
    this.slowFrames = 0;
    if (this.dpr > 1) { this.dpr = Math.max(1, this.dpr - 0.5); this.renderer.setPixelRatio(this.dpr); this.resize(); }
    else if (this.post?.bloom.enabled) this.post.bloom.enabled = false;        // glow goes before resolution does
    else if (this.dpr > 0.75) { this.dpr = 0.75; this.renderer.setPixelRatio(this.dpr); this.resize(); }
  }

  /** Development: one frame at a given size, as a JPEG data URL. */
  capture(w: number, h: number) {
    const cw = this.canvas.clientWidth, ch = this.canvas.clientHeight;
    this.renderer.setPixelRatio(1); this.renderer.setSize(w, h, false); this.post?.setSize(w, h, 1);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    if (this.post) this.post.render(this.clock.elapsedTime); else this.renderer.render(this.scene, this.camera);
    const url = this.canvas.toDataURL("image/jpeg", 0.88);
    this.renderer.setPixelRatio(this.dpr); this.renderer.setSize(cw, ch, false); this.resize();
    return url;
  }

  // ------------------------------------------------------------------ reflections
  private glossify() {
    const spec: [RegExp, { rough: number; metal?: number; tint?: string; amt: number; coat?: number }][] = [
      [/^mug$/, { rough: 0.12, amt: 1.0, coat: 1 }],
      [/^phone$/, { rough: 0.08, amt: 1.0, coat: 1 }],
      [/^laptop(_lid)?$/, { rough: 0.32, metal: 1, tint: "#8d9096", amt: 0.55 }],
      [/^lamp$/, { rough: 0.28, amt: 0.7, coat: 0.6 }],
      [/^desk$/, { rough: 0.42, amt: 0.35, coat: 0.3 }],
      [/^window_frame$/, { rough: 0.35, amt: 0.4 }],
      [/^gpu_/, { rough: 0.38, amt: 0.5, coat: 0.4 }],
      [/^poster_frame_/, { rough: 0.25, amt: 0.4 }],
    ];
    for (const [name, root] of this.nodes) {
      const sp = spec.find(([re]) => re.test(name))?.[1];
      if (!sp) continue;
      root.traverse((c) => {
        if (!(c instanceof THREE.Mesh) || !(c.material instanceof THREE.MeshBasicMaterial) || !c.material.map) return;
        if ([...this.live.values()].includes(c.material)) return;
        // the export leaves normals out (the baked look never needed them); reflections do
        if (!c.geometry.attributes.normal) c.geometry.computeVertexNormals();
        const m = new THREE.MeshPhysicalMaterial({
          color: sp.metal ? new THREE.Color(sp.tint ?? "#888") : new THREE.Color(0, 0, 0),
          emissive: 0xffffff, emissiveMap: c.material.map, roughness: sp.rough, metalness: sp.metal ?? 0,
          clearcoat: sp.coat ?? 0, clearcoatRoughness: 0.15, envMapIntensity: sp.amt,
        });
        m.name = `gloss:${name}`;
        c.material = m; this.gloss.push(m);
      });
    }
    // glass: only its reflection shows (added on top), over the window and every poster
    const glass = (amt: number) => new THREE.MeshPhysicalMaterial({
      color: 0x000000, roughness: 0.06, metalness: 0, envMapIntensity: amt,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const w = this.info.window;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w.x1 - w.x0, w.z1 - w.z0), glass(0.9));
    pane.position.set((w.x0 + w.x1) / 2, (w.z0 + w.z1) / 2, -w.back - 0.05);
    pane.renderOrder = 3; this.scene.add(pane); this.gloss.push(pane.material);
    for (const [name, n] of this.nodes) {
      if (!/^poster_\d$/.test(name) || !(n instanceof THREE.Mesh)) continue;
      if (!n.geometry.attributes.normal) n.geometry.computeVertexNormals();
      const g = new THREE.Mesh(n.geometry, glass(0.7));
      n.updateWorldMatrix(true, false);
      g.matrixAutoUpdate = false; g.matrix.copy(n.matrixWorld);
      const nrm = new THREE.Vector3(...this.info.live[name].normal).multiplyScalar(0.003);
      g.matrix.premultiply(new THREE.Matrix4().makeTranslation(nrm.x, nrm.y, nrm.z));
      g.renderOrder = 3; this.scene.add(g); this.gloss.push(g.material);
    }
  }

  /** The room, seen from the middle, as the thing every glossy surface reflects. Taken once the
   *  window's photo is in. */
  private captureEnv() {
    const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
    const cam = new THREE.CubeCamera(0.05, 60, rt);
    cam.position.set(0.1, 1.25, -0.7);
    this.scene.add(cam);
    const hide = this.gloss.length ? [this.beam?.group] : [];
    for (const h of hide) if (h) h.visible = false;
    cam.update(this.renderer, this.scene);
    for (const h of hide) if (h) h.visible = true;
    this.scene.remove(cam);
    const pm = new THREE.PMREMGenerator(this.renderer);
    const env = pm.fromCubemap(rt.texture).texture;
    pm.dispose(); rt.dispose();
    for (const m of this.gloss) { m.envMap = env; m.needsUpdate = true; }
  }

  // ------------------------------------------------------------------ the laptop's screen
  /** Puts `el` (px wide, 16:10) on the laptop's screen. It takes the pointer only when `active`. */
  attachScreen(host: HTMLElement, el: HTMLElement, px = 1280) {
    const s = this.info.live.laptop_screen;
    if (!s) return;
    if (!this.css) {
      this.css = new CSS3DRenderer();
      this.css.domElement.className = "room-css";
      host.insertBefore(this.css.domElement, this.canvas.nextSibling);
      this.resize();
    }
    if (this.cssScreen) this.cssScene.remove(this.cssScreen);
    el.style.width = `${px}px`; el.style.height = `${Math.round(px / 1.6)}px`;
    const o = new CSS3DObject(el);
    const pos = new THREE.Vector3(...s.pos), n = new THREE.Vector3(...s.normal).normalize();
    o.position.copy(pos).addScaledVector(n, 0.0008);
    o.lookAt(pos.clone().add(n));
    o.scale.setScalar(s.size[0] / px);
    this.cssScene.add(o); this.cssScreen = o;
  }
  setScreenActive(on: boolean) { this.cssScreen?.element.classList.toggle("is-active", on); }

  // ------------------------------------------------------------------ drawn surfaces
  /** Clickable regions on a live surface ("screen"); glTF surfaces have v running down. */
  setRegions(name: string, d: Drawn | null) {
    if (!d) { this.regions.delete(name); return; }
    this.regions.set(name, { regions: d.regions, w: d.canvas.width, h: d.canvas.height, flipY: false });
  }

  // ------------------------------------------------------------------ clock, keys, settings
  /** The wall clock keeps the visitor's own time. A click knocks the battery out (and it stops);
   *  another click puts it back. */
  private clickClock() {
    const bat = this.nodes.get("clock_battery");
    if (!bat) return;
    bat.userData.home ??= bat.position.clone();
    const home = bat.userData.home as THREE.Vector3;
    const floor = new THREE.Vector3(home.x - 0.22, 0.012, home.z + 0.06);
    const a = bat.position.clone(), b = this.clockStopped === null ? floor : home.clone();
    this.clockStopped = this.clockStopped === null ? Date.now() : null;
    this.moving.add(bat);
    this.anims.push({
      t: 0, dur: this.reduced ? 0.001 : 0.9,
      step: (k) => {
        const fall = b.y < a.y;
        const e = fall ? k * k : ease(k);
        bat.position.lerpVectors(a, b, e);
        if (fall) { bat.position.y += Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k) * 0.05; bat.rotation.z = k * 4; }
        else bat.rotation.z = (1 - k) * 4;
      },
      done: () => this.moving.delete(bat),
    });
  }

  private tickClock() {
    const now = new Date(this.clockStopped ?? Date.now());
    const s = now.getSeconds() + (this.clockStopped ? 0 : Math.min(1, (now.getMilliseconds() / 1000) * 6)); // quartz tick
    const m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
    const set = (name: string, turns: number) => {
      const n = this.nodes.get(`clock_${name}`);
      if (!n) return;
      n.userData.q0 ??= n.quaternion.clone();
      n.quaternion.copy(n.userData.q0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -turns * Math.PI * 2));
    };
    set("hour", h / 12); set("minute", m / 60); set("second", s / 60);
  }

  private tapRandomKey() {
    const codes = [...this.keyBase.keys()].filter((c) => c.startsWith("Key"));
    const c = codes[Math.floor(Math.random() * codes.length)];
    this.pressed.add(c); this.ev.key?.(c);
    setTimeout(() => this.pressed.delete(c), 110);
  }

  setSettings(s: Settings) {
    this.settings = { ...s };
    if (this.post) { this.post.bloom.enabled = s.glow; this.post.setGrain(s.grain); }
    const full = Math.min(devicePixelRatio, 2);
    this.dpr = s.quality === "smooth" ? Math.min(1, full) : full;
    this.renderer.setPixelRatio(this.dpr); this.resize();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointerup", this.onUp);
    removeEventListener("pointermove", this.onDrag);
    removeEventListener("pointerup", this.onDragEnd);
    removeEventListener("keydown", this.onKeyDown);
    removeEventListener("keyup", this.onKeyUp);
    removeEventListener("blur", this.onBlur);
    this.post?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
