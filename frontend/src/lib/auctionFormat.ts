export const ROUND_DURATION_SECONDS = 20;

export function formatRoundCountdown(epochMs: number, maxSeconds = ROUND_DURATION_SECONDS): string {
  if (!epochMs) return '--:--';
  const remainingMs = Math.max(0, epochMs - Date.now());
  if (remainingMs <= 0) return '00:00';
  const seconds = Math.min(Math.ceil(remainingMs / 1000), maxSeconds);
  return `00:${String(seconds).padStart(2, '0')}`;
}

export function sortTeamsWithMeFirst<T extends { managerId: string }>(teams: T[], myManagerId: string): T[] {
  return [...teams].sort((a, b) => {
    if (a.managerId === myManagerId) return -1;
    if (b.managerId === myManagerId) return 1;
    return a.managerId.localeCompare(b.managerId);
  });
}

export type MainScreenMode = 'waiting' | 'bidding' | 'result' | 'ended';

export function resolveMainScreenMode(roomView: {
  finished: boolean;
  auctionStarted: boolean;
  roundResult: unknown;
  currentPlayer: unknown;
}): MainScreenMode {
  if (roomView.finished) return 'ended';
  if (roomView.roundResult) return 'result';
  if (roomView.auctionStarted && roomView.currentPlayer) return 'bidding';
  return 'waiting';
}

export function estimateTotalRounds(queueCount: number, encoreCount: number, roundNumber: number): number {
  const remaining = queueCount + encoreCount;
  return Math.max(roundNumber + remaining, roundNumber, 1);
}
