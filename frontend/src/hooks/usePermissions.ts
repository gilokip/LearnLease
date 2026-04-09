import { useAuthStore } from "@store/authStore";
import type { Role }    from "@types/index";

/**
 * Returns boolean helpers for role-based rendering decisions.
 *
 * Usage:
 *   const { isAdmin, can } = usePermissions();
 *   if (can("approve-leases")) { ... }
 */
export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role ?? null;

  const is = (...roles: Role[]) => role !== null && roles.includes(role);

  const permissions: Record<string, Role[]> = {
    "approve-leases":    ["admin"],
    "reject-leases":     ["admin"],
    "manage-devices":    ["inventory", "admin"],
    "manage-users":      ["admin"],
    "view-all-leases":   ["admin", "inventory", "finance"],
    "view-all-payments": ["admin", "finance"],
    "record-payment":    ["admin", "finance"],
    "view-audit-logs":   ["admin"],
    "manage-maintenance":["inventory", "admin"],
    "view-finance":      ["admin", "finance"],
  };

  const can = (action: string): boolean => {
    const allowed = permissions[action];
    if (!allowed || !role) return false;
    return allowed.includes(role);
  };

  return {
    role,
    isStudent:   is("student"),
    isAdmin:     is("admin"),
    isInventory: is("inventory"),
    isFinance:   is("finance"),
    isStaff:     is("admin", "inventory", "finance"),
    can,
    is,
  };
}
