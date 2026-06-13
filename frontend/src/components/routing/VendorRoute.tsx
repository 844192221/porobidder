import { Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../stores/VendorAuthContext';

export function VendorProtectedRoute() {
  const { isAuthenticated, isReady } = useVendorAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function VendorGuestRoute() {
  const { isAuthenticated, isReady } = useVendorAuth();

  if (!isReady) {
    return (
      <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/vendor" replace />;
  }

  return <Outlet />;
}
