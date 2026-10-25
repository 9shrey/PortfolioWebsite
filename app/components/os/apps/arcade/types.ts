/* The contract every Arcade game implements. Games draw on a 320×240
   logical screen; the cabinet handles the loop, input, sound and scores. */

export const W = 320;
export const H = 240;

export type Action = "up" | "down" | "left" | "right" | "fire";
export type Sfx = "eat" | "bonus" | "jump" | "hit" | "die" | "start" | "brick" | "level";

export const PAL = {
  bg: "#020402",
  fg: "#9dff9d",
  fg2: "#6fd46f",
  dim: "rgba(157,255,157,0.16)",
  amber: "#ffb000",
  red: "#ff6a4d",
  cyan: "#7fe3ff",
  white: "#f2fff2",
};

export interface GameCtx {
  sfx(name: Sfx): void;
  /** The run is over; the cabinet shows the score screen. */
  over(): void;
}

export interface GameInstance {
  /** dt in seconds, fixed 1/60. */
  step(dt: number): void;
  draw(g: CanvasRenderingContext2D): void;
  input(a: Action, down: boolean): void;
  /** Pointer x in logical pixels (breakout's paddle follows it). */
  pointer?(x: number): void;
  score(): number;
  /** One extra readout for the HUD, e.g. "1.42 tok/s". */
  stat(): string;
}

export interface Game {
  id: string;
  title: string;
  blurb: string;
  controls: string;
  create(ctx: GameCtx): GameInstance;
}

export function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function burst(ps: Particle[], x: number, y: number, color: string, n = 12, speed = 90) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rand(speed * 0.3, speed);
    ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.35, 0.7), color });
  }
}

export function stepParticles(ps: Particle[], dt: number, gravity = 0) {
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0) {
      ps.splice(i, 1);
      continue;
    }
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

export function drawParticles(g: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) {
    g.globalAlpha = Math.min(1, p.life * 2);
    g.fillStyle = p.color;
    g.fillRect(p.x - 1, p.y - 1, 2, 2);
  }
  g.globalAlpha = 1;
}
