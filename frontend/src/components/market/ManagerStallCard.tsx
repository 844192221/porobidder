import { Button, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { getActivePlayers } from '../../lib/vendorStallHelpers';
import type { VendorStall } from '../../types/vendor';
import { PanelCard } from '../ui/PanelCard';
import { tokens } from '../../theme/tokens';

const { Paragraph, Text } = Typography;

type ManagerStallCardProps = {
  stall: VendorStall;
  joined: boolean;
  joining?: boolean;
  onJoin?: () => void;
  onEnter?: () => void;
};

export function ManagerStallCard({ stall, joined, joining, onJoin, onEnter }: ManagerStallCardProps) {
  const { t } = useTranslation();
  const activeCount = getActivePlayers(stall.players).length;

  return (
    <PanelCard>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: tokens.spacing.lg,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              marginBottom: tokens.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            <Text
              strong
              style={{
                fontFamily: tokens.font.familyDisplay,
                fontSize: tokens.font.size.xl,
                color: tokens.color.text.primary,
              }}
            >
              {stall.title}
            </Text>
            <Tag color={joined ? 'success' : 'processing'} style={{ margin: 0 }}>
              {joined ? t('market.statusJoined') : t('market.statusOpen')}
            </Tag>
          </div>
          <Paragraph style={{ marginBottom: tokens.spacing.sm, color: tokens.color.text.secondary }}>
            {joined ? t('manager.stallJoinedDesc') : t('manager.stallOpenDesc')}
          </Paragraph>
          <Text style={{ fontSize: tokens.font.size.sm, color: tokens.color.text.tertiary }}>
            {t('manager.stallMeta', {
              budget: stall.startingBudget,
              teamSize: stall.teamSize,
              players: activeCount,
            })}
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          loading={joining}
          onClick={joined ? onEnter : onJoin}
          style={{ flexShrink: 0 }}
        >
          {joined ? t('market.enterAuction') : t('manager.joinByCode')}
        </Button>
      </div>
    </PanelCard>
  );
}
