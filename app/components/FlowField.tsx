"use client";

import { useEffect, useRef } from "react";

/**
 * Flow-field particle background.
 * Pure Canvas2D — no deps. Particles follow a perlin-ish noise field
 * with subtle parallax pull toward the cursor. Designed to sit behind
 * the hero and fade out as the user scrolls.
 */
export default function FlowField({
  density = 0.00018,
  className = "",
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
    }[] = [];

    const mouse = { x: -9999, y: -9999, has: false };

    // Cheap pseudo-noise via layered sin. Good enough for visual flow.
    const noise = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 0.0025 + t * 0.0004);
      const b = Math.cos(y * 0.0028 - t * 0.0003);
      const c = Math.sin((x + y) * 0.0017 + t * 0.0006);
      return (a + b + c) / 3; // -1..1
    };

    const seed = () => {
      const target = Math.max(60, Math.floor(width * height * density));
      particles = new Array(target).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        life: Math.random() * 240,
        max: 180 + Math.random() * 240,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.has = true;
    };
    const onLeave = () => {
      mouse.has = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let raf = 0;
    let t = 0;

    // Soft wash; fades trails so particles draw silky lines.
    const fade = "rgba(10, 10, 10, 0.075)";
    const stroke = "rgba(217, 119, 87, 0.55)"; // matches --accent
    const strokeAlt = "rgba(237, 232, 216, 0.18)"; // matches --fg dim

    const tick = () => {
      t += reduceMotion.current ? 4 : 16;

      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.7;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const n = noise(p.x, p.y, t);
        const angle = n * Math.PI * 2;

        // Gentle pull toward cursor for parallax interactivity.
        let pullX = 0;
        let pullY = 0;
        if (mouse.has) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          const range = 220;
          if (d2 < range * range) {
            const f = (1 - Math.sqrt(d2) / range) * 0.6;
            pullX = (dx / (Math.sqrt(d2) + 0.01)) * f;
            pullY = (dy / (Math.sqrt(d2) + 0.01)) * f;
          }
        }

        const speed = reduceMotion.current ? 0.15 : 0.55;
        p.vx = Math.cos(angle) * speed + pullX;
        p.vy = Math.sin(angle) * speed + pullY;

        const px = p.x;
        const py = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        ctx.strokeStyle = i % 9 === 0 ? stroke : strokeAlt;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Wrap + respawn for variety.
        if (
          p.x < -10 ||
          p.x > width + 10 ||
          p.y < -10 ||
          p.y > height + 10 ||
          p.life > p.max
        ) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 0;
          p.max = 180 + Math.random() * 240;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
