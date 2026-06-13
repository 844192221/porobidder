import type { CSSProperties } from 'react';
import { auctionLayout } from '../../lib/auctionLayout';
import { tokens } from '../../theme/tokens';
import { TruncatedText } from '../ui/TruncatedText';

type IdChipProps = {
  id: string;
  muted?: boolean;
  dashed?: boolean;
  style?: CSSProperties;
};

export function IdChip({ id, muted, dashed, style }: IdChipProps) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        height: auctionLayout.chipHeight,
        padding: `0 ${tokens.spacing.sm + 2}px`,
        border: `${tokens.border.width}px ${dashed ? 'dashed' : 'solid'} ${tokens.border.color}`,
        borderRadius: tokens.radius.md,
        background: dashed ? 'transparent' : muted ? tokens.color.surface.inset : tokens.color.surface.card,
        ...style,
      }}
    >
      <TruncatedText
        text={id}
        style={{
          fontSize: tokens.font.size.sm,
          fontWeight: tokens.font.weight.semibold,
          color: muted || dashed ? tokens.color.text.tertiary : tokens.color.text.primary,
        }}
      />
    </div>
  );
}
