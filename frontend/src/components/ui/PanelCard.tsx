import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '../../theme/tokens';

type PanelVariant = 'default' | 'gold' | 'inset' | 'accent';

type PanelCardProps = {
  children: ReactNode;
  variant?: PanelVariant;
  className?: string;
  style?: CSSProperties;
};

const railColors: Record<PanelVariant, string | null> = {
  default: null,
  gold: tokens.color.auction.moneyBright,
  inset: tokens.color.brand.primary,
  accent: null,
};

const backgrounds: Record<PanelVariant, string> = {
  default: tokens.color.surface.card,
  gold: `linear-gradient(135deg, #fffdf6 0%, ${tokens.color.surface.card} 48%)`,
  inset: tokens.color.surface.inset,
  accent: tokens.color.surface.card,
};

const borders: Record<PanelVariant, string> = {
  default: tokens.border.color,
  gold: tokens.border.color,
  inset: tokens.border.color,
  accent: 'rgba(26, 79, 175, 0.28)',
};

const shadows: Record<PanelVariant, string> = {
  default: tokens.shadow.card,
  gold: tokens.shadow.card,
  inset: tokens.shadow.card,
  accent: tokens.shadow.panel,
};

export function PanelCard({ children, variant = 'default', className, style }: PanelCardProps) {
  const rail = railColors[variant];

  return (
    <section
      className={className ? `panel-card ${className}` : 'panel-card'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: backgrounds[variant],
        border: `${tokens.border.width}px solid ${borders[variant]}`,
        borderRadius: tokens.radius.lg,
        boxShadow: shadows[variant],
        padding: tokens.spacing.lg,
        ...style,
      }}
    >
      {rail ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 3,
            background: rail,
          }}
        />
      ) : null}
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}
