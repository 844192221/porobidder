import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../theme/tokens';

const { Text } = Typography;

type RosterUsageBarProps = {
  picked: number;
  teamSize: number;
};

export function RosterUsageBar({ picked, teamSize }: RosterUsageBarProps) {
  const { t } = useTranslation();
  const pct = teamSize > 0 ? Math.round((picked / teamSize) * 100) : 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: tokens.font.size.sm, color: tokens.color.text.secondary }}>
          {t('auction.selectedRoster')}
        </Text>
        <Text style={{ fontSize: tokens.font.size.xs, color: tokens.color.text.tertiary }}>
          {picked}/{teamSize}
        </Text>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: tokens.color.surface.divider,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: tokens.color.brand.primary,
            borderRadius: 999,
            transition: 'width 200ms ease',
          }}
        />
      </div>
    </div>
  );
}
