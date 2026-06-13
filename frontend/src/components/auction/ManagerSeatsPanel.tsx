import { Tag, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auctionLayout, auctionPanelStyle } from '../../lib/auctionLayout';
import { sortTeamsWithMeFirst } from '../../lib/auctionFormat';
import { tokens } from '../../theme/tokens';
import type { RoomView } from '../../types/auction';
import { TruncatedText } from '../ui/TruncatedText';
import { IdChip } from './IdChip';
import { RemainingFundsBar } from './RemainingFundsBar';
import { RosterUsageBar } from './RosterUsageBar';

const { Text } = Typography;

type ManagerSeatsPanelProps = {
  roomView: RoomView;
};

export function ManagerSeatsPanel({ roomView }: ManagerSeatsPanelProps) {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([roomView.myManagerId]),
  );
  const teams = sortTeamsWithMeFirst(roomView.teams, roomView.myManagerId);

  const toggleExpanded = (managerId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(managerId)) {
        next.delete(managerId);
      } else {
        next.add(managerId);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'grid', gap: auctionLayout.seatGap }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <Text strong style={{ fontSize: tokens.font.size.lg, margin: 0 }}>
          {t('auction.managerSeats')}
        </Text>
        <Text type="secondary" style={{ fontSize: tokens.font.size.sm, margin: 0 }}>
          {t('auction.managerSeatsHint')}
        </Text>
      </div>

      {teams.map((team) => {
        const isMe = team.managerId === roomView.myManagerId;
        const expanded = expandedIds.has(team.managerId);

        return (
          <div
            key={team.managerId}
            role="button"
            tabIndex={0}
            onClick={() => toggleExpanded(team.managerId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                toggleExpanded(team.managerId);
              }
            }}
            style={{
              ...auctionPanelStyle(),
              padding: 12,
              cursor: 'pointer',
              background: expanded ? tokens.color.surface.inset : tokens.color.surface.card,
              outline: isMe ? `2px solid ${tokens.color.brand.primary}` : undefined,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                marginBottom: 10,
                minWidth: 0,
              }}
            >
              <TruncatedText
                text={isMe ? `${team.managerId}${t('auction.youSuffix')}` : team.managerId}
                style={{
                  flex: 1,
                  fontSize: tokens.font.size.md,
                  fontWeight: tokens.font.weight.semibold,
                  color: tokens.color.text.primary,
                }}
              />
              {isMe ? (
                <Tag color="processing" style={{ margin: 0, flexShrink: 0 }}>
                  {t('auction.seatCurrent')}
                </Tag>
              ) : null}
              <Text type="secondary" style={{ fontSize: tokens.font.size.xs, flexShrink: 0 }}>
                {expanded ? t('auction.collapseRoster') : t('auction.viewRoster')}
              </Text>
            </div>

            <RemainingFundsBar money={team.money} />
            <RosterUsageBar picked={team.players.length} teamSize={roomView.teamSize} />

            {expanded ? (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: `${tokens.border.width}px solid ${tokens.border.color}`,
                  display: 'grid',
                  gap: auctionLayout.chipGap,
                }}
              >
                {team.players.map((player) => (
                  <IdChip key={player.lotId} id={player.playerId} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
