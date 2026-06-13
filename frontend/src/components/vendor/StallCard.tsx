import { Button, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getActivePlayers } from '../../lib/vendorStallHelpers';
import type { VendorStall } from '../../types/vendor';
import { InviteCodeDisplay } from './InviteCodeDisplay';
import { PanelCard } from '../ui/PanelCard';
import { tokens } from '../../theme/tokens';

const { Paragraph, Text } = Typography;

type StallCardProps = {
  stall: VendorStall;
};

export function StallCard({ stall }: StallCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusLabel = stall.isOpen ? t('vendor.stallOpen') : t('vendor.stallClosed');

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
            <Tag color={stall.isOpen ? 'processing' : 'default'} style={{ margin: 0 }}>
              {statusLabel}
            </Tag>
          </div>
          <Paragraph style={{ marginBottom: tokens.spacing.xs, color: tokens.color.text.secondary }}>
            {t('vendor.stallMeta', {
              budget: stall.startingBudget,
              teamSize: stall.teamSize,
              managers: stall.managerCount,
              players: getActivePlayers(stall.players).length,
            })}
          </Paragraph>
          {stall.isOpen && stall.inviteCode ? (
            <InviteCodeDisplay inviteCode={stall.inviteCode} compact />
          ) : null}
        </div>
        <Button
          size="large"
          onClick={() => navigate(`/vendor/stalls/${stall.stallId}`)}
          style={{ flexShrink: 0 }}
        >
          {t('vendor.settings')}
        </Button>
      </div>
    </PanelCard>
  );
}
