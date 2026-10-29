import type { Book, CardContent, RoomContent } from "../types";
import { fonts } from "./surfaces";

/* Everything you read in the room is drawn onto things in it: the projector's slide, and paper cards
   that float up off the desk. Each drawing returns its canvas and the clickable regions on it
   (canvas pixels, top-left origin); the engine maps a click on the 3D surface back to a region. */

export interface Region { x: number; y: number; w: number; h: number; action: string; label: string }
export interface Drawn { canvas: HTMLCanvasElement; regions: Region[] }

const PAPER = "#f3efe6", INK = "#16161a", MUTE = "#5a5a62", PEN = "#2442d8", RULE = "#d9d2c3";

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

function paper(W: number, H: number, accent = PEN) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);   // the edges of the sheet catch less light
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(60,40,20,0.12)");
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.fillStyle = accent; g.fillRect(0, 0, W, 18);
  g.textBaseline = "alphabetic";
  return { c, g };
}

// ------------------------------------------------------------------ the projected slide
export function drawSlide(card: CardContent | null, prev: CardContent | null, next: CardContent | null): Drawn {
  const W = 1600, H = 1200;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const F = fonts();
  const r = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.75);
  r.addColorStop(0, "#fbf8f1"); r.addColorStop(1, "#d9d5cc");
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  if (!card) {
    g.fillStyle = "#3b3b40"; g.font = `500 54px ${F.sans}`; g.textAlign = "center";
    g.fillText("Pick a card from the rack on the desk.", W / 2, H / 2);
    return { canvas: c, regions: [] };
  }
  const pad = 110, regions: Region[] = [];
  g.fillStyle = card.accent; g.fillRect(0, 0, W, 26);
  g.fillStyle = MUTE; g.font = `500 38px ${F.mono}`;
  g.fillText(`${card.area}  ·  ${card.years}`, pad, pad + 30);
  g.fillStyle = "#121215"; g.font = `900 ${card.label.length > 10 ? 140 : 168}px ${F.display}`;
  g.fillText(card.label, pad - 6, pad + 205);
  g.font = `400 46px ${F.sans}`; g.fillStyle = "#26262b";
  let y = pad + 295;
  for (const line of wrap(g, card.blurb, W - pad * 2).slice(0, 4)) { g.fillText(line, pad, y); y += 60; }
  // metrics
  const ms = card.metrics.slice(0, 3);
  if (ms.length) {
    const mw = (W - pad * 2) / ms.length, my = Math.max(y + 140, 760);
    ms.forEach((m, i) => {
      const x = pad + i * mw;
      g.fillStyle = "#121215"; g.font = `800 ${m.value.length > 8 ? 72 : 96}px ${F.display}`;
      g.fillText(m.value, x, my);
      g.fillStyle = MUTE; g.font = `500 32px ${F.sans}`;
      wrap(g, m.label, mw - 40).slice(0, 2).forEach((line, k) => g.fillText(line, x, my + 52 + k * 40));
    });
  }
  // the bar along the bottom: previous, the links, next
  const by = H - 90;
  g.fillStyle = "rgba(22,22,26,.12)"; g.fillRect(pad, by - 70, W - pad * 2, 2);
  if (prev) {
    arrow(g, pad + 18, by - 14, -1, MUTE);
    g.font = `600 36px ${F.sans}`; g.fillStyle = MUTE; g.fillText(prev.label.toLowerCase(), pad + 52, by);
    regions.push({ x: pad - 10, y: by - 60, w: 60 + g.measureText(prev.label.toLowerCase()).width, h: 80, action: "card:prev", label: `Previous: ${prev.title}` });
  }
  if (next) {
    g.font = `600 36px ${F.sans}`; const t = next.label.toLowerCase(), tw = g.measureText(t).width;
    g.fillStyle = MUTE; g.fillText(t, W - pad - 52 - tw, by);
    arrow(g, W - pad - 18, by - 14, 1, MUTE);
    regions.push({ x: W - pad - 62 - tw, y: by - 60, w: tw + 72, h: 80, action: "card:next", label: `Next: ${next.title}` });
  }
  g.textAlign = "left";
  let lx = W / 2 - 260;
  for (const l of card.links) {
    const font = `700 40px ${F.sans}`;
    regions.push(link(g, l.label, lx, by, l.href.startsWith("http") ? `ext:${l.href}` : `href:${l.href}`, font, PEN));
    g.font = font; lx += g.measureText(l.label).width + 56;
  }
  return { canvas: c, regions };
}

