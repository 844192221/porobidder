import { DEFAULT_GAME_ID } from '../constants/games';
import type { AuctionPlayerLot, StallRoomDraft, VendorStall } from '../types/vendor';

export const DEFAULT_ROOM_DRAFT: StallRoomDraft = {
  roomName: '',
  gameId: DEFAULT_GAME_ID,
  managerCount: 2,
  teamSize: 4,
  startingBudget: 80,
};

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newLotId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyPlayerLot(): AuctionPlayerLot {
  return {
    lotId: newLotId(),
    playerId: '',
    rank: '',
    position1: '',
    position2: '',
    hero1: '',
    hero2: '',
    hero3: '',
    startingBid: 1,
    enabled: true,
  };
}

export function normalizePlayerLot(raw: AuctionPlayerLot): AuctionPlayerLot {
  return {
    ...raw,
    enabled: raw.enabled ?? true,
  };
}

export function normalizeStall(raw: VendorStall): VendorStall {
  return {
    ...raw,
    managerCount: raw.managerCount ?? 2,
    inviteCode: raw.inviteCode ?? null,
    players: (raw.players ?? []).map((lot) => normalizePlayerLot(lot)),
  };
}

export function isPlayerLotComplete(lot: AuctionPlayerLot): boolean {
  return lot.playerId.trim().length > 0;
}

export function getActivePlayers(players: AuctionPlayerLot[]): AuctionPlayerLot[] {
  return players.filter((lot) => lot.enabled && isPlayerLotComplete(lot));
}

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  }
  return code;
}
