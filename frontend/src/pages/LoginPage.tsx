import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import Logo from "@components/ui/Logo";

const IcEye    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    try {
      await new Promise<void>((res, rej) =>
        login({ email, password }, { onSuccess: () => res(), onError: (err: any) => rej(err) })
      );
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid email or password.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex" }}>
      {/* Left panel — branding */}
      <div style={{
        width: "42%", background: "#3b5bfc", flexShrink: 0, display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "48px 48px 40px",
      }} className="login-left">
        <Logo height={32} dark />
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 700, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
            Access quality devices<br />on your terms.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0 }}>
            UniLease gives every Kenyan university student a path to a reliable laptop — no lump-sum purchase required.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
            {["Affordable monthly plans","Approved in under 48 hours","Full device support included"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>✓</div>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>© {new Date().getFullYear()} UniLease</p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo (hidden on desktop) */}
          <div className="login-mobile-logo" style={{ display: "none", marginBottom: 32 }}>
            <Logo height={30} />
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 32px" }}>
            Sign in to your UniLease account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "11px 14px", fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div>
              <label className="form-label">University Email</label>
              <input className="input" type="email" placeholder="you@university.edu"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "#3b5bfc", textDecoration: "none" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}>
                  {showPass ? <IcEyeOff /> : <IcEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }} disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 28 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#3b5bfc", fontWeight: 600, textDecoration: "none" }}>Register</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .login-left       { display: none !important; }
          .login-mobile-logo{ display: block !important; }
        }
      `}</style>
    </div>
  );
}
