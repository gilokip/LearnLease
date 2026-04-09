import { cn } from "@utils/cn";
import {
  LEASE_STATUS_COLORS,
  DEVICE_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  PRIORITY_COLORS,
} from "@utils/constants";

type BadgeVariant = "lease" | "device" | "payment" | "priority" | "custom";

interface StatusBadgeProps {
  status:    string;
  variant?:  BadgeVariant;
  color?:    string;
  className?: string;
}

const MAPS: Record<BadgeVariant, Record<string, string>> = {
  lease:    LEASE_STATUS_COLORS,
  device:   DEVICE_STATUS_COLORS,
  payment:  PAYMENT_STATUS_COLORS,
  priority: PRIORITY_COLORS,
  custom:   {},
};

export default function StatusBadge({
  status,
  variant = "lease",
  color,
  className,
}: StatusBadgeProps) {
  const map       = MAPS[variant];
  const hexColor  = color ?? map[status] ?? "#8890b5";
  const label     = status.replace(/_/g, " ");

  return (
    <span
      className={cn("badge capitalize", className)}
      style={{
        background:  `${hexColor}20`,
        color:        hexColor,
        border:      `1px solid ${hexColor}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block flex-shrink-0"
        style={{ background: hexColor }}
      />
      {label}
    </span>
  );
}
