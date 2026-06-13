import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { createEmptyPlayerLot } from '../../lib/vendorStallHelpers';
import type { AuctionPlayerLot } from '../../types/vendor';
import { tokens } from '../../theme/tokens';

type PlayerLotsEditorProps = {
  players: AuctionPlayerLot[];
  onChange: (players: AuctionPlayerLot[]) => void;
  showParticipationToggle?: boolean;
};

type LotField = keyof Pick<
  AuctionPlayerLot,
  'playerId' | 'rank' | 'position1' | 'position2' | 'hero1' | 'hero2' | 'hero3'
>;

const TEXT_FIELDS: { key: LotField; headerKey: string; placeholderKey: string; width: number }[] = [
  { key: 'playerId', headerKey: 'vendor.colPlayerId', placeholderKey: 'vendor.playerIdPlaceholder', width: 96 },
  { key: 'rank', headerKey: 'vendor.colRank', placeholderKey: 'vendor.rankPlaceholder', width: 80 },
  { key: 'position1', headerKey: 'vendor.colPos1', placeholderKey: 'vendor.positionPlaceholder', width: 72 },
  { key: 'position2', headerKey: 'vendor.colPos2', placeholderKey: 'vendor.positionPlaceholder', width: 72 },
  { key: 'hero1', headerKey: 'vendor.colHero1', placeholderKey: 'vendor.heroPlaceholder', width: 80 },
  { key: 'hero2', headerKey: 'vendor.colHero2', placeholderKey: 'vendor.heroPlaceholder', width: 80 },
  { key: 'hero3', headerKey: 'vendor.colHero3', placeholderKey: 'vendor.heroPlaceholder', width: 80 },
];

export function PlayerLotsEditor({
  players,
  onChange,
  showParticipationToggle = false,
}: PlayerLotsEditorProps) {
  const { t } = useTranslation();

  const updateLot = (lotId: string, patch: Partial<AuctionPlayerLot>) => {
    onChange(players.map((lot) => (lot.lotId === lotId ? { ...lot, ...patch } : lot)));
  };

  const addLot = () => {
    onChange([...players, createEmptyPlayerLot()]);
  };

  const removeLot = (lotId: string) => {
    if (players.length <= 1) return;
    onChange(players.filter((lot) => lot.lotId !== lotId));
  };

  return (
    <div className="player-lots-table-wrap">
      {showParticipationToggle ? (
        <p style={{ margin: `0 0 ${tokens.spacing.sm}px`, fontSize: tokens.font.size.sm, color: tokens.color.text.secondary }}>
          {t('vendor.participationHint')}
        </p>
      ) : null}
      <table className="player-lots-table">
        <thead>
          <tr>
            {showParticipationToggle ? (
              <th className="player-lots-table__col-check" title={t('vendor.colParticipate')}>
                {t('vendor.colParticipate')}
              </th>
            ) : null}
            <th className="player-lots-table__col-index">#</th>
            {TEXT_FIELDS.map((field) => (
              <th key={field.key} style={{ minWidth: field.width }}>
                {t(field.headerKey)}
              </th>
            ))}
            <th className="player-lots-table__col-bid" style={{ minWidth: 72 }}>
              {t('vendor.colBid')}
            </th>
            <th className="player-lots-table__col-action" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {players.map((lot, index) => (
            <tr key={lot.lotId} className={showParticipationToggle && !lot.enabled ? 'player-lots-table__row--off' : undefined}>
              {showParticipationToggle ? (
                <td className="player-lots-table__col-check">
                  <Checkbox
                    checked={lot.enabled}
                    onChange={(event) => updateLot(lot.lotId, { enabled: event.target.checked })}
                    aria-label={t('vendor.participatePlayer', { name: lot.playerId || index + 1 })}
                  />
                </td>
              ) : null}
              <td className="player-lots-table__col-index">{index + 1}</td>
              {TEXT_FIELDS.map((field) => (
                <td key={field.key}>
                  <Input
                    size="small"
                    value={lot[field.key]}
                    onChange={(event) => updateLot(lot.lotId, { [field.key]: event.target.value })}
                    placeholder={t(field.placeholderKey)}
                    disabled={showParticipationToggle && !lot.enabled}
                  />
                </td>
              ))}
              <td>
                <InputNumber
                  size="small"
                  min={1}
                  value={lot.startingBid}
                  onChange={(value) => updateLot(lot.lotId, { startingBid: value ?? 1 })}
                  controls={false}
                  suffix="G"
                  style={{ width: '100%' }}
                  disabled={showParticipationToggle && !lot.enabled}
                />
              </td>
              <td className="player-lots-table__col-action">
                {players.length > 1 ? (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeLot(lot.lotId)}
                    aria-label={t('vendor.removePlayer')}
                  />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        type="dashed"
        block
        size="small"
        icon={<PlusOutlined />}
        onClick={addLot}
        style={{ marginTop: tokens.spacing.sm }}
      >
        {t('vendor.addPlayer')}
      </Button>
    </div>
  );
}
