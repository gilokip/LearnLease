import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@lib/axios";
import { queryKeys } from "@lib/queryKeys";
import Modal from "@components/ui/Modal";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate } from "@utils/format";
import toast from "react-hot-toast";
import type { Role } from "@types/index";

// ── Types ────────────────────────────────────────────────────────────────────

interface StaffMember {
  id:         number;
  name:       string;
  email:      string;
  role:       Role;
  is_active:  number;
  created_at: string;
}

type StaffRole = "admin" | "inventory" | "finance";

const STAFF_ROLES: { value: StaffRole; label: string; desc: string; color: string }[] = [
  { value: "admin",     label: "Admin",     desc: "Full system access",       color: "#3b5bfc" },
  { value: "inventory", label: "Inventory", desc: "Devices & maintenance",    color: "#f59e0b" },
  { value: "finance",   label: "Finance",   desc: "Payments & billing",       color: "#22c55e" },
];

const ROLE_COLOR: Record<StaffRole, string> = {
  admin:     "#3b5bfc",
  inventory: "#f59e0b",
  finance:   "#22c55e",
};

const IcEye    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcEyeOff = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

// ── API helpers ──────────────────────────────────────────────────────────────

const staffKey = () => ["users", "staff"];

const fetchStaff  = (): Promise<StaffMember[]> =>
  api.get("/users/staff").then(r => r.data.data);

const createStaff = (payload: { name: string; email: string; password: string; role: StaffRole }) =>
  api.post("/users/staff", payload).then(r => r.data.data);

const deactivateUser = (id: number) =>
  api.delete(`/users/${id}`).then(r => r.data);

const reactivateUser = (id: number) =>
  api.put(`/users/${id}/reactivate`).then(r => r.data);

// ── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", email: "", password: "", role: "inventory" as StaffRole };

