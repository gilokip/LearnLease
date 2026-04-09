import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@services/paymentService";
import { queryKeys } from "@lib/queryKeys";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import { PAYMENT_STATUS_COLORS } from "@utils/constants";

export default function StudentPayments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: queryKeys.payments(),
    queryFn: () => paymentService.getAll(),
  });

  const paid    = payments?.filter(p => p.status === "paid").reduce((s,p) => s + Number(p.amount), 0) ?? 0;
  const pending = payments?.filter(p => p.status === "pending").reduce((s,p) => s + Number(p.amount), 0) ?? 0;
  const overdue = payments?.filter(p => p.status === "overdue").reduce((s,p) => s + Number(p.amount), 0) ?? 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">My Payments</h1>
        <p className="page-subtitle">Track your payment schedule and history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Paid",    value: paid,    color: "#22c55e", icon: "✅" },
          { label: "Pending",       value: pending, color: "#f59e0b", icon: "⏳" },
          { label: "Overdue",       value: overdue, color: "#ef4444", icon: "⚠️" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-display font-bold" style={{ color: s.color }}>{formatCurrency(s.value)}</div>
            <p className="text-xs text-bodydark2 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="font-semibold">Payment Schedule</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !payments?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No payment records found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr>
                <th>Due Date</th><th>Amount</th><th>Status</th><th>Paid Date</th><th>Reference</th>
              </tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{formatDate(p.due_date)}</td>
                    <td className="font-semibold text-primary-400">{formatCurrency(Number(p.amount))}</td>
                    <td><StatusBadge status={p.status} variant="payment" /></td>
                    <td className="text-bodydark2">{formatDate(p.paid_date)}</td>
                    <td className="text-bodydark2 font-mono text-xs">{p.payment_ref ?? "—"}</td>
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
