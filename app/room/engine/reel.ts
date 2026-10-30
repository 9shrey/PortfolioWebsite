/* The projector's reel: a few generative pieces on a loop, each fading into the next. Each piece draws
   on its own canvas (some keep trails), and the reel blends them onto the canvas the screen shows. */

const W = 800, H = 600;
const SHOW = 11, FADE = 1.6;   // seconds each piece holds, and the crossfade between them

type Piece = { c: HTMLCanvasElement; g: CanvasRenderingContext2D; draw(t: number, dt: number): void };

function piece(draw: (g: CanvasRenderingContext2D, t: number, dt: number, c: HTMLCanvasElement) => void, w = W, h = H): Piece {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  return { c, g, draw: (t, dt) => draw(g, t, dt, c) };
}

/** Stars rushing out of the middle, in colour. */
function starfield(): Piece {
  const N = 420;
  const s = Array.from({ length: N }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), h: Math.random() * 360 }));
  return piece((g, t, dt) => {
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, 0, W, H);
    for (const p of s) {
      const z0 = p.z;
      p.z -= dt * 0.32;
      if (p.z <= 0.02) { p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; p.z = 1; continue; }
      const k = 0.5 * W;
      const x0 = W / 2 + (p.x / z0) * k, y0 = H / 2 + (p.y / z0) * k;
      const x1 = W / 2 + (p.x / p.z) * k, y1 = H / 2 + (p.y / p.z) * k;
      g.strokeStyle = `hsla(${(p.h + t * 20) % 360},90%,${70 - p.z * 30}%,${1 - p.z})`;
      g.lineWidth = (1 - p.z) * 3.2 + 0.4;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  });
}

/** An oscilloscope tracing Lissajous figures that slowly drift through their ratios. */
function scope(): Piece {
  return piece((g, t) => {
    g.fillStyle = "rgba(0,8,4,.16)"; g.fillRect(0, 0, W, H);
    const a = 3 + Math.sin(t * 0.13) * 2, b = 2 + Math.cos(t * 0.09) * 2, ph = t * 0.7;
    g.strokeStyle = "#52ffb0"; g.lineWidth = 2.4; g.shadowColor = "#52ffb0"; g.shadowBlur = 14;
    g.beginPath();
    for (let i = 0; i <= 900; i++) {
      const u = (i / 900) * Math.PI * 2;
      const x = W / 2 + Math.sin(a * u + ph) * W * 0.38, y = H / 2 + Math.sin(b * u) * H * 0.38;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke(); g.shadowBlur = 0;
  });
}

/** A wireframe torus turning in space. */
function torus(): Piece {
  const R = 1, r = 0.42, U = 34, V = 16;
  return piece((g, t) => {
    g.fillStyle = "#05030c"; g.fillRect(0, 0, W, H);
    const ax = t * 0.5, ay = t * 0.33;
    const proj = (u: number, v: number) => {
      let x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
      [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
      [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
      const k = 360 / (z + 3.2);
      return [W / 2 + x * k, H / 2 + y * k, z] as const;
    };
    g.lineWidth = 1.6;
    for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
      const u0 = (i / U) * Math.PI * 2, u1 = ((i + 1) / U) * Math.PI * 2, v0 = (j / V) * Math.PI * 2, v1 = ((j + 1) / V) * Math.PI * 2;
      const [x0, y0, z0] = proj(u0, v0), [x1, y1] = proj(u1, v0), [x2, y2] = proj(u0, v1);
      g.strokeStyle = `hsla(${(i / U) * 360 + t * 40},85%,${62 - z0 * 14}%,${0.95 - (z0 + 1.4) * 0.22})`;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.moveTo(x0, y0); g.lineTo(x2, y2); g.stroke();
    }
  });
}

/** The old demoscene plasma, worked out small and blown up soft. */
function plasma(): Piece {
  const w = 160, h = 120;
  const small = document.createElement("canvas"); small.width = w; small.height = h;
  const sg = small.getContext("2d")!, img = sg.createImageData(w, h);
  return piece((g, t) => {
    const d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w * 6, v = y / h * 4.5;
      const s = Math.sin(u + t) + Math.sin(v * 1.3 - t * 0.8) + Math.sin((u + v + t) * 0.7) + Math.sin(Math.hypot(u - 3, v - 2.2) * 1.6 - t * 1.4);
      const k = (x + y * w) * 4, p = s * 0.8;
      d[k] = 128 + 127 * Math.sin(p * Math.PI);
      d[k + 1] = 128 + 127 * Math.sin(p * Math.PI + 2.1);
      d[k + 2] = 128 + 127 * Math.sin(p * Math.PI + 4.2);
      d[k + 3] = 255;
    }
    sg.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(small, 0, 0, W, H);
  });
}

/** Particles drifting along a slowly turning flow field, leaving ink behind. */
function flow(): Piece {
  const N = 900;
  const ps = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, h: 0 }));
  return piece((g, t, dt) => {
    g.fillStyle = "rgba(6,4,10,.06)"; g.fillRect(0, 0, W, H);
    g.lineWidth = 1.3;
    for (const p of ps) {
      const a = Math.sin(p.x * 0.006 + t * 0.2) * 2.2 + Math.cos(p.y * 0.007 - t * 0.15) * 2.2;
      const nx = p.x + Math.cos(a) * 90 * dt, ny = p.y + Math.sin(a) * 90 * dt;
      g.strokeStyle = `hsla(${190 + Math.sin(a) * 70 + t * 8},90%,62%,.7)`;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(nx, ny); g.stroke();
      p.x = nx; p.y = ny;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || Math.random() < 0.004) { p.x = Math.random() * W; p.y = Math.random() * H; }
    }
  });
}

export class Reel {
  canvas = document.createElement("canvas");
  private g: CanvasRenderingContext2D;
  private pieces: Piece[] = [starfield(), torus(), scope(), plasma(), flow()];
  private last = -1;

  constructor() {
    this.canvas.width = W; this.canvas.height = H;
    this.g = this.canvas.getContext("2d")!;
  }

  /** Draws the frame for time `t` (seconds). */
  draw(t: number) {
    const dt = this.last < 0 ? 1 / 60 : Math.min(0.1, t - this.last);
    this.last = t;
    const n = this.pieces.length, cycle = t / SHOW;
    const i = Math.floor(cycle) % n, into = (cycle % 1) * SHOW;
    const cur = this.pieces[i];
    cur.draw(t, dt);
    this.g.globalAlpha = 1; this.g.drawImage(cur.c, 0, 0);
    // the next piece starts underneath the last second and a half, and fades up over this one
    if (into > SHOW - FADE) {
      const nxt = this.pieces[(i + 1) % n];
      nxt.draw(t, dt);
      this.g.globalAlpha = (into - (SHOW - FADE)) / FADE;
      this.g.drawImage(nxt.c, 0, 0);
      this.g.globalAlpha = 1;
    }
  }
}
