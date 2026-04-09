import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import Logo from "@components/ui/Logo";
import type { Role } from "@types/index";

const IcEye    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

// Role definitions with SVG icons (no emoji)
const ROLES: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "student", label: "Student", desc: "Lease a laptop",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    value: "admin", label: "Admin", desc: "Manage the system",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    value: "inventory", label: "Inventory", desc: "Manage devices",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>,
  },
  {
    value: "finance", label: "Finance", desc: "Handle billing",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
];

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "student" as Role, studentId: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password !== form.confirm)               { setError("Passwords do not match."); return; }
    if (form.password.length < 8)                     { setError("Password must be at least 8 characters."); return; }
    try {
      await new Promise<void>((res, rej) =>
        registerUser(
          { name: form.name, email: form.email, password: form.password, role: form.role, studentId: form.studentId || undefined },
          { onSuccess: () => res(), onError: (err: any) => rej(err) }
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <Logo height={30} />
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", textAlign: "center" }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 28px", textAlign: "center" }}>
          Join UniLease and start your lease journey
        </p>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "11px 14px", fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="form-label">Select your role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => upd("role", r.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      border: form.role === r.value ? "2px solid #3b5bfc" : "1px solid #e5e7eb",
                      background: form.role === r.value ? "#eff2ff" : "#fafafa",
                      transition: "all 0.12s", textAlign: "left",
                    }}>
                    <span style={{ color: form.role === r.value ? "#3b5bfc" : "#6b7280", flexShrink: 0 }}>{r.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: form.role === r.value ? "#3b5bfc" : "#0f172a", margin: 0 }}>{r.label}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input className="input" placeholder="e.g. Amina Wanjiku" value={form.name} onChange={e => upd("name", e.target.value)} />
            </div>

            {form.role === "student" && (
              <div>
                <label className="form-label">Student ID <span style={{ color: "#9ca3af", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input className="input" placeholder="e.g. 2024-00001" value={form.studentId} onChange={e => upd("studentId", e.target.value)} />
              </div>
            )}

            <div>
              <label className="form-label">University Email</label>
              <input className="input" type="email" placeholder="you@university.edu" value={form.email} onChange={e => upd("email", e.target.value)} />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => upd("password", e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}>
                  {showPass ? <IcEyeOff /> : <IcEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => upd("confirm", e.target.value)} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }} disabled={isRegistering}>
              {isRegistering ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 24 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#3b5bfc", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
