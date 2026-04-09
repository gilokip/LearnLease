import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@services/userService";
import { queryKeys } from "@lib/queryKeys";
import StatusBadge from "@components/ui/StatusBadge";
import { formatDate } from "@utils/format";
import { ROLE_LABELS } from "@utils/constants";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: queryKeys.users({ role: "student", search }),
    queryFn: () => userService.getAll({ role: "student", search }),
  });

  const { mutate: deactivate } = useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.users() }); toast.success("Student deactivated."); },
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage registered student accounts</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-14 bg-white/[0.03] rounded animate-pulse" />)}</div>
        ) : !users?.length ? (
          <div className="p-12 text-center text-bodydark2 text-sm">No students found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Student</th><th>Student ID</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-bodydark2">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-bodydark2">{u.student_id ?? "—"}</td>
                    <td><span className="text-xs font-medium text-bodydark2">{ROLE_LABELS[u.role]}</span></td>
                    <td>
                      <span className={`badge ${u.is_active ? "text-success bg-success/10 border-success/20" : "text-bodydark2 bg-white/5 border-white/10"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-bodydark2 text-sm">{formatDate(u.created_at)}</td>
                    <td>
                      {u.is_active && (
                        <button onClick={() => deactivate(u.id)} className="text-xs text-danger hover:text-red-400 transition-colors">Deactivate</button>
                      )}
                    </td>
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
