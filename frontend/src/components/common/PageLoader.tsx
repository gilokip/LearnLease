export default function PageLoader() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#3b5bfc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
          </svg>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b5bfc", opacity: 0.3, animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes dot { 0%,80%,100%{opacity:0.3;transform:scale(1)} 40%{opacity:1;transform:scale(1.2)} }
      `}</style>
    </div>
  );
}
