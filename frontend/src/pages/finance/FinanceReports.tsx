import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@services/paymentService";
import { queryKeys } from "@lib/queryKeys";
import { formatCurrency } from "@utils/format";

export default function FinanceReports() {
  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.paymentSummary(),
    queryFn:  paymentService.getSummary,
  });

  const months     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData = [4200,5800,6100,5400,7200,7800,6900,8100,8600,7900,8400,9200];
  const expenseData = [1200,1400,1300,1500,1600,1700,1400,1800,1900,1700,1900,2100];
  const maxVal = Math.max(...revenueData);

  const METRICS = summary ? [
    { label:"Monthly Revenue",   value:formatCurrency(summary.monthly),              sub:"Current month",         color:"#22c55e", icon:"📈" },
    { label:"Annual Revenue",    value:formatCurrency(summary.annual),               sub:"Year to date",           color:"#3b5bfc", icon:"💰" },
    { label:"Outstanding",       value:formatCurrency(summary.pending.amount + summary.overdue.amount), sub:`${summary.pending.count + summary.overdue.count} accounts`, color:"#f59e0b", icon:"⏳" },
    { label:"Collection Rate",   value: summary.monthly + summary.overdue.amount > 0
        ? `${Math.round((summary.monthly / (summary.monthly + summary.overdue.amount)) * 100)}%`
        : "—",
      sub:"Paid vs total billed", color:"#a78bfa", icon:"🎯" },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Financial Reports</h1>
        <p className="page-subtitle">Revenue analysis, trends, and collection metrics</p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="card h-28 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {METRICS.map(m => (
            <div key={m.label} className="card p-5">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="text-xl font-display font-bold" style={{ color:m.color }}>{m.value}</div>
              <p className="text-sm font-medium text-white mt-1">{m.label}</p>
              <p className="text-xs text-bodydark2 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue vs Expenses */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold">Revenue vs Expenses</p>
            <p className="text-xs text-bodydark2">2025 — All months</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background:"#3b5bfc" }} />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background:"#ef4444" }} />Expenses</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-44">
          {revenueData.map((rev, i) => {
            const exp = expenseData[i];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height:"152px" }}>
                  <div className="flex-1 rounded-t transition-all duration-700"
                    style={{ height:`${(rev/maxVal)*100}%`, background:"linear-gradient(to top,#3b5bfc,#5e7cff)", minHeight:4 }} />
                  <div className="flex-1 rounded-t transition-all duration-700"
                    style={{ height:`${(exp/maxVal)*100}%`, background:"linear-gradient(to top,#ef4444,#f87171)", minHeight:4 }} />
                </div>
                <span className="text-[9px] text-bodydark2">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two bottom cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Net Revenue */}
        <div className="card p-6">
          <p className="font-semibold mb-4">Net Revenue by Month</p>
          <div className="space-y-2">
            {revenueData.slice(-6).map((r, i) => {
              const net = r - expenseData[revenueData.length - 6 + i];
              const max = Math.max(...revenueData.map((rv,ii) => rv - expenseData[ii]));
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-bodydark2">{months[revenueData.length - 6 + i]}</span>
                    <span className="font-semibold text-success">{formatCurrency(net)}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${(net/max)*100}%`, background:"#22c55e" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment status breakdown */}
        <div className="card p-6">
          <p className="font-semibold mb-4">Payment Status Breakdown</p>
          {summary && (
            <div className="space-y-4">
              {[
                { label:"Paid this month",  amount:summary.monthly,              count:null,                   color:"#22c55e" },
                { label:"Pending",          amount:summary.pending.amount,        count:summary.pending.count,  color:"#f59e0b" },
                { label:"Overdue",          amount:summary.overdue.amount,        count:summary.overdue.count,  color:"#ef4444" },
              ].map(row => {
                const total = summary.monthly + summary.pending.amount + summary.overdue.amount || 1;
                const pct = Math.round((row.amount / total) * 100);
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background:row.color }} />
                        <span className="text-bodydark2">{row.label}{row.count != null ? ` (${row.count})` : ""}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(row.amount)} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background:row.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
