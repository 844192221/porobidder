import { Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MainScreenMode } from '../../lib/auctionFormat';
import { auctionPanelStyle, auctionLayout } from '../../lib/auctionLayout';
import { tokens } from '../../theme/tokens';
import type { PlayerSnapshot, RoomView, RoundResult } from '../../types/auction';
import { TruncatedText } from '../ui/TruncatedText';

const { Text, Paragraph } = Typography;

type AuctionPlayerStageProps = {
  roomView: RoomView;
  mode: MainScreenMode;
  displayResult: RoundResult | null;
};

function MetaField({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Text type="secondary" style={{ fontSize: tokens.font.size.sm }}>
        {label}
      </Text>
      <div>
        <Text
          strong
          style={{
            fontSize: tokens.font.size.md,
            color: gold ? tokens.color.auction.moneyBright : tokens.color.text.primary,
          }}
        >
          {value}
        </Text>
      </div>
    </div>
  );
}

function PlayerInfo({ player }: { player: PlayerSnapshot }) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'grid', gap: tokens.spacing.lg, width: '100%' }}>
      <TruncatedText
        text={player.playerId}
        style={{
          fontFamily: tokens.font.familyDisplay,
          fontSize: tokens.font.size.display,
          fontWeight: tokens.font.weight.bold,
          lineHeight: tokens.font.lineHeight.tight,
          color: tokens.color.brand.primary,
          letterSpacing: tokens.font.letterSpacing.display,
        }}
      />
      <div className="auction-player-meta-grid" style={{ gap: tokens.spacing.md }}>
        <MetaField label={t('auction.positionPrimary')} value={player.position || '—'} />
        <MetaField
          label={t('auction.positionSecondary')}
          value={player.position2 || t('auction.noSecondary')}
        />
        <MetaField label={t('auction.rank')} value={player.rankLevel || '—'} />
        <MetaField label={t('auction.basePrice')} value={`${player.basePrice}G`} gold />
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: tokens.font.size.sm }}>
          {t('auction.signatureHeroes')}
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.xs, marginTop: tokens.spacing.xs }}>
          {player.heroes.length > 0 ? (
            player.heroes.map((hero) => (
              <Tag key={hero} style={{ margin: 0 }}>
                {hero}
              </Tag>
            ))
          ) : (
            <Tag style={{ margin: 0 }}>{t('auction.noHeroes')}</Tag>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuctionPlayerStage({ roomView, mode, displayResult }: AuctionPlayerStageProps) {
  const { t } = useTranslation();
  const player = roomView.currentPlayer;
  const isWaiting = mode === 'waiting' || (mode === 'bidding' && !player);
  const isActive = mode === 'bidding' && Boolean(player);
  const isResult = mode === 'result';
  const isEnded = mode === 'ended';

  const waitingStatus =
    !roomView.auctionStarted && !roomView.finished
      ? t('auction.waitingManagers', {
          present: roomView.presentCount,
          total: roomView.managerCount,
        })
      : null;

  const statusText =
    roomView.finished && isEnded
      ? t('auction.auctionEnded')
      : waitingStatus ?? roomView.roomStatus ?? roomView.hint ?? t('auction.waitingStart');

  const pillLabel = isWaiting
    ? t('auction.waitingPlayer')
    : isResult
      ? t('auction.statusReveal')
      : isEnded
        ? t('auction.auctionEnded')
        : t('auction.currentPlayer');

  const pillColor = isResult ? 'warning' : isEnded ? 'default' : 'processing';

  return (
    <div
      style={{
        ...auctionPanelStyle(),
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tag color={pillColor} style={{ margin: '0 0 16px', width: 'fit-content', flexShrink: 0 }}>
        {pillLabel}
      </Tag>

      <div
        className="auction-player-stage-body"
        style={{
          height: auctionLayout.playerStageBodyHeight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {isActive && player ? <PlayerInfo player={player} /> : null}

        {isWaiting ? (
          <div
            style={{
              flex: 1,
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: tokens.spacing.sm,
              textAlign: 'center',
            }}
          >
            <Text strong style={{ fontSize: tokens.font.size.lg }}>
              {statusText}
            </Text>
            <Text type="secondary">{roomView.hint || t('auction.waitingStart')}</Text>
          </div>
        ) : null}

        {isEnded ? (
          <div
            style={{
              flex: 1,
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: tokens.spacing.sm,
              textAlign: 'center',
              paddingInline: tokens.spacing.md,
            }}
          >
            <Text strong style={{ fontSize: tokens.font.size.lg }}>
              {statusText}
            </Text>
            {roomView.finishReason ? (
              <Paragraph style={{ margin: 0, color: tokens.color.text.secondary, textAlign: 'center' }}>
                {roomView.finishReason}
              </Paragraph>
            ) : null}
          </div>
        ) : null}

        {isResult && displayResult ? (
          <div
            style={{
              flex: 1,
              display: 'grid',
              alignContent: 'start',
              gap: tokens.spacing.md,
              paddingTop: tokens.spacing.xl,
            }}
          >
            <Text
              strong
              style={{
                fontSize: tokens.font.size.lg,
                textAlign: 'center',
                lineHeight: 1.35,
              }}
            >
              {displayResult.text}
            </Text>
            {displayResult.bids.length > 0 ? (
              <div
                style={{
                  border: `${tokens.border.width}px solid ${tokens.border.color}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing.md,
                  background: tokens.color.surface.inset,
                }}
              >
                <Text strong style={{ display: 'block', marginBottom: tokens.spacing.sm }}>
                  {t('auction.roundBids')}
                </Text>
                <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
                  {displayResult.bids.map((bid) => (
                    <div
                      key={`${bid.managerId}-${bid.amount}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: tokens.spacing.sm,
                        minWidth: 0,
                      }}
                    >
                      <TruncatedText
                        text={bid.managerId}
                        style={{
                          flex: 1,
                          fontSize: tokens.font.size.md,
                          color: tokens.color.text.primary,
                        }}
                      />
                      <Text strong style={{ flexShrink: 0 }}>
                        {bid.amount}G
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <Text type="secondary" style={{ textAlign: 'center', fontSize: tokens.font.size.sm }}>
              {t('auction.revealAutoAdvance')}
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  );
}
