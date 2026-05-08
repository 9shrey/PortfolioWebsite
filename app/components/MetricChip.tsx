export default function MetricChip({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`glass-surface rounded-full px-4 py-3 ${className}`}>
      <div className="glass-content flex items-center gap-2.5">
        <span className="text-sm font-bold text-[var(--fg)]">{value}</span>
        <span className="text-xs font-medium text-[var(--fg-dim)]">{label}</span>
      </div>
    </div>
  );
}
