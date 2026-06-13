export type PlayerSnapshot = {
  lotId: string;
  playerId: string;
  position: string;
  position2: string;
  rankLevel: string;
  heroes: string[];
  basePrice: number;
};

export type BidSnapshot = {
  managerId: string;
  amount: number;
};

export type RoundResult = {
  type: string;
  text: string;
  bids: BidSnapshot[];
  playerSnapshot: PlayerSnapshot | null;
};

export type TeamView = {
  managerId: string;
  money: number;
  players: PlayerSnapshot[];
};

export type RoomView = {
  stallId: string;
  title: string;
  auctionStarted: boolean;
  finished: boolean;
  finishReason: string | null;
  phase: 'first' | 'encore';
  myManagerId: string;
  myMoney: number;
  teamSize: number;
  managerCount: number;
  presentCount: number;
  joinedCount: number;
  teams: TeamView[];
  roundNumber: number;
  roundEndsAtEpochMs: number;
  roundOpen: boolean;
  myBidSubmitted: boolean;
  roundResult: RoundResult | null;
  lastRoundResult: RoundResult | null;
  currentPlayer: PlayerSnapshot | null;
  queueWaiting: PlayerSnapshot[];
  encoreQueue: PlayerSnapshot[];
  passedPool: PlayerSnapshot[];
  roomStatus: string;
  hint: string;
  closesAtEpochMs: number;
};

export type RoomMessage =
  | { type: 'room'; payload: RoomView }
  | { type: 'error'; message: string }
  | { type: 'closed'; message: string };

export type BidHistoryEntry = {
  round: number;
  result: RoundResult;
};
