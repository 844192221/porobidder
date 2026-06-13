import { Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PanelCard } from '../components/ui/PanelCard';
import { useAuth } from '../stores/AuthContext';
import { tokens } from '../theme/tokens';

const { Paragraph } = Typography;

export function ManagerLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/manager';
  const trimmed = userId.trim();

  const handleSubmit = async () => {
    if (!trimmed) {
      setError(t('manager.userIdRequired'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(trimmed);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('manager.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: tokens.layout.panelMaxWidth, margin: '0 auto' }}>
      <PanelCard>
        <Eyebrow>{t('manager.loginEyebrow')}</Eyebrow>
        <Form layout="vertical" onFinish={() => void handleSubmit()} style={{ marginTop: tokens.spacing.md }}>
          <Form.Item label={t('manager.userIdLabel')} style={{ marginBottom: tokens.spacing.md }}>
            <Input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder={t('manager.userIdPlaceholder')}
              autoComplete="off"
              onPressEnter={() => void handleSubmit()}
              autoFocus
              size="large"
            />
          </Form.Item>
          {error ? (
            <Paragraph
              style={{
                marginTop: 0,
                marginBottom: tokens.spacing.md,
                color: tokens.color.semantic.error,
                fontSize: tokens.font.size.sm,
              }}
            >
              {error}
            </Paragraph>
          ) : null}
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {t('manager.enter')}
          </Button>
          <Button type="link" block onClick={() => navigate('/enter')} style={{ marginTop: tokens.spacing.xs }}>
            {t('common.back')}
          </Button>
        </Form>
      </PanelCard>
    </div>
  );
}
