import { createI18n } from 'vue-i18n';
import zh from '../locales/zh';
import en from '../locales/en';

type MessageSchema = typeof zh
type LanguageType = 'zh' | 'en'

export const i18n = createI18n<[MessageSchema], LanguageType>({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
});

export async function initI18n(locale?: LanguageType) {
  if (!locale) {
    const config = await window.electronAPI.getConfig();
    locale = config.language;
  }
  setI18nLanguage(locale);
}

export function setI18nLanguage(locale: LanguageType) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    (i18n.global.locale as any).value = locale;
  }
} 
