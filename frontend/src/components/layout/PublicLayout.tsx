import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { CenteredPage } from '../routing/ProtectedRoute';
import { tokens } from '../../theme/tokens';
import { AppBrand } from './AppBrand';

const { Header } = Layout;

export function PublicLayout() {
  return (
    <Layout className="app-canvas" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: tokens.spacing.lg,
          borderBottom: `${tokens.border.width}px solid ${tokens.border.color}`,
          height: tokens.layout.headerHeight,
          background: tokens.color.surface.card,
        }}
      >
        <AppBrand />
        <LanguageSwitcher />
      </Header>
      <CenteredPage>
        <Outlet />
      </CenteredPage>
    </Layout>
  );
}
