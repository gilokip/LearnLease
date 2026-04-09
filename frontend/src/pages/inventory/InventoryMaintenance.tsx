import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "@services/maintenanceService";
import { queryKeys } from "@lib/queryKeys";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate } from "@utils/format";
import toast from "react-hot-toast";
import type { MaintenanceLog } from "@types/index";

export default function InventoryMaintenance() {
  const [selected, setSelected] = useState<MaintenanceLog | null>(null);
  const [resolution, setResolution] = useState("");
  const [cost, setCost] = useState("");
  const qc = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: queryKeys.maintenance(),
    queryFn: () => maintenanceService.getAll(),
  });

  const { mutate: resolve, isPending } = useMutation({
    mutationFn: ({ id, resolution, cost }: { id: number; resolution: string; cost?: number }) =>
      maintenanceService.resolve(id, { resolution, cost }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.maintenance() });
      qc.invalidateQueries({ queryKey: queryKeys.devices() });
      toast.success("Maintenance resolved. Device set back to available.");
      setSelected(null); setResolution(""); setCost("");
    },
    onError: () => toast.error("Failed to resolve."),
  });

  const statusColor: Record<string, string> = { reported:"#ef4444", in_progress:"#f59e0b", resolved:"#22c55e" };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Maintenance</h1>
        <p className="page-subtitle">Track and resolve device maintenance jobs</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[["Reported","reported","🔴"],["In Progress","in_progress","🟡"],["Resolved","resolved","🟢"]].map(([l,s,i]) => (
          <div key={s as string} className="card p-5">
            <div className="text-2xl mb-2">{i}</div>
            <div className="text-2xl font-display font-bold" style={{ color: statusColor[s as string] }}>
              {logs?.filter(x => x.status === s).length ?? 0}
            </div>
            <p className="text-xs text-bodydark2 mt-1">{l}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !logs?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">✅ No maintenance jobs found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Device</th><th>Issue</th><th>Reported By</th><th>Reported</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>
                      <p className="font-medium">{l.brand} {l.model}</p>
                      <p className="text-xs font-mono text-bodydark2">{l.serial_number}</p>
                    </td>
                    <td className="text-sm max-w-[200px] truncate text-bodydark2">{l.issue}</td>
                    <td className="text-sm text-bodydark2">{l.reported_by_name}</td>
                    <td className="text-sm text-bodydark2">{formatDate(l.created_at)}</td>
                    <td>
                      <span className="badge capitalize" style={{ background:`${statusColor[l.status]}20`, color:statusColor[l.status], border:`1px solid ${statusColor[l.status]}40` }}>
                        {l.status.replace("_"," ")}
                      </span>
                    </td>
                    <td>
                      {l.status !== "resolved" && (
                        <button onClick={() => setSelected(l)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                          Resolve
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Resolve Maintenance"
        footer={<><button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button><button className="btn-primary" disabled={isPending||!resolution} onClick={() => resolve({ id:selected!.id, resolution, cost: cost ? Number(cost) : undefined })}>{isPending?"Saving…":"Mark Resolved"}</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="card p-3 text-sm">
              <p className="font-semibold">{selected.brand} {selected.model}</p>
              <p className="text-bodydark2 mt-1">Issue: {selected.issue}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-bodydark2 mb-1.5">Resolution *</label>
              <textarea className="input min-h-[90px] resize-none" placeholder="Describe what was done to resolve this..."
                value={resolution} onChange={e => setResolution(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-bodydark2 mb-1.5">Repair Cost (optional)</label>
              <input className="input" type="number" min={0} placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
