import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { PanelCard } from '../components/ui/PanelCard';
import { useAuth } from '../stores/AuthContext';
import { tokens } from '../theme/tokens';

const { Paragraph } = Typography;

export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-enter" style={{ maxWidth: tokens.layout.panelMaxWidth, margin: '0 auto' }}>
      <PanelCard variant="gold">
        <DisplayTitle>{t('welcome.title')}</DisplayTitle>
        <Paragraph
          style={{
            margin: `${tokens.spacing.md}px 0 ${tokens.spacing.lg}px`,
            fontSize: tokens.font.size.lg,
            lineHeight: tokens.font.lineHeight.relaxed,
            color: tokens.color.text.secondary,
          }}
        >
          {t('welcome.description')}
        </Paragraph>
        <div>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/manager' : '/enter')}
          >
            {t('home.enterMarket')}
          </Button>
        </div>
      </PanelCard>
    </div>
  );
}
