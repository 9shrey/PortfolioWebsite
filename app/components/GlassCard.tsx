import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={`glass-surface rounded-[var(--radius-lg)] ${className}`}>
      <div className="glass-content">{children}</div>
    </Tag>
  );
}
