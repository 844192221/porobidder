import { Empty, Spin, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  joinStallByInviteCode,
  listManagerJoinedStalls,
  listOpenStalls,
} from '../api/vendorStalls';
import { GameTabBar } from '../components/market/GameTabBar';
import { InviteCodeModal } from '../components/market/InviteCodeModal';
import { ManagerStallCard } from '../components/market/ManagerStallCard';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { DEFAULT_GAME_ID, type GameId } from '../constants/games';
import { useAuth } from '../stores/AuthContext';
import type { VendorStall } from '../types/vendor';
import { tokens } from '../theme/tokens';

function mapJoinError(code: string, t: (key: string) => string): string {
  switch (code) {
    case 'INVITE_CODE_INVALID':
      return t('manager.inviteCodeInvalid');
    case 'INVITE_CODE_MISMATCH':
      return t('manager.inviteCodeMismatch');
    case 'INVITE_CODE_WRONG_GAME':
      return t('manager.inviteCodeWrongGame');
    case 'ALREADY_JOINED':
      return t('manager.alreadyJoined');
    case 'ROOM_FULL':
      return t('market.roomFull');
    case 'STALL_NO_PLAYERS':
      return t('manager.stallNoPlayers');
    default:
      return t('market.joinFailed');
  }
}

export function ManagerMarketPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openStalls, setOpenStalls] = useState<VendorStall[]>([]);
  const [joinedStalls, setJoinedStalls] = useState<VendorStall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGameId, setActiveGameId] = useState<GameId>(DEFAULT_GAME_ID);
  const [joiningStallId, setJoiningStallId] = useState<string | null>(null);
  const [pendingStall, setPendingStall] = useState<VendorStall | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [open, joined] = await Promise.all([
        listOpenStalls(activeGameId),
        listManagerJoinedStalls(user.userId, activeGameId),
      ]);
      setOpenStalls(open);
      setJoinedStalls(joined);
    } catch {
      message.error(t('market.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [user, activeGameId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const joinedStallIds = useMemo(
    () => new Set(joinedStalls.map((stall) => stall.stallId)),
    [joinedStalls],
  );

  const availableOpenStalls = useMemo(
    () => openStalls.filter((stall) => !joinedStallIds.has(stall.stallId)),
    [openStalls, joinedStallIds],
  );

  const hasContent = joinedStalls.length > 0 || availableOpenStalls.length > 0;

  const handleJoinByCode = async (code: string) => {
    if (!user || !pendingStall) return;
    if (!code) {
      message.warning(t('manager.inviteCodeRequired'));
      return;
    }

    setJoiningStallId(pendingStall.stallId);
    try {
      await joinStallByInviteCode(code, user.userId, activeGameId, pendingStall.stallId);
      message.success(t('market.joined'));
      setPendingStall(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'INVITE_CODE_INVALID';
      message.error(mapJoinError(msg, t));
    } finally {
      setJoiningStallId(null);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'grid', gap: tokens.spacing.lg }}>
      <header>
        <DisplayTitle as="h2">
          {t('manager.greeting', { name: user?.userId ?? '' })}
        </DisplayTitle>
      </header>

      <GameTabBar activeGameId={activeGameId} onChange={setActiveGameId} />

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
          <Spin size="large" />
        </div>
      ) : !hasContent ? (
        <Empty
          description={t('manager.noActivitiesForGame')}
          style={{
            padding: `${tokens.spacing.xl}px 0`,
            background: tokens.color.surface.card,
            borderRadius: tokens.radius.lg,
            border: `${tokens.border.width}px solid ${tokens.border.color}`,
          }}
        />
      ) : (
        <div style={{ display: 'grid', gap: tokens.spacing.md }}>
          {joinedStalls.map((stall) => (
            <ManagerStallCard
              key={stall.stallId}
              stall={stall}
              joined
              onEnter={() => navigate(`/manager/stalls/${stall.stallId}/auction`)}
            />
          ))}
          {availableOpenStalls.map((stall) => (
            <ManagerStallCard
              key={stall.stallId}
              stall={stall}
              joined={false}
              joining={joiningStallId === stall.stallId}
              onJoin={() => setPendingStall(stall)}
            />
          ))}
        </div>
      )}

      <InviteCodeModal
        stall={pendingStall}
        open={pendingStall !== null}
        loading={joiningStallId === pendingStall?.stallId}
        onCancel={() => setPendingStall(null)}
        onSubmit={(code) => void handleJoinByCode(code)}
      />
    </div>
  );
}
