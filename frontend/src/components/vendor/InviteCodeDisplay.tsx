import { CopyOutlined } from '@ant-design/icons';
import { Button, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

type InviteCodeDisplayProps = {
  inviteCode: string;
  compact?: boolean;
};

export function InviteCodeDisplay({ inviteCode, compact = false }: InviteCodeDisplayProps) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      message.success(t('vendor.inviteCodeCopied'));
    } catch {
      message.error(t('vendor.inviteCodeCopyFailed'));
    }
  };

  if (compact) {
    return (
      <div className="invite-code invite-code--compact">
        <span className="invite-code__label">{t('vendor.inviteCodeLabel')}</span>
        <span className="invite-code__value">{inviteCode}</span>
        <Button
          type="text"
          size="small"
          className="invite-code__copy"
          icon={<CopyOutlined />}
          onClick={() => void handleCopy()}
          aria-label={t('vendor.copyInviteCode')}
        />
      </div>
    );
  }

  return (
    <div className="invite-code">
      <Paragraph className="invite-code__heading">{t('vendor.inviteCodeLabel')}</Paragraph>
      <div className="invite-code__row">
        <span className="invite-code__value">{inviteCode}</span>
        <Button size="small" icon={<CopyOutlined />} onClick={() => void handleCopy()}>
          {t('vendor.copyInviteCode')}
        </Button>
      </div>
      <Paragraph className="invite-code__hint">{t('vendor.inviteCodeHint')}</Paragraph>
    </div>
  );
}
