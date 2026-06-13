import type { ReactNode } from 'react';
import { tokens } from '../../theme/tokens';

type DisplayTitleProps = {
  children: ReactNode;
  as?: 'h1' | 'h2';
};

export function DisplayTitle({ children, as: Tag = 'h1' }: DisplayTitleProps) {
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: tokens.font.familyDisplay,
        fontSize: Tag === 'h1' ? tokens.font.size.display : tokens.font.size.xxl,
        fontWeight: tokens.font.weight.bold,
        lineHeight: tokens.font.lineHeight.tight,
        letterSpacing: tokens.font.letterSpacing.display,
        color: tokens.color.text.primary,
      }}
    >
      {children}
    </Tag>
  );
}
