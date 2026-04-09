import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore }    from "@store/authStore";
import { useUIStore }      from "@store/uiStore";
import { usePermissions }  from "@hooks/usePermissions";
import { ROLE_COLORS, ROLE_LABELS } from "@utils/constants";
import { cn } from "@utils/cn";
import {
  IconHome, IconLaptop, IconSearch, IconCreditCard, IconHeadphones,
  IconClipboard, IconGradCap, IconFileText, IconBarChart, IconSettings,
  IconTool, IconRefreshCw, IconDollarSign, IconReceipt, IconPieChart,
  IconUser, IconChevronLeft, IconChevronRight, IconLogOut, IconUsers,
} from "@components/ui/Icons";
import Logo from "@components/ui/Logo";
import type { Role } from "@types/index";

interface NavItem { to: string; icon: ReactNode; label: string; roles: Role[]; }

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",       icon: <IconHome size={15} />,        label: "Overview",        roles: ["student","admin","inventory","finance"] },
  { to: "/my-lease",        icon: <IconLaptop size={15} />,      label: "My Lease",        roles: ["student"] },
  { to: "/browse-devices",  icon: <IconSearch size={15} />,      label: "Browse Devices",  roles: ["student"] },
  { to: "/my-payments",     icon: <IconCreditCard size={15} />,  label: "Payments",        roles: ["student"] },
  { to: "/my-tickets",      icon: <IconHeadphones size={15} />,  label: "Support",         roles: ["student"] },
  { to: "/applications",    icon: <IconClipboard size={15} />,   label: "Applications",    roles: ["admin"] },
  { to: "/students",        icon: <IconGradCap size={15} />,     label: "Students",        roles: ["admin"] },
  { to: "/staff",           icon: <IconUsers size={15} />,       label: "Staff",           roles: ["admin"] },
  { to: "/leases",          icon: <IconFileText size={15} />,    label: "All Leases",      roles: ["admin","inventory"] },
  { to: "/admin-reports",   icon: <IconBarChart size={15} />,    label: "Reports",         roles: ["admin"] },
  { to: "/settings",        icon: <IconSettings size={15} />,    label: "Settings",        roles: ["admin"] },
  { to: "/devices",         icon: <IconLaptop size={15} />,      label: "Devices",         roles: ["inventory"] },
  { to: "/maintenance",     icon: <IconTool size={15} />,        label: "Maintenance",     roles: ["inventory","admin"] },
  { to: "/assign",          icon: <IconRefreshCw size={15} />,   label: "Assign / Return", roles: ["inventory"] },
  { to: "/billing",         icon: <IconDollarSign size={15} />,  label: "Billing",         roles: ["finance"] },
  { to: "/payments",        icon: <IconCreditCard size={15} />,  label: "Payments",        roles: ["finance","admin"] },
  { to: "/invoices",        icon: <IconReceipt size={15} />,     label: "Invoices",        roles: ["finance"] },
  { to: "/finance-reports", icon: <IconPieChart size={15} />,    label: "Reports",         roles: ["finance"] },
  { to: "/profile",         icon: <IconUser size={15} />,        label: "Profile",         roles: ["student","admin","inventory","finance"] },
];

export default function Sidebar() {
  const { user, clearAuth }                    = useAuthStore();
  const { sidebarCollapsed, toggleCollapsed }  = useUIStore();
  const { role }                               = usePermissions();
  const navigate                               = useNavigate();

  const visibleItems = NAV_ITEMS.filter(item => role && item.roles.includes(role));
  const accentColor  = role ? ROLE_COLORS[role] : "#3b5bfc";

  const handleLogout = () => { clearAuth(); navigate("/login", { replace: true }); };

  return (
    <aside className={cn("fixed top-0 left-0 h-full flex flex-col transition-all duration-300 z-50 border-r", sidebarCollapsed ? "w-[64px]" : "w-[240px]")}
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--border)" }}>

      {/* Logo */}
      <div className="flex items-center px-4 h-[60px] flex-shrink-0 border-b" style={{ borderColor: "var(--border)" }}>
        {sidebarCollapsed ? (
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#3b5bfc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
            </svg>
          </div>
        ) : (
          <Logo height={28} />
        )}
      </div>

      {/* Role pill */}
      {!sidebarCollapsed && role && (
        <div className="px-3 pt-3">
          <div className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2"
            style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25`, color: accentColor }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
            {ROLE_LABELS[role as Role]}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-2 space-y-px">
        {visibleItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}>
            {({ isActive }) => (
              <span className={cn("nav-item select-none", sidebarCollapsed && "justify-center")}
                style={isActive ? {
                  background: `${accentColor}10`,
                  color: accentColor,
                  borderLeftColor: accentColor,
                  paddingLeft: sidebarCollapsed ? undefined : "calc(10px - 2px)",
                } : {}}
                title={sidebarCollapsed ? item.label : undefined}>
                <span style={{ flexShrink: 0, color: isActive ? accentColor : "var(--text-muted)" }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ color: isActive ? accentColor : "var(--text-secondary)" }}>{item.label}</span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-2.5 flex-shrink-0 space-y-1" style={{ borderColor: "var(--border)" }}>
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1" style={{ background: "var(--bg-surface)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${accentColor},#7390ff)` }}>
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={cn("flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-colors", sidebarCollapsed && "justify-center")}
          style={{ color: "#d34053", background: "rgba(211,64,83,0.06)" }}
          title={sidebarCollapsed ? "Sign Out" : undefined}>
          <IconLogOut size={13} style={{ color: "#d34053", flexShrink: 0 }} />
          {!sidebarCollapsed && "Sign Out"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={toggleCollapsed}
        className="absolute top-[18px] -right-3 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-10"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
        {sidebarCollapsed ? <IconChevronRight size={11} /> : <IconChevronLeft size={11} />}
      </button>
    </aside>
  );
}