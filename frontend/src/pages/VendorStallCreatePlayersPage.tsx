import { Button, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { createVendorStall } from '../api/vendorStalls';
import { PlayerLotsEditor } from '../components/vendor/PlayerLotsEditor';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { FormActionBar } from '../components/ui/FormActionBar';
import { PanelCard } from '../components/ui/PanelCard';
import {
  createEmptyPlayerLot,
  isPlayerLotComplete,
} from '../lib/vendorStallHelpers';
import { useVendorAuth } from '../stores/VendorAuthContext';
import type { AuctionPlayerLot, StallRoomDraft } from '../types/vendor';
import { tokens } from '../theme/tokens';

const { Paragraph, Text } = Typography;

type CreatePlayersLocationState = {
  room?: StallRoomDraft;
};

export function VendorStallCreatePlayersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor } = useVendorAuth();
  const room = (location.state as CreatePlayersLocationState | null)?.room;

  const [players, setPlayers] = useState<AuctionPlayerLot[]>([createEmptyPlayerLot()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate('/vendor/stalls/new', { replace: true });
    }
  }, [room, navigate]);

  if (!room) return null;

  const handleCreate = async () => {
    if (!vendor) return;

    const validPlayers = players.filter(isPlayerLotComplete);
    if (validPlayers.length === 0) {
      message.warning(t('vendor.playersRequired'));
      return;
    }

    setSaving(true);
    try {
      await createVendorStall(vendor.vendorId, {
        ...room,
        roomName: room.roomName.trim(),
        players: validPlayers.map((lot) => ({
          ...lot,
          playerId: lot.playerId.trim(),
          enabled: true,
        })),
        isOpen: false,
      });
      message.success(t('vendor.stallCreated'));
      navigate('/vendor');
    } catch {
      message.error(t('vendor.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="page-enter"
      style={{ maxWidth: tokens.layout.contentMaxWidth, margin: '0 auto', width: '100%' }}
    >
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <Text style={{ color: tokens.color.text.tertiary, fontSize: tokens.font.size.sm }}>
          {t('vendor.createStep', { step: 2, total: 2 })}
        </Text>
        <DisplayTitle as="h2">{t('vendor.createStep2Title')}</DisplayTitle>
        <Paragraph style={{ margin: `${tokens.spacing.sm}px 0 0`, color: tokens.color.text.secondary }}>
          {t('vendor.createStep2Hint')}
        </Paragraph>
      </div>

      <PanelCard>
        <PlayerLotsEditor players={players} onChange={setPlayers} />
      </PanelCard>

      <FormActionBar>
        <Button onClick={() => navigate('/vendor/stalls/new', { state: { room } })}>
          {t('vendor.prevStep')}
        </Button>
        <Button type="primary" loading={saving} onClick={() => void handleCreate()}>
          {t('vendor.finishCreate')}
        </Button>
      </FormActionBar>
    </div>
  );
}
