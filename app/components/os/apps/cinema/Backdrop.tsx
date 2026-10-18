"use client";

import { useEffect, useRef } from "react";

/* The moving picture behind a trailer, one look per genre:
     action  embers rising + lens-flare streaks
     horror  rolling fog + flicker
     romcom  floating hearts + bokeh
     scifi   starfield warp
     heist   sweeping laser grid + gold glints
   `energy` (0..1) spikes on the big moments: villain, boom, title. */

export type Look = "action" | "horror" | "romcom" | "scifi" | "heist";

type P = { x: number; y: number; z: number; s: number; v: number; a: number };

export default function Backdrop({ look, energy }: { look: Look; energy: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef(energy);
  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const N = look === "scifi" ? 260 : look === "horror" ? 14 : 70;
    const ps: P[] = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      s: Math.random(),
      v: Math.random(),
      a: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    let t = 0;
    let last = performance.now();
    let e = energyRef.current;

    const heart = (x: number, y: number, r: number) => {
      g.beginPath();
      g.moveTo(x, y + r * 0.35);
      g.bezierCurveTo(x, y - r * 0.3, x - r, y - r * 0.3, x - r, y + r * 0.2);
      g.bezierCurveTo(x - r, y + r * 0.7, x, y + r, x, y + r * 1.25);
      g.bezierCurveTo(x, y + r, x + r, y + r * 0.7, x + r, y + r * 0.2);
      g.bezierCurveTo(x + r, y - r * 0.3, x, y - r * 0.3, x, y + r * 0.35);
      g.fill();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      e += (energyRef.current - e) * Math.min(1, dt * 4);
      g.clearRect(0, 0, w, h);

      if (look === "action") {
        const grd = g.createLinearGradient(0, h, 0, 0);
        grd.addColorStop(0, `rgba(255,90,20,${0.18 + e * 0.25})`);
        grd.addColorStop(0.6, "rgba(60,10,0,0.05)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, w, h);
        for (const p of ps) {
          p.y -= dt * (0.05 + p.v * 0.12) * (1 + e * 2);
          p.x += Math.sin(t * 2 + p.a) * dt * 0.02;
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = Math.random();
          }
          const r = 1 + p.s * 2.4;
          g.fillStyle = `rgba(255,${140 + Math.round(p.z * 90)},40,${0.4 + p.z * 0.5})`;
          g.shadowColor = "#ff7a1a";
          g.shadowBlur = 8;
          g.beginPath();
          g.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
          g.fill();
        }
        g.shadowBlur = 0;
        // anamorphic flare sweeping across
        const fx = ((t * 0.18) % 1.6 - 0.3) * w;
        const fl = g.createLinearGradient(fx - w * 0.4, 0, fx + w * 0.4, 0);
        fl.addColorStop(0, "rgba(120,200,255,0)");
        fl.addColorStop(0.5, `rgba(160,220,255,${0.12 + e * 0.25})`);
        fl.addColorStop(1, "rgba(120,200,255,0)");
        g.fillStyle = fl;
        g.fillRect(0, h * 0.48, w, 3);
      } else if (look === "horror") {
        const flick = Math.random() < 0.02 + e * 0.05 ? 0.25 : 0;
        for (const p of ps) {
          p.x += dt * (0.01 + p.v * 0.02);
          if (p.x > 1.3) p.x = -0.3;
          const r = (0.25 + p.s * 0.35) * Math.max(w, h);
          const grd = g.createRadialGradient(p.x * w, (0.55 + p.y * 0.5) * h, 0, p.x * w, (0.55 + p.y * 0.5) * h, r);
          grd.addColorStop(0, `rgba(170,190,200,${0.06 + e * 0.04})`);
          grd.addColorStop(1, "rgba(170,190,200,0)");
          g.fillStyle = grd;
          g.fillRect(0, 0, w, h);
        }
        if (e > 0.6 && Math.random() < 0.04) {
          g.fillStyle = "rgba(160,0,0,0.25)";
          g.fillRect(0, 0, w, h);
        }
        if (flick) {
          g.fillStyle = `rgba(0,0,0,${flick + 0.5})`;
          g.fillRect(0, 0, w, h);
        }
      } else if (look === "romcom") {
        for (const p of ps) {
          p.y -= dt * (0.02 + p.v * 0.05);
          p.x += Math.sin(t + p.a) * dt * 0.03;
          if (p.y < -0.1) {
            p.y = 1.1;
            p.x = Math.random();
          }
          if (p.z > 0.55) {
            g.fillStyle = `rgba(255,${110 + Math.round(p.s * 60)},170,${0.35 + p.z * 0.4})`;
            heart(p.x * w, p.y * h, 4 + p.s * 9);
          } else {
            g.fillStyle = `rgba(255,210,230,${0.05 + p.z * 0.12})`;
            g.beginPath();
            g.arc(p.x * w, p.y * h, 10 + p.s * 30, 0, Math.PI * 2);
            g.fill();
          }
        }
      } else if (look === "scifi") {
        const cx = w / 2;
        const cy = h / 2;
        const speed = 0.25 + e * 1.4;
        for (const p of ps) {
          p.z -= dt * speed;
          if (p.z <= 0.02) {
            p.z = 1;
            p.a = Math.random() * Math.PI * 2;
            p.s = Math.random();
          }
          const d = (p.s * 0.9 + 0.1) / p.z;
          const x = cx + Math.cos(p.a) * d * w * 0.5;
          const y = cy + Math.sin(p.a) * d * h * 0.5;
          const d2 = (p.s * 0.9 + 0.1) / (p.z + dt * speed * 3);
          const x2 = cx + Math.cos(p.a) * d2 * w * 0.5;
          const y2 = cy + Math.sin(p.a) * d2 * h * 0.5;
          g.strokeStyle = `rgba(${170 + Math.round(p.v * 80)},220,255,${Math.min(1, (1 - p.z) * 1.3)})`;
          g.lineWidth = 1 + (1 - p.z) * 1.5;
          g.beginPath();
          g.moveTo(x2, y2);
          g.lineTo(x, y);
          g.stroke();
        }
      } else {
        // heist: sweeping lasers + glints
        g.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const ang = Math.sin(t * (0.4 + i * 0.13) + i) * 0.6;
          const x0 = (i + 0.5) * (w / 5);
          g.strokeStyle = `rgba(255,40,60,${0.25 + e * 0.35})`;
          g.shadowColor = "#ff2a3c";
          g.shadowBlur = 10;
          g.beginPath();
          g.moveTo(x0, 0);
          g.lineTo(x0 + Math.tan(ang) * h, h);
          g.stroke();
        }
        g.shadowBlur = 0;
        for (const p of ps) {
          const tw = Math.max(0, Math.sin(t * (1 + p.v * 3) + p.a));
          if (tw < 0.92) continue;
          const r = (tw - 0.92) * 60 * (0.5 + p.s);
          g.strokeStyle = "rgba(255,215,120,0.9)";
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(p.x * w - r, p.y * h);
          g.lineTo(p.x * w + r, p.y * h);
          g.moveTo(p.x * w, p.y * h - r);
          g.lineTo(p.x * w, p.y * h + r);
          g.stroke();
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [look]);

  return <canvas ref={ref} className="cin-backdrop" aria-hidden />;
}