// ------------------------------------------------------------------ cards that float up
const W = 1200, H = 1640;

export function drawAbout(c: RoomContent): Drawn {
  const { c: cv, g } = paper(W, H); const F = fonts(); const pad = 90;
  g.fillStyle = INK; g.font = `900 112px ${F.display}`; g.fillText(c.name, pad - 4, 190);
  g.fillStyle = MUTE; g.font = `500 32px ${F.mono}`; g.fillText(`${c.title}, ${c.location}`, pad, 250);
  let y = 340;
  g.fillStyle = INK; g.font = `500 46px ${F.sans}`;
  for (const l of wrap(g, c.about.lead, W - pad * 2)) { g.fillText(l, pad, y); y += 60; }
  y += 24; g.font = `400 36px ${F.sans}`; g.fillStyle = "#2a2a30";
  for (const p of c.about.paragraphs) { for (const l of wrap(g, p, W - pad * 2)) { g.fillText(l, pad, y); y += 50; } y += 22; }
  g.fillStyle = RULE; g.fillRect(pad, y, W - pad * 2, 2); y += 60;
  g.fillStyle = INK; g.font = `700 30px ${F.sans}`; g.fillText("Education", pad, y);
  g.font = `400 32px ${F.sans}`; g.fillStyle = "#2a2a30";
  for (const l of wrap(g, c.about.education, W - pad * 2 - 230)) { g.fillText(l, pad + 230, y); y += 44; }
  y += 24;
  for (const s of c.about.skills) {
    g.fillStyle = INK; g.font = `700 30px ${F.sans}`; g.fillText(s.group, pad, y);
    g.font = `400 30px ${F.sans}`; g.fillStyle = "#2a2a30";
    for (const l of wrap(g, s.items.join(", "), W - pad * 2 - 230)) { g.fillText(l, pad + 230, y); y += 42; }
    y += 10;
  }
  return { canvas: cv, regions: [] };
}

