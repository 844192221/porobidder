import { Button, Modal, Spin, Switch, Tabs, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteVendorStall, getVendorStall, updateVendorStall } from '../api/vendorStalls';
import { InviteCodeDisplay } from '../components/vendor/InviteCodeDisplay';
import { PlayerLotsEditor } from '../components/vendor/PlayerLotsEditor';
import { StallRoomForm } from '../components/vendor/StallRoomForm';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { PanelCard } from '../components/ui/PanelCard';
import {
  createEmptyPlayerLot,
  getActivePlayers,
  isPlayerLotComplete,
} from '../lib/vendorStallHelpers';
import { useVendorAuth } from '../stores/VendorAuthContext';
import type { AuctionPlayerLot, StallRoomDraft } from '../types/vendor';
import { tokens } from '../theme/tokens';

const { Paragraph } = Typography;

export function VendorStallSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stallId } = useParams<{ stallId: string }>();
  const { vendor } = useVendorAuth();
  const [room, setRoom] = useState<StallRoomDraft | null>(null);
  const [players, setPlayers] = useState<AuctionPlayerLot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  const load = useCallback(async () => {
    if (!vendor || !stallId) return;
    setLoading(true);
    try {
      const stall = await getVendorStall(vendor.vendorId, stallId);
      if (!stall) {
        message.error(t('vendor.stallNotFound'));
        navigate('/vendor', { replace: true });
        return;
      }
      setRoom({
        roomName: stall.title,
        gameId: stall.gameId,
        managerCount: stall.managerCount,
        teamSize: stall.teamSize,
        startingBudget: stall.startingBudget,
      });
      setPlayers(stall.players.length > 0 ? stall.players : [createEmptyPlayerLot()]);
      setIsOpen(stall.isOpen);
      setInviteCode(stall.inviteCode);
    } finally {
      setLoading(false);
    }
  }, [vendor, stallId, navigate, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!vendor || !stallId || !room) return;

    const roomName = room.roomName.trim();
    if (!roomName) {
      message.warning(t('vendor.roomNameRequired'));
      return;
    }

    const configuredPlayers = players.filter(isPlayerLotComplete);
    if (configuredPlayers.length === 0) {
      message.warning(t('vendor.playersRequired'));
      return;
    }

    if (isOpen && getActivePlayers(players).length === 0) {
      message.warning(t('vendor.activePlayersRequired'));
      return;
    }

    setSaving(true);
    try {
      const updated = await updateVendorStall(vendor.vendorId, stallId, {
        ...room,
        roomName,
        players: players.map((lot) => ({
          ...lot,
          playerId: lot.playerId.trim(),
        })),
        isOpen,
      });
      message.success(t('vendor.stallSaved'));
      if (updated.isOpen && updated.inviteCode) {
        message.info(t('vendor.inviteCodeReady', { code: updated.inviteCode }));
      }
      navigate('/vendor');
    } catch {
      message.error(t('vendor.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDissolve = () => {
    if (!vendor || !stallId || !room) return;

    Modal.confirm({
      title: t('vendor.dissolveConfirmTitle'),
      content: t('vendor.dissolveConfirmBody', { room: room.roomName.trim() || room.roomName }),
      okText: t('vendor.dissolveRoom'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        setDissolving(true);
        try {
          await deleteVendorStall(vendor.vendorId, stallId);
          message.success(t('vendor.stallDissolved'));
          navigate('/vendor');
        } catch {
          message.error(t('vendor.dissolveFailed'));
        } finally {
          setDissolving(false);
        }
      },
    });
  };

  if (loading || !room) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'room',
      label: t('vendor.settingsTabRoom'),
      children: (
        <PanelCard>
          <StallRoomForm values={room} onChange={setRoom} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: tokens.spacing.md,
              paddingTop: tokens.spacing.md,
              borderTop: `${tokens.border.width}px solid ${tokens.color.surface.divider}`,
            }}
          >
            <Paragraph style={{ margin: 0, color: tokens.color.text.secondary }}>
              {t('vendor.isOpenLabel')}
            </Paragraph>
            <Switch
              checked={isOpen}
              onChange={setIsOpen}
              checkedChildren={t('vendor.stallOpen')}
              unCheckedChildren={t('vendor.stallClosed')}
            />
          </div>
          {isOpen && inviteCode ? <InviteCodeDisplay inviteCode={inviteCode} /> : null}
          {isOpen && !inviteCode ? (
            <Paragraph
              style={{
                margin: `${tokens.spacing.md}px 0 0`,
                fontSize: tokens.font.size.sm,
                color: tokens.color.text.tertiary,
              }}
            >
              {t('vendor.inviteCodePending')}
            </Paragraph>
          ) : null}
        </PanelCard>
      ),
    },
    {
      key: 'players',
      label: t('vendor.settingsTabPlayers'),
      children: (
        <PanelCard>
          <PlayerLotsEditor
            players={players}
            onChange={setPlayers}
            showParticipationToggle
          />
        </PanelCard>
      ),
    },
  ];

  return (
    <div
      className="page-enter"
      style={{ maxWidth: tokens.layout.contentMaxWidth, margin: '0 auto', width: '100%' }}
    >
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <DisplayTitle as="h2">{t('vendor.settingsTitle')}</DisplayTitle>
        <Paragraph style={{ margin: `${tokens.spacing.sm}px 0 0`, color: tokens.color.text.secondary }}>
          {t(`games.${room.gameId}`)}
        </Paragraph>
      </div>

      <Tabs items={tabItems} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: tokens.spacing.sm,
          marginTop: tokens.spacing.lg,
        }}
      >
        <Button danger loading={dissolving} onClick={handleDissolve}>
          {t('vendor.dissolveRoom')}
        </Button>
        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          <Button onClick={() => navigate('/vendor')}>{t('common.cancel')}</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            {t('vendor.saveSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
