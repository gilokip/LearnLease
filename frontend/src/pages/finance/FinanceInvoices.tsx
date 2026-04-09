import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@services/paymentService";
import { queryKeys } from "@lib/queryKeys";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import toast from "react-hot-toast";

export default function FinanceInvoices() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: queryKeys.payments({ month }),
    queryFn:  () => paymentService.getAll(),
  });

  const filtered = payments?.filter(p => {
    if (!month) return true;
    return p.due_date?.startsWith(month);
  }) ?? [];

  const handleExport = () => {
    const rows = [
      ["Invoice #","Student","Device","Amount","Due Date","Status","Paid Date","Reference"],
      ...filtered.map((p, i) => [
        `INV-${String(p.id).padStart(5,"0")}`,
        p.student_name ?? "—",
        `${p.brand} ${p.model}`,
        p.amount,
        p.due_date,
        p.status,
        p.paid_date ?? "—",
        p.payment_ref ?? "—",
      ])
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `invoices-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const total   = filtered.reduce((s,p) => s + Number(p.amount), 0);
  const paid    = filtered.filter(p => p.status === "paid").reduce((s,p) => s + Number(p.amount), 0);
  const pending = filtered.filter(p => p.status === "pending").reduce((s,p) => s + Number(p.amount), 0);
  const overdue = filtered.filter(p => p.status === "overdue").reduce((s,p) => s + Number(p.amount), 0);

  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2025, i, 1);
    return { value: `2025-${String(i+1).padStart(2,"0")}`, label: d.toLocaleString("default",{month:"long",year:"numeric"}) };
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">View and export monthly invoice records</p>
        </div>
        <button className="btn-primary" onClick={handleExport} disabled={!filtered.length}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Month filter + summary */}
      <div className="flex flex-wrap gap-4 items-start">
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Filter by Month</label>
          <select className="input w-52" value={month} onChange={e => setMonth(e.target.value)}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-6 flex-wrap">
          {[
            { label:"Total",   value:total,   color:"#8890b5" },
            { label:"Paid",    value:paid,    color:"#22c55e" },
            { label:"Pending", value:pending, color:"#f59e0b" },
            { label:"Overdue", value:overdue, color:"#ef4444" },
          ].map(s => (
            <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:s.color }} />
              <span className="text-xs text-bodydark2">{s.label}</span>
              <span className="font-bold text-sm" style={{ color:s.color }}>{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-12 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !filtered.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No invoices found for the selected month.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Invoice #</th><th>Student</th><th>Device</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Reference</th></tr></thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-bodydark2">INV-{String(p.id).padStart(5,"0")}</td>
                    <td>
                      <p className="font-medium text-sm">{p.student_name ?? "—"}</p>
                      <p className="text-xs text-bodydark2">{p.email}</p>
                    </td>
                    <td className="text-sm text-bodydark2">{p.brand} {p.model}</td>
                    <td className="font-semibold text-primary-400">{formatCurrency(Number(p.amount))}</td>
                    <td className="text-sm text-bodydark2">{formatDate(p.due_date)}</td>
                    <td><StatusBadge status={p.status} variant="payment" /></td>
                    <td className="font-mono text-xs text-bodydark2">{p.payment_ref ?? "—"}</td>
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
