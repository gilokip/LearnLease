import { useLeases } from "@hooks/useLeases";
import { useAuthStore } from "@store/authStore";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import { PLAN_LABELS } from "@utils/constants";
import type { Lease } from "@types/index";

function LeaseCard({ lease }: { lease: Lease }) {
  const start = lease.start_date ? new Date(lease.start_date).getTime() : null;
  const end   = lease.end_date   ? new Date(lease.end_date).getTime()   : null;
  const pct   = start && end ? Math.min(100, Math.round(((Date.now() - start) / (end - start)) * 100)) : 0;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-semibold">{lease.brand} {lease.model}</h3>
          <p className="text-xs text-bodydark2 mt-1">Serial: {lease.serial_number ?? "—"}</p>
        </div>
        <StatusBadge status={lease.status} variant="lease" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Plan",        PLAN_LABELS[lease.plan_type] ?? lease.plan_type],
          ["Duration",    `${lease.duration_weeks} weeks`],
          ["Start Date",  formatDate(lease.start_date)],
          ["End Date",    formatDate(lease.end_date)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white/[0.03] rounded-lg p-3">
            <p className="text-[11px] text-bodydark2 mb-1 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {lease.status === "active" && (
        <div>
          <div className="flex justify-between text-xs text-bodydark2 mb-1.5">
            <span>Lease Progress</span><span>{pct}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg,#3b5bfc,#a78bfa)" }} />
          </div>
        </div>
      )}

      {lease.monthly_rate && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-bodydark2">Monthly rate:</span>
          <span className="font-semibold text-primary-400">{formatCurrency(Number(lease.monthly_rate))}</span>
        </div>
      )}

      {lease.rejection_note && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-sm text-danger">
          ⚠️ Rejection reason: {lease.rejection_note}
        </div>
      )}
    </div>
  );
}

export default function StudentLease() {
  const { data: leases, isLoading } = useLeases();
  const active  = leases?.find(l => l.status === "active");
  const pending = leases?.find(l => l.status === "pending");
  const history = leases?.filter(l => !["active","pending"].includes(l.status)) ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">My Lease</h1>
        <p className="page-subtitle">View and manage your current lease agreement</p>
      </div>

      {isLoading && (
        <div className="space-y-4">{[...Array(2)].map((_,i) => (
          <div key={i} className="card p-6 h-40 animate-pulse" />
        ))}</div>
      )}

      {!isLoading && !active && !pending && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">💻</div>
          <h3 className="text-lg font-display font-semibold mb-2">No Active Lease</h3>
          <p className="text-bodydark2 text-sm mb-6">You don't have a current or pending lease. Browse available devices to apply.</p>
          <a href="/browse-devices" className="btn-primary inline-block">Browse Devices →</a>
        </div>
      )}

      {active && (
        <section>
          <p className="text-xs font-semibold text-bodydark2 uppercase tracking-widest mb-3">Active Lease</p>
          <LeaseCard lease={active} />
        </section>
      )}

      {pending && (
        <section>
          <p className="text-xs font-semibold text-bodydark2 uppercase tracking-widest mb-3">Pending Approval</p>
          <LeaseCard lease={pending} />
        </section>
      )}

      {history.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-bodydark2 uppercase tracking-widest mb-3">Lease History</p>
          <div className="space-y-3">{history.map(l => <LeaseCard key={l.id} lease={l} />)}</div>
        </section>
      )}
    </div>
  );
}
