import { useState } from "react";
import { useLeases, useUpdateLeaseStatus } from "@hooks/useLeases";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import { PLAN_LABELS } from "@utils/constants";
import type { LeaseStatus } from "@types/index";

const STATUS_TABS: { label: string; value: LeaseStatus | "" }[] = [
  { label: "All",      value: "" },
  { label: "Active",   value: "active" },
  { label: "Pending",  value: "pending" },
  { label: "Returned", value: "returned" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired",  value: "expired" },
];

export default function AdminLeases() {
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | "">("");
  const [search, setSearch] = useState("");

  const { data: leases, isLoading } = useLeases({ status: statusFilter || undefined, search });
  const { mutate: updateStatus, isPending } = useUpdateLeaseStatus();

  const handleReturn = (id: number) => {
    if (confirm("Mark this lease as returned?")) updateStatus({ id, payload: { status: "returned" } });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">All Leases</h1>
        <p className="page-subtitle">View and manage every lease record</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or device..." className="input pl-9 w-64" />
        </div>
        <div className="flex gap-1">
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setStatusFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === t.value ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "text-bodydark2 hover:text-white hover:bg-white/5"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !leases?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No leases found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Student</th><th>Device</th><th>Plan</th><th>Period</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {leases.map(l => (
                  <tr key={l.id}>
                    <td>
                      <p className="font-medium">{l.student_name}</p>
                      <p className="text-xs text-bodydark2">{l.student_email}</p>
                    </td>
                    <td>
                      <p className="text-sm font-medium">{l.brand} {l.model}</p>
                      <p className="text-xs text-bodydark2 font-mono">{l.serial_number}</p>
                    </td>
                    <td className="text-sm text-bodydark2">{PLAN_LABELS[l.plan_type] ?? l.plan_type}</td>
                    <td className="text-xs text-bodydark2">
                      <p>{formatDate(l.start_date)} →</p>
                      <p>{formatDate(l.end_date)}</p>
                    </td>
                    <td className="font-semibold text-primary-400">{formatCurrency(Number(l.monthly_rate))}</td>
                    <td><StatusBadge status={l.status} variant="lease" /></td>
                    <td>
                      {l.status === "active" && (
                        <button disabled={isPending} onClick={() => handleReturn(l.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-bodydark2 hover:text-white transition-colors">
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
