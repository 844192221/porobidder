import type { GameId } from '../constants/games';

export type VendorAccount = {
  vendorId: string;
  password: string;
  createdAt: string;
};

export type AuctionPlayerLot = {
  lotId: string;
  playerId: string;
  rank: string;
  position1: string;
  position2: string;
  hero1: string;
  hero2: string;
  hero3: string;
  startingBid: number;
  enabled: boolean;
};

export type VendorStall = {
  stallId: string;
  vendorId: string;
  gameId: GameId;
  title: string;
  managerCount: number;
  teamSize: number;
  startingBudget: number;
  players: AuctionPlayerLot[];
  isOpen: boolean;
  inviteCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StallRoomDraft = {
  roomName: string;
  gameId: GameId;
  managerCount: number;
  teamSize: number;
  startingBudget: number;
};

export type VendorStallInput = StallRoomDraft & {
  players: AuctionPlayerLot[];
  isOpen: boolean;
  inviteCode?: string | null;
};

export type StallJoinRecord = {
  stallId: string;
  managerId: string;
  joinedAt: string;
};
