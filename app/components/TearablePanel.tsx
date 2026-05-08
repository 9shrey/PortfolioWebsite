"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useMemo, useRef, useState, type ReactNode } from "react";

type PointerMap = Map<number, { x: number; y: number }>;

function distance(points: PointerMap) {
  const [a, b] = Array.from(points.values());
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function TearablePanel({
  children,
  reveal,
  className = "",
  intensity = 1,
  threshold = 88,
  asButton = false,
  label,
  onClick,
}: {
  children: ReactNode;
  reveal?: ReactNode;
  className?: string;
  intensity?: number;
  threshold?: number;
  asButton?: boolean;
  label?: string;
  onClick?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const pointers = useRef<PointerMap>(new Map());
  const startPinch = useRef(0);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tension = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.8 });
  const springTension = useSpring(tension, { stiffness: 210, damping: 24, mass: 0.9 });
  const [revealed, setRevealed] = useState(false);

  const rotateX = useTransform(springY, [-100, 100], [7 * intensity, -7 * intensity]);
  const rotateY = useTransform(springX, [-100, 100], [-8 * intensity, 8 * intensity]);
  const skewX = useTransform(springX, [-120, 120], [-2.5 * intensity, 2.5 * intensity]);
  const scaleX = useTransform(springTension, [0, 1], [1, 1.025]);
  const scaleY = useTransform(springTension, [0, 1], [1, 0.985]);
  const revealWidth = useTransform(springTension, [0, 1], ["0%", "44%"]);

  const Tag = asButton ? motion.button : motion.div;
  const revealContent = useMemo(() => reveal, [reveal]);

  const reset = () => {
    x.set(0);
    y.set(0);
    tension.set(revealed ? 1 : 0);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  const updatePointer = (event: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    x.set(((localX / rect.width) - 0.5) * 42 * intensity);
    y.set(((localY / rect.height) - 0.5) * 42 * intensity);
  };

  const onDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reduceMotion) return;
    const pull = Math.min(1, Math.hypot(info.offset.x, info.offset.y) / threshold);
    tension.set(pull);
  };

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reduceMotion) return;
    const pull = Math.hypot(info.offset.x, info.offset.y);
    if (reveal && pull > threshold) {
      const next = !revealed;
      setRevealed(next);
      tension.set(next ? 1 : 0);
      resetPosition();
    } else {
      reset();
    }
  };

  return (
    <Tag
      type={asButton ? "button" : undefined}
      aria-label={label}
      aria-pressed={asButton && reveal ? revealed : undefined}
      onClick={onClick}
      onClickCapture={(event) => {
        if (dragged.current) {
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }
      }}
      drag={reduceMotion ? false : true}
      dragSnapToOrigin
      dragElastic={0.18}
      dragMomentum={false}
      dragConstraints={{ top: -42, bottom: 42, left: -42, right: 42 }}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onPointerMove={updatePointer}
      onPointerLeave={() => {
        if (!reduceMotion) reset();
      }}
      onPointerDown={(event) => {
        if (reduceMotion) return;
        startPoint.current = { x: event.clientX, y: event.clientY };
        dragged.current = false;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size === 2) startPinch.current = distance(pointers.current);
      }}
      onPointerUp={(event) => {
        pointers.current.delete(event.pointerId);
        startPinch.current = 0;
        if (!reduceMotion) resetPosition();
      }}
      onPointerCancel={(event) => {
        pointers.current.delete(event.pointerId);
        startPinch.current = 0;
        if (!reduceMotion) resetPosition();
      }}
      onPointerMoveCapture={(event) => {
        if (reduceMotion || !pointers.current.has(event.pointerId)) return;
        if (startPoint.current) {
          const move = Math.hypot(event.clientX - startPoint.current.x, event.clientY - startPoint.current.y);
          if (move > 8) dragged.current = true;
        }
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size >= 2 && startPinch.current > 0) {
          const delta = Math.abs(distance(pointers.current) - startPinch.current);
          const pull = Math.min(1, delta / threshold);
          tension.set(pull);
          if (reveal && pull > 0.86) setRevealed(true);
        }
      }}
      style={
        reduceMotion
          ? undefined
          : {
              x: springX,
              y: springY,
              rotateX,
              rotateY,
              skewX,
              scaleX,
              scaleY,
              transformPerspective: 900,
            }
      }
      className={`tearable-panel ${revealed ? "is-revealed" : ""} ${className}`}
    >
      {revealContent ? (
        <motion.div
          className="tearable-reveal"
          aria-hidden={!revealed}
          style={reduceMotion ? undefined : { width: revealWidth }}
        >
          {revealContent}
        </motion.div>
      ) : null}
      <div className="tearable-face">{children}</div>
    </Tag>
  );
}
