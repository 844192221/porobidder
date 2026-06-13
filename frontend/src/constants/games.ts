export type GameId = 'lol' | 'dota2' | 'cs2';

export type GameDefinition = {
  id: GameId;
  labelKey: string;
};

export const GAMES: GameDefinition[] = [
  { id: 'lol', labelKey: 'games.lol' },
  { id: 'dota2', labelKey: 'games.dota2' },
  { id: 'cs2', labelKey: 'games.cs2' },
];

export const DEFAULT_GAME_ID: GameId = 'lol';

export function resolveActivityGame(gameId?: string): GameId {
  if (gameId === 'dota2' || gameId === 'cs2' || gameId === 'lol') {
    return gameId;
  }
  return DEFAULT_GAME_ID;
}
