import type { ReactNode } from 'react';
import { tokens } from '../../theme/tokens';

type FormActionBarProps = {
  children: ReactNode;
};

export function FormActionBar({ children }: FormActionBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: tokens.spacing.sm,
        justifyContent: 'flex-end',
        marginTop: tokens.spacing.lg,
      }}
    >
      {children}
    </div>
  );
}
