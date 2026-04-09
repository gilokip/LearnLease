import StatCard          from "@components/ui/StatCard";
import { useDashboardStats } from "@hooks/useDashboard";
import { usePermissions }    from "@hooks/usePermissions";
import { formatCurrency }    from "@utils/format";
import type { AdminStats, StudentStats } from "@types/index";

export default function OverviewStats() {
  const { data, isLoading }     = useDashboardStats();
  const { isAdmin, isInventory, isFinance, isStudent } = usePermissions();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isStudent) {
    const stats = data as StudentStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="✅" title="Lease Status" color="#22c55e"
          value={stats.activeLease ? "Active" : stats.pendingLease ? "Pending" : "None"}
          subtitle={stats.activeLease ? `${stats.activeLease.brand} ${stats.activeLease.model}` : "No active lease"} />
        <StatCard icon="💳" title="Next Payment" color="#3b5bfc"
          value={stats.nextPayment ? formatCurrency(stats.nextPayment.amount) : "—"}
          subtitle={stats.nextPayment ? `Due ${stats.nextPayment.due_date}` : "No upcoming payment"} />
        <StatCard icon="⚠️" title="Overdue Amount" color="#ef4444"
          value={formatCurrency(stats.overdueAmount)}
          subtitle={`${stats.overdueCount} overdue payment(s)`} />
        <StatCard icon="📋" title="Lease History" color="#a78bfa"
          value={stats.leaseHistory.length}
          subtitle="Total applications" />
      </div>
    );
  }

  if (isAdmin) {
    const stats = data as AdminStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="📋" title="Pending Applications" color="#f59e0b"
          value={stats.leases.pending ?? 0} subtitle="Awaiting review" />
        <StatCard icon="✅" title="Active Leases" color="#22c55e"
          value={stats.leases.active ?? 0} subtitle="All campuses" />
        <StatCard icon="🎓" title="Total Students" color="#3b5bfc"
          value={stats.users.student ?? 0} subtitle="Registered users" />
        <StatCard icon="💰" title="Monthly Revenue" color="#a78bfa"
          value={formatCurrency(stats.payments.monthly)} subtitle="This month" />
      </div>
    );
  }

  if (isInventory) {
    const stats = data as AdminStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="💻" title="Total Devices"   color="#3b5bfc"  value={stats.devices.total}       subtitle="All models" />
        <StatCard icon="✅" title="Available"        color="#22c55e"  value={stats.devices.available}   subtitle="Ready to assign" />
        <StatCard icon="📤" title="On Lease"         color="#f59e0b"  value={stats.devices.leased}      subtitle="Currently assigned" />
        <StatCard icon="🔧" title="Under Maintenance" color="#ef4444" value={stats.devices.maintenance} subtitle="Being serviced" />
      </div>
    );
  }

  if (isFinance) {
    const stats = data as AdminStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="💰" title="Monthly Revenue" color="#22c55e"
          value={formatCurrency(stats.payments.monthly)} subtitle="This month" />
        <StatCard icon="⏳" title="Pending"          color="#f59e0b"
          value={formatCurrency(stats.payments.pending.amount)}
          subtitle={`${stats.payments.pending.count} invoices`} />
        <StatCard icon="⚠️" title="Overdue"          color="#ef4444"
          value={formatCurrency(stats.payments.overdue.amount)}
          subtitle={`${stats.payments.overdue.count} students`} />
        <StatCard icon="📈" title="Annual Revenue"   color="#3b5bfc"
          value={formatCurrency(stats.payments.annual)} subtitle="Year to date" />
      </div>
    );
  }

  return null;
}
