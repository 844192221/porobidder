import type { CSSProperties } from 'react';
import { Divider, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  auctionChipListStyle,
  auctionLayout,
  poolVisibleHeight,
} from '../../lib/auctionLayout';
import { tokens } from '../../theme/tokens';
import type { PlayerSnapshot } from '../../types/auction';
import { TruncatedText } from '../ui/TruncatedText';

const { Text } = Typography;

type AuctionPoolPanelProps = {
  queue: PlayerSnapshot[];
  passed: PlayerSnapshot[];
};

function poolChipStyle(muted?: boolean): CSSProperties {
  return {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    height: auctionLayout.poolChipHeight,
    padding: `0 ${tokens.spacing.sm + 2}px`,
    border: `${tokens.border.width}px solid ${tokens.border.color}`,
    borderRadius: tokens.radius.md,
    background: muted ? tokens.color.surface.inset : tokens.color.surface.card,
    minWidth: 0,
  };
}

function PoolSection({
  title,
  count,
  hint,
  players,
  muted,
  showIndex,
  reservedSlots,
}: {
  title: string;
  count: number;
  hint: string;
  players: PlayerSnapshot[];
  muted?: boolean;
  showIndex?: boolean;
  reservedSlots?: number;
}) {
  const reservedHeight = reservedSlots ? poolVisibleHeight(reservedSlots) : undefined;
  const showList = reservedSlots !== undefined || players.length > 0;

  return (
    <div style={{ display: 'grid', gap: auctionLayout.chipGap }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing.sm }}>
        <Text strong style={{ fontSize: tokens.font.size.lg, margin: 0 }}>
          {title}
        </Text>
        <Text type="secondary" style={{ fontSize: tokens.font.size.sm }}>
          {count}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: tokens.font.size.sm, margin: 0 }}>
        {hint}
      </Text>
      {showList ? (
        <ul
          className={reservedSlots ? 'auction-pool-queue-list' : undefined}
          style={{
            ...auctionChipListStyle(),
            ...(reservedHeight
              ? {
                  minHeight: reservedHeight,
                  maxHeight: reservedHeight,
                  overflowY: 'auto',
                }
              : {
                  overflowY: 'auto',
                  maxHeight: 240,
                }),
          }}
        >
          {players.map((player, index) => (
            <li key={player.lotId} style={poolChipStyle(muted)}>
              {showIndex ? (
                <Text type="secondary" style={{ fontSize: tokens.font.size.xs, flexShrink: 0 }}>
                  #{index + 1}
                </Text>
              ) : null}
              <TruncatedText
                text={player.playerId}
                style={{
                  flex: 1,
                  fontSize: tokens.font.size.sm,
                  fontWeight: tokens.font.weight.semibold,
                  color: muted ? tokens.color.text.secondary : tokens.color.text.primary,
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AuctionPoolPanel({ queue, passed }: AuctionPoolPanelProps) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <PoolSection
        title={t('auction.waitingPool')}
        count={queue.length}
        hint={t('auction.queueHint')}
        players={queue}
        showIndex
        reservedSlots={auctionLayout.queueVisibleSlots}
      />
      <Divider style={{ margin: 0 }} />
      <PoolSection
        title={t('auction.passedPoolTitle')}
        count={passed.length}
        hint={t('auction.passedHint')}
        players={passed}
        muted
      />
    </div>
  );
}
