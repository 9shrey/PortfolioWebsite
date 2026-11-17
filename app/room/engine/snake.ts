/* Snake, on the old monitor: started from its command line. The terminal draws the bars around it and
   passes the keys on; this keeps the board. It waits whenever the visitor gets up from the desk. */

const GW = 26, GH = 16, CELL = 32;
const BEST_KEY = "room.snake";
type Cell = [number, number];

export class Snake {
  static readonly W = GW * CELL;
  static readonly H = GH * CELL;
  score = 0;
  best = 0;
  dead = false;
  /** waiting for a key: at the start, and after the visitor leaves the desk */
  paused = true;
  private body: Cell[] = [];
  private dir: Cell = [1, 0];
  private turns: Cell[] = [];
  private food: Cell = [0, 0];
  private last = 0;

  constructor(private sfx: (kind: "blip" | "over") => void) {
    try { this.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch {}
    this.reset();
  }

  reset() {
    const y = GH >> 1;
    this.body = [[8, y], [7, y], [6, y], [5, y]];
    this.dir = [1, 0]; this.turns = []; this.score = 0; this.dead = false; this.paused = true;
    this.drop();
  }

  private drop() {
    do this.food = [Math.floor(Math.random() * GW), Math.floor(Math.random() * GH)];
    while (this.body.some(([x, y]) => x === this.food[0] && y === this.food[1]));
  }

  /** Steer. Two turns can wait in line, so a quick corner isn't dropped; a turn back on itself is. */
  turn(dx: number, dy: number) {
    this.paused = false;
    const [lx, ly] = this.turns[this.turns.length - 1] ?? this.dir;
    if ((lx === dx && ly === dy) || (lx === -dx && ly === -dy) || this.turns.length >= 2) return;
    this.turns.push([dx, dy]);
  }

  /** Moves the snake on if it's time to; returns whether the board changed. */
  tick(now: number): boolean {
    const every = Math.max(0.065, 0.13 - this.score * 0.002);   // it speeds up as it grows
    if (this.dead || this.paused || now - this.last < every) { if (this.dead || this.paused) this.last = now; return false; }
    this.last = now;
    this.dir = this.turns.shift() ?? this.dir;
    const [hx, hy] = this.body[0], x = hx + this.dir[0], y = hy + this.dir[1];
    const eats = x === this.food[0] && y === this.food[1];
    const tail = eats ? this.body : this.body.slice(0, -1);      // the tail moves out of the way unless it grows
    if (x < 0 || y < 0 || x >= GW || y >= GH || tail.some(([bx, by]) => bx === x && by === y)) {
      this.dead = true; this.sfx("over");
      if (this.score > this.best) { this.best = this.score; try { localStorage.setItem(BEST_KEY, String(this.best)); } catch {} }
      return true;
    }
    this.body = [[x, y], ...tail];
    if (eats) { this.score++; this.sfx("blip"); this.drop(); }
    return true;
  }

  /** Draws the board with its top left at (x, y). */
  draw(g: CanvasRenderingContext2D, x: number, y: number, p: { ink: string; dim: string; bg: string }, font: string, start = "PRESS AN ARROW") {
    const { ink, dim } = p;
    g.strokeStyle = dim; g.lineWidth = 3; g.strokeRect(x - 6, y - 6, Snake.W + 12, Snake.H + 12);
    g.fillStyle = dim;
    g.beginPath(); g.arc(x + (this.food[0] + 0.5) * CELL, y + (this.food[1] + 0.5) * CELL, CELL * 0.3, 0, Math.PI * 2); g.fill();
    this.body.forEach(([bx, by], i) => {
      g.fillStyle = i ? ink : "#fff";   // the head runs hot
      g.fillRect(x + bx * CELL + 2, y + by * CELL + 2, CELL - 4, CELL - 4);
    });
    const say = this.dead ? "GAME OVER" : this.paused ? start : "";
    if (!say) return;
    g.save(); g.font = `72px ${font}`; g.textAlign = "center";
    const w = g.measureText(say).width;
    g.shadowBlur = 0; g.globalAlpha = 0.85; g.fillStyle = p.bg; g.fillRect(x + Snake.W / 2 - w / 2 - 24, y + Snake.H / 2 - 62, w + 48, 92);
    g.globalAlpha = 1; g.shadowBlur = 10; g.fillStyle = ink; g.fillText(say, x + Snake.W / 2, y + Snake.H / 2 + 10);
    g.restore();
  }
}
