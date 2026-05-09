"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  u: number;
  v: number;
  pinned: boolean;
  pinX: number;
  pinY: number;
};

type Constraint = {
  a: number;
  b: number;
  rest: number;
  broken: boolean;
  border: boolean;
};

type Grab = {
  lastX: number;
  lastY: number;
  points: number[];
};

type Cloth = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  points: Point[];
  constraints: Constraint[];
  broken: number;
  opening: number;
  dropping: boolean;
  dropStartedAt: number;
};

const ITERATIONS = 3;
const DAMPING = 0.985;
const GRAB_RADIUS = 112;

function indexFor(col: number, row: number, cols: number) {
  return row * (cols + 1) + col;
}

function createCloth(width: number, height: number, isTouch: boolean): Cloth {
  const cols = isTouch ? 34 : 52;
  const rows = isTouch ? 24 : 34;
  const points: Point[] = [];
  const constraints: Constraint[] = [];

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = (col / cols) * width;
      const y = (row / rows) * height;
      const pinned = col === 0 || col === cols || row === 0 || row === rows;
      points.push({ x, y, oldX: x, oldY: y, u: col / cols, v: row / rows, pinned, pinX: x, pinY: y });
    }
  }

  const addConstraint = (a: number, b: number, border = false) => {
    const pa = points[a];
    const pb = points[b];
    constraints.push({ a, b, rest: Math.hypot(pb.x - pa.x, pb.y - pa.y), broken: false, border });
  };

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const current = indexFor(col, row, cols);
      if (col < cols) addConstraint(current, indexFor(col + 1, row, cols), row === 0 || row === rows);
      if (row < rows) addConstraint(current, indexFor(col, row + 1, cols), col === 0 || col === cols);
      if (col < cols && row < rows) addConstraint(current, indexFor(col + 1, row + 1, cols));
      if (col > 0 && row < rows) addConstraint(current, indexFor(col - 1, row + 1, cols));
    }
  }

  return { width, height, cols, rows, points, constraints, broken: 0, opening: 0, dropping: false, dropStartedAt: 0 };
}

