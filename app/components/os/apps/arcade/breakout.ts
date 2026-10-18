import { unlock } from "../../achievements";
import { H, PAL, W, burst, drawParticles, stepParticles, type Game, type Particle } from "./types";

/* Cache Breakout: clear the memory hierarchy. Registers and L1 are cheap,
   HBM takes two hits. Each level the ball gets faster. */

const ROWS = [
  { name: "HBM", color: PAL.red, hp: 2, pts: 40 },
  { name: "L2", color: PAL.amber, hp: 1, pts: 20 },
  { name: "L2", color: PAL.amber, hp: 1, pts: 20 },
  { name: "L1", color: PAL.fg, hp: 1, pts: 10 },
  { name: "REG", color: PAL.cyan, hp: 1, pts: 5 },
];
const COLS = 10;
const BW = 28;
const BH = 10;
const GAP = 3;
const LEFT = (W - (COLS * BW + (COLS - 1) * GAP)) / 2;
const TOP = 34;
const PW = 50;
const PY = 222;

type Brick = { x: number; y: number; hp: number; row: number };

export const breakout: Game = {
  id: "breakout",
  title: "Cache Breakout",
  blurb: "Smash through the memory hierarchy. HBM takes two hits.",
  controls: "Arrows / A D / mouse / drag · Space to launch",
  create(ctx) {
    let bricks: Brick[] = [];
    const paddle = { x: W / 2 - PW / 2, l: false, r: false };
    const ball = { x: 0, y: 0, vx: 0, vy: 0, stuck: true };
    const ps: Particle[] = [];
    let level = 1;
    let lives = 3;
    let points = 0;
    let dead = false;
    let banner = 1.6;

    const build = () => {
      bricks = [];
      ROWS.forEach((r, row) => {
        for (let c = 0; c < COLS; c++) bricks.push({ x: LEFT + c * (BW + GAP), y: TOP + row * (BH + GAP), hp: r.hp, row });
      });
    };
    const reset = () => {
      ball.stuck = true;
      ball.vx = 0;
      ball.vy = 0;
    };
    const speed = () => 165 * (1 + (level - 1) * 0.15);
    const launch = () => {
      if (!ball.stuck || dead) return;
      ball.stuck = false;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      ball.vx = Math.cos(a) * speed();
      ball.vy = Math.sin(a) * speed();
      ctx.sfx("start");
    };
    build();

    return {
      step(dt) {
        stepParticles(ps, dt, 200);
        banner = Math.max(0, banner - dt);
        if (dead) return;
        if (paddle.l) paddle.x -= 280 * dt;
        if (paddle.r) paddle.x += 280 * dt;
        paddle.x = Math.max(0, Math.min(W - PW, paddle.x));
        if (ball.stuck) {
          ball.x = paddle.x + PW / 2;
          ball.y = PY - 4;
          return;
        }
        // Sub-steps so a fast ball can't tunnel through a brick.
        const n = 3;
        for (let s = 0; s < n; s++) {
          ball.x += (ball.vx * dt) / n;
          ball.y += (ball.vy * dt) / n;
          if (ball.x < 3) {
            ball.x = 3;
            ball.vx = Math.abs(ball.vx);
          }
          if (ball.x > W - 3) {
            ball.x = W - 3;
            ball.vx = -Math.abs(ball.vx);
          }
          if (ball.y < 3) {
            ball.y = 3;
            ball.vy = Math.abs(ball.vy);
          }
          if (ball.vy > 0 && ball.y >= PY - 3 && ball.y <= PY + 6 && ball.x >= paddle.x - 3 && ball.x <= paddle.x + PW + 3) {
            // Where it hits the paddle sets the angle.
            const off = (ball.x - (paddle.x + PW / 2)) / (PW / 2);
            const a = -Math.PI / 2 + off * 1.05;
            const v = Math.hypot(ball.vx, ball.vy);
            ball.vx = Math.cos(a) * v;
            ball.vy = Math.sin(a) * v;
            ball.y = PY - 3;
            ctx.sfx("hit");
          }
          for (const b of bricks) {
            if (b.hp <= 0) continue;
            if (ball.x + 3 < b.x || ball.x - 3 > b.x + BW || ball.y + 3 < b.y || ball.y - 3 > b.y + BH) continue;
            const overlapX = Math.min(ball.x + 3 - b.x, b.x + BW - (ball.x - 3));
            const overlapY = Math.min(ball.y + 3 - b.y, b.y + BH - (ball.y - 3));
            if (overlapX < overlapY) ball.vx = -ball.vx;
            else ball.vy = -ball.vy;
            b.hp--;
            const row = ROWS[b.row];
            if (b.hp <= 0) {
              points += row.pts;
              burst(ps, b.x + BW / 2, b.y + BH / 2, row.color, 14, 90);
            }
            ctx.sfx("brick");
            break;
          }
        }
        if (ball.y > H + 6) {
          lives--;
          ctx.sfx("die");
          if (lives <= 0) {
            dead = true;
            window.setTimeout(() => ctx.over(), 600);
          } else reset();
        }
        if (bricks.every((b) => b.hp <= 0)) {
          if (level === 1) unlock("breakout");
          level++;
          points += 100;
          banner = 1.6;
          ctx.sfx("level");
          build();
          reset();
        }
      },
      draw(g) {
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, W, H);
        g.fillStyle = PAL.dim;
        for (let x = 10; x < W; x += 20) for (let y = 10; y < H; y += 20) g.fillRect(x, y, 1, 1);
        for (const b of bricks) {
          if (b.hp <= 0) continue;
          const row = ROWS[b.row];
          g.fillStyle = row.color;
          g.globalAlpha = b.hp < row.hp ? 0.45 : 1;
          g.shadowColor = row.color;
          g.shadowBlur = 6;
          g.fillRect(b.x, b.y, BW, BH);
          g.shadowBlur = 0;
          g.globalAlpha = 1;
          g.fillStyle = "rgba(0,0,0,0.35)";
          g.fillRect(b.x, b.y + BH - 2, BW, 2);
        }
        g.fillStyle = PAL.white;
        g.shadowColor = PAL.fg;
        g.shadowBlur = 10;
        g.fillRect(paddle.x, PY, PW, 5);
        g.beginPath();
        g.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
        for (let i = 0; i < lives; i++) {
          g.fillStyle = PAL.fg;
          g.fillRect(W - 12 - i * 10, H - 9, 6, 4);
        }
        drawParticles(g, ps);
        if (banner > 0) {
          g.globalAlpha = Math.min(1, banner);
          g.fillStyle = PAL.amber;
          g.font = "bold 16px monospace";
          g.textAlign = "center";
          g.fillText(`LEVEL ${level}`, W / 2, 150);
          g.globalAlpha = 1;
        }
      },
      input(a, down) {
        if (a === "left") paddle.l = down;
        if (a === "right") paddle.r = down;
        if ((a === "fire" || a === "up") && down) launch();
      },
      pointer(x) {
        paddle.x = Math.max(0, Math.min(W - PW, x - PW / 2));
      },
      score: () => points,
      stat: () => `level ${level} · ${"♥".repeat(Math.max(0, lives))}`,
    };
  },
};
