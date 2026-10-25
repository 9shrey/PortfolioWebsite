import { unlock } from "../../achievements";
import { H, PAL, W, burst, drawParticles, stepParticles, type Game, type Particle } from "./types";

/* Token Snake: eat tokens, grow, go faster. A cyan bonus token appears now
   and then, worth five, gone in a few seconds. */

const C = 16;
const COLS = W / C;
const ROWS = H / C;
type P = { x: number; y: number };

export const snake: Game = {
  id: "snake",
  title: "Token Snake",
  blurb: "Decode as many tokens as you can before you run out of context.",
  controls: "Arrows / WASD / swipe",
  create(ctx) {
    const body: P[] = [
      { x: 8, y: 7 },
      { x: 7, y: 7 },
      { x: 6, y: 7 },
    ];
    let dir: P = { x: 1, y: 0 };
    const queue: P[] = [];
    let food: P = { x: 14, y: 7 };
    let bonus: (P & { ttl: number }) | null = null;
    let eaten = 0;
    let points = 0;
    let acc = 0;
    let time = 0;
    let dead = false;
    let flash = 0;
    const ps: Particle[] = [];

    const free = (): P => {
      let p: P;
      do p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      while (body.some((s) => s.x === p.x && s.y === p.y) || (food && food.x === p.x && food.y === p.y));
      return p;
    };
    food = free();
    const interval = () => Math.max(0.055, 0.13 - eaten * 0.003);

    const tick = () => {
      const next = queue.shift();
      if (next) dir = next;
      const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some((s) => s.x === head.x && s.y === head.y)) {
        dead = true;
        flash = 0.3;
        burst(ps, body[0].x * C + C / 2, body[0].y * C + C / 2, PAL.red, 30, 140);
        ctx.sfx("die");
        window.setTimeout(() => ctx.over(), 700);
        return;
      }
      body.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        eaten++;
        points++;
        burst(ps, head.x * C + C / 2, head.y * C + C / 2, PAL.amber);
        ctx.sfx("eat");
        food = free();
        if (eaten >= 10) unlock("snake");
        if (!bonus && Math.random() < 0.18) bonus = { ...free(), ttl: 5 };
      } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
        points += 5;
        burst(ps, head.x * C + C / 2, head.y * C + C / 2, PAL.cyan, 24, 130);
        ctx.sfx("bonus");
        bonus = null;
      } else body.pop();
    };

    return {
      step(dt) {
        stepParticles(ps, dt);
        flash = Math.max(0, flash - dt);
        if (dead) return;
        time += dt;
        if (bonus && (bonus.ttl -= dt) <= 0) bonus = null;
        acc += dt;
        while (acc >= interval() && !dead) {
          acc -= interval();
          tick();
        }
      },
      draw(g) {
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, W, H);
        g.fillStyle = PAL.dim;
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) g.fillRect(x * C + C / 2 - 0.5, y * C + C / 2 - 0.5, 1, 1);
        // food: a spinning amber diamond
        const t = time * 4;
        g.save();
        g.translate(food.x * C + C / 2, food.y * C + C / 2);
        g.rotate(Math.PI / 4 + Math.sin(t) * 0.2);
        g.fillStyle = PAL.amber;
        g.shadowColor = PAL.amber;
        g.shadowBlur = 8;
        g.fillRect(-4, -4, 8, 8);
        g.restore();
        if (bonus && (bonus.ttl > 1.5 || Math.floor(bonus.ttl * 8) % 2)) {
          g.save();
          g.translate(bonus.x * C + C / 2, bonus.y * C + C / 2);
          g.rotate(time * 3);
          g.fillStyle = PAL.cyan;
          g.shadowColor = PAL.cyan;
          g.shadowBlur = 12;
          g.fillRect(-5, -5, 10, 10);
          g.restore();
        }
        body.forEach((s, i) => {
          const head = i === 0;
          g.fillStyle = dead ? PAL.red : head ? PAL.white : PAL.fg;
          g.globalAlpha = head ? 1 : Math.max(0.35, 1 - i / (body.length + 6));
          if (head) {
            g.shadowColor = PAL.fg;
            g.shadowBlur = 10;
          }
          g.fillRect(s.x * C + 1, s.y * C + 1, C - 2, C - 2);
          g.shadowBlur = 0;
        });
        g.globalAlpha = 1;
        drawParticles(g, ps);
        if (flash > 0) {
          g.fillStyle = `rgba(255,106,77,${flash})`;
          g.fillRect(0, 0, W, H);
        }
      },
      input(a, down) {
        if (!down || dead) return;
        const d = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[a as "up"];
        if (!d) return;
        const last = queue[queue.length - 1] ?? dir;
        if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
        if (queue.length < 3) queue.push(d);
      },
      score: () => points,
      stat: () => `${(eaten / Math.max(1, time)).toFixed(2)} tok/s`,
    };
  },
};
