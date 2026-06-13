import type { CSSProperties } from 'react';
import { tokens } from '../theme/tokens';
import type { TeamView } from '../types/auction';

/** Section title → content (mock-aligned). */
export const auctionSectionGap = 6;

export const auctionLayout = {
  seatWidth: 220,
  poolWidth: 220,
  chipHeight: 32,
  poolChipHeight: 32,
  chipGap: 6,
  seatGap: 8,
  centerMaxWidth: 560,
  columnMinHeight: 400,
  /** Fixed body below the stage tag — avoids height jump between waiting / bidding / result. */
  playerStageBodyHeight: 280,
  /** 待拍区最少预留可见 ID 行数 */
  queueVisibleSlots: 10,
} as const;

export function poolVisibleHeight(slotCount: number): number {
  const slots = Math.max(1, slotCount);
  return auctionLayout.poolChipHeight * slots + auctionLayout.chipGap * (slots - 1);
}

export function auctionChipListStyle(): CSSProperties {
  return {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: auctionLayout.chipGap,
    alignContent: 'start',
    gridAutoRows: `${auctionLayout.poolChipHeight}px`,
  };
}

export function auctionPanelStyle(options?: { inset?: boolean }): CSSProperties {
  return {
    border: `${tokens.border.width}px solid ${tokens.border.color}`,
    borderRadius: tokens.radius.lg,
    background: options?.inset ? tokens.color.surface.inset : tokens.color.surface.card,
    boxShadow: tokens.shadow.card,
  };
}

export function estimateStartingBudget(teams: TeamView[]): number {
  const totals = teams.map(
    (team) => team.money + team.players.reduce((sum, player) => sum + player.basePrice, 0),
  );
  return Math.max(...totals, 1);
}
