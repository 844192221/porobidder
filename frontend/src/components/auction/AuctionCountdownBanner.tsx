import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { auctionPanelStyle } from '../../lib/auctionLayout';
import { tokens } from '../../theme/tokens';

const { Text } = Typography;

type AuctionCountdownBannerProps = {
  countdown: string;
  visible: boolean;
};

export function AuctionCountdownBanner({ countdown, visible }: AuctionCountdownBannerProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <div
      style={{
        ...auctionPanelStyle({ inset: true }),
        borderLeft: `3px solid ${tokens.color.brand.primary}`,
        padding: '6px 20px 4px',
        textAlign: 'center',
      }}
    >
      <Text type="secondary" style={{ fontSize: tokens.font.size.sm, lineHeight: 1.2 }}>
        {t('auction.countdown')}
      </Text>
      <div
        aria-live="polite"
        style={{
          marginTop: 0,
          fontFamily: tokens.font.familyDisplay,
          fontSize: tokens.font.size.xxl,
          fontWeight: tokens.font.weight.semibold,
          lineHeight: 1,
          letterSpacing: '0.02em',
          color: tokens.color.text.primary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {countdown}
      </div>
    </div>
  );
}
