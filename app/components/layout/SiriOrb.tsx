"use client";

import { useEffect, useRef } from "react";

type Phase =
  | "loading"
  | "listening"
  | "thinking"
  | "speaking"
  | "routed"
  | "unclear"
  | "failed";

export default function SiriOrb({
  active,
  phase,
  levelRef,
  outputLevelRef,
  size = 24,
}: {
  active: boolean;
  phase: Phase;
  levelRef: React.RefObject<number>;
  outputLevelRef: React.RefObject<number>;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const r = size / 2;
    const cx = r;
    const cy = r;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size);

      const input = levelRef.current ?? 0;
      const output = outputLevelRef.current ?? 0;
      const raw = Math.min(1, Math.max(input * 12, output));
      // smooth so the wave doesn't jitter frame to frame
      smoothedRef.current += (raw - smoothedRef.current) * 0.25;
      const level = smoothedRef.current;

      const busy = phase === "thinking" || phase === "loading";
      const idle = 0.08 + Math.sin(t / 900) * 0.03;
      const amp = active ? (busy ? idle : Math.max(idle, level)) : idle * 0.5;

      // base sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
      const bg = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
      bg.addColorStop(0, "rgba(255,255,255,0.06)");
      bg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.clip();

      // animated wave band through the middle — the "Siri" ribbon
      const colors = active
        ? ["#5ec8ff", "#7d6bff", "#ff5fae", "#ff9f5a"]
        : ["#6b6a68", "#88857f", "#6b6a68", "#4a4844"];

      const bands = 3;
      for (let b = 0; b < bands; b++) {
        const phaseOffset = t / (busy ? 260 : 520) + b * 1.7;
        const bandAmp = r * amp * (1 - b * 0.22);
        ctx.beginPath();
        for (let x = -2; x <= size + 2; x += 2) {
          const nx = (x / size) * Math.PI * 2;
          const y =
            cy +
            Math.sin(nx * 1.6 + phaseOffset) * bandAmp * 0.5 +
            Math.sin(nx * 0.6 - phaseOffset * 0.7) * bandAmp * 0.3;
          if (x === -2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, colors[b % colors.length]);
        grad.addColorStop(1, colors[(b + 2) % colors.length]);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.85 - b * 0.2;
        ctx.lineWidth = Math.max(1, size * 0.09 - b * 0.4);
        ctx.lineCap = "round";
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // rim light
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, active, phase]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, borderRadius: "9999px" }}
      aria-hidden="true"
    />
  );
}
