import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children, message }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        Checking login...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: message || "" }}
      />
    );
  }

  return children;
}
