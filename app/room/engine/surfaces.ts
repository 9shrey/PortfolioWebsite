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
  pixel: fam("--font-pixel", "monospace"),
  serif: fam("--font-serif", "serif"),
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const INK = "#16161a", PEN = "#2442d8", PAPER = "#f3efe6", RED = "#c8412d";

/** A year-at-a-glance planner: twelve months; the days gone crossed through in pen, today circled;
 *  the goals written along the top, numbered, and each one's date ringed with its number. Before the
 *  year starts it counts down to it. */
export function drawCalendar(c: HTMLCanvasElement, year: number, goals: Goal[], today = new Date()) {
  const W = 2048, H = Math.round(2048 * (1.10 / 1.00));   // the planner is 1.00 x 1.10 m
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.textBaseline = "alphabetic";
  const pad = 90;
  const day = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const short = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;

  g.fillStyle = INK; g.font = `900 230px ${F.display}`;
  g.fillText(String(year), pad - 8, pad + 176);
  const start = new Date(year, 0, 1);
  const toGo = Math.ceil((start.getTime() - today.getTime()) / 86400000);
  g.fillStyle = "#55555c"; g.font = `500 44px ${F.sans}`;
  g.fillText(toGo > 0 ? `${toGo} days to go` : "one year, on one wall", pad + 8, pad + 246);

  // the goals, in pen, numbered; their dates in the margin
  const gx = W * 0.46, gy = pad + 20;
  goals.forEach((goal, i) => {
    const y = gy + 64 + i * 84;
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(gx, y - 38, 40, 40);
    if (goal.done) {
      g.strokeStyle = PEN; g.lineWidth = 7; g.beginPath();
      g.moveTo(gx + 5, y - 18); g.lineTo(gx + 18, y - 3); g.lineTo(gx + 50, y - 54); g.stroke();
    }
    g.fillStyle = RED; g.font = `72px ${F.hand}`; g.fillText(String(i + 1), gx + 58, y);
    g.fillStyle = PEN; g.fillText(goal.text, gx + 100, y);
    const tw = g.measureText(goal.text).width;
    if (goal.note) { g.fillStyle = "#8a8a90"; g.font = `52px ${F.hand}`; g.fillText(`(${goal.note})`, gx + 118 + tw, y); }
    g.fillStyle = "#55555c"; g.font = `600 30px ${F.sans}`; g.textAlign = "right";
    g.fillText(`${goal.kind} ${short(day(goal.date))}`, W - pad, y - 6); g.textAlign = "left";
  });

  // the months
  const top = Math.max(pad + 340, gy + 64 + goals.length * 84 + 10);
  const cols = 4, rows = 3, gapX = 50, gapY = 40;
  const cw = (W - pad * 2 - gapX * (cols - 1)) / cols;
  const ch = (H - top - pad - gapY * (rows - 1)) / rows;
  const marks = new Map<string, { n: number; kind: Goal["kind"] }>();
  goals.forEach((gl, i) => marks.set(day(gl.date).toDateString(), { n: i + 1, kind: gl.kind }));
  for (let m = 0; m < 12; m++) {
    const x0 = pad + (m % cols) * (cw + gapX), y0 = top + Math.floor(m / cols) * (ch + gapY);
    g.fillStyle = INK; g.font = `800 40px ${F.sans}`;
    g.fillText(MONTHS[m], x0, y0 + 40);
    const first = new Date(year, m, 1).getDay(); // 0 Sunday
    const days = new Date(year, m + 1, 0).getDate();
    const cell = cw / 7, rowH = (ch - 70) / 6;
    g.font = `500 22px ${F.sans}`; g.fillStyle = "#8a8a90";
    "SMTWTFS".split("").forEach((d, i) => g.fillText(d, x0 + i * cell + cell * 0.36, y0 + 78));
    for (let d = 1; d <= days; d++) {
      const idx = first + d - 1;
      const cx = x0 + (idx % 7) * cell + cell / 2, cy = y0 + 92 + Math.floor(idx / 7) * rowH + rowH / 2;
      const date = new Date(year, m, d);
      const isToday = date.toDateString() === today.toDateString();
      const past = date < today && !isToday;
      const mark = marks.get(date.toDateString());
      if (mark?.kind === "on") { g.fillStyle = "rgba(200,65,45,.85)"; g.beginPath(); g.arc(cx, cy, Math.min(cell, rowH) * 0.46, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = mark?.kind === "on" ? "#fff" : past ? "#b3b0a8" : INK; g.font = `${mark ? 800 : 500} 26px ${F.sans}`;
      g.textAlign = "center"; g.fillText(String(d), cx, cy + 9); g.textAlign = "left";
      if (past) {   // crossed through in pen, a little uneven
        const j = ((d * 37 + m * 11) % 7) - 3;
        g.strokeStyle = "rgba(36,66,216,.75)"; g.lineWidth = 3.2; g.beginPath();
        g.moveTo(cx - 15, cy + 12 + j * 0.6); g.lineTo(cx + 15, cy - 12 - j * 0.4); g.stroke();
      }
      if (mark) {   // its number, in red pen, by the day
        if (mark.kind === "by") { g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.ellipse(cx + 1, cy, cell * 0.44, rowH * 0.5, -0.15, 0.2, Math.PI * 2 - 0.1); g.stroke(); }
        g.fillStyle = RED; g.font = `48px ${F.hand}`; g.fillText(String(mark.n), cx + cell * 0.34, cy - rowH * 0.24);
      }
      if (isToday) {
        g.strokeStyle = PEN; g.lineWidth = 5; g.beginPath();
        g.ellipse(cx + 1, cy, cell * 0.46, rowH * 0.5, -0.2, 0, Math.PI * 2 - 0.3); g.stroke();
      }
    }
  }
  return c;
}
