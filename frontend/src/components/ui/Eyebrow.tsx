import type { ReactNode } from 'react';
import { tokens } from '../../theme/tokens';

type EyebrowProps = {
  children: ReactNode;
};

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: tokens.font.familyDisplay,
        fontSize: tokens.font.size.xs,
        fontWeight: tokens.font.weight.semibold,
        letterSpacing: tokens.font.letterSpacing.eyebrow,
        textTransform: 'uppercase',
        color: tokens.color.text.tertiary,
      }}
    >
      {children}
    </p>
  );
}
