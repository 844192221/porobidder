import { Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VendorStall } from '../../types/vendor';
import { tokens } from '../../theme/tokens';

type InviteCodeModalProps = {
  stall: VendorStall | null;
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (code: string) => void;
};

export function InviteCodeModal({ stall, open, loading, onCancel, onSubmit }: InviteCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');

  useEffect(() => {
    if (open) setCode('');
  }, [open, stall?.stallId]);

  return (
    <Modal
      title={t('manager.inviteCodeModalTitle', { room: stall?.title ?? '' })}
      open={open}
      okText={t('manager.joinByCode')}
      cancelText={t('common.cancel')}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => onSubmit(code.trim())}
      destroyOnClose
    >
      <p style={{ margin: `0 0 ${tokens.spacing.md}px`, color: tokens.color.text.secondary }}>
        {t('manager.inviteCodeModalHint')}
      </p>
      <Input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder={t('manager.inviteCodePlaceholder')}
        maxLength={6}
        autoFocus
        size="large"
        style={{ fontFamily: tokens.font.familyData, letterSpacing: '0.1em' }}
        onPressEnter={() => onSubmit(code.trim())}
      />
    </Modal>
  );
}
