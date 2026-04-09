import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@components/ui/Logo";

// ── Inline SVG icons ──────────────────────────────────────────
const Ic = {
  Laptop:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>,
  Calendar:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Card:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Tool:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  Headphones: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Chart:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Check:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b5bfc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Arrow:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Menu:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── Data ──────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Ic.Laptop,     title: "Wide Device Selection",  desc: "MacBooks, ThinkPads, Dell XPS and more — available across all campus pickup centres." },
  { Icon: Ic.Calendar,   title: "Flexible Lease Plans",   desc: "Semester, annual, or monthly options built around your academic calendar and budget." },
  { Icon: Ic.Card,       title: "Transparent Billing",    desc: "Automated monthly invoices, clear payment schedules, and a full payment history." },
  { Icon: Ic.Tool,       title: "Maintenance Support",    desc: "Device issues are handled by our inventory team with fast turnarounds." },
  { Icon: Ic.Headphones, title: "Student Support",        desc: "Open a ticket anytime. Our staff responds within one business day, guaranteed." },
  { Icon: Ic.Chart,      title: "Admin Dashboard",        desc: "Full visibility for administrators — approvals, reports, inventory, and audit logs." },
];

const STEPS = [
  { n: "01", title: "Create your account",  desc: "Register as a student and log in to the UniLease portal in under two minutes." },
  { n: "02", title: "Browse & apply",       desc: "Find an available device and submit a lease application for admin review." },
  { n: "03", title: "Pick up your device",  desc: "Once approved, collect your laptop from your assigned campus centre." },
  { n: "04", title: "Pay & track monthly",  desc: "Automated payment reminders, invoice history, and real-time lease progress." },
];

const STATS = [
  { value: "2,400+", label: "Active Leases" },
  { value: "98%",    label: "Platform Uptime" },
  { value: "15+",    label: "Device Models" },
  { value: "4",      label: "Campus Locations" },
];

const TESTIMONIALS = [
  { quote: "Before UniLease I was sharing a laptop with two housemates. Now I have my own device and I've never submitted an assignment late.", name: "Amina W.", role: "3rd Year, Computer Science" },
  { quote: "The application took five minutes. Two days later I had an approved MacBook. I honestly didn't believe it would be that straightforward.", name: "Brian O.", role: "2nd Year, Business Administration" },
  { quote: "As a finance officer, the automated payment sweep alone saves me hours every month. Everything is auditable.", name: "Carol N.", role: "Finance Office" },
];

