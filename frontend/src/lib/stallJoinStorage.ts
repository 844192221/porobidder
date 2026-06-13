import type { StallJoinRecord } from '../types/vendor';

const JOINS_KEY = 'porobidder.stall.joins';

function readJoins(): StallJoinRecord[] {
  try {
    const raw = localStorage.getItem(JOINS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StallJoinRecord[];
  } catch {
    return [];
  }
}

function writeJoins(joins: StallJoinRecord[]): void {
  localStorage.setItem(JOINS_KEY, JSON.stringify(joins));
}

export function listStallJoins(stallId: string): StallJoinRecord[] {
  return readJoins().filter((join) => join.stallId === stallId);
}

export function listManagerJoins(managerId: string): StallJoinRecord[] {
  return readJoins().filter((join) => join.managerId === managerId);
}

export function hasManagerJoined(stallId: string, managerId: string): boolean {
  return readJoins().some((join) => join.stallId === stallId && join.managerId === managerId);
}

export function addStallJoin(stallId: string, managerId: string): void {
  if (hasManagerJoined(stallId, managerId)) return;
  const joins = readJoins();
  joins.push({
    stallId,
    managerId,
    joinedAt: new Date().toISOString(),
  });
  writeJoins(joins);
}

export function removeStallJoins(stallId: string): void {
  writeJoins(readJoins().filter((join) => join.stallId !== stallId));
}
