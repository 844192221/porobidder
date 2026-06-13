import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type AppLanguage } from '../../i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = (i18n.language === 'en-US' ? 'en-US' : 'zh-CN') as AppLanguage;

  return (
    <Select<AppLanguage>
      aria-label={t('common.language')}
      value={current}
      onChange={(lang) => void i18n.changeLanguage(lang)}
      options={SUPPORTED_LANGUAGES.map((lang) => ({
        value: lang,
        label: LANGUAGE_LABELS[lang],
      }))}
      style={{ width: 120 }}
    />
  );
}
