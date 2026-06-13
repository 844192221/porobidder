import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { PanelCard } from '../components/ui/PanelCard';
import { tokens } from '../theme/tokens';

const { Paragraph } = Typography;

export function RoleSelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="page-enter"
      style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}
    >
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <DisplayTitle as="h2">{t('roleSelect.title')}</DisplayTitle>
      </div>

      <div className="role-select-grid" style={{ gap: tokens.spacing.md }}>
        <div className="role-option-card role-option-card--manager">
          <PanelCard className="role-option-card__panel">
            <Paragraph
              style={{
                margin: `0 0 ${tokens.spacing.md}px`,
                color: tokens.color.text.secondary,
              }}
            >
              {t('roleSelect.managerHint')}
            </Paragraph>
            <Button
              className="role-option-card__btn"
              size="large"
              block
              onClick={() => navigate('/manager/login')}
            >
              {t('roleSelect.manager')}
            </Button>
          </PanelCard>
        </div>

        <div className="role-option-card role-option-card--vendor">
          <PanelCard className="role-option-card__panel">
            <Paragraph
              style={{
                margin: `0 0 ${tokens.spacing.md}px`,
                color: tokens.color.text.secondary,
              }}
            >
              {t('roleSelect.vendorHint')}
            </Paragraph>
            <Button
              className="role-option-card__btn"
              size="large"
              block
              onClick={() => navigate('/vendor/login')}
            >
              {t('roleSelect.vendor')}
            </Button>
          </PanelCard>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: tokens.spacing.md }}>
        <Button type="link" onClick={() => navigate('/')}>
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
