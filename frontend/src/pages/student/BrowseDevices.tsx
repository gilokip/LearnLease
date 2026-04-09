import { useState } from "react";
import { useDevices } from "@hooks/useDevices";
import { useApplyForLease } from "@hooks/useLeases";
import { useLeases } from "@hooks/useLeases";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatCurrency } from "@utils/format";
import { PLAN_LABELS } from "@utils/constants";
import type { Device, PlanType } from "@types/index";

const PLAN_OPTIONS: { value: PlanType; label: string; weeks: number }[] = [
  { value: "semester", label: "Semester — 16 weeks", weeks: 16 },
  { value: "annual",   label: "Annual — 48 weeks",   weeks: 48 },
  { value: "monthly",  label: "Monthly — 4 weeks",   weeks: 4  },
];

export default function BrowseDevices() {
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Device | null>(null);
  const [plan, setPlan]           = useState<PlanType>("semester");

  const { data: devices, isLoading } = useDevices({ status: "available", search });
  const { data: leases } = useLeases();
  const { mutate: applyForLease, isPending } = useApplyForLease();

  const hasActive = leases?.some(l => ["active","pending"].includes(l.status));

  const filtered = (devices ?? []).filter(d =>
    !search || `${d.brand} ${d.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    if (!selected) return;
    const weeks = PLAN_OPTIONS.find(p => p.value === plan)?.weeks ?? 16;
    applyForLease({ deviceId: selected.id, planType: plan, durationWeeks: weeks },
      { onSuccess: () => setSelected(null) });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Browse Devices</h1>
        <p className="page-subtitle">Choose a laptop to apply for a lease</p>
      </div>

      {hasActive && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-sm text-warning flex items-center gap-3">
          ⚠️ You already have an active or pending lease. Return your current device before applying for a new one.
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search brand or model..." className="input pl-9" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="card h-52 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-bodydark2">No available devices found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(device => (
            <div key={device.id} className="card p-5 flex flex-col gap-4 hover:border-primary-500/30 transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{device.brand} {device.model}</h3>
                  <p className="text-xs text-bodydark2 mt-0.5">{device.serial_number}</p>
                </div>
                <StatusBadge status={device.status} variant="device" />
              </div>
              {device.specs && <p className="text-xs text-bodydark2 leading-relaxed">{device.specs}</p>}
              <div className="flex items-center justify-between text-xs">
                <span className="text-bodydark2">📍 {device.campus_location ?? "N/A"}</span>
                <span className="font-bold text-primary-400 text-base">{formatCurrency(Number(device.monthly_rate))}<span className="text-bodydark2 font-normal text-xs">/mo</span></span>
              </div>
              <button
                onClick={() => setSelected(device)}
                disabled={hasActive || device.status !== "available"}
                className="btn-primary w-full text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply for Lease
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Apply for Lease"
        footer={<>
          <button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleApply} disabled={isPending}>
            {isPending ? "Submitting…" : "Submit Application"}
          </button>
        </>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="card p-4 flex gap-3 items-center">
              <div className="text-3xl">💻</div>
              <div>
                <p className="font-semibold">{selected.brand} {selected.model}</p>
                <p className="text-xs text-bodydark2">{selected.specs}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bodydark2 mb-2">Select Lease Plan</label>
              <div className="space-y-2">
                {PLAN_OPTIONS.map(p => (
                  <button key={p.value} type="button" onClick={() => setPlan(p.value)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${plan === p.value ? "border-primary-500 bg-primary-500/10 text-white" : "border-white/[0.08] bg-white/[0.02] text-bodydark2 hover:border-white/20"}`}>
                    <span className="font-medium">{p.label}</span>
                    <span className="float-right font-bold text-primary-400">{formatCurrency(Number(selected.monthly_rate))}/mo</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 text-xs text-bodydark2 space-y-1">
              <p>📌 Your application will be reviewed by school administration.</p>
              <p>📌 Device pickup is available after approval from your assigned campus center.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
