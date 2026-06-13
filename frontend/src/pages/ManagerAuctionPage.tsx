import { Alert, Button, Spin, Tag, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AuctionBidPanel } from '../components/auction/AuctionBidPanel';
import { AuctionCountdownBanner } from '../components/auction/AuctionCountdownBanner';
import { AuctionPlayerStage } from '../components/auction/AuctionPlayerStage';
import { AuctionPoolPanel } from '../components/auction/AuctionPoolPanel';
import { ManagerSeatsPanel } from '../components/auction/ManagerSeatsPanel';
import { PanelCard } from '../components/ui/PanelCard';
import { useAuctionRoom } from '../hooks/useAuctionRoom';
import {
  estimateTotalRounds,
  formatRoundCountdown,
  resolveMainScreenMode,
} from '../lib/auctionFormat';
import { tokens } from '../theme/tokens';
import { auctionLayout } from '../lib/auctionLayout';

const { Paragraph, Text } = Typography;

function statusTag(
  roomView: {
    finished: boolean;
    auctionStarted: boolean;
    roundResult: unknown;
  },
  t: (key: string) => string,
): { color: string; label: string } {
  if (roomView.finished) return { color: 'default', label: t('auction.statusEnded') };
  if (!roomView.auctionStarted) return { color: 'processing', label: t('auction.statusWaiting') };
  if (roomView.roundResult) return { color: 'warning', label: t('auction.statusReveal') };
  return { color: 'success', label: t('auction.statusLive') };
}

export function ManagerAuctionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stallId } = useParams<{ stallId: string }>();
  const handleRoomClosed = useCallback(() => {
    message.info(t('auction.roomClosed'));
    navigate('/manager');
  }, [navigate, t]);
  const { roomView, loading, error, submitBid } = useAuctionRoom(stallId, handleRoomClosed);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('--:--');

  useEffect(() => {
    if (!roomView?.currentPlayer || !roomView.roundOpen || roomView.myBidSubmitted) {
      return;
    }
    const min = roomView.phase === 'encore' ? 0 : Math.max(1, roomView.currentPlayer.basePrice);
    setBidAmount((current) => (current === null ? min : current));
  }, [roomView]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatRoundCountdown(roomView?.roundEndsAtEpochMs ?? 0));
    }, 200);
    return () => window.clearInterval(timer);
  }, [roomView?.roundEndsAtEpochMs]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSubmitBid = () => {
    if (bidAmount === null) {
      message.warning(t('auction.bidRequired'));
      return;
    }
    submitBid(bidAmount);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 280 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!roomView) {
    return (
      <PanelCard>
        <Paragraph>{error || t('auction.loadFailed')}</Paragraph>
        <Button onClick={() => navigate('/manager')}>{t('common.back')}</Button>
      </PanelCard>
    );
  }

  const displayResult = roomView.roundResult ?? (roomView.finished ? roomView.lastRoundResult : null);
  const screenMode = resolveMainScreenMode(roomView);
  const totalRounds = estimateTotalRounds(
    roomView.queueWaiting.length,
    roomView.encoreQueue.length,
    roomView.roundNumber,
  );
  const canBid =
    roomView.auctionStarted &&
    !roomView.finished &&
    roomView.roundOpen &&
    !roomView.myBidSubmitted &&
    Boolean(roomView.currentPlayer);
  const status = statusTag(roomView, t);
  const phaseLabel =
    roomView.phase === 'encore' ? t('auction.phaseEncore') : t('auction.phaseFirst');
  const showCountdown =
    roomView.auctionStarted && !roomView.finished && !roomView.roundResult && roomView.roundOpen;

  return (
    <div className="page-enter" style={{ display: 'grid', gap: tokens.spacing.md }}>
      <PanelCard style={{ padding: '12px 16px' }}>
        <Text strong style={{ display: 'block', fontSize: tokens.font.size.lg, marginBottom: tokens.spacing.sm }}>
          {roomView.title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
          <Tag color={status.color} style={{ margin: 0 }}>
            {status.label}
          </Tag>
          {roomView.auctionStarted && !roomView.finished ? (
            <Text type="secondary" style={{ fontSize: tokens.font.size.sm }}>
              {t('auction.roundProgress', { round: roomView.roundNumber, total: totalRounds })}
            </Text>
          ) : null}
          {roomView.auctionStarted && !roomView.finished ? (
            <>
              <Text type="secondary">·</Text>
              <Text type="secondary" style={{ fontSize: tokens.font.size.sm }}>
                {phaseLabel}
              </Text>
            </>
          ) : null}
          <div style={{ flex: 1 }} />
          <Button onClick={() => navigate('/manager')}>{t('auction.backToMarket')}</Button>
        </div>
      </PanelCard>

      {roomView.finished ? <Alert type="info" showIcon message={t('auction.roomClosing')} /> : null}

      <div className="auction-stage">
        <ManagerSeatsPanel roomView={roomView} />

        <div
          className="auction-center-column"
          style={{ minHeight: auctionLayout.columnMinHeight }}
        >
          <AuctionCountdownBanner countdown={countdown} visible={showCountdown} />
          <AuctionPlayerStage roomView={roomView} mode={screenMode} displayResult={displayResult} />
          <AuctionBidPanel
            roomView={roomView}
            bidAmount={bidAmount}
            canBid={canBid}
            onBidAmountChange={(value) => setBidAmount(value)}
            onSubmitBid={handleSubmitBid}
          />
        </div>

        <div
          className="auction-pool-column"
          style={{ minHeight: auctionLayout.columnMinHeight }}
        >
          <AuctionPoolPanel queue={roomView.queueWaiting} passed={roomView.passedPool} />
        </div>
      </div>
    </div>
  );
}
