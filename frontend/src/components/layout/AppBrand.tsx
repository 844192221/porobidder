import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme/tokens';

export function AppBrand() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      aria-label={t('app.homeLink')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        padding: 0,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: tokens.font.familyDisplay,
        fontSize: tokens.font.size.lg,
        fontWeight: tokens.font.weight.bold,
        color: tokens.color.text.primary,
        letterSpacing: tokens.font.letterSpacing.display,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: tokens.color.auction.moneyBright,
          boxShadow: `0 0 0 2px ${tokens.color.surface.card}, 0 0 0 3px ${tokens.color.auction.moneyBright}55`,
        }}
      />
      {t('app.name')}
    </button>
  );
}
