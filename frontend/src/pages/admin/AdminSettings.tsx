import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    systemName: "UniLease",
    supportEmail: "support@university.edu",
    maxLeasesPerStudent: 1,
    semesterWeeks: 16,
    annualWeeks: 48,
    monthlyWeeks: 4,
    autoOverdueDays: 7,
    allowSelfRegistration: true,
    requireStudentId: true,
    maintenanceMode: false,
  });

  const save = (section: string) => toast.success(`${section} saved successfully.`);

  const upd = (k: string, v: any) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure system-wide settings for UniLease</p>
      </div>

      {/* General */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-base">General</h3>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">System Name</label>
          <input className="input" value={settings.systemName} onChange={e => upd("systemName", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Support Email</label>
          <input className="input" type="email" value={settings.supportEmail} onChange={e => upd("supportEmail", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Max Active Leases per Student</label>
          <input className="input" type="number" min={1} max={5} value={settings.maxLeasesPerStudent} onChange={e => upd("maxLeasesPerStudent", +e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => save("General settings")}>Save General</button>
      </div>

      {/* Lease Plans */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-base">Lease Plan Durations</h3>
        {[
          ["Semester (weeks)", "semesterWeeks"],
          ["Annual (weeks)",   "annualWeeks"],
          ["Monthly (weeks)",  "monthlyWeeks"],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-bodydark2 mb-1.5">{label}</label>
            <input className="input" type="number" min={1} value={(settings as any)[key]} onChange={e => upd(key, +e.target.value)} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Days until overdue sweep</label>
          <input className="input" type="number" min={1} value={settings.autoOverdueDays} onChange={e => upd("autoOverdueDays", +e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => save("Lease settings")}>Save Lease Settings</button>
      </div>

      {/* Toggles */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-base">Access & Registration</h3>
        {[
          ["Allow Self-Registration",  "allowSelfRegistration",  "Let users register without admin invite"],
          ["Require Student ID",       "requireStudentId",       "Students must provide a student ID on sign-up"],
          ["Maintenance Mode",         "maintenanceMode",        "Block all non-admin access to the system"],
        ].map(([label, key, desc]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-bodydark2 mt-0.5">{desc}</p>
            </div>
            <button onClick={() => upd(key, !(settings as any)[key])}
              className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${(settings as any)[key] ? "bg-primary-500" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(settings as any)[key] ? "left-5.5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
        <button className="btn-primary" onClick={() => save("Access settings")}>Save Access Settings</button>
      </div>
    </div>
  );
}
