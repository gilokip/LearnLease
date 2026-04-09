import { useAuthStore }                    from "@store/authStore";
import { useDashboardStats, useRecentActivity } from "@hooks/useDashboard";
import { usePermissions }                 from "@hooks/usePermissions";
import StatCard                           from "@components/ui/StatCard";
import {
  IconCheckCircle, IconCreditCard, IconAlertCircle, IconClipboard,
  IconGradCap, IconDollarSign, IconLaptop, IconTool,
  IconTrendingUp, IconClock, IconActivity,
} from "@components/ui/Icons";
import { formatCurrency, formatDate } from "@utils/format";
import { LEASE_STATUS_COLORS }        from "@utils/constants";
import type { AdminStats, StudentStats } from "@types/index";
import type { ActivityEvent }           from "@services/dashboardService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7)   return `${d} days ago`;
  return formatDate(ts);
}

const ACTIVITY_META: Record<
  ActivityEvent["icon"],
  { color: string; icon: React.ReactNode }
> = {
  approved:    { color: "#22c55e", icon: <IconCheckCircle size={13} /> },
  application: { color: "#f59e0b", icon: <IconClipboard   size={13} /> },
  returned:    { color: "#3b5bfc", icon: <IconLaptop      size={13} /> },
  payment:     { color: "#a78bfa", icon: <IconCreditCard  size={13} /> },
  maintenance: { color: "#ef4444", icon: <IconTool        size={13} /> },
  ticket:      { color: "#8890b5", icon: <IconAlertCircle size={13} /> },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ActivityItem({ icon, color, text, subtitle, time }: {
  icon: React.ReactNode; color: string; text: string; subtitle?: string; time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{text}</p>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        )}
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{time}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Overview() {
  const { user }             = useAuthStore();
  const { data, isLoading }  = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { isStudent, isAdmin, isInventory, isFinance } = usePermissions();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const adminData   = data as AdminStats   | undefined;
  const studentData = data as StudentStats | undefined;

  const months  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const barVals = [58,72,80,65,86,90,82,88,93,85,90,96];
  const barMax  = Math.max(...barVals);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-up">
      <div className="h-7 w-52 rounded-lg animate-pulse" style={{ background: "var(--bg-card)" }} />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
          Good morning, {firstName}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Here's what's happening in UniLease today.
        </p>
      </div>

      {/* ── Student stat cards ── */}
      {isStudent && studentData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<IconCheckCircle size={17} />} title="Lease Status" color="#22c55e"
            value={studentData.activeLease ? "Active" : studentData.pendingLease ? "Pending" : "None"}
            subtitle={studentData.activeLease
              ? `${studentData.activeLease.brand} ${studentData.activeLease.model}`
              : "No active lease"} />
          <StatCard icon={<IconCreditCard size={17} />} title="Next Payment" color="#3b5bfc"
            value={studentData.nextPayment ? formatCurrency(studentData.nextPayment.amount) : "—"}
            subtitle={studentData.nextPayment
              ? `Due ${formatDate(studentData.nextPayment.due_date)}`
              : "All clear"} />
          <StatCard icon={<IconAlertCircle size={17} />} title="Overdue" color="#ef4444"
            value={formatCurrency(studentData.overdueAmount)}
            subtitle={`${studentData.overdueCount} overdue payment(s)`} />
          <StatCard icon={<IconClipboard size={17} />} title="Applications" color="#a78bfa"
            value={studentData.leaseHistory?.length ?? 0}
            subtitle="Total submitted" />
        </div>
      )}

      {/* ── Admin stat cards ── */}
      {isAdmin && adminData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<IconClipboard size={17} />} title="Pending Applications" color="#f59e0b"
            value={adminData.leases?.pending ?? 0} subtitle="Awaiting review" />
          <StatCard icon={<IconCheckCircle size={17} />} title="Active Leases" color="#22c55e"
            value={adminData.leases?.active ?? 0} subtitle="All campuses" />
          <StatCard icon={<IconGradCap size={17} />} title="Students" color="#3b5bfc"
            value={adminData.users?.student ?? 0} subtitle="Registered" />
          <StatCard icon={<IconDollarSign size={17} />} title="Monthly Revenue" color="#a78bfa"
            value={formatCurrency(adminData.payments?.monthly ?? 0)} subtitle="This month" />
        </div>
      )}

      {/* ── Inventory stat cards ── */}
      {isInventory && adminData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<IconLaptop size={17} />} title="Total Devices" color="#3b5bfc"
            value={adminData.devices?.total ?? 0} subtitle="All models" />
          <StatCard icon={<IconCheckCircle size={17} />} title="Available" color="#22c55e"
            value={adminData.devices?.available ?? 0} subtitle="Ready to assign" />
          <StatCard icon={<IconActivity size={17} />} title="On Lease" color="#f59e0b"
            value={adminData.devices?.leased ?? 0} subtitle="Currently assigned" />
          <StatCard icon={<IconTool size={17} />} title="Maintenance" color="#ef4444"
            value={adminData.devices?.maintenance ?? 0} subtitle="Being serviced" />
        </div>
      )}

      {/* ── Finance stat cards ── */}
      {isFinance && adminData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<IconDollarSign size={17} />} title="Monthly Revenue" color="#22c55e"
            value={formatCurrency(adminData.payments?.monthly ?? 0)} subtitle="This month" />
          <StatCard icon={<IconClock size={17} />} title="Pending" color="#f59e0b"
            value={formatCurrency(adminData.payments?.pending?.amount ?? 0)}
            subtitle={`${adminData.payments?.pending?.count ?? 0} invoices`} />
          <StatCard icon={<IconAlertCircle size={17} />} title="Overdue" color="#ef4444"
            value={formatCurrency(adminData.payments?.overdue?.amount ?? 0)}
            subtitle={`${adminData.payments?.overdue?.count ?? 0} students`} />
          <StatCard icon={<IconTrendingUp size={17} />} title="Annual Revenue" color="#3b5bfc"
            value={formatCurrency(adminData.payments?.annual ?? 0)} subtitle="Year to date" />
        </div>
      )}

      {/* Charts + Activity row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Activity Overview</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Last 12 months</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "rgba(59,91,252,0.1)", color: "#5e7cff", border: "1px solid rgba(59,91,252,0.2)" }}>
              {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {barVals.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full rounded-sm transition-all duration-500 cursor-default relative"
                  style={{ height: `${(v / barMax) * 100}%`, background: "linear-gradient(to top, #3b5bfc, #7390ff)", minHeight: 3, opacity: 0.85 }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                    style={{ background: "var(--bg-card-hover)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                    {v}
                  </div>
                </div>
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Real activity feed ── */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</p>

          {activityLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "var(--bg-card-hover)" }} />
              ))}
            </div>
          ) : !activity?.length ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              No recent activity
            </p>
          ) : (
            <div className="space-y-3.5">
              {activity.map((event, i) => {
                const meta = ACTIVITY_META[event.icon] ?? ACTIVITY_META.ticket;
                return (
                  <ActivityItem
                    key={i}
                    icon={meta.icon}
                    color={meta.color}
                    text={event.label}
                    subtitle={event.subtitle}
                    time={timeAgo(event.ts)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row — breakdown bars */}
      {(isAdmin || isInventory) && adminData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Device Breakdown</p>
            <div className="space-y-3.5">
              <MiniBar label="Available"   value={adminData.devices?.available ?? 0}   max={adminData.devices?.total ?? 1} color="#22c55e" />
              <MiniBar label="On Lease"    value={adminData.devices?.leased ?? 0}      max={adminData.devices?.total ?? 1} color="#3b5bfc" />
              <MiniBar label="Maintenance" value={adminData.devices?.maintenance ?? 0} max={adminData.devices?.total ?? 1} color="#f59e0b" />
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Lease Status Breakdown</p>
            <div className="space-y-3.5">
              {(["active","pending","returned","rejected"] as const).map(s => (
                <MiniBar key={s}
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  value={adminData.leases?.[s] ?? 0}
                  max={adminData.leases?.total ?? 1}
                  color={LEASE_STATUS_COLORS[s]} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student active lease card */}
      {isStudent && studentData?.activeLease && (
        <div className="card p-5">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Current Lease</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {([
              ["Device", `${studentData.activeLease.brand} ${studentData.activeLease.model}`],
              ["Plan",   studentData.activeLease.plan_type],
              ["Start",  formatDate(studentData.activeLease.start_date)],
              ["End",    formatDate(studentData.activeLease.end_date)],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} className="rounded-lg p-3" style={{ background: "var(--bg-card-hover)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{l}</p>
                <p className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{v}</p>
              </div>
            ))}
          </div>
          {studentData.activeLease.start_date && studentData.activeLease.end_date && (() => {
            const start = new Date(studentData.activeLease.start_date!).getTime();
            const end   = new Date(studentData.activeLease.end_date!).getTime();
            const pct   = Math.min(100, Math.round(((Date.now() - start) / (end - start)) * 100));
            return (
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                  <span>Lease progress</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#3b5bfc,#a78bfa)" }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}