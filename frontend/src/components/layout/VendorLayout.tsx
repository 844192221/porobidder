import { Button, Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVendorAuth } from '../../stores/VendorAuthContext';
import { tokens } from '../../theme/tokens';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { AppBrand } from './AppBrand';

const { Header, Content } = Layout;

export function VendorLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useVendorAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Layout className="app-canvas" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing.md,
          paddingInline: tokens.spacing.lg,
          borderBottom: `${tokens.border.width}px solid ${tokens.border.color}`,
          height: tokens.layout.headerHeight,
          background: tokens.color.surface.card,
        }}
      >
        <AppBrand />
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
          <LanguageSwitcher />
          <Button onClick={() => void handleLogout()}>{t('vendor.logout')}</Button>
        </div>
      </Header>
      <Content
        style={{
          width: '100%',
          maxWidth: tokens.layout.contentMaxWidth,
          margin: '0 auto',
          padding: `${tokens.spacing.lg}px ${tokens.spacing.lg}px ${tokens.spacing.xxl}px`,
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
