import { type ReactNode } from "react";
import { cn } from "@utils/cn";

interface StatCardProps {
  title:     string;
  value:     string | number;
  subtitle?: string;
  icon:      ReactNode;
  color?:    string;
  trend?:    { value: string; positive: boolean };
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "#3b5bfc",
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("card p-5 relative overflow-hidden animate-fade-up", className)}>
      {/* Subtle corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-[96px] pointer-events-none"
        style={{ background: color, opacity: 0.05 }}
      />

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>

      {/* Value */}
      <div className="text-[1.6rem] font-display font-bold leading-none" style={{ color }}>
        {value}
      </div>

      {/* Title */}
      <div className="text-sm font-medium mt-1.5" style={{ color: "var(--text-primary)" }}>
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </div>
      )}

      {/* Trend badge */}
      {trend && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold mt-2.5 px-2 py-0.5 rounded-full",
            trend.positive ? "text-success bg-success/10" : "text-danger bg-danger/10"
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </div>
  );
}
