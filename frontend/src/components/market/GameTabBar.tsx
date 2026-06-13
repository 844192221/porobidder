import { useTranslation } from 'react-i18next';
import { GAMES, type GameId } from '../../constants/games';
import { tokens } from '../../theme/tokens';

type GameTabBarProps = {
  activeGameId: GameId;
  onChange: (gameId: GameId) => void;
};

export function GameTabBar({ activeGameId, onChange }: GameTabBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="game-lane-bar"
      role="tablist"
      aria-label={t('manager.gameTabsLabel')}
      style={{
        display: 'flex',
        gap: tokens.spacing.sm,
        flexWrap: 'wrap',
      }}
    >
      {GAMES.map((game) => {
        const isActive = game.id === activeGameId;
        return (
          <button
            key={game.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`game-lane-tab${isActive ? ' game-lane-tab--active' : ''}`}
            onClick={() => onChange(game.id)}
          >
            {t(game.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
