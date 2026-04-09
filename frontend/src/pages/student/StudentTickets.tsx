import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@services/ticketService";
import { queryKeys } from "@lib/queryKeys";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate } from "@utils/format";
import { PRIORITY_COLORS } from "@utils/constants";
import toast from "react-hot-toast";
import type { TicketPriority } from "@types/index";

export default function StudentTickets() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium" as TicketPriority });
  const qc = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: queryKeys.tickets(),
    queryFn: () => ticketService.getAll(),
  });

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: () => ticketService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tickets() });
      toast.success("Support ticket submitted!");
      setOpen(false);
      setForm({ subject: "", description: "", priority: "medium" });
    },
    onError: () => toast.error("Failed to create ticket."),
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Get help with your lease or device</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ New Ticket</button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !tickets?.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🎧</div>
            <p className="text-bodydark2 text-sm">No tickets yet. Open a ticket if you need help!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Subject</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td>
                      <p className="font-medium">{t.subject}</p>
                      {t.description && <p className="text-xs text-bodydark2 truncate max-w-xs mt-0.5">{t.description}</p>}
                    </td>
                    <td>
                      <span className="badge capitalize" style={{ background: `${PRIORITY_COLORS[t.priority]}20`, color: PRIORITY_COLORS[t.priority], border: `1px solid ${PRIORITY_COLORS[t.priority]}40` }}>
                        {t.priority}
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} variant="custom" color={{ open:"#3b5bfc", in_progress:"#f59e0b", resolved:"#22c55e", closed:"#8890b5" }[t.status]} /></td>
                    <td className="text-bodydark2 text-sm">{formatDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Support Ticket"
        footer={<>
          <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" disabled={isPending || !form.subject} onClick={() => createTicket()}>
            {isPending ? "Submitting…" : "Submit Ticket"}
          </button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">Subject *</label>
            <input className="input" placeholder="e.g. Device not powering on"
              value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(["low","medium","high","urgent"] as TicketPriority[]).map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${form.priority === p ? "border-current" : "border-white/[0.08] text-bodydark2 hover:border-white/20"}`}
                  style={form.priority === p ? { background: `${PRIORITY_COLORS[p]}20`, color: PRIORITY_COLORS[p], borderColor: `${PRIORITY_COLORS[p]}60` } : {}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">Description</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe your issue in detail..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
