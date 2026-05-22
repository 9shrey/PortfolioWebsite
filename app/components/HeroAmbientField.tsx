"use client";

import { useEffect, useRef } from "react";

type NodePoint = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  radius: number;
  hue: number;
};

type Route = {
  y: number;
  amplitude: number;
  phase: number;
  speed: number;
  color: string;
};

const NODE_COUNT = 56;
const REDUCED_NODE_COUNT = 24;

const ROUTES: Route[] = [
  { y: 0.32, amplitude: 54, phase: 0.1, speed: 0.42, color: "rgba(11, 99, 206, 0.42)" },
  { y: 0.47, amplitude: 78, phase: 1.8, speed: 0.28, color: "rgba(32, 164, 184, 0.38)" },
  { y: 0.64, amplitude: 45, phase: 3.2, speed: 0.36, color: "rgba(225, 154, 72, 0.24)" },
];

function createNode(width: number, height: number): NodePoint {
  const x = Math.random() * width;
  const y = Math.random() * height;

  return {
    x,
    y,
    baseX: x,
    baseY: y,
    phase: Math.random() * Math.PI * 2,
    radius: 1.6 + Math.random() * 3.2,
    hue: 190 + Math.random() * 70,
  };
}

function routePoint(route: Route, progress: number, width: number, height: number, time: number) {
  const x = width * (-0.08 + progress * 1.16);
  const normalized = progress * Math.PI * 2;
  const y =
    height * route.y +
    Math.sin(normalized + route.phase + time * route.speed) * route.amplitude +
    Math.sin(normalized * 2.1 + route.phase) * route.amplitude * 0.24;

  return { x, y };
}

export default function HeroAmbientField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: NodePoint[] = [];
    let raf = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(480, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: reduceMotion ? REDUCED_NODE_COUNT : NODE_COUNT }, () => createNode(width, height));
    };

    const drawRoute = (route: Route, time: number, lineWidth: number, alphaScale = 1) => {
      const gradient = ctx.createLinearGradient(width * 0.04, 0, width * 0.94, height);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.22, route.color);
      gradient.addColorStop(0.54, "rgba(255, 255, 255, 0.42)");
      gradient.addColorStop(0.78, route.color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = alphaScale;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.shadowColor = route.color;
      ctx.shadowBlur = lineWidth * 1.4;
      ctx.beginPath();

      for (let i = 0; i <= 120; i += 1) {
        const progress = i / 120;
        const point = routePoint(route, progress, width, height, time);

        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const drawTopology = (time: number) => {
      const centerX = width * 0.83;
      const centerY = height * 0.42;
      const maxRadius = Math.min(width, height) * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineWidth = 1;

      for (let ring = 0; ring < 12; ring += 1) {
        const radius = maxRadius * (0.22 + ring * 0.07);
        const alpha = Math.max(0, 0.16 - ring * 0.008);
        ctx.strokeStyle = `rgba(11, 99, 206, ${alpha})`;
        ctx.beginPath();

        for (let i = 0; i <= 160; i += 1) {
          const angle = (i / 160) * Math.PI * 2;
          const wobble = Math.sin(angle * 4 + time * 0.65 + ring) * 10 + Math.cos(angle * 7 - time * 0.35) * 5;
          const x = centerX + Math.cos(angle) * (radius + wobble) * 1.28;
          const y = centerY + Math.sin(angle) * (radius + wobble) * 0.72;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      ctx.restore();
    };

    const drawNodes = (time: number) => {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const driftX = reduceMotion ? 0 : Math.sin(time * 0.35 + node.phase) * 18;
        const driftY = reduceMotion ? 0 : Math.cos(time * 0.27 + node.phase) * 14;
        node.x = node.baseX + driftX;
        node.y = node.baseY + driftY;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.hypot(dx, dy);
          const maxDistance = width < 720 ? 92 : 132;

          if (distance < maxDistance) {
            ctx.strokeStyle = `rgba(15, 71, 126, ${(1 - distance / maxDistance) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        const pulse = reduceMotion ? 0.55 : 0.55 + Math.sin(time * 1.6 + node.phase) * 0.32;
        const dot = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 8);
        dot.addColorStop(0, `hsla(${node.hue}, 82%, 72%, ${0.22 + pulse * 0.22})`);
        dot.addColorStop(0.36, `hsla(${node.hue}, 82%, 72%, ${0.08 + pulse * 0.08})`);
        dot.addColorStop(1, `hsla(${node.hue}, 82%, 72%, 0)`);
        ctx.fillStyle = dot;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPackets = (time: number) => {
      if (reduceMotion) return;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      ROUTES.forEach((route, routeIndex) => {
        for (let packet = 0; packet < 3; packet += 1) {
          const progress = (time * (0.045 + routeIndex * 0.012) + packet * 0.34 + routeIndex * 0.12) % 1;
          const point = routePoint(route, progress, width, height, time);
          const prev = routePoint(route, Math.max(0, progress - 0.018), width, height, time);
          const angle = Math.atan2(point.y - prev.y, point.x - prev.x);

          ctx.save();
          ctx.translate(point.x, point.y);
          ctx.rotate(angle);
          ctx.shadowColor = route.color;
          ctx.shadowBlur = 18;
          ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
          ctx.fillRect(-9, -2, 18, 4);
          ctx.fillStyle = route.color;
          ctx.fillRect(-19, -1, 10, 2);
          ctx.restore();
        }
      });

      ctx.restore();
    };

    const draw = (timestamp: number) => {
      const time = timestamp * 0.001;
      ctx.clearRect(0, 0, width, height);

      const backdrop = ctx.createRadialGradient(width * 0.66, height * 0.34, 0, width * 0.66, height * 0.34, width * 0.64);
      backdrop.addColorStop(0, "rgba(32, 164, 184, 0.16)");
      backdrop.addColorStop(0.42, "rgba(111, 143, 232, 0.12)");
      backdrop.addColorStop(0.7, "rgba(225, 154, 72, 0.05)");
      backdrop.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, width, height);

      drawTopology(time);

      ROUTES.forEach((route, index) => {
        drawRoute(route, time + index * 0.6, width < 720 ? 12 : 22, 0.32);
        drawRoute(route, time + index * 0.6, width < 720 ? 2.2 : 3.2, 0.88);
      });

      drawPackets(time);
      drawNodes(time);

      if (!reduceMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw(0);

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(draw);
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-ambient-field" aria-hidden>
      <div className="hero-ambient-mesh" />
      <canvas ref={canvasRef} className="hero-ambient-canvas" />
      <div className="hero-ambient-grain" />
    </div>
  );
}
