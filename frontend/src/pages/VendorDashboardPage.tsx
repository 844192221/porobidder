import { Button, Empty, Spin, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { listVendorStalls } from '../api/vendorStalls';
import { GameTabBar } from '../components/market/GameTabBar';
import { StallCard } from '../components/vendor/StallCard';
import { DisplayTitle } from '../components/ui/DisplayTitle';
import { DEFAULT_GAME_ID, GAMES, type GameId } from '../constants/games';
import { useVendorAuth } from '../stores/VendorAuthContext';
import type { VendorStall } from '../types/vendor';
import { tokens } from '../theme/tokens';

export function VendorDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vendor } = useVendorAuth();
  const [allStalls, setAllStalls] = useState<VendorStall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGameId, setActiveGameId] = useState<GameId>(DEFAULT_GAME_ID);

  const load = useCallback(async () => {
    if (!vendor) return;
    setLoading(true);
    try {
      const list = await listVendorStalls(vendor.vendorId);
      setAllStalls(list);
    } catch {
      message.error(t('vendor.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [vendor, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (allStalls.length === 0) return;
    const gamesWithStalls = GAMES.map((game) => game.id).filter((gameId) =>
      allStalls.some((stall) => stall.gameId === gameId),
    );
    if (gamesWithStalls.length === 1) {
      setActiveGameId(gamesWithStalls[0]);
    }
  }, [allStalls]);

  const stalls = useMemo(
    () => allStalls.filter((stall) => stall.gameId === activeGameId),
    [allStalls, activeGameId],
  );

  return (
    <div className="page-enter" style={{ display: 'grid', gap: tokens.spacing.lg }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: tokens.spacing.md,
          flexWrap: 'wrap',
        }}
      >
        <DisplayTitle as="h2">
          {t('vendor.greeting', { name: vendor?.vendorId ?? '' })}
        </DisplayTitle>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate(`/vendor/stalls/new?game=${activeGameId}`)}
        >
          {t('vendor.createStall')}
        </Button>
      </header>

      <GameTabBar activeGameId={activeGameId} onChange={setActiveGameId} />

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
          <Spin size="large" />
        </div>
      ) : stalls.length === 0 ? (
        <Empty
          description={t('vendor.noStallsForGame')}
          style={{
            padding: `${tokens.spacing.xl}px 0`,
            background: tokens.color.surface.card,
            borderRadius: tokens.radius.lg,
            border: `${tokens.border.width}px solid ${tokens.border.color}`,
          }}
        />
      ) : (
        <div style={{ display: 'grid', gap: tokens.spacing.md }}>
          {stalls.map((stall) => (
            <StallCard key={stall.stallId} stall={stall} />
          ))}
        </div>
      )}
    </div>
  );
}
