import { useState } from "react";
import { useAuthStore } from "@store/authStore";
import { useMutation } from "@tanstack/react-query";
import { userService } from "@services/userService";
import { authService } from "@services/authService";
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS } from "@utils/constants";
import toast from "react-hot-toast";
import type { Role } from "@types/index";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName]           = useState(user?.name ?? "");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [curPass, setCurPass]     = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: () => userService.update(user!.id, { name, email }),
    onSuccess: (updated) => { updateUser({ name: updated.name, email: updated.email }); toast.success("Profile updated."); },
    onError:   () => toast.error("Failed to update profile."),
  });

  const { mutate: changePassword, isPending: changingPass } = useMutation({
    mutationFn: () => authService.changePassword(curPass, newPass),
    onSuccess: () => { toast.success("Password changed."); setCurPass(""); setNewPass(""); setConfirmPass(""); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to change password."),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { toast.error("New passwords do not match."); return; }
    if (newPass.length < 8)     { toast.error("Password must be at least 8 characters."); return; }
    changePassword();
  };

  const accentColor = user?.role ? ROLE_COLORS[user.role as Role] : "#3b5bfc";

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View and update your account details</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background:`linear-gradient(135deg,${accentColor},#a78bfa)` }}>
          {user?.name?.[0] ?? "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-display font-bold truncate">{user?.name}</h3>
          <p className="text-sm text-bodydark2 truncate">{user?.email}</p>
          {user?.role && (
            <span className="badge mt-2 capitalize" style={{ background:`${accentColor}20`, color:accentColor, border:`1px solid ${accentColor}40` }}>
              {ROLE_ICONS[user.role as Role]} {ROLE_LABELS[user.role as Role]}
            </span>
          )}
        </div>
        {user?.studentId && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-bodydark2">Student ID</p>
            <p className="font-mono text-sm font-semibold mt-0.5">{user.studentId}</p>
          </div>
        )}
      </div>

      {/* Edit profile */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold">Personal Information</h3>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Full Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Email Address</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Role</label>
          <input className="input opacity-60 cursor-not-allowed" value={user?.role ? ROLE_LABELS[user.role as Role] : ""} disabled />
          <p className="text-xs text-bodydark2 mt-1">Role cannot be changed. Contact admin if needed.</p>
        </div>
        <button className="btn-primary" disabled={saving} onClick={() => saveProfile()}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-display font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">Current Password</label>
            <input className="input" type="password" placeholder="••••••••" value={curPass} onChange={e => setCurPass(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">New Password</label>
            <input className="input" type="password" placeholder="min 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">Confirm New Password</label>
            <input className="input" type="password" placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={changingPass || !curPass || !newPass}>
            {changingPass ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
