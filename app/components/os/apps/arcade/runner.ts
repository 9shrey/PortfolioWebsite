import { unlock } from "../../achievements";
import { H, PAL, W, burst, drawParticles, rand, stepParticles, type Game, type Particle } from "./types";

/* Roofline Runner: run along the memory roof, jump the cuBLAS cliffs,
   collect tokens. Hold jump to jump higher. */

const GROUND = 204;
const GRAV = 1100;

type Obstacle = { x: number; w: number; h: number; kind: "spike" | "cliff" };
type Token = { x: number; y: number; got: boolean };

export const runner: Game = {
  id: "runner",
  title: "Roofline Runner",
  blurb: "Stay on the roof. Jump the cuBLAS cliffs. Speed only goes up.",
  controls: "Space / ↑ / tap to jump (hold = higher)",
  create(ctx) {
    const me = { x: 52, y: GROUND - 14, vy: 0, size: 14, ground: true, holding: false };
    const obs: Obstacle[] = [];
    const toks: Token[] = [];
    const ps: Particle[] = [];
    let speed = 130;
    let dist = 0;
    let coins = 0;
    let nextGap = 240;
    let dead = false;
    let time = 0;
    let shake = 0;

    const spawn = () => {
      const hard = Math.min(1, dist / 4000);
      const cliff = Math.random() < 0.2 + hard * 0.3;
      const o: Obstacle = cliff
        ? { x: W + 10, w: rand(10, 16), h: rand(30, 44 + hard * 10), kind: "cliff" }
        : { x: W + 10, w: rand(12, 26), h: rand(12, 20), kind: "spike" };
      obs.push(o);
      if (Math.random() < 0.6) {
        const n = 1 + Math.floor(Math.random() * 3);
        const y = GROUND - (cliff ? o.h + 26 : rand(40, 70));
        for (let i = 0; i < n; i++) toks.push({ x: o.x + o.w / 2 + (i - (n - 1) / 2) * 16, y, got: false });
      }
      nextGap = rand(150, 260) * (speed / 130) * 0.8 + 60;
    };

    return {
      step(dt) {
        stepParticles(ps, dt, 300);
        shake = Math.max(0, shake - dt);
        if (dead) return;
        time += dt;
        speed = Math.min(340, 130 + time * 5);
        const dx = speed * dt;
        dist += dx;
        nextGap -= dx;
        if (nextGap <= 0) spawn();

        // Variable jump: let go early and gravity bites harder.
        me.vy += GRAV * (me.holding || me.vy > 0 ? 1 : 2.2) * dt;
        me.y += me.vy * dt;
        if (me.y >= GROUND - me.size) {
          if (!me.ground) burst(ps, me.x + me.size / 2, GROUND, PAL.fg2, 4, 40);
          me.y = GROUND - me.size;
          me.vy = 0;
          me.ground = true;
        }

        for (const o of obs) o.x -= dx;
        for (const t of toks) t.x -= dx;
        while (obs.length && obs[0].x + obs[0].w < -10) obs.shift();
        while (toks.length && toks[0].x < -10) toks.shift();

        const box = { l: me.x + 2, r: me.x + me.size - 2, t: me.y + 2, b: me.y + me.size };
        for (const o of obs) {
          const top = GROUND - o.h;
          if (box.r > o.x + 2 && box.l < o.x + o.w - 2 && box.b > top + (o.kind === "spike" ? 4 : 0)) {
            dead = true;
            shake = 0.4;
            burst(ps, me.x + me.size / 2, me.y + me.size / 2, PAL.red, 36, 160);
            ctx.sfx("die");
            window.setTimeout(() => ctx.over(), 800);
            break;
          }
        }
        for (const t of toks) {
          if (!t.got && Math.abs(t.x - (me.x + me.size / 2)) < 11 && Math.abs(t.y - (me.y + me.size / 2)) < 12) {
            t.got = true;
            coins++;
            burst(ps, t.x, t.y, PAL.amber, 10, 80);
            ctx.sfx("eat");
          }
        }
        if (Math.floor(dist / 10) + coins * 10 >= 500) unlock("runner");
      },
      draw(g) {
        g.save();
        if (shake > 0) g.translate(rand(-3, 3) * shake * 3, rand(-3, 3) * shake * 3);
        g.fillStyle = PAL.bg;
        g.fillRect(-5, -5, W + 10, H + 10);

        // Parallax: a faint roofline repeating in the distance.
        const off = (dist * 0.25) % 200;
        g.strokeStyle = "rgba(255,176,0,0.18)";
        g.lineWidth = 2;
        g.beginPath();
        for (let x = -off - 200; x < W + 200; x += 200) {
          g.moveTo(x, 150);
          g.lineTo(x + 110, 70);
          g.lineTo(x + 200, 70);
        }
        g.stroke();
        g.strokeStyle = "rgba(127,227,255,0.12)";
        g.beginPath();
        for (let x = -off - 200; x < W + 200; x += 200) {
          g.moveTo(x + 110, 70);
          g.lineTo(x + 200, 70);
        }
        g.stroke();
        // grid
        g.fillStyle = PAL.dim;
        const goff = (dist * 0.6) % 20;
        for (let x = -goff; x < W; x += 20) for (let y = 20; y < GROUND; y += 20) g.fillRect(x, y, 1, 1);

        // the roof itself
        g.fillStyle = PAL.amber;
        g.shadowColor = PAL.amber;
        g.shadowBlur = 10;
        g.fillRect(0, GROUND, W, 2);
        g.shadowBlur = 0;
        g.fillStyle = "rgba(255,176,0,0.08)";
        g.fillRect(0, GROUND + 2, W, H - GROUND);
        const tick = (dist * 1) % 24;
        g.fillStyle = "rgba(255,176,0,0.35)";
        for (let x = -tick; x < W; x += 24) g.fillRect(x, GROUND + 8, 8, 1);

        for (const o of obs) {
          const top = GROUND - o.h;
          g.fillStyle = PAL.red;
          g.shadowColor = PAL.red;
          g.shadowBlur = 8;
          if (o.kind === "spike") {
            g.beginPath();
            const n = Math.max(1, Math.round(o.w / 8));
            const w = o.w / n;
            for (let i = 0; i < n; i++) {
              g.moveTo(o.x + i * w, GROUND);
              g.lineTo(o.x + i * w + w / 2, top);
              g.lineTo(o.x + (i + 1) * w, GROUND);
            }
            g.fill();
          } else {
            g.fillRect(o.x, top, o.w, o.h);
            g.fillStyle = PAL.bg;
            for (let y = top + 4; y < GROUND - 2; y += 6) g.fillRect(o.x + 2, y, o.w - 4, 2);
          }
          g.shadowBlur = 0;
        }
        for (const t of toks) {
          if (t.got) continue;
          g.save();
          g.translate(t.x, t.y + Math.sin(time * 6 + t.x * 0.1) * 2);
          g.rotate(Math.PI / 4);
          g.fillStyle = PAL.amber;
          g.fillRect(-3, -3, 6, 6);
          g.restore();
        }
        if (!dead) {
          // the runner: a little glowing block with a squash on landing
          const squash = me.ground ? 1 : 0.85;
          g.fillStyle = PAL.white;
          g.shadowColor = PAL.fg;
          g.shadowBlur = 12;
          const w = me.size / squash;
          const h = me.size * squash;
          g.fillRect(me.x - (w - me.size) / 2, me.y + (me.size - h), w, h);
          g.shadowBlur = 0;
          g.fillStyle = PAL.bg;
          g.fillRect(me.x + me.size - 5, me.y + me.size - h + 4, 2, 2);
        }
        drawParticles(g, ps);
        g.restore();
      },
      input(a, down) {
        if (a !== "up" && a !== "fire") return;
        me.holding = down;
        if (down && me.ground && !dead) {
          me.vy = -390;
          me.ground = false;
          ctx.sfx("jump");
        }
      },
      score: () => Math.floor(dist / 10) + coins * 10,
      stat: () => `${Math.round(speed)} px/s`,
    };
  },
};
