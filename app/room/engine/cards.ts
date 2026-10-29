import type { CardContent, RoomContent } from "../types";
import { fonts } from "./surfaces";

/* Things drawn onto surfaces in the room: the projector's slide and the phone's screen. Each drawing
   returns its canvas and the clickable regions on it (canvas pixels, top-left origin); the engine maps
   a click on the 3D surface back to a region. */

export interface Region { x: number; y: number; w: number; h: number; action: string; label: string }
export interface Drawn { canvas: HTMLCanvasElement; regions: Region[] }

const INK = "#16161a", MUTE = "#5a5a62", PEN = "#2442d8";

function wrap(g: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(/\s+/)) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}

/** A link drawn as text with an underline; returns its region. */
function link(g: CanvasRenderingContext2D, text: string, x: number, y: number, action: string, font: string, color = INK): Region {
  g.font = font; g.fillStyle = color; g.fillText(text, x, y);
  const w = g.measureText(text).width;
  g.fillRect(x, y + 10, w, 3);
  return { x: x - 12, y: y - 46, w: w + 24, h: 70, action, label: text };
}

/** A small arrow drawn as lines (no font needs to have the glyph). */
function arrow(g: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, color = INK) {
  g.strokeStyle = color; g.lineWidth = 4; g.beginPath();
  g.moveTo(x - 18 * dir, y); g.lineTo(x + 18 * dir, y); g.moveTo(x + 6 * dir, y - 12); g.lineTo(x + 18 * dir, y); g.lineTo(x + 6 * dir, y + 12);
  g.stroke();
}


// ------------------------------------------------------------------ the projected slide
/** A talk slide: what it is on the left, the numbers on the right, links and the next card along the
 *  bottom. Projected, so it is drawn warm and soft-edged. */
export function drawSlide(card: CardContent | null, prev: CardContent | null, next: CardContent | null): Drawn {
  const W = 1600, H = 1200;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  const r = g.createRadialGradient(W * 0.45, H * 0.45, 120, W / 2, H / 2, W * 0.78);
  r.addColorStop(0, "#fdfaf3"); r.addColorStop(0.7, "#eee9df"); r.addColorStop(1, "#d6d1c6");
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  if (!card) {
    g.fillStyle = "#3b3b40"; g.font = `500 54px ${F.sans}`; g.textAlign = "center";
    g.fillText("Pick a card from the rack on the desk.", W / 2, H / 2);
    return { canvas: c, regions: [] };
  }
  const pad = 112, regions: Region[] = [];
  const split = W * 0.6;
  // left: the accent rule, what it is, the title, the one sentence
  g.fillStyle = card.accent; g.fillRect(pad, pad - 6, 84, 12);
  g.fillStyle = MUTE; g.font = `500 34px ${F.mono}`;
  g.fillText(`${card.area}`, pad, pad + 70);
  g.fillText(card.years, pad, pad + 116);
  let size = 156; g.font = `900 ${size}px ${F.display}`;
  while (g.measureText(card.label).width > split - pad - 40 && size > 80) { size -= 6; g.font = `900 ${size}px ${F.display}`; }
  g.fillStyle = "#121215"; g.fillText(card.label, pad - 6, pad + 140 + size);
  g.font = `400 44px ${F.sans}`; g.fillStyle = "#26262b";
  let y = pad + 220 + size;
  for (const line of wrap(g, card.blurb, split - pad - 60).slice(0, 6)) { g.fillText(line, pad, y); y += 60; }
  // right: the numbers, stacked, with hairlines between
  const ms = card.metrics.slice(0, 3);
  const rx = split + 40, rw = W - pad - rx;
  g.fillStyle = "rgba(22,22,26,.12)"; g.fillRect(split, pad, 2, H - pad * 2 - 120);
  const top = pad + 30, each = (H - pad * 2 - 180) / Math.max(ms.length, 1);
  ms.forEach((m, i) => {
    const my = top + i * each;
    if (i) { g.fillStyle = "rgba(22,22,26,.12)"; g.fillRect(rx, my - 26, rw, 2); }
    let vs = 120; g.font = `800 ${vs}px ${F.display}`;
    while (g.measureText(m.value).width > rw && vs > 56) { vs -= 6; g.font = `800 ${vs}px ${F.display}`; }
    g.fillStyle = "#121215"; g.fillText(m.value, rx, my + vs * 0.82);
    g.fillStyle = MUTE; g.font = `500 30px ${F.sans}`;
    wrap(g, m.label, rw).slice(0, 2).forEach((line, k) => g.fillText(line, rx, my + vs * 0.82 + 46 + k * 38));
  });
  if (!ms.length) {
    g.fillStyle = MUTE; g.font = `500 34px ${F.sans}`;
    card.body.slice(0, 2).forEach((b, i) => {
      let yy = top + i * 320;
      g.fillStyle = "#121215"; g.font = `700 34px ${F.sans}`; g.fillText(b.k, rx, yy + 30);
      g.fillStyle = "#3a3a40"; g.font = `400 30px ${F.sans}`;
      for (const line of wrap(g, b.v, rw).slice(0, 6)) { yy += 42; g.fillText(line, rx, yy + 40); }
    });
  }
  // bottom: previous, the links, next
  const by = H - 92;
  g.fillStyle = "rgba(22,22,26,.12)"; g.fillRect(pad, by - 66, W - pad * 2, 2);
  if (prev) {
    arrow(g, pad + 18, by - 12, -1, MUTE);
    g.font = `600 34px ${F.sans}`; g.fillStyle = MUTE; const t = prev.label.toLowerCase(); g.fillText(t, pad + 52, by);
    regions.push({ x: pad - 10, y: by - 60, w: 70 + g.measureText(t).width, h: 84, action: "card:prev", label: `Previous: ${prev.title}` });
  }
  if (next) {
    g.font = `600 34px ${F.sans}`; const t = next.label.toLowerCase(), tw = g.measureText(t).width;
    g.fillStyle = MUTE; g.fillText(t, W - pad - 52 - tw, by);
    arrow(g, W - pad - 18, by - 12, 1, MUTE);
    regions.push({ x: W - pad - 62 - tw, y: by - 60, w: tw + 72, h: 84, action: "card:next", label: `Next: ${next.title}` });
  }
  g.font = `700 38px ${F.sans}`;
  const total = card.links.reduce((a, l) => a + g.measureText(l.label).width, 0) + 56 * Math.max(0, card.links.length - 1);
  let lx = W / 2 - total / 2;
  for (const l of card.links) {
    const font = `700 38px ${F.sans}`;
    regions.push(link(g, l.label, lx, by, l.href.startsWith("http") ? `ext:${l.href}` : `href:${l.href}`, font, PEN));
    g.font = font; lx += g.measureText(l.label).width + 56;
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
