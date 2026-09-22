"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソ01アイウエオ01$#@%&{}[]<>/\\;:_+-=~ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ";

/** Matrix-style code rain, run once per route change then torn down. Canvas
 *  rather than DOM nodes — hundreds of glyphs redrawn every frame would be
 *  too much churn for React/CSS to drive smoothly. */
export default function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = 16;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let columns = Math.ceil(width / fontSize);
    let drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -40);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -40);
    };
    resize();
    window.addEventListener("resize", resize);

    const DURATION = 900;
    const FADE = 220;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = now - start;

      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px var(--font-mono-custom), ui-monospace, monospace`;
      ctx.textBaseline = "top";

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright leading glyph, dimmer red trail behind it.
        ctx.fillStyle = "#ff2d3d";
        ctx.shadowColor = "#ff2d3d";
        ctx.shadowBlur = 6;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > 0) {
          ctx.fillStyle = "rgba(180, 20, 40, 0.55)";
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - fontSize);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (elapsed > DURATION - FADE) {
        const fadeProgress = Math.min(1, (elapsed - (DURATION - FADE)) / FADE);
        ctx.fillStyle = `rgba(16, 16, 18, ${fadeProgress * 0.92})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (elapsed < DURATION) {
        raf = requestAnimationFrame(frame);
      } else {
        onDone();
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="matrix-rain" aria-hidden />;
}
