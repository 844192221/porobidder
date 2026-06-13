import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../theme/tokens';

const { Text } = Typography;

type RemainingFundsBarProps = {
  money: number;
};

export function RemainingFundsBar({ money }: RemainingFundsBarProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        border: `${tokens.border.width}px solid ${tokens.border.color}`,
        borderRadius: tokens.radius.md,
        background: tokens.color.surface.inset,
        padding: '9px 10px',
        marginBottom: tokens.spacing.sm + 2,
      }}
    >
      <Text style={{ fontSize: tokens.font.size.md, color: tokens.color.text.secondary }}>
        {t('auction.remainingFundsLabel')}
      </Text>
      <Text
        strong
        style={{
          fontFamily: tokens.font.familyData,
          fontSize: tokens.font.size.lg,
          color: tokens.color.brand.primary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {money}
        {t('auction.moneyUnit')}
      </Text>
    </div>
  );
}
