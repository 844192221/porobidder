import { Form, Input, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { GameTabBar } from '../market/GameTabBar';
import type { StallRoomDraft } from '../../types/vendor';
import { tokens } from '../../theme/tokens';

type StallRoomFormProps = {
  values: StallRoomDraft;
  onChange: (values: StallRoomDraft) => void;
};

export function StallRoomForm({ values, onChange }: StallRoomFormProps) {
  const { t } = useTranslation();

  const patch = (partial: Partial<StallRoomDraft>) => onChange({ ...values, ...partial });

  return (
    <Form layout="vertical">
      <Form.Item label={t('vendor.roomNameLabel')} required>
        <Input
          value={values.roomName}
          onChange={(event) => patch({ roomName: event.target.value })}
          placeholder={t('vendor.roomNamePlaceholder')}
          size="large"
        />
      </Form.Item>
      <Form.Item label={t('vendor.gameLabel')} style={{ marginBottom: tokens.spacing.lg }}>
        <GameTabBar activeGameId={values.gameId} onChange={(gameId) => patch({ gameId })} />
      </Form.Item>
      <Form.Item label={t('vendor.managerCountLabel')}>
        <InputNumber
          min={2}
          max={20}
          value={values.managerCount}
          onChange={(value) => patch({ managerCount: value ?? 2 })}
          style={{ width: '100%' }}
          size="large"
        />
      </Form.Item>
      <Form.Item label={t('vendor.startingBudgetLabel')}>
        <InputNumber
          min={1}
          value={values.startingBudget}
          onChange={(value) => patch({ startingBudget: value ?? 80 })}
          addonAfter="G"
          style={{ width: '100%' }}
          size="large"
        />
      </Form.Item>
      <Form.Item label={t('vendor.teamSizeLabel')}>
        <InputNumber
          min={1}
          max={10}
          value={values.teamSize}
          onChange={(value) => patch({ teamSize: value ?? 4 })}
          style={{ width: '100%' }}
          size="large"
        />
      </Form.Item>
    </Form>
  );
}
