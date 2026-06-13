import { Spin } from 'antd';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { tokens } from '../../theme/tokens';

export function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div
        style={{
          minHeight: '40vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/manager/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/manager" replace />;
  }

  return <Outlet />;
}

export function CenteredPage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: tokens.spacing.lg,
        background: tokens.color.surface.page,
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>{children}</div>
    </div>
  );
}
