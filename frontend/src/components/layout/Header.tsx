import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { useUIStore }   from "@store/uiStore";
import { ROLE_COLORS }  from "@utils/constants";
import { IconSearch, IconBell, IconSun, IconMoon } from "@components/ui/Icons";
import type { Role } from "@types/index";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard":       "Overview",
  "/my-lease":        "My Lease",
  "/browse-devices":  "Browse Devices",
  "/my-payments":     "Payments",
  "/my-tickets":      "Support",
  "/applications":    "Applications",
  "/students":        "Students",
  "/leases":          "All Leases",
  "/admin-reports":   "Reports",
  "/settings":        "Settings",
  "/devices":         "Devices",
  "/maintenance":     "Maintenance",
  "/assign":          "Assign / Return",
  "/billing":         "Billing",
  "/payments":        "Payments",
  "/invoices":        "Invoices",
  "/finance-reports": "Reports",
  "/profile":         "Profile",
};

export default function Header() {
  const { user }         = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { pathname }     = useLocation();
  const [search, setSearch] = useState("");

  const pageTitle   = ROUTE_LABELS[pathname] ?? "Dashboard";
  const accentColor = user?.role ? ROLE_COLORS[user.role as Role] : "#3b5bfc";
  const isDark      = theme === "dark";

  const iconBtnStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  };

  return (
    <header
      className="h-[64px] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40 border-b"
      style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}
    >
      {/* Left: page title */}
      <div>
        <h1 className="text-[15px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
          {pageTitle}
        </h1>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          UniLease / {pageTitle}
        </p>
      </div>

      {/* Right: search + theme toggle + bell + avatar */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
            <IconSearch size={14} />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="input pl-8 w-48 h-8 text-xs"
            style={{ height: 34 }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={iconBtnStyle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark
            ? <IconSun  size={15} strokeWidth={1.8} />
            : <IconMoon size={15} strokeWidth={1.8} />
          }
        </button>

        {/* Notification bell */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={iconBtnStyle}
          title="Notifications"
        >
          <IconBell size={15} strokeWidth={1.8} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#d34053", boxShadow: "0 0 0 2px var(--header-bg)" }}
          />
        </button>

        {/* Avatar */}
        {user && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer flex-shrink-0 text-white select-none"
            style={{ background: `linear-gradient(135deg,${accentColor},#a78bfa)` }}
            title={user.name}
          >
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </div>
    </header>
  );
}
