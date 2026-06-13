import type { ReactNode } from 'react';
import { tokens } from '../../theme/tokens';

type StatBlockProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  valueTone?: 'default' | 'gold';
};

export function StatBlock({ label, value, hint, valueTone = 'default' }: StatBlockProps) {
  const valueColor =
    valueTone === 'gold' ? tokens.color.auction.money : tokens.color.text.primary;

  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize: tokens.font.size.sm,
          color: tokens.color.text.secondary,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: `${tokens.spacing.xs}px 0 0`,
          fontFamily: valueTone === 'gold' ? tokens.font.familyData : tokens.font.familyDisplay,
          fontSize: tokens.font.size.xxl,
          fontWeight: tokens.font.weight.bold,
          lineHeight: tokens.font.lineHeight.tight,
          letterSpacing: tokens.font.letterSpacing.display,
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      {hint ? (
        <p
          style={{
            margin: `${tokens.spacing.xs}px 0 0`,
            fontSize: tokens.font.size.xs,
            color: tokens.color.text.tertiary,
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
