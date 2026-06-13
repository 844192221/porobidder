import { Button, Typography, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { StallRoomForm } from '../components/vendor/StallRoomForm';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { FormActionBar } from '../components/ui/FormActionBar';
import { PanelCard } from '../components/ui/PanelCard';
import { resolveActivityGame } from '../constants/games';
import { DEFAULT_ROOM_DRAFT } from '../lib/vendorStallHelpers';
import type { StallRoomDraft } from '../types/vendor';
import { tokens } from '../theme/tokens';

const { Paragraph, Text } = Typography;

type CreateRoomLocationState = {
  room?: StallRoomDraft;
};

export function VendorStallCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const defaultGame = resolveActivityGame(searchParams.get('game') ?? undefined);
  const restoredRoom = (location.state as CreateRoomLocationState | null)?.room;

  const [room, setRoom] = useState<StallRoomDraft>(
    restoredRoom ?? {
      ...DEFAULT_ROOM_DRAFT,
      gameId: defaultGame,
    },
  );

  const handleNext = () => {
    if (!room.roomName.trim()) {
      message.warning(t('vendor.roomNameRequired'));
      return;
    }
    if (room.managerCount < 2) {
      message.warning(t('vendor.managerCountMin'));
      return;
    }
    navigate('/vendor/stalls/new/players', { state: { room } });
  };

  return (
    <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <Text style={{ color: tokens.color.text.tertiary, fontSize: tokens.font.size.sm }}>
          {t('vendor.createStep', { step: 1, total: 2 })}
        </Text>
        <DisplayTitle as="h2">{t('vendor.createStallTitle')}</DisplayTitle>
        <Paragraph style={{ margin: `${tokens.spacing.sm}px 0 0`, color: tokens.color.text.secondary }}>
          {t('vendor.createStep1Hint')}
        </Paragraph>
      </div>

      <PanelCard>
        <StallRoomForm values={room} onChange={setRoom} />
      </PanelCard>

      <FormActionBar>
        <Button onClick={() => navigate('/vendor')}>{t('common.cancel')}</Button>
        <Button type="primary" onClick={handleNext}>
          {t('vendor.nextStep')}
        </Button>
      </FormActionBar>
    </div>
  );
}
