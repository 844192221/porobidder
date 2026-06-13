import type { ThemeConfig } from 'antd';
import { tokens } from './tokens';

/** Maps design tokens to Ant Design ConfigProvider theme. */
export function createAntdTheme(): ThemeConfig {
  return {
    token: {
      colorPrimary: tokens.color.brand.primary,
      colorSuccess: tokens.color.semantic.success,
      colorWarning: tokens.color.semantic.warning,
      colorError: tokens.color.semantic.error,
      colorInfo: tokens.color.semantic.info,
      colorLink: tokens.color.text.link,
      colorText: tokens.color.text.primary,
      colorTextSecondary: tokens.color.text.secondary,
      colorTextTertiary: tokens.color.text.tertiary,
      colorBorder: tokens.border.color,
      lineWidth: tokens.border.width,
      lineWidthBold: tokens.border.widthStrong,
      colorBgContainer: tokens.color.surface.card,
      colorBgLayout: tokens.color.surface.page,
      borderRadius: tokens.radius.md,
      borderRadiusLG: tokens.radius.lg,
      borderRadiusSM: tokens.radius.sm,
      fontFamily: tokens.font.family,
      fontSize: tokens.font.size.md,
      fontSizeLG: tokens.font.size.lg,
      fontSizeSM: tokens.font.size.sm,
      lineHeight: tokens.font.lineHeight.normal,
      controlHeight: 40,
      boxShadow: tokens.shadow.card,
      boxShadowSecondary: tokens.shadow.panel,
    },
    components: {
      Layout: {
        headerBg: tokens.color.surface.card,
        bodyBg: tokens.color.surface.page,
      },
      Card: {
        borderRadiusLG: tokens.radius.lg,
        paddingLG: tokens.spacing.lg,
      },
      Button: {
        borderRadius: tokens.radius.md,
        fontWeight: tokens.font.weight.semibold,
        primaryShadow: 'none',
      },
      Input: {
        borderRadius: tokens.radius.md,
        activeShadow: tokens.shadow.focus,
      },
      Tag: {
        borderRadiusSM: tokens.radius.sm,
      },
    },
  };
}