export function drawWriting(c: RoomContent): Drawn {
  const { c: cv, g } = paper(W, H); const F = fonts(); const pad = 90; const regions: Region[] = [];
  g.fillStyle = INK; g.font = `900 112px ${F.display}`; g.fillText("Writing", pad - 4, 190);
  g.fillStyle = MUTE; g.font = `400 38px ${F.sans}`;
  g.fillText("Notes from the projects: what I measured, and", pad, 270);
  g.fillText("what fooled me first.", pad, 318);
  let y = 420;
  for (const p of c.posts) {
    g.fillStyle = RULE; g.fillRect(pad, y - 50, W - pad * 2, 2);
    const top = y;
    g.fillStyle = INK; g.font = `800 50px ${F.sans}`;
    for (const l of wrap(g, p.title, W - pad * 2)) { g.fillText(l, pad, y + 20); y += 62; }
    g.fillStyle = "#3a3a40"; g.font = `400 34px ${F.sans}`;
    for (const l of wrap(g, p.excerpt, W - pad * 2).slice(0, 3)) { g.fillText(l, pad, y + 20); y += 46; }
    g.fillStyle = MUTE; g.font = `500 26px ${F.mono}`;
    const date = new Date(p.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    g.fillText(`${date} · ${p.readingTime}${p.status === "draft" ? " · draft" : ""}`, pad, y + 24);
    g.fillStyle = PEN; g.font = `700 32px ${F.sans}`; const rt = "Read it"; const rw = g.measureText(rt).width;
    g.fillText(rt, W - pad - rw - 40, y + 24); arrow(g, W - pad - 18, y + 14, 1, PEN);
    regions.push({ x: pad, y: top - 40, w: W - pad * 2, h: y - top + 90, action: `href:/writing/${p.slug}`, label: p.title });
    y += 130;
  }
  return { canvas: cv, regions };
}

export function drawContact(c: RoomContent): Drawn {
  const H2 = 1100;
  const { c: cv, g } = paper(W, H2); const F = fonts(); const pad = 90; const regions: Region[] = [];
  g.fillStyle = INK; g.font = `900 112px ${F.display}`; g.fillText("Say hi", pad - 4, 190);
  g.fillStyle = MUTE; g.font = `400 38px ${F.sans}`; g.fillText("Email is fastest. I answer everything that isn't a sales pitch.", pad, 270);
  regions.push(link(g, c.email, pad, 410, `ext:mailto:${c.email}`, `800 64px ${F.display}`, INK));
  g.font = `600 30px ${F.sans}`; const cw = g.measureText("Copy the address").width + 48;
  g.strokeStyle = "#b9b2a3"; g.lineWidth = 3; g.strokeRect(pad, 470, cw, 64);
  g.fillStyle = INK; g.fillText("Copy the address", pad + 24, 513);
  regions.push({ x: pad, y: 470, w: cw, h: 64, action: `copy:${c.email}`, label: "Copy the email address" });
  let y = 660;
  for (const l of c.links) {
    g.fillStyle = RULE; g.fillRect(pad, y - 62, W - pad * 2, 2);
    g.fillStyle = INK; g.font = `700 44px ${F.sans}`; g.fillText(l.label, pad, y);
    g.fillStyle = MUTE; g.font = `400 36px ${F.sans}`; const hw = g.measureText(l.handle).width;
    g.fillText(l.handle, W - pad - hw - 50, y); arrow(g, W - pad - 16, y - 12, 1, MUTE);
    regions.push({ x: pad, y: y - 60, w: W - pad * 2, h: 96, action: `ext:${l.href}`, label: l.label });
    y += 110;
  }
  return { canvas: cv, regions };
}

export function drawResume(c: RoomContent, page: HTMLImageElement | null): Drawn {
  const { c: cv, g } = paper(W, H); const F = fonts(); const pad = 90; const regions: Region[] = [];
  g.fillStyle = INK; g.font = `900 112px ${F.display}`; g.fillText("Résumé", pad - 4, 190);
  regions.push(link(g, "Open the PDF", pad, 290, `ext:${c.resume}`, `700 40px ${F.sans}`, PEN));
  g.font = `700 40px ${F.sans}`;
  regions.push(link(g, "Read it as a page", pad + g.measureText("Open the PDF").width + 70, 290, "href:/cv", `700 40px ${F.sans}`, PEN));
  if (page) {
    const top = 360, h = H - top - 70, w = h * (page.width / page.height);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect((W - w) / 2 + 8, top + 10, w, h);
    g.drawImage(page, (W - w) / 2, top, w, h);
    regions.push({ x: (W - w) / 2, y: top, w, h, action: `ext:${c.resume}`, label: "Open the PDF" });
  }
  return { canvas: cv, regions };
}

export function drawBooks(books: Book[], pick?: number): Drawn {
  const { c: cv, g } = paper(W, H); const F = fonts(); const pad = 90;
  g.fillStyle = INK; g.font = `900 112px ${F.display}`; g.fillText("On the shelf", pad - 4, 190);
  g.fillStyle = MUTE; g.font = `400 38px ${F.sans}`; g.fillText("Books that changed how I work, left to right.", pad, 268);
  let y = 370;
  const each = Math.min(120, (H - y - 40) / Math.max(books.length, 1));
  books.forEach((b, i) => {
    if (i === pick) { g.fillStyle = "rgba(36,66,216,.07)"; g.fillRect(pad - 20, y - 58, W - pad * 2 + 40, each); }
    g.fillStyle = b.color; g.fillRect(pad, y - 52, 14, each - 22);
    g.fillStyle = INK; g.font = `700 38px ${F.sans}`; g.fillText(b.title, pad + 40, y - 8);
    const tw = g.measureText(b.title).width;
    g.fillStyle = MUTE; g.font = `400 30px ${F.sans}`; g.fillText(b.author, pad + 40 + tw + 20, y - 8);
    g.fillStyle = "#3a3a40"; g.font = `400 30px ${F.sans}`;
    g.fillText(wrap(g, b.note, W - pad * 2 - 40)[0] ?? "", pad + 40, y + 34);
    y += each;
  });
  return { canvas: cv, regions: [] };
}

export type { Book };
