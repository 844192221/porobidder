import { Button, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { auctionPanelStyle } from '../../lib/auctionLayout';
import { tokens } from '../../theme/tokens';
import type { RoomView } from '../../types/auction';

const { Text } = Typography;

type AuctionBidPanelProps = {
  roomView: RoomView;
  bidAmount: number | null;
  canBid: boolean;
  onBidAmountChange: (value: number | null) => void;
  onSubmitBid: () => void;
};

export function AuctionBidPanel({
  roomView,
  bidAmount,
  canBid,
  onBidAmountChange,
  onSubmitBid,
}: AuctionBidPanelProps) {
  const { t } = useTranslation();
  const minBid =
    roomView.phase === 'encore' ? 0 : Math.max(1, roomView.currentPlayer?.basePrice ?? 1);

  const hint = roomView.myBidSubmitted
    ? t('auction.bidSubmitted')
    : !roomView.auctionStarted
      ? t('auction.bidHintWaiting')
      : roomView.roundResult
        ? t('auction.bidHintReveal')
        : canBid
          ? t('auction.bidHintLive', {
              min: minBid,
              money: roomView.myMoney,
            })
          : t('auction.bidHintDisabled');

  return (
    <div
      style={{
        ...auctionPanelStyle(),
        padding: '16px 0',
        opacity: canBid ? 1 : 0.72,
      }}
    >
      <Text
        strong
        style={{
          display: 'block',
          marginBottom: 12,
          paddingInline: 16,
          fontSize: tokens.font.size.md,
        }}
      >
        {t('auction.yourBid')}
      </Text>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 10,
          alignItems: 'stretch',
          paddingInline: 16,
        }}
      >
        <InputNumber
          min={minBid}
          max={roomView.myMoney}
          value={bidAmount}
          onChange={onBidAmountChange}
          disabled={!canBid}
          style={{ width: '100%', height: 36 }}
          size="middle"
        />
        <Button type="primary" disabled={!canBid} onClick={onSubmitBid} style={{ height: 36 }}>
          {t('auction.submitBid')}
        </Button>
      </div>
      <Text
        type="secondary"
        style={{
          display: 'block',
          marginTop: 10,
          paddingInline: 16,
          fontSize: tokens.font.size.sm,
        }}
      >
        {hint}
      </Text>
    </div>
  );
}
