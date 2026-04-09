import { useState } from "react";
import { useDevices, useCreateDevice, useSendToMaintenance } from "@hooks/useDevices";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@utils/format";
import type { DeviceStatus } from "@types/index";

const STATUS_TABS = ["", "available", "leased", "maintenance", "decommissioned"] as const;

export default function InventoryDevices() {
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "">("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [maintDevice, setMaintDevice] = useState<number | null>(null);
  const [maintIssue, setMaintIssue] = useState("");
  const [form, setForm] = useState({ brand:"", model:"", serialNumber:"", specs:"", monthlyRate:"", campusLocation:"" });

  const { data: devices, isLoading } = useDevices({ status: statusFilter || undefined, search });
  const { mutate: createDevice, isPending: adding } = useCreateDevice();
  const { mutate: sendToMaint, isPending: sending } = useSendToMaintenance();

  const handleAdd = () => {
    createDevice({ ...form, monthlyRate: Number(form.monthlyRate) }, { onSuccess: () => { setShowAdd(false); setForm({ brand:"",model:"",serialNumber:"",specs:"",monthlyRate:"",campusLocation:"" }); } });
  };

  const handleMaint = () => {
    if (!maintDevice || !maintIssue) return;
    sendToMaint({ id: maintDevice, issue: maintIssue }, { onSuccess: () => { setMaintDevice(null); setMaintIssue(""); } });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Devices</h1>
          <p className="page-subtitle">Manage all laptop inventory across campuses</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Device</button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brand, model, serial..." className="input pl-9 w-64" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "text-bodydark2 hover:text-white hover:bg-white/5"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !devices?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No devices found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Device</th><th>Serial</th><th>Specs</th><th>Monthly Rate</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.id}>
                    <td>
                      <p className="font-medium">{d.brand} {d.model}</p>
                      <p className="text-xs text-bodydark2">{formatDate(d.purchased_date)}</p>
                    </td>
                    <td className="font-mono text-xs text-bodydark2">{d.serial_number}</td>
                    <td className="text-xs text-bodydark2 max-w-[180px] truncate">{d.specs ?? "—"}</td>
                    <td className="font-semibold text-primary-400">{formatCurrency(Number(d.monthly_rate))}</td>
                    <td className="text-sm text-bodydark2">{d.campus_location ?? "—"}</td>
                    <td><StatusBadge status={d.status} variant="device" /></td>
                    <td>
                      {d.status === "available" && (
                        <button onClick={() => setMaintDevice(d.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors">
                          🔧 Maintenance
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

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Device"
        footer={<><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" disabled={adding || !form.brand || !form.model || !form.serialNumber} onClick={handleAdd}>{adding ? "Adding…" : "Add Device"}</button></>}
      >
        <div className="space-y-3">
          {[["Brand *","brand","text","Apple"],["Model *","model","text","MacBook Pro 14"],["Serial Number *","serialNumber","text","MBP-2024-XXX"],["Specs","specs","text","M3, 16GB, 512GB"],["Monthly Rate *","monthlyRate","number","45"],["Campus Location","campusLocation","text","Center A"]].map(([l,k,t,ph]) => (
            <div key={k as string}>
              <label className="block text-xs font-medium text-bodydark2 mb-1.5">{l}</label>
              <input className="input" type={t as string} placeholder={ph as string} value={(form as any)[k as string]}
                onChange={e => setForm(f => ({ ...f, [k as string]: e.target.value }))} />
            </div>
          ))}
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal open={!!maintDevice} onClose={() => setMaintDevice(null)} title="Flag for Maintenance"
        footer={<><button className="btn-secondary" onClick={() => setMaintDevice(null)}>Cancel</button><button className="btn-primary" disabled={sending || !maintIssue} onClick={handleMaint}>{sending ? "Flagging…" : "Confirm"}</button></>}
      >
        <div className="space-y-3">
          <p className="text-sm text-bodydark2">Describe the issue with this device. It will be marked as under maintenance.</p>
          <textarea className="input min-h-[100px] resize-none" placeholder="e.g. Screen flickering, keyboard issue..." value={maintIssue} onChange={e => setMaintIssue(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
