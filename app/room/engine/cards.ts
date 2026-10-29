import type { CardContent, RoomContent } from "../types";
import { fonts } from "./surfaces";

/* Things drawn onto surfaces in the room: the projector's slide and the phone's screen. Each drawing
   returns its canvas and the clickable regions on it (canvas pixels, top-left origin); the engine maps
   a click on the 3D surface back to a region. */

export interface Region { x: number; y: number; w: number; h: number; action: string; label: string }
export interface Drawn { canvas: HTMLCanvasElement; regions: Region[] }

const INK = "#16161a";

function wrap(g: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(/\s+/)) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}


/** A small arrow drawn as lines (no font needs to have the glyph). */
function arrow(g: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, color = INK) {
  g.strokeStyle = color; g.lineWidth = 4; g.beginPath();
  g.moveTo(x - 18 * dir, y); g.lineTo(x + 18 * dir, y); g.moveTo(x + 6 * dir, y - 12); g.lineTo(x + 18 * dir, y); g.lineTo(x + 6 * dir, y + 12);
  g.stroke();
}


const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = ([r, g, b]: number[]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
/** A card's accent, darkened until it reads as ink on white (a lime or a sky blue would vanish). */
function inked(hex: string) {
  let c = rgb(hex);
  for (let k = 0; k < 14 && lum(c) > 0.36; k++) c = c.map((v) => v * 0.86);
  return `rgb(${c.map(Math.round).join(",")})`;
}

// ------------------------------------------------------------------ the projected slide
/** A slide as the projector throws it: white, like a printed page on the wall. The project's name is
 *  the poster across the top, the blurb is set in the serif, and one figure is the hero (for Inferbench,
 *  the measured decode speed-up as two bars). A band in the card's own colour runs along the bottom and
 *  carries the links and the way to the cards either side. */
export function drawSlide(card: CardContent | null, prev: CardContent | null, next: CardContent | null, index = 0, total = 0): Drawn {
  const W = 1600, H = 1200;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  const serif = F.serif;
  const PAPER = "#f7f5f0", BLACK = "#121214", GREY = "#6b6a70", RULE = "#dcd8cf";
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  if (!card) {
    g.fillStyle = GREY; g.font = `italic 400 60px ${serif}`; g.textAlign = "center";
    g.fillText("Slot a card from the rack.", W / 2, H / 2);
    return { canvas: c, regions: [] };
  }
  const pad = 112, regions: Region[] = [];
  const ink = inked(card.accent);
  const bandH = 176, bandY = H - bandH;

  // the running head: what it is, and where it sits in the stack
  g.font = `500 32px ${F.sans}`; g.fillStyle = GREY;
  g.fillText(`${card.area}, ${card.years}`, pad, pad);
  if (total) { g.textAlign = "right"; g.fillText(`${index + 1} of ${total}`, W - pad, pad); g.textAlign = "left"; }

  // the title, the full width of the page
  let size = 260; g.font = `900 ${size}px ${F.display}`;
  while (g.measureText(card.label).width > W - pad * 2 + 10 && size > 90) { size -= 6; g.font = `900 ${size}px ${F.display}`; }
  const ty = pad + 40 + size * 0.8;
  g.fillStyle = BLACK; g.fillText(card.label, pad - size * 0.05, ty);

  // the blurb, in the serif, in a measure a reader can follow
  let y = ty + 98;
  g.font = `400 50px ${serif}`; g.fillStyle = "#2c2b30";
  const lines = wrap(g, card.blurb, W * 0.62);
  for (const line of lines.slice(0, 4)) { g.fillText(line, pad, y); y += 66; }

  // the hero
  const top = Math.max(y + 34, ty + 340), room = bandY - 70 - top;
  const ms = card.metrics;
  if (card.id === "inferbench") {
    // measured: Qwen2.5-0.5B decode at batch 16 on the GTX 1650, before and after the kernel
    const bars: [string, number, string][] = [["stock", 87, "#c9c5bc"], ["with the kernel", 451, ink]];
    const bx = pad + 330, bw = W - pad - bx - 200, bh = Math.min(70, room / 3.4);
    bars.forEach(([lab, v, col], i) => {
      const yy = top + i * (bh + 26);
      g.fillStyle = GREY; g.font = `500 34px ${F.sans}`; g.fillText(lab, pad, yy + bh * 0.68);
      g.fillStyle = col; g.fillRect(bx, yy, (bw * v) / 451, bh);
      g.fillStyle = i ? ink : BLACK; g.font = `900 ${Math.round(bh * 0.95)}px ${F.display}`; g.fillText(`${v}`, bx + (bw * v) / 451 + 20, yy + bh * 0.84);
    });
    g.fillStyle = GREY; g.font = `italic 400 32px ${serif}`;
    g.fillText("tokens a second, Qwen2.5-0.5B decode at batch 16 on a GTX 1650. Measured.", pad, top + 2 * (bh + 26) + 30);
  } else {
    const hero = ms[0] ?? { value: "Building", label: "in the open, one release at a time" };
    let hs = Math.min(230, room * 0.9); g.font = `900 ${hs}px ${F.display}`;
    while (g.measureText(hero.value).width > W * 0.5 && hs > 90) { hs -= 8; g.font = `900 ${hs}px ${F.display}`; }
    const hy = top + hs * 0.78;
    g.fillStyle = ink; g.fillText(hero.value, pad - hs * 0.04, hy);
    const lx = pad + g.measureText(hero.value).width + 44;
    g.fillStyle = "#2c2b30"; g.font = `italic 400 40px ${serif}`;
    wrap(g, hero.label, Math.min(520, W - pad - lx)).slice(0, 3).forEach((l, i, arr) => g.fillText(l, lx, hy - (arr.length - 1) * 50 + i * 50));
    // two more numbers, smaller, at the right edge
    let ry = top + 6;
    g.textAlign = "right";
    for (const m of ms.slice(1, 3)) {
      if (lx + 560 > W - pad - 300) break;   // no room beside a long hero
      g.fillStyle = BLACK; g.font = `900 84px ${F.display}`; g.fillText(m.value, W - pad, ry + 70);
      g.fillStyle = GREY; g.font = `500 28px ${F.sans}`; g.fillText(m.label, W - pad, ry + 110);
      ry += 150;
    }
    g.textAlign = "left";
  }
  g.fillStyle = RULE; g.fillRect(pad, bandY - 1, W - pad * 2, 0);

  // the band: the card's colour, its links, and the cards either side
  g.fillStyle = card.accent; g.fillRect(0, bandY, W, bandH);
  const on = lum(rgb(card.accent)) > 0.5 ? BLACK : "#ffffff";
  const mid = bandY + bandH / 2;
  let lx = pad;
  card.links.forEach((l) => {
    const label = l.href.startsWith("/") ? "Read the case study" : l.label;
    g.font = `800 44px ${F.display}`; g.fillStyle = on;
    const w = g.measureText(label).width;
    g.fillText(label, lx, mid + 15);
    g.fillRect(lx, mid + 26, w, 4);
    if (l.href.startsWith("http")) {   // leaves the room: a small arrow out of the box
      const ax = lx + w + 26, ay = mid - 2; g.strokeStyle = on; g.lineWidth = 4;
      g.beginPath(); g.moveTo(ax - 9, ay + 9); g.lineTo(ax + 9, ay - 9); g.moveTo(ax - 4, ay - 9); g.lineTo(ax + 9, ay - 9); g.lineTo(ax + 9, ay + 4); g.stroke();
    }
    regions.push({ x: lx - 16, y: bandY + 20, w: w + 70, h: bandH - 40, action: l.href.startsWith("http") ? `ext:${l.href}` : `href:${l.href}`, label });
    lx += w + 96;
  });
  g.font = `600 34px ${F.sans}`;
  let rx = W - pad;
  if (next) {
    const t = next.label.toLowerCase(), tw = g.measureText(t).width;
    g.fillStyle = on; g.fillText(t, rx - 50 - tw, mid + 12); arrow(g, rx - 18, mid, 1, on);
    regions.push({ x: rx - 70 - tw, y: bandY + 20, w: tw + 86, h: bandH - 40, action: "card:next", label: `Next: ${next.title}` });
    rx -= tw + 130;
  }
  if (prev) {
    const t = prev.label.toLowerCase(), tw = g.measureText(t).width;
    g.globalAlpha = 0.72; arrow(g, rx - tw - 32, mid, -1, on); g.fillStyle = on; g.fillText(t, rx - tw, mid + 12); g.globalAlpha = 1;
    regions.push({ x: rx - tw - 66, y: bandY + 20, w: tw + 80, h: bandH - 40, action: "card:prev", label: `Previous: ${prev.title}` });
  }
  return { canvas: c, regions };
}

// ------------------------------------------------------------------ the phone
/** The phone on the desk. Lying there it shows a lock screen with the time; picked up (the contact
 *  view) it shows how to reach me. */
export function drawPhone(c: RoomContent, open: boolean, now = new Date()): Drawn {
  const W = 660, H = 1450;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!; const F = fonts(); const regions: Region[] = [];
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#151a2c"); bg.addColorStop(1, "#06070b");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = "#eef0f6";
  if (!open) {
    g.globalAlpha = 0.55;
    g.font = `300 200px ${F.sans}`; g.fillText(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), W / 2, 420);
    g.font = `500 38px ${F.sans}`; g.fillText(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }), W / 2, 220);
    g.globalAlpha = 1;
    return { canvas: cv, regions };
  }
  g.font = `500 34px ${F.sans}`; g.fillStyle = "#9aa3bd";
  g.fillText(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), W / 2, 90);
  // a contact card, the way a phone shows one
  g.fillStyle = "#2442d8"; g.beginPath(); g.arc(W / 2, 300, 110, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f3efe6"; g.font = `900 92px ${F.display}`; g.fillText("SS", W / 2, 332);
  g.font = `700 56px ${F.sans}`; g.fillText(c.name, W / 2, 500);
  g.fillStyle = "#9aa3bd"; g.font = `400 32px ${F.sans}`; g.fillText(`${c.title}, ${c.location.split(",")[0]}`, W / 2, 550);
  g.textAlign = "left";
  const rows: [string, string, string][] = [
    ["email", c.email, `ext:mailto:${c.email}`],
    ...c.links.map((l): [string, string, string] => [l.label.toLowerCase(), l.handle, `ext:${l.href}`]),
    ["résumé", "PDF, one page", `ext:${c.resume}`],
  ];
  let y = 660;
  for (const [k, v, action] of rows) {
    g.fillStyle = "#1b2033"; g.fillRect(40, y, W - 80, 140);
    g.fillStyle = "#9aa3bd"; g.font = `500 28px ${F.sans}`; g.fillText(k, 76, y + 52);
    g.fillStyle = "#eef0f6"; g.font = `600 38px ${F.sans}`; g.fillText(v, 76, y + 104);
    regions.push({ x: 40, y, w: W - 80, h: 140, action, label: v });
    y += 158;
  }
  g.textAlign = "center"; g.fillStyle = "#7c86a3"; g.font = `500 30px ${F.sans}`;
  g.fillText("Tap to copy the email instead", W / 2, y + 50);
  regions.push({ x: 40, y: y + 10, w: W - 80, h: 64, action: `copy:${c.email}`, label: "Copy" });
  return { canvas: cv, regions };
}
