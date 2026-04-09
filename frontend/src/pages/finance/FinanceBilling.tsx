import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@services/paymentService";
import { queryKeys } from "@lib/queryKeys";
import { formatCurrency } from "@utils/format";
import toast from "react-hot-toast";

export default function FinanceBilling() {
  const qc = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.paymentSummary(),
    queryFn:  paymentService.getSummary,
  });

  const { mutate: runSweep, isPending: sweeping } = useMutation({
    mutationFn: paymentService.sweepOverdue,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.payments() });
      qc.invalidateQueries({ queryKey: queryKeys.paymentSummary() });
      toast.success(`Sweep complete — ${data.updatedCount} payment(s) marked overdue.`);
    },
    onError: () => toast.error("Sweep failed."),
  });

  const tiles = summary ? [
    { label:"Monthly Collected", value: formatCurrency(summary.monthly),              color:"#22c55e", icon:"💰", subtitle:"This calendar month" },
    { label:"Annual Collected",  value: formatCurrency(summary.annual),               color:"#3b5bfc", icon:"📈", subtitle:"Year to date" },
    { label:"Pending Amount",    value: formatCurrency(summary.pending.amount),        color:"#f59e0b", icon:"⏳", subtitle:`${summary.pending.count} unpaid invoices` },
    { label:"Overdue Amount",    value: formatCurrency(summary.overdue.amount),        color:"#ef4444", icon:"⚠️", subtitle:`${summary.overdue.count} overdue students` },
  ] : [];

  const BILLING_CYCLE = [
    { step:"1", title:"Generate invoices",   desc:"Invoices are auto-generated on the 1st of each month for all active leases.",      done:true  },
    { step:"2", title:"Notify students",     desc:"Students receive an email reminder 7 days before each due date.",                   done:true  },
    { step:"3", title:"Payment collection",  desc:"Students pay via the portal. Finance records each payment with a reference number.", done:false },
    { step:"4", title:"Overdue sweep",       desc:"Run the overdue sweep after the due date to flag unpaid invoices automatically.",    done:false },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Manage monthly billing cycles and collections</p>
        </div>
        <button className="btn-primary" disabled={sweeping} onClick={() => runSweep()}>
          {sweeping ? "Running…" : "🔄 Run Overdue Sweep"}
        </button>
      </div>

      {/* Summary tiles */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="card h-28 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {tiles.map(t => (
            <div key={t.label} className="card p-5">
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-xl font-display font-bold" style={{ color:t.color }}>{t.value}</div>
              <p className="text-sm font-medium text-white mt-1">{t.label}</p>
              <p className="text-xs text-bodydark2 mt-0.5">{t.subtitle}</p>
            </div>
          ))}
        </div>
      )}

      {/* Billing cycle steps */}
      <div className="card p-6">
        <h3 className="font-display font-semibold mb-5">Monthly Billing Cycle</h3>
        <div className="space-y-4">
          {BILLING_CYCLE.map((s, i) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.done ? "bg-success/20 text-success border border-success/30" : "bg-white/[0.05] text-bodydark2 border border-white/10"}`}>
                {s.done ? "✓" : s.step}
              </div>
              <div className="flex-1 pt-0.5">
                <p className={`text-sm font-semibold ${s.done ? "text-success" : "text-white"}`}>{s.title}</p>
                <p className="text-xs text-bodydark2 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection rate bar */}
      {summary && (
        <div className="card p-6">
          <h3 className="font-display font-semibold mb-4">Collection Rate</h3>
          <div className="space-y-4">
            {[
              { label:"Collected this month",  value:summary.monthly, total:summary.monthly + summary.pending.amount + summary.overdue.amount, color:"#22c55e" },
              { label:"Pending",               value:summary.pending.amount, total:summary.monthly + summary.pending.amount + summary.overdue.amount, color:"#f59e0b" },
              { label:"Overdue",               value:summary.overdue.amount, total:summary.monthly + summary.pending.amount + summary.overdue.amount, color:"#ef4444" },
            ].map(row => {
              const total = row.total || 1;
              const pct   = Math.round((row.value / total) * 100);
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-bodydark2">{row.label}</span>
                    <span className="font-semibold">{formatCurrency(row.value)} <span className="text-bodydark2">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
