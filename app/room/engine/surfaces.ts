import type { Goal } from "../types";

/* The two surfaces drawn live: the year planner on the wall and the slide the projector throws.
   Fonts come from the page's CSS variables (next/font gives them hashed family names). */

function fam(v: string, fallback: string) {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f || fallback;
}
export const fonts = () => ({
  display: fam("--font-display", "sans-serif"),
  sans: fam("--font-sans", "sans-serif"),
  mono: fam("--font-mono", "monospace"),
  hand: fam("--font-hand", "cursive"),
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const INK = "#16161a", PEN = "#2442d8", PAPER = "#f3efe6", RED = "#c8412d";

/** A year-at-a-glance planner: twelve months, the days so far crossed through in pen, today
 *  circled, each goal written along the bottom and marked in the month it's due. */
export function drawCalendar(c: HTMLCanvasElement, year: number, goals: Goal[], today = new Date()) {
  const W = 2048, H = Math.round(2048 * (1.10 / 1.00));   // the planner is 1.00 x 1.10 m
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);

  const pad = 90;
  g.fillStyle = INK;
  g.font = `900 220px ${F.display}`;
  g.textBaseline = "alphabetic";
  (g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "expanded";
  g.fillText(String(year), pad - 8, pad + 170);
  g.font = `500 44px ${F.sans}`;
  g.fillStyle = "#55555c";
  g.fillText("one year, on one wall", pad + 8, pad + 240);

  // goals: handwritten list at the top right
  const gx = W * 0.47, gy = pad + 30;
  g.font = `600 30px ${F.mono}`; g.fillStyle = "#55555c";
  g.fillText("GOALS", gx, gy + 10);
  goals.forEach((goal, i) => {
    const y = gy + 72 + i * 62;
    g.strokeStyle = INK; g.lineWidth = 4;
    g.strokeRect(gx, y - 34, 36, 36);
    if (goal.done) {
      g.strokeStyle = PEN; g.lineWidth = 7; g.beginPath();
      g.moveTo(gx + 4, y - 16); g.lineTo(gx + 16, y - 2); g.lineTo(gx + 46, y - 50); g.stroke();
    }
    g.fillStyle = PEN; g.font = `64px ${F.hand}`;
    g.fillText(goal.text, gx + 62, y);
    if (goal.due) { g.font = `500 28px ${F.mono}`; g.fillStyle = "#77777e"; g.fillText(MONTHS[goal.due - 1].slice(0, 3).toUpperCase(), W - pad - 80, y - 4); }
  });

  // months
  const top = Math.max(pad + 330, gy + 72 + goals.length * 62 + 20);
  const cols = 4, rows = 3, gapX = 50, gapY = 40;
  const cw = (W - pad * 2 - gapX * (cols - 1)) / cols;
  const ch = (H - top - pad - gapY * (rows - 1)) / rows;
  const due = new Map<number, number>();
  goals.forEach((gl) => gl.due && due.set(gl.due, (due.get(gl.due) ?? 0) + 1));
  for (let m = 0; m < 12; m++) {
    const x0 = pad + (m % cols) * (cw + gapX), y0 = top + Math.floor(m / cols) * (ch + gapY);
    g.fillStyle = INK; g.font = `800 40px ${F.sans}`;
    g.fillText(MONTHS[m], x0, y0 + 40);
    if (due.has(m + 1)) {
      g.fillStyle = RED; g.beginPath(); g.arc(x0 + g.measureText(MONTHS[m]).width + 22, y0 + 26, 11, 0, Math.PI * 2); g.fill();
    }
    const first = new Date(year, m, 1).getDay(); // 0 Sunday
    const days = new Date(year, m + 1, 0).getDate();
    const cell = cw / 7, rowH = (ch - 70) / 6;
    g.font = `500 22px ${F.mono}`; g.fillStyle = "#8a8a90";
    "SMTWTFS".split("").forEach((d, i) => g.fillText(d, x0 + i * cell + cell * 0.32, y0 + 78));
    for (let d = 1; d <= days; d++) {
      const idx = first + d - 1;
      const cx = x0 + (idx % 7) * cell + cell / 2, cy = y0 + 92 + Math.floor(idx / 7) * rowH + rowH / 2;
      const date = new Date(year, m, d);
      const isToday = date.toDateString() === today.toDateString();
      const past = date < today && !isToday;
      g.fillStyle = past ? "#b3b0a8" : INK; g.font = `500 26px ${F.sans}`;
      g.textAlign = "center"; g.fillText(String(d), cx, cy + 9); g.textAlign = "left";
      if (past) {   // crossed through in pen, a little uneven
        const j = ((d * 37 + m * 11) % 7) - 3;
        g.strokeStyle = "rgba(36,66,216,.75)"; g.lineWidth = 3.2; g.beginPath();
        g.moveTo(cx - 15, cy + 12 + j * 0.6); g.lineTo(cx + 15, cy - 12 - j * 0.4); g.stroke();
      }
      if (isToday) {
        g.strokeStyle = RED; g.lineWidth = 5; g.beginPath();
        g.ellipse(cx + 1, cy, cell * 0.46, rowH * 0.5, -0.2, 0, Math.PI * 2 - 0.3); g.stroke();
      }
    }
  }
  return c;
}