function drawWelcomeTexture(canvas: HTMLCanvasElement, width: number, height: number, dpr: number) {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#eef3fb");
  bg.addColorStop(0.46, "#fbfcff");
  bg.addColorStop(1, "#e7edf7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glowA = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.55);
  glowA.addColorStop(0, "rgba(255,255,255,0.95)");
  glowA.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  const glowB = ctx.createRadialGradient(width * 0.8, height * 0.72, 0, width * 0.8, height * 0.72, width * 0.5);
  glowB.addColorStop(0, "rgba(155,176,218,0.28)");
  glowB.addColorStop(1, "rgba(155,176,218,0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = "rgba(55, 70, 96, 0.22)";
  ctx.lineWidth = 1;
  for (let x = -height; x < width; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.018;
  for (let y = 0; y < height; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(y * 0.02) * 4);
    ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111827";
  ctx.font = `700 ${Math.min(126, Math.max(56, width * 0.075))}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`;
  ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
  ctx.shadowBlur = 12;
  const lines = ["WELCOME, TEAR TO", "SEE SHREY'S WEBSITE."];
  const lineHeight = Math.min(132, Math.max(62, width * 0.078));
  const centerY = height * 0.48;
  lines.forEach((line, i) => ctx.fillText(line, width / 2, centerY + (i - 0.5) * lineHeight));
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(44, 56, 80, 0.68)";
  ctx.font = `500 ${Math.min(22, Math.max(15, width * 0.014))}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
  ctx.fillText("Grab the surface and pull until it gives.", width / 2, centerY + lineHeight * 1.18);

  const pillW = 150;
  const pillH = 46;
  const pillX = width / 2 - pillW / 2;
  const pillY = centerY + lineHeight * 1.55;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.fill();
  ctx.strokeStyle = "rgba(116, 134, 166, 0.24)";
  ctx.stroke();
  ctx.fillStyle = "#243044";
  ctx.font = "700 14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("DRAG TO TEAR", width / 2, pillY + pillH / 2 + 1);
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  s0: [number, number],
  s1: [number, number],
  s2: [number, number],
  d0: [number, number],
  d1: [number, number],
  d2: [number, number],
) {
  const [sx0, sy0] = s0;
  const [sx1, sy1] = s1;
  const [sx2, sy2] = s2;
  const [dx0, dy0] = d0;
  const [dx1, dy1] = d1;
  const [dx2, dy2] = d2;
  const denom = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (Math.abs(denom) < 0.0001) return;

  const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const b = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const c = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const d = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const e = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;
  const f = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby || 1)));
  const x = ax + abx * t;
  const y = ay + aby * t;
  return Math.hypot(px - x, py - y);
}

function cutAlongSegment(cloth: Cloth, fromX: number, fromY: number, toX: number, toY: number, radius: number) {
  for (const constraint of cloth.constraints) {
    if (constraint.broken || constraint.border) continue;
    const a = cloth.points[constraint.a];
    const b = cloth.points[constraint.b];
    const mx = (a.x + b.x) * 0.5;
    const my = (a.y + b.y) * 0.5;
    if (distanceToSegment(mx, my, fromX, fromY, toX, toY) < radius && Math.random() > 0.84) {
      constraint.broken = true;
      cloth.broken += 1;
    }
  }
}

function reducedMotionGate(onComplete: () => void) {
  return (
    <motion.div
      className="tear-full-gate fixed inset-0 z-[120] grid place-items-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome. Enter Shrey's website."
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tear-static-copy px-6 text-center">
        <p className="micro mb-6">Portfolio surface</p>
        <h1 className="display mx-auto max-w-5xl text-balance text-[clamp(3.5rem,9vw,8.8rem)]">
          WELCOME, TEAR TO SEE SHREY&apos;S WEBSITE.
        </h1>
        <button type="button" className="tear-skip static mt-10" onClick={onComplete}>
          Enter
        </button>
      </div>
    </motion.div>
  );
}

export default function TearableLanding({ onComplete }: { onComplete: () => void }) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<HTMLCanvasElement | null>(null);
  const clothRef = useRef<Cloth | null>(null);
  const grabsRef = useRef<Map<number, Grab>>(new Map());
  const completeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const complete = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    setLeaving(true);
    window.setTimeout(onComplete, reduceMotion ? 0 : 950);
  }, [onComplete, reduceMotion]);

  const finishAfterCurtainDrop = useCallback(() => {
    window.setTimeout(() => {
      completeRef.current = true;
      onComplete();
    }, 1320);
  }, [onComplete]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") complete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [complete]);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const texture = document.createElement("canvas");
    textureRef.current = texture;

    const setup = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      clothRef.current = createCloth(width, height, "ontouchstart" in window || navigator.maxTouchPoints > 0);
      drawWelcomeTexture(texture, width, height, dpr);
    };

    const step = () => {
      const cloth = clothRef.current;
      if (!cloth || completeRef.current) return;
      const width = cloth.width;
      const height = cloth.height;

      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#eef3fb");
      bg.addColorStop(1, "#dfe8f4");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const tearGoal = window.innerWidth < 720 ? 108 : 176;
      cloth.opening += cloth.broken > tearGoal ? 0.009 : 0;

      if (cloth.opening > 0.72 && !cloth.dropping) {
        cloth.dropping = true;
        cloth.dropStartedAt = performance.now();
        grabsRef.current.clear();
        setDragging(false);
        setLeaving(true);
        for (const point of cloth.points) {
          point.pinned = false;
          point.oldY -= 7 + point.v * 18;
          point.oldX -= (point.u - 0.5) * 18;
        }
        finishAfterCurtainDrop();
      }

      for (const point of cloth.points) {
        if (point.pinned && cloth.opening < 0.08 && !cloth.dropping) {
          point.x += (point.pinX - point.x) * 0.55;
          point.y += (point.pinY - point.y) * 0.55;
          point.oldX = point.x;
          point.oldY = point.y;
          continue;
        }
        const vx = (point.x - point.oldX) * DAMPING;
        const vy = (point.y - point.oldY) * DAMPING;
        point.oldX = point.x;
        point.oldY = point.y;
        const sideForce = cloth.opening > 0 ? (point.u < 0.5 ? -1 : 1) * 14 * cloth.opening : 0;
        point.x += vx + sideForce;
        point.y += vy + (cloth.dropping ? 3.9 + point.v * 3.2 : cloth.opening > 0 ? 0.8 + point.v * 0.9 : 0.04);
      }

      grabsRef.current.forEach((grab) => {
        for (const i of grab.points) {
          const point = cloth.points[i];
          point.x += (grab.lastX - point.x) * 0.52;
          point.y += (grab.lastY - point.y) * 0.52;
        }
      });

      for (let n = 0; n < ITERATIONS; n++) {
        for (const constraint of cloth.constraints) {
          if (constraint.broken) continue;
          const a = cloth.points[constraint.a];
          const b = cloth.points[constraint.b];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (!constraint.border && dist > constraint.rest * 3.75) {
            constraint.broken = true;
            cloth.broken += 1;
            continue;
          }
          const diff = ((dist - constraint.rest) / dist) * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;
          if (!a.pinned || cloth.opening > 0.08 || cloth.dropping) {
            a.x += ox;
            a.y += oy;
          }
          if (!b.pinned || cloth.opening > 0.08 || cloth.dropping) {
            b.x -= ox;
            b.y -= oy;
          }
        }
      }

      const cellIntact = (a: Point, b: Point, c: Point, d: Point) => {
        const max = Math.max(
          Math.hypot(a.x - b.x, a.y - b.y),
          Math.hypot(b.x - c.x, b.y - c.y),
          Math.hypot(c.x - d.x, c.y - d.y),
          Math.hypot(d.x - a.x, d.y - a.y),
        );
        return max < Math.max(width / cloth.cols, height / cloth.rows) * 4.8;
      };

      for (let row = 0; row < cloth.rows; row++) {
        for (let col = 0; col < cloth.cols; col++) {
          const p0 = cloth.points[indexFor(col, row, cloth.cols)];
          const p1 = cloth.points[indexFor(col + 1, row, cloth.cols)];
          const p2 = cloth.points[indexFor(col, row + 1, cloth.cols)];
          const p3 = cloth.points[indexFor(col + 1, row + 1, cloth.cols)];
          if (!cellIntact(p0, p1, p3, p2)) continue;
          const s0: [number, number] = [p0.u * texture.width, p0.v * texture.height];
          const s1: [number, number] = [p1.u * texture.width, p1.v * texture.height];
          const s2: [number, number] = [p2.u * texture.width, p2.v * texture.height];
          const s3: [number, number] = [p3.u * texture.width, p3.v * texture.height];
          drawTriangle(ctx, texture, s0, s2, s1, [p0.x, p0.y], [p2.x, p2.y], [p1.x, p1.y]);
          drawTriangle(ctx, texture, s2, s3, s1, [p2.x, p2.y], [p3.x, p3.y], [p1.x, p1.y]);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    setup();
    rafRef.current = requestAnimationFrame(step);
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [complete, finishAfterCurtainDrop, reduceMotion]);

  const createGrab = (pointerId: number, x: number, y: number) => {
    const cloth = clothRef.current;
    if (!cloth) return;
    const points = cloth.points
      .map((point, index) => ({ index, dist: Math.hypot(point.x - x, point.y - y) }))
      .filter(({ dist }) => dist < GRAB_RADIUS)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 28)
      .map(({ index }) => index);
    grabsRef.current.set(pointerId, { lastX: x, lastY: y, points });
    setDragging(true);
  };

  if (reduceMotion) return reducedMotionGate(onComplete);

  return (
    <div
      className={`tear-full-gate fixed inset-0 z-[120] overflow-hidden ${leaving ? "is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome. Tear to see Shrey's website."
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        createGrab(event.pointerId, event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        const grab = grabsRef.current.get(event.pointerId);
        if (!grab) return;
        const cloth = clothRef.current;
        if (cloth) {
          const dx = event.clientX - grab.lastX;
          const dy = event.clientY - grab.lastY;
          if (Math.hypot(dx, dy) > 2) {
            for (const pointIndex of grab.points) {
              const point = cloth.points[pointIndex];
              point.oldX -= dx * 0.22;
              point.oldY -= dy * 0.22;
            }
          }
        }
        const previousX = grab.lastX;
        const previousY = grab.lastY;
        grab.lastX = event.clientX;
        grab.lastY = event.clientY;
        if (clothRef.current) {
          const drag = Math.hypot(event.movementX, event.movementY);
          if (drag > 5) {
            const cloth = clothRef.current;
            const radius = event.pointerType === "touch" ? 28 : 18;
            cutAlongSegment(cloth, previousX, previousY, event.clientX, event.clientY, radius);
          }
        }
      }}
      onPointerUp={(event) => {
        grabsRef.current.delete(event.pointerId);
        setDragging(grabsRef.current.size > 0);
      }}
      onPointerCancel={(event) => {
        grabsRef.current.delete(event.pointerId);
        setDragging(grabsRef.current.size > 0);
      }}
    >
      <canvas ref={canvasRef} className="tear-canvas" aria-hidden />
      <button type="button" className="tear-skip" onClick={complete}>
        Enter
      </button>
      <div className={`tear-cursor-copy ${dragging ? "is-visible" : ""}`} aria-hidden>
        keep pulling
      </div>
    </div>
  );
}
