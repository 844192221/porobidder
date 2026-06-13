import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { VendorLayout } from '../components/layout/VendorLayout';
import { GuestRoute, ProtectedRoute } from '../components/routing/ProtectedRoute';
import { VendorGuestRoute, VendorProtectedRoute } from '../components/routing/VendorRoute';
import { ManagerLoginPage } from '../pages/ManagerLoginPage';
import { ManagerAuctionPage } from '../pages/ManagerAuctionPage';
import { ManagerMarketPage } from '../pages/ManagerMarketPage';
import { RoleSelectPage } from '../pages/RoleSelectPage';
import { VendorDashboardPage } from '../pages/VendorDashboardPage';
import { VendorLoginPage } from '../pages/VendorLoginPage';
import { VendorStallCreatePage } from '../pages/VendorStallCreatePage';
import { VendorStallCreatePlayersPage } from '../pages/VendorStallCreatePlayersPage';
import { VendorStallSettingsPage } from '../pages/VendorStallSettingsPage';
import { WelcomePage } from '../pages/WelcomePage';
import { AuthProvider } from '../stores/AuthContext';
import { VendorAuthProvider } from '../stores/VendorAuthContext';
import { AppProviders } from './providers';

export function App() {
  return (
    <AuthProvider>
      <VendorAuthProvider>
        <AppProviders>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<WelcomePage />} />
                <Route path="enter" element={<RoleSelectPage />} />
                <Route element={<GuestRoute />}>
                  <Route path="manager/login" element={<ManagerLoginPage />} />
                </Route>
                <Route element={<VendorGuestRoute />}>
                  <Route path="vendor/login" element={<VendorLoginPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="manager" element={<ManagerMarketPage />} />
                  <Route path="manager/stalls/:stallId/auction" element={<ManagerAuctionPage />} />
                </Route>
              </Route>

              <Route element={<VendorProtectedRoute />}>
                <Route element={<VendorLayout />}>
                  <Route path="vendor" element={<VendorDashboardPage />} />
                  <Route path="vendor/stalls/new/players" element={<VendorStallCreatePlayersPage />} />
                  <Route path="vendor/stalls/new" element={<VendorStallCreatePage />} />
                  <Route path="vendor/stalls/:stallId" element={<VendorStallSettingsPage />} />
                </Route>
              </Route>

              <Route path="market" element={<Navigate to="/manager" replace />} />
              <Route path="login" element={<Navigate to="/enter" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProviders>
      </VendorAuthProvider>
    </AuthProvider>
  );
}
