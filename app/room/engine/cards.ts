import type { RoomContent } from "../types";
import { fonts } from "./surfaces";

/* Things drawn onto surfaces in the room: the phone's screen. Each drawing
   returns its canvas and the clickable regions on it (canvas pixels, top-left origin); the engine maps
   a click on the 3D surface back to a region. */

export interface Region { x: number; y: number; w: number; h: number; action: string; label: string }
export interface Drawn { canvas: HTMLCanvasElement; regions: Region[] }

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