export default function StaffPage() {
  const qc = useQueryClient();
  const [modalOpen,   setModalOpen]   = useState(false);
  const [showPass,    setShowPass]     = useState(false);
  const [filterRole,  setFilterRole]   = useState<StaffRole | "all">("all");
  const [search,      setSearch]       = useState("");
  const [form,        setForm]         = useState(EMPTY_FORM);
  const [formError,   setFormError]    = useState("");
  const [confirmId,   setConfirmId]    = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "reactivate" | null>(null);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Queries
  const { data: staff = [], isLoading } = useQuery({
    queryKey: staffKey(),
    queryFn:  fetchStaff,
  });

  // Mutations
  const { mutate: addStaff, isPending: isAdding } = useMutation({
    mutationFn: createStaff,
    onSuccess: (newUser) => {
      qc.invalidateQueries({ queryKey: staffKey() });
      qc.invalidateQueries({ queryKey: queryKeys.userStats() });
      toast.success(`${newUser.name} added as ${newUser.role}.`);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setFormError("");
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to create account."),
  });

  const { mutate: deactivate } = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: staffKey() }); toast.success("Account deactivated."); },
    onError:   () => toast.error("Failed to deactivate account."),
  });

  const { mutate: reactivate } = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: staffKey() }); toast.success("Account reactivated."); },
    onError:   () => toast.error("Failed to reactivate account."),
  });

  // Filtered list
  const filtered = staff.filter(s => {
    const matchRole   = filterRole === "all" || s.role === filterRole;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Counts
  const counts = { all: staff.length, admin: 0, inventory: 0, finance: 0 };
  for (const s of staff) { if (s.role in counts) (counts as any)[s.role]++; }

  const handleCreate = () => {
    setFormError("");
    if (!form.name || !form.email || !form.password) { setFormError("All fields are required."); return; }
    if (form.password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    addStaff(form);
  };

  const handleConfirm = () => {
    if (!confirmId || !confirmAction) return;
    confirmAction === "deactivate" ? deactivate(confirmId) : reactivate(confirmId);
    setConfirmId(null);
    setConfirmAction(null);
  };

  const openDeactivate = (id: number) => { setConfirmId(id); setConfirmAction("deactivate"); };
  const openReactivate = (id: number) => { setConfirmId(id); setConfirmAction("reactivate"); };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Create and manage administrator, inventory, and finance accounts</p>
        </div>
        <button className="btn-primary" onClick={() => { setModalOpen(true); setFormError(""); setForm(EMPTY_FORM); }}>
          + Add Staff
        </button>
      </div>

      {/* Role filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "admin", "inventory", "finance"] as const).map(r => {
          const color = r === "all" ? "#8890b5" : ROLE_COLOR[r];
          const active = filterRole === r;
          return (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                background: active ? `${color}18` : "var(--bg-card)",
                color:      active ? color : "var(--text-muted)",
                border:     `1px solid ${active ? color + "40" : "var(--border)"}`,
              }}>
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="ml-1.5 opacity-70">{counts[r]}</span>
            </button>
          );
        })}
        <input
          className="input ml-auto"
          style={{ maxWidth: 220, padding: "6px 12px", fontSize: 13 }}
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}
          </div>
        ) : !filtered.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-bodydark2 text-sm">
              {search || filterRole !== "all" ? "No staff match your filters." : "No staff accounts yet. Add one above."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => {
                  const color = ROLE_COLOR[member.role as StaffRole] ?? "#8890b5";
                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: `linear-gradient(135deg,${color},${color}99)` }}>
                            {member.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge capitalize px-2.5 py-1 text-xs font-semibold rounded-full"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                          {member.role}
                        </span>
                      </td>
                      <td>
                        <StatusBadge
                          status={member.is_active ? "active" : "inactive"}
                          variant="custom"
                          color={member.is_active ? "#22c55e" : "#8890b5"}
                        />
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {formatDate(member.created_at)}
                      </td>
                      <td>
                        {member.is_active ? (
                          <button
                            onClick={() => openDeactivate(member.id)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                            style={{ color: "#d34053", background: "rgba(211,64,83,0.07)", border: "1px solid rgba(211,64,83,0.15)" }}>
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => openReactivate(member.id)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                            style={{ color: "#22c55e", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Staff Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setFormError(""); }}
        title="Add Staff Account"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setFormError(""); }}>Cancel</button>
            <button className="btn-primary" disabled={isAdding} onClick={handleCreate}>
              {isAdding ? "Creating…" : "Create Account"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              {formError}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Role</label>
            <div className="grid grid-cols-3 gap-2">
              {STAFF_ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => upd("role", r.value)}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-center transition-all"
                  style={{
                    border:     form.role === r.value ? `2px solid ${r.color}` : "1px solid var(--border)",
                    background: form.role === r.value ? `${r.color}12` : "var(--bg-card-hover)",
                  }}>
                  <p className="text-xs font-semibold" style={{ color: form.role === r.value ? r.color : "var(--text-primary)" }}>{r.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Full Name</label>
            <input className="input" placeholder="e.g. Jane Mwangi" value={form.name} onChange={e => upd("name", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email Address</label>
            <input className="input" type="email" placeholder="staff@university.edu" value={form.email} onChange={e => upd("email", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Temporary Password
              <span className="ml-1 font-normal" style={{ color: "var(--text-muted)", opacity: 0.7 }}>(staff should change on first login)</span>
            </label>
            <div style={{ position: "relative" }}>
              <input className="input" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                value={form.password} onChange={e => upd("password", e.target.value)} style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
                {showPass ? <IcEyeOff /> : <IcEye />}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Confirm deactivate/reactivate Modal ── */}
      <Modal
        open={!!confirmId}
        onClose={() => { setConfirmId(null); setConfirmAction(null); }}
        title={confirmAction === "deactivate" ? "Deactivate Account" : "Reactivate Account"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setConfirmId(null); setConfirmAction(null); }}>Cancel</button>
            <button
              onClick={handleConfirm}
              className="btn-primary"
              style={confirmAction === "deactivate" ? { background: "#d34053", borderColor: "#d34053" } : {}}>
              {confirmAction === "deactivate" ? "Yes, Deactivate" : "Yes, Reactivate"}
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {confirmAction === "deactivate"
            ? "This will prevent the staff member from logging in. You can reactivate them later."
            : "This will restore the staff member's access to the system."}
        </p>
      </Modal>

    </div>
  );
}