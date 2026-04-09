import { useLeases, useUpdateLeaseStatus } from "@hooks/useLeases";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import { PLAN_LABELS } from "@utils/constants";
import toast from "react-hot-toast";

export default function InventoryAssign() {
  const { data: approvedLeases, isLoading: loadApproved } = useLeases({ status: "approved" });
  const { data: activeLeases,   isLoading: loadActive   } = useLeases({ status: "active"   });
  const { mutate: updateStatus, isPending } = useUpdateLeaseStatus();

  const handleReturn = (id: number, name: string) => {
    if (confirm(`Mark ${name}'s lease as returned?`))
      updateStatus({ id, payload: { status: "returned" } });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Assign / Return</h1>
        <p className="page-subtitle">Handle device handoff for approved leases and process returns</p>
      </div>

      {/* Approved — awaiting pickup */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-xs font-semibold text-bodydark2 uppercase tracking-widest">Approved — Awaiting Pickup</p>
          <span className="badge" style={{ background:"rgba(59,91,252,0.15)", color:"#5e7cff", border:"1px solid rgba(59,91,252,0.3)" }}>
            {approvedLeases?.length ?? 0}
          </span>
        </div>
        <div className="card overflow-hidden">
          {loadApproved ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
          ) : !approvedLeases?.length ? (
            <div className="p-10 text-center text-bodydark2 text-sm">No pending pickups.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Device</th><th>Plan</th><th>Approved</th><th>Rate</th><th>Action</th></tr></thead>
                <tbody>
                  {approvedLeases.map(l => (
                    <tr key={l.id}>
                      <td>
                        <p className="font-medium">{l.student_name}</p>
                        <p className="text-xs text-bodydark2">{l.student_email}</p>
                      </td>
                      <td>
                        <p className="text-sm font-medium">{l.brand} {l.model}</p>
                        <p className="text-xs font-mono text-bodydark2">{l.serial_number}</p>
                      </td>
                      <td className="text-sm text-bodydark2">{PLAN_LABELS[l.plan_type]}</td>
                      <td className="text-sm text-bodydark2">{formatDate(l.updated_at)}</td>
                      <td className="font-semibold text-primary-400">{formatCurrency(Number(l.monthly_rate))}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-bodydark2">📍 {l.campus_location ?? "See admin"}</span>
                          <span className="badge text-success bg-success/10 border-success/20">Ready</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Active — can be returned */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-xs font-semibold text-bodydark2 uppercase tracking-widest">Active Leases — Process Return</p>
          <span className="badge" style={{ background:"rgba(34,197,94,0.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,0.3)" }}>
            {activeLeases?.length ?? 0}
          </span>
        </div>
        <div className="card overflow-hidden">
          {loadActive ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
          ) : !activeLeases?.length ? (
            <div className="p-10 text-center text-bodydark2 text-sm">No active leases to return.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Device</th><th>Ends</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {activeLeases.map(l => (
                    <tr key={l.id}>
                      <td>
                        <p className="font-medium">{l.student_name}</p>
                        <p className="text-xs text-bodydark2">{l.student_email}</p>
                      </td>
                      <td>
                        <p className="text-sm font-medium">{l.brand} {l.model}</p>
                        <p className="text-xs font-mono text-bodydark2">{l.serial_number}</p>
                      </td>
                      <td className="text-sm text-bodydark2">{formatDate(l.end_date)}</td>
                      <td><StatusBadge status={l.status} variant="lease" /></td>
                      <td>
                        <button disabled={isPending} onClick={() => handleReturn(l.id, l.student_name ?? "student")}
                          className="text-xs px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors">
                          🔄 Mark Returned
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
