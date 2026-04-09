import { useState } from "react";
import { useLeases, useUpdateLeaseStatus } from "@hooks/useLeases";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import { PLAN_LABELS } from "@utils/constants";
import type { Lease } from "@types/index";

export default function AdminApplications() {
  const [selected, setSelected] = useState<Lease | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const { data: leases, isLoading } = useLeases({ status: "pending" });
  const { mutate: updateStatus, isPending } = useUpdateLeaseStatus();

  const handleApprove = () => {
    if (!selected) return;
    updateStatus({ id: selected.id, payload: { status: "approved" } }, { onSuccess: () => setSelected(null) });
  };

  const handleReject = () => {
    if (!selected) return;
    updateStatus({ id: selected.id, payload: { status: "rejected", rejectionNote: rejectNote } }, { onSuccess: () => { setSelected(null); setRejectNote(""); } });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Lease Applications</h1>
        <p className="page-subtitle">Review and process pending student lease requests</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold">Pending Applications</h3>
          <span className="badge" style={{ background:"rgba(245,158,11,0.15)", color:"#f59e0b", border:"1px solid rgba(245,158,11,0.3)" }}>
            {leases?.length ?? 0} pending
          </span>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !leases?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">✅ No pending applications. All caught up!</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Student</th><th>Device</th><th>Plan</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {leases.map(l => (
                  <tr key={l.id}>
                    <td>
                      <p className="font-medium">{l.student_name}</p>
                      <p className="text-xs text-bodydark2">{l.student_email}</p>
                    </td>
                    <td>
                      <p className="font-medium">{l.brand} {l.model}</p>
                      <p className="text-xs text-bodydark2">{l.serial_number}</p>
                    </td>
                    <td className="text-sm">{PLAN_LABELS[l.plan_type] ?? l.plan_type}</td>
                    <td className="text-bodydark2 text-sm">{formatDate(l.created_at)}</td>
                    <td><StatusBadge status={l.status} variant="lease" /></td>
                    <td>
                      <button onClick={() => setSelected(l)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Application" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Student",  selected.student_name],
                ["Email",    selected.student_email],
                ["Device",   `${selected.brand} ${selected.model}`],
                ["Serial",   selected.serial_number],
                ["Plan",     PLAN_LABELS[selected.plan_type]],
                ["Duration", `${selected.duration_weeks} weeks`],
                ["Applied",  formatDate(selected.created_at)],
                ["Monthly Rate", formatCurrency(Number(selected.monthly_rate))],
              ].map(([l,v]) => (
                <div key={l} className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-[11px] text-bodydark2 uppercase tracking-wider mb-1">{l}</p>
                  <p className="text-sm font-semibold">{v ?? "—"}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-bodydark2 mb-1.5">Rejection Note (required if rejecting)</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Reason for rejection..."
                value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-secondary flex-1" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-danger flex-1" disabled={isPending || !rejectNote} onClick={handleReject}>
                {isPending ? "…" : "Reject"}
              </button>
              <button className="btn-primary flex-1" disabled={isPending} onClick={handleApprove}>
                {isPending ? "…" : "✅ Approve"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