// ── Scroll-reveal hook ────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Shared style tokens ───────────────────────────────────────
const S = {
  accent:     "#3b5bfc",
  accentBg:   "#eff2ff",
  border:     "#e5e7eb",
  text:       "#0f172a",
  muted:      "#6b7280",
  bg:         "#ffffff",
  surface:    "#f8fafc",
  radius:     12,
  fontSans:   "'DM Sans', system-ui, sans-serif",
  fontDisplay:"'Space Grotesk', sans-serif",
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { href: "#features",     label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <div style={{ fontFamily: S.fontSans, color: S.text, background: S.bg, overflowX: "hidden" }}>

      {/* ── Navbar — sticky + freezes on scroll ─────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? S.border : "transparent"}`,
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo height={30} />

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="ld-nav-links">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 500, color: S.muted, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none", padding: "8px 16px", borderRadius: 8, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = S.surface)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              Sign In
            </Link>
            <Link to="/register" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: S.accent, textDecoration: "none", padding: "9px 20px", borderRadius: 8, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2f4ce8")}
              onMouseLeave={e => (e.currentTarget.style.background = S.accent)}>
              Get Started
            </Link>
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="ld-hamburger"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#374151", padding: 4, alignItems: "center", justifyContent: "center" }}>
              {menuOpen ? <Ic.Close /> : <Ic.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: S.bg, borderTop: `1px solid ${S.border}`, padding: "12px 24px 20px" }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "11px 0", fontSize: 15, fontWeight: 500, color: "#374151", textDecoration: "none", borderBottom: `1px solid ${S.surface}` }}>
                {l.label}
              </a>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Link to="/login" style={{ flex: 1, textAlign: "center", padding: 11, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none" }}>Sign In</Link>
              <Link to="/register" style={{ flex: 1, textAlign: "center", padding: 11, background: S.accent, borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 24px 72px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="ld-hero">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: S.accentBg, color: S.accent, borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent, flexShrink: 0 }} />
            University Laptop Lease Portal
          </div>
          <h1 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.14, color: S.text, margin: "0 0 20px" }}>
            Every student<br />deserves a<br />
            <span style={{ color: S.accent }}>working laptop.</span>
          </h1>
          <p style={{ fontSize: 17, color: S.muted, lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
            UniLease makes it possible — affordable monthly leases, managed entirely online, for university students across Kenya.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: S.accent, color: "#fff", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 15, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2f4ce8")}
              onMouseLeave={e => (e.currentTarget.style.background = S.accent)}>
              Start Leasing <Ic.Arrow />
            </Link>
            <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#374151", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 500, fontSize: 15, border: `1px solid ${S.border}`, transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = S.accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}>
              How it works
            </a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {["No upfront purchase", "Cancel anytime", "Same-day pickup"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
                <Ic.Check />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 320 }}>
            <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, boxShadow: "0 20px 48px rgba(0,0,0,0.09), 0 4px 12px rgba(59,91,252,0.08)", animation: "floatCard 5s ease-in-out infinite" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: S.accentBg, display: "flex", alignItems: "center", justifyContent: "center", color: S.accent }}>
                    <Ic.Laptop />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>MacBook Pro 14″</p>
                    <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>M3 · 16GB · 512GB</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "3px 10px", borderRadius: 99 }}>Active</span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: S.muted, marginBottom: 7 }}>
                  <span>Lease progress</span><span style={{ fontWeight: 600, color: S.text }}>64%</span>
                </div>
                <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: "64%", height: "100%", background: S.accent, borderRadius: 99 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[["Monthly","KES 4,500"],["Next Due","Apr 1"],["Ends","Jun 15"]].map(([l,v]) => (
                  <div key={l} style={{ background: S.surface, borderRadius: 8, padding: "9px 10px" }}>
                    <p style={{ fontSize: 10, color: S.muted, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Badge */}
            <div style={{ position: "absolute", bottom: -18, left: -18, background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: "9px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 10, animation: "floatCard 5s ease-in-out infinite 0.9s" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", fontSize: 14 }}>✓</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>Application approved</p>
                <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>Ready for pickup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, background: S.surface }}>
        <Reveal>
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "44px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }} className="ld-stats">
            {STATS.map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: S.fontDisplay, fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 700, color: S.accent, margin: "0 0 4px" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.accent, margin: "0 0 10px" }}>Platform Features</p>
            <h2 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 700, margin: "0 0 14px" }}>One platform. Every role.</h2>
            <p style={{ fontSize: 16, color: S.muted, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Built for students, admins, inventory managers, and finance teams.
            </p>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }} className="ld-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div style={{ padding: "28px 26px", border: `1px solid ${S.border}`, cursor: "default", transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafbff"; (e.currentTarget as HTMLElement).style.borderColor = S.accent; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = S.border; }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: S.accentBg, color: S.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <f.Icon />
                </div>
                <h3 style={{ fontFamily: S.fontDisplay, fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: S.surface, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.accent, margin: "0 0 10px" }}>Process</p>
              <h2 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 700, margin: "0 0 14px" }}>Up and running in four steps</h2>
              <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.7, margin: 0 }}>From registration to device pickup typically takes under 48 hours.</p>
            </div>
          </Reveal>
          <div>
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 70}>
                <div style={{ display: "flex", gap: 28, padding: "28px 0", borderBottom: i < STEPS.length - 1 ? `1px solid ${S.border}` : "none", alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, border: `2px solid ${S.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: S.fontDisplay, fontSize: 12, fontWeight: 700, color: S.accent }}>{step.n}</span>
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <h3 style={{ fontFamily: S.fontDisplay, fontSize: 16, fontWeight: 600, margin: "0 0 7px" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section id="testimonials" style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.accent, margin: "0 0 10px" }}>Testimonials</p>
            <h2 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 700, margin: 0 }}>What students are saying</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ld-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 60}>
              <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 14, padding: "26px 26px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 32, color: "#dde3ff", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 14 }}>"</div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 22px" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 18, borderTop: `1px solid ${S.surface}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: S.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${S.border}`, background: S.surface }}>
        <Reveal>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "88px 24px", textAlign: "center" }}>
            <h2 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: 700, margin: "0 0 14px" }}>Ready to get your laptop?</h2>
            <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.7, marginBottom: 32 }}>
              Join thousands of Kenyan university students who access quality devices through UniLease — no upfront cost, no compromise.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: S.accent, color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15, transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#2f4ce8")}
                onMouseLeave={e => (e.currentTarget.style.background = S.accent)}>
                Create your account <Ic.Arrow />
              </Link>
              <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#374151", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontWeight: 500, fontSize: 15, border: `1px solid ${S.border}`, transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = S.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}>
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${S.border}`, background: S.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Logo height={26} />
          <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>© {new Date().getFullYear()} UniLease. All rights reserved.</p>
        </div>
      </footer>

      {/* ── Responsive styles ─────────────────────────────────── */}
      <style>{`
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; }
        @media (max-width: 900px) {
          .ld-hero        { grid-template-columns: 1fr !important; padding-top: 56px !important; }
          .ld-features    { grid-template-columns: 1fr 1fr !important; }
          .ld-testimonials{ grid-template-columns: 1fr !important; }
          .ld-stats       { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .ld-features    { grid-template-columns: 1fr !important; }
          .ld-nav-links   { display: none !important; }
          .ld-hamburger   { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
