/**
 * PoroBidder design tokens — single source of truth.
 * Subject: LOL manager sealed-bid talent market (gold economy, two-team draft).
 * Signature: gold ledger rail on wallet / hero panels — one accent, rest quiet tool UI.
 */
export const tokens = {
  color: {
    brand: {
      primary: '#1a4faf',
      primaryHover: '#2563c7',
      primaryActive: '#123d85',
    },
    semantic: {
      success: '#2d8a4e',
      warning: '#c9850a',
      error: '#c73e3e',
      info: '#1a4faf',
    },
    surface: {
      page: '#e8ecf2',
      pageAccent: '#dfe6f0',
      card: '#ffffff',
      elevated: '#ffffff',
      border: '#d4dbe6',
      divider: '#e8edf3',
      inset: '#f4f6fa',
    },
    text: {
      primary: '#1c2b42',
      secondary: '#5a6b82',
      tertiary: '#8b97a8',
      inverse: '#ffffff',
      link: '#1a4faf',
    },
    auction: {
      teamA: '#1a4faf',
      teamB: '#6b3fa0',
      money: '#b8860b',
      moneyBright: '#d4a012',
      countdown: '#b42318',
      passed: '#7a8494',
    },
  },
  border: {
    width: 1,
    widthStrong: 2,
    color: '#d4dbe6',
    colorStrong: '#bcc6d4',
    radius: {
      sm: 6,
      md: 8,
      lg: 10,
      xl: 14,
    },
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 14,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  font: {
    family:
      '"Outfit", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
    familyDisplay:
      '"Outfit", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
    familyData: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace',
    size: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 28,
      display: 36,
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.65,
    },
    letterSpacing: {
      eyebrow: '0.08em',
      display: '-0.02em',
    },
  },
  shadow: {
    card: '0 1px 2px rgba(15, 26, 46, 0.05), 0 2px 8px rgba(15, 26, 46, 0.04)',
    panel: '0 8px 28px rgba(15, 26, 46, 0.07)',
    focus: '0 0 0 2px rgba(26, 79, 175, 0.22)',
  },
  layout: {
    contentMaxWidth: 960,
    headerHeight: 56,
    panelMaxWidth: 440,
  },
} as const;

export type DesignTokens = typeof tokens;
