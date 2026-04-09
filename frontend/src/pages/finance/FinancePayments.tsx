import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@services/paymentService";
import { queryKeys } from "@lib/queryKeys";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@utils/format";
import toast from "react-hot-toast";
import type { Payment, PaymentStatus } from "@types/index";

const STATUS_TABS: { label: string; value: PaymentStatus | "" }[] = [
  { label:"All", value:"" }, { label:"Paid",value:"paid" }, { label:"Pending",value:"pending" }, { label:"Overdue",value:"overdue" },
];

export default function FinancePayments() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [payRef, setPayRef] = useState("");
  const qc = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: queryKeys.payments({ status: statusFilter }),
    queryFn: () => paymentService.getAll({ status: statusFilter || undefined }),
  });

  const { mutate: markPaid, isPending } = useMutation({
    mutationFn: ({ id, ref }: { id: number; ref: string }) =>
      paymentService.markPaid(id, undefined, ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payments() });
      qc.invalidateQueries({ queryKey: queryKeys.paymentSummary() });
      toast.success("Payment recorded.");
      setSelected(null); setPayRef("");
    },
    onError: () => toast.error("Failed to record payment."),
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Record and track all student payments</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
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
          <div className="p-6 space-y-3">{[...Array(7)].map((_,i) => <div key={i} className="h-12 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !payments?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No payment records found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Student</th><th>Device</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-medium">{p.student_name ?? "—"}</p>
                      <p className="text-xs text-bodydark2">{p.email}</p>
                    </td>
                    <td className="text-sm text-bodydark2">{p.brand} {p.model}</td>
                    <td className="font-semibold text-primary-400">{formatCurrency(Number(p.amount))}</td>
                    <td className="text-sm text-bodydark2">{formatDate(p.due_date)}</td>
                    <td className="text-sm text-bodydark2">{formatDate(p.paid_date)}</td>
                    <td><StatusBadge status={p.status} variant="payment" /></td>
                    <td>
                      {p.status !== "paid" && p.status !== "waived" && (
                        <button onClick={() => setSelected(p)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                          Mark Paid
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Record Payment"
        footer={<><button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button><button className="btn-primary" disabled={isPending} onClick={() => markPaid({ id:selected!.id, ref:payRef })}>{isPending?"Saving…":"Confirm Payment"}</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[["Student",selected.student_name],["Amount",formatCurrency(Number(selected.amount))],["Due Date",formatDate(selected.due_date)],["Device",`${selected.brand} ${selected.model}`]].map(([l,v]) => (
                <div key={l as string} className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-[11px] text-bodydark2 mb-1">{l}</p>
                  <p className="text-sm font-semibold">{v ?? "—"}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-bodydark2 mb-1.5">Payment Reference (optional)</label>
              <input className="input" placeholder="e.g. OR-20250315-001" value={payRef} onChange={e => setPayRef(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
