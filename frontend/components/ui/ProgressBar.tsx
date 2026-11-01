export default function ProgressBar({
  value,
  className = "",
  showLabel = false,
  color = "brand",
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
  color?: "brand" | "green" | "amber" | "red";
}) {
  const colors = {
    brand: "bg-brand-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{value}%</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
