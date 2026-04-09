import type { Role } from "@types/index";

export const ROLE_LABELS: Record<Role, string> = {
  student:   "Student",
  admin:     "School Admin",
  inventory: "Inventory Mgmt",
  finance:   "Finance",
};

export const ROLE_COLORS: Record<Role, string> = {
  student:   "#3b5bfc",
  admin:     "#059669",
  inventory: "#d97706",
  finance:   "#7c3aed",
};

// Kept for any legacy usage — SVG icons are preferred in new components
export const ROLE_ICONS: Record<Role, string> = {
  student:   "student",
  admin:     "admin",
  inventory: "inventory",
  finance:   "finance",
};

export const LEASE_STATUS_COLORS: Record<string, string> = {
  pending:  "#d97706",
  approved: "#3b5bfc",
  active:   "#059669",
  returned: "#64748b",
  rejected: "#dc2626",
  expired:  "#dc2626",
};

export const DEVICE_STATUS_COLORS: Record<string, string> = {
  available:      "#059669",
  leased:         "#3b5bfc",
  maintenance:    "#d97706",
  decommissioned: "#64748b",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "#d97706",
  paid:    "#059669",
  overdue: "#dc2626",
  waived:  "#64748b",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low:    "#059669",
  medium: "#d97706",
  high:   "#dc2626",
  urgent: "#7c3aed",
};

export const PLAN_LABELS: Record<string, string> = {
  semester: "Semester (16 wks)",
  annual:   "Annual (48 wks)",
  monthly:  "Monthly (4 wks)",
};
