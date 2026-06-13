import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { createAntdTheme } from '../theme/antdTheme';
import type { AppLanguage } from '../i18n';

const antdLocales: Record<AppLanguage, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();
  const language = (i18n.language === 'en-US' ? 'en-US' : 'zh-CN') as AppLanguage;

  return (
    <ConfigProvider locale={antdLocales[language]} theme={createAntdTheme()}>
      {children}
    </ConfigProvider>
  );
}
