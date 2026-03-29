import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fullscreen-state">
        <div className="fullscreen-state__card">
          <div className="eyebrow">Loading</div>
          <h1>Loading dashboard...</h1>
          <p>Checking your saved session and fetching your account details.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
