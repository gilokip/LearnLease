import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 text-center">
      <div>
        <div className="text-8xl mb-6 animate-float inline-block">🔍</div>
        <h1 className="text-6xl font-display font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page not found</h2>
        <p className="text-bodydark2 text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary px-8 py-3 inline-block">← Go to Dashboard</Link>
      </div>
    </div>
  );
}
