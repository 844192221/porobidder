import { Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PanelCard } from '../components/ui/PanelCard';
import { useVendorAuth } from '../stores/VendorAuthContext';
import { tokens } from '../theme/tokens';

const { Paragraph, Link: TextLink } = Typography;

type Mode = 'login' | 'register';

function mapVendorError(message: string, t: (key: string) => string): string {
  switch (message) {
    case 'VENDOR_ID_REQUIRED':
    case '主办 ID 不能为空。':
      return t('vendor.vendorIdRequired');
    case 'PASSWORD_REQUIRED':
    case '密码不能为空。':
      return t('vendor.passwordRequired');
    case 'EMAIL_REQUIRED':
    case '邮箱不能为空。':
      return t('vendor.emailRequired');
    case 'VENDOR_EXISTS':
    case '该主办 ID 已注册。':
      return t('vendor.vendorExists');
    case 'EMAIL_EXISTS':
    case '该邮箱已被注册。':
      return t('vendor.emailExists');
    case 'VENDOR_AUTH_FAILED':
    case '主办 ID 或密码不正确。':
      return t('vendor.authFailed');
    case '邮箱格式不正确。':
      return t('vendor.emailInvalid');
    default:
      if (message.startsWith('密码长度至少为')) {
        return t('vendor.passwordTooShort');
      }
      if (message.startsWith('主办 ID 长度需要在')) {
        return t('vendor.vendorIdInvalid');
      }
      if (message === '主办 ID 仅支持字母、数字和下划线。') {
        return t('vendor.vendorIdInvalid');
      }
      return message || t('vendor.authFailed');
  }
}

export function VendorLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useVendorAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [vendorId, setVendorId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/vendor';
  const trimmed = vendorId.trim();

  const handleSubmit = async () => {
    if (!trimmed) {
      setError(t('vendor.vendorIdRequired'));
      return;
    }
    if (!password) {
      setError(t('vendor.passwordRequired'));
      return;
    }
    if (mode === 'register' && !email.trim()) {
      setError(t('vendor.emailRequired'));
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError(t('vendor.passwordMismatch'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await register(trimmed, password, email.trim());
      } else {
        await login(trimmed, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'VENDOR_AUTH_FAILED';
      setError(mapVendorError(message, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: tokens.layout.panelMaxWidth, margin: '0 auto' }}>
      <PanelCard variant="inset">
        <Eyebrow>{t('vendor.loginEyebrow')}</Eyebrow>
        <Paragraph
          style={{
            margin: `${tokens.spacing.sm}px 0 ${tokens.spacing.lg}px`,
            color: tokens.color.text.secondary,
          }}
        >
          {mode === 'register' ? t('vendor.registerHint') : t('vendor.loginHint')}
        </Paragraph>

        <Form layout="vertical" onFinish={() => void handleSubmit()}>
          <Form.Item label={t('vendor.vendorIdLabel')} style={{ marginBottom: tokens.spacing.md }}>
            <Input
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              placeholder={t('vendor.vendorIdPlaceholder')}
              autoComplete="username"
              autoFocus
              size="large"
            />
          </Form.Item>
          {mode === 'register' ? (
            <Form.Item label={t('vendor.emailLabel')} style={{ marginBottom: tokens.spacing.md }}>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('vendor.emailPlaceholder')}
                autoComplete="email"
                type="email"
                size="large"
              />
            </Form.Item>
          ) : null}
          <Form.Item label={t('vendor.passwordLabel')} style={{ marginBottom: tokens.spacing.md }}>
            <Input.Password
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('vendor.passwordPlaceholder')}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              size="large"
            />
          </Form.Item>
          {mode === 'register' ? (
            <Form.Item
              label={t('vendor.confirmPasswordLabel')}
              style={{ marginBottom: tokens.spacing.md }}
            >
              <Input.Password
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t('vendor.confirmPasswordPlaceholder')}
                autoComplete="new-password"
                size="large"
              />
            </Form.Item>
          ) : null}
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
            {mode === 'register' ? t('vendor.register') : t('vendor.enter')}
          </Button>
        </Form>

        <Paragraph style={{ marginTop: tokens.spacing.md, marginBottom: 0, textAlign: 'center' }}>
          {mode === 'register' ? t('vendor.hasAccount') : t('vendor.noAccount')}{' '}
          <TextLink
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
              setConfirmPassword('');
              setEmail('');
            }}
          >
            {mode === 'register' ? t('vendor.switchToLogin') : t('vendor.switchToRegister')}
          </TextLink>
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: tokens.spacing.md }}>
          <Button type="link" onClick={() => navigate('/enter')}>
            {t('common.back')}
          </Button>
        </div>
      </PanelCard>
    </div>
  );
}
