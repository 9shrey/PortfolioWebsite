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


// ------------------------------------------------------------------ the projected slide
/** A slide as a projector shows it: black is no light, so it is mostly dark, and the type is the light.
 *  One number is the hero (for Inferbench, the measured decode speed-up as bars); the rest sit quietly
 *  beneath. The case study and code are buttons; the cards either side are along the bottom edge. */
export function drawSlide(card: CardContent | null, prev: CardContent | null, next: CardContent | null, index = 0, total = 0): Drawn {
  const W = 1600, H = 1200;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  const LIGHT = "#f4efe4", DIM = "rgba(244,239,228,.58)", FAINT = "rgba(244,239,228,.18)";
  // the throw: a dark frame with the lamp's light pooling a little in the middle
  g.fillStyle = "#0b0b0d"; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W * 0.5, H * 0.46, 60, W * 0.5, H * 0.5, W * 0.7);
  r.addColorStop(0, "rgba(60,55,48,.55)"); r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  if (!card) {
    g.fillStyle = DIM; g.font = `500 52px ${F.sans}`; g.textAlign = "center";
    g.fillText("Slot a card from the rack.", W / 2, H / 2);
    return { canvas: c, regions: [] };
  }
  const pad = 120, regions: Region[] = [];
  const acc = card.accent;

  // the running head: where this sits in the stack, and what it is
  g.font = `500 30px ${F.mono}`; g.fillStyle = DIM;
  if (total) g.fillText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, pad, pad);
  g.textAlign = "right"; g.fillText(`${card.area}  ·  ${card.years}`, W - pad, pad); g.textAlign = "left";
  g.fillStyle = acc; g.fillRect(pad, pad + 28, 64, 6);

  // the title, as wide as it can be
  let size = 210; g.font = `900 ${size}px ${F.display}`;
  while (g.measureText(card.label).width > W - pad * 2 && size > 90) { size -= 6; g.font = `900 ${size}px ${F.display}`; }
  g.fillStyle = LIGHT; g.fillText(card.label, pad - 8, pad + 70 + size * 0.86);
  let y = pad + 70 + size * 0.86 + 74;
  g.font = `400 42px ${F.sans}`; g.fillStyle = DIM;
  for (const line of wrap(g, card.blurb, W - pad * 2 - 260).slice(0, 3)) { g.fillText(line, pad, y); y += 56; }

  // the hero
  const top = y + 46, heroH = H - pad - 150 - top;
  const ms = card.metrics;
  if (card.id === "inferbench") {
    // measured: Qwen2.5-0.5B decode at batch 16 on the GTX 1650, before and after the kernel
    const bars: [string, number, string][] = [["stock", 87, "rgba(244,239,228,.35)"], ["with the kernel", 451, acc]];
    const bx = pad + 300, bw = W - pad - bx - 220, bh = Math.min(56, heroH / 4);
    bars.forEach(([lab, v, col], i) => {
      const yy = top + 18 + i * (bh + 34);
      g.fillStyle = DIM; g.font = `500 28px ${F.mono}`; g.fillText(lab, pad, yy + bh * 0.7);
      g.fillStyle = col; g.fillRect(bx, yy, (bw * v) / 451, bh);
      g.fillStyle = LIGHT; g.font = `800 40px ${F.display}`; g.fillText(`${v}`, bx + (bw * v) / 451 + 18, yy + bh * 0.78);
    });
    g.fillStyle = DIM; g.font = `500 24px ${F.mono}`;
    g.fillText("tok/s · Qwen2.5-0.5B decode, batch 16, GTX 1650 · measured", pad, top + 18 + 2 * (bh + 34) + 18);
  } else if (ms.length) {
    const hero = ms[0];
    let hs = 190; g.font = `800 ${hs}px ${F.display}`;
    while (g.measureText(hero.value).width > 760 && hs > 90) { hs -= 8; g.font = `800 ${hs}px ${F.display}`; }
    g.fillStyle = acc; g.fillText(hero.value, pad - 6, top + hs * 0.8);
    g.fillStyle = DIM; g.font = `500 34px ${F.sans}`;
    wrap(g, hero.label, 640).slice(0, 2).forEach((l, i) => g.fillText(l, pad, top + hs * 0.8 + 52 + i * 42));
  } else {
    g.fillStyle = acc; g.font = `800 120px ${F.display}`; g.fillText("Building", pad - 6, top + 100);
    g.fillStyle = DIM; g.font = `500 34px ${F.sans}`; g.fillText("in the open, one release at a time", pad, top + 152);
  }
  // the rest of the numbers, quiet, on the right
  const rest = card.id === "inferbench" ? ms : ms.slice(1);
  if (rest.length && card.id !== "inferbench") {
    let ry = top + 10;
    for (const m of rest.slice(0, 2)) {
      g.textAlign = "right"; g.fillStyle = LIGHT; g.font = `800 76px ${F.display}`; g.fillText(m.value, W - pad, ry + 64);
      g.fillStyle = DIM; g.font = `500 28px ${F.sans}`; g.fillText(m.label, W - pad, ry + 104); g.textAlign = "left";
      ry += 150;
    }
  }

  // the bottom edge: previous, the buttons, next
  const by = H - pad + 6;
  g.fillStyle = FAINT; g.fillRect(pad, by - 76, W - pad * 2, 2);
  const pill = (label: string, x: number, action: string, primary: boolean) => {
    g.font = `700 32px ${F.sans}`; const w = g.measureText(label).width + 84;
    g.lineWidth = 3; g.strokeStyle = primary ? acc : FAINT;
    if (primary) { g.fillStyle = acc; g.beginPath(); g.roundRect(x, by - 52, w, 64, 32); g.fill(); }
    else { g.beginPath(); g.roundRect(x, by - 52, w, 64, 32); g.stroke(); }
    g.fillStyle = primary ? "#0b0b0d" : LIGHT; g.fillText(label, x + 30, by - 9);
    // a small arrow out of the box: it leaves the room
    const ax = x + w - 40, ay = by - 22; g.strokeStyle = primary ? "#0b0b0d" : LIGHT; g.lineWidth = 3;
    g.beginPath(); g.moveTo(ax - 7, ay + 7); g.lineTo(ax + 7, ay - 7); g.moveTo(ax - 3, ay - 7); g.lineTo(ax + 7, ay - 7); g.lineTo(ax + 7, ay + 3); g.stroke();
    regions.push({ x, y: by - 52, w, h: 64, action, label });
    return w;
  };
  let lx = pad;
  card.links.forEach((l, i) => {
    const w = pill(i === 0 && l.href.startsWith("/") ? "Case study" : l.label, lx, l.href.startsWith("http") ? `ext:${l.href}` : `href:${l.href}`, i === 0);
    lx += w + 18;
  });
  g.font = `600 30px ${F.sans}`;
  if (next) {
    const t = next.label.toLowerCase(), tw = g.measureText(t).width;
    g.fillStyle = DIM; g.fillText(t, W - pad - 46 - tw, by - 9); arrow(g, W - pad - 16, by - 20, 1, LIGHT);
    regions.push({ x: W - pad - 66 - tw, y: by - 60, w: tw + 76, h: 80, action: "card:next", label: `Next: ${next.title}` });
  }
  if (prev) {
    const t = prev.label.toLowerCase(), tw = g.measureText(t).width;
    const nx = W - pad - 46 - (next ? g.measureText(next.label.toLowerCase()).width + 110 : 0) - tw - 46;
    arrow(g, nx + 16, by - 20, -1, LIGHT); g.fillStyle = DIM; g.fillText(t, nx + 46, by - 9);
    regions.push({ x: nx - 10, y: by - 60, w: tw + 76, h: 80, action: "card:prev", label: `Previous: ${prev.title}` });
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
