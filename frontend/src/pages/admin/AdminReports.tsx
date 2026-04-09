import { useDashboardStats } from "@hooks/useDashboard";
import { formatCurrency } from "@utils/format";
import { LEASE_STATUS_COLORS, DEVICE_STATUS_COLORS } from "@utils/constants";
import type { AdminStats } from "@types/index";

function DonutSlice({ pct, color, offset }: { pct: number; color: string; offset: number }) {
  const r = 40; const circ = 2 * Math.PI * r;
  return <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="12"
    strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ}
    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />;
}

export default function AdminReports() {
  const { data, isLoading } = useDashboardStats();
  const stats = data as AdminStats | undefined;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData = [8200,9100,9800,8700,10200,10800,9900,11000,11400,10800,11200,12000];
  const max = Math.max(...revenueData);

  const leaseSlices = stats ? [
    { label:"Active",   value: stats.leases?.active ?? 0,   color: LEASE_STATUS_COLORS.active },
    { label:"Pending",  value: stats.leases?.pending ?? 0,  color: LEASE_STATUS_COLORS.pending },
    { label:"Returned", value: stats.leases?.returned ?? 0, color: LEASE_STATUS_COLORS.returned },
  ] : [];
  const leaseTotal = leaseSlices.reduce((s,x) => s + x.value, 0) || 1;

  let sliceOffset = 0;
  const slices = leaseSlices.map(s => {
    const pct = s.value / leaseTotal;
    const out = { ...s, pct, offset: sliceOffset };
    sliceOffset += pct;
    return out;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">System-wide analytics and performance metrics</p>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:"Total Students",  value: stats.users?.student ?? 0,                icon:"🎓", color:"#3b5bfc" },
            { label:"Active Leases",   value: stats.leases?.active ?? 0,               icon:"✅", color:"#22c55e" },
            { label:"Total Devices",   value: stats.devices?.total ?? 0,               icon:"💻", color:"#f59e0b" },
            { label:"Monthly Revenue", value: formatCurrency(stats.payments?.monthly ?? 0), icon:"💰", color:"#a78bfa" },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className="text-2xl font-display font-bold" style={{ color: k.color }}>{k.value}</div>
              <p className="text-xs text-bodydark2 mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue bar chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold">Monthly Revenue</p>
              <p className="text-xs text-bodydark2">Full year 2025</p>
            </div>
            <p className="font-display font-bold text-success">{formatCurrency(revenueData.reduce((s,x)=>s+x,0))}</p>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t transition-all duration-700 group relative"
                  style={{ height:`${(v/max)*100}%`, background:"linear-gradient(to top,#3b5bfc,#a78bfa)", minHeight:4 }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-navy-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                    {formatCurrency(v)}
                  </div>
                </div>
                <span className="text-[9px] text-bodydark2">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lease donut */}
        <div className="card p-6 flex flex-col">
          <p className="font-semibold mb-5">Lease Distribution</p>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-32 h-32 rounded-full bg-white/[0.04] animate-pulse" /></div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  {slices.map(s => <DonutSlice key={s.label} pct={s.pct} color={s.color} offset={s.offset} />)}
                  <text x="50" y="54" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{leaseTotal}</text>
                </svg>
              </div>
              <div className="space-y-2">
                {slices.map(s => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-bodydark2">{s.label}</span>
                    </div>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Device & payment summary */}
      {stats && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-6">
            <p className="font-semibold mb-4">Device Inventory Summary</p>
            <div className="space-y-3">
              {[
                ["Available",      stats.devices?.available ?? 0,   "#22c55e"],
                ["On Lease",       stats.devices?.leased ?? 0,      "#3b5bfc"],
                ["Maintenance",    stats.devices?.maintenance ?? 0, "#f59e0b"],
                ["Decommissioned", stats.devices?.decommissioned ?? 0, "#8890b5"],
              ].map(([l,v,c]) => (
                <div key={l as string} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-bodydark2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c as string }} />
                    {l}
                  </div>
                  <span className="font-bold" style={{ color: c as string }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <p className="font-semibold mb-4">Payment Summary</p>
            <div className="space-y-3">
              {[
                ["Monthly Collected", formatCurrency(stats.payments?.monthly ?? 0),                     "#22c55e"],
                ["Annual Collected",  formatCurrency(stats.payments?.annual ?? 0),                      "#3b5bfc"],
                ["Pending",           formatCurrency(stats.payments?.pending?.amount ?? 0),             "#f59e0b"],
                ["Overdue",           formatCurrency(stats.payments?.overdue?.amount ?? 0),             "#ef4444"],
              ].map(([l,v,c]) => (
                <div key={l as string} className="flex items-center justify-between">
                  <span className="text-sm text-bodydark2">{l}</span>
                  <span className="font-bold text-sm" style={{ color: c as string }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
