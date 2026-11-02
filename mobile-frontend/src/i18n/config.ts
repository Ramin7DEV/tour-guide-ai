import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import azTranslations from './locales/az.json';
import enTranslations from './locales/en.json';

const LANGUAGE_STORAGE_KEY = '@app:language';

// Get device language or default to English
const getDeviceLanguage = (): string => {
  const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
  return deviceLang === 'az' ? 'az' : 'en';
};

// Get saved language preference or use device language
const getSavedLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

// Initialize i18n synchronously first, then update language
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      az: {
        translation: azTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: getDeviceLanguage(), // Use device language initially
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Update language from saved preference after init
getSavedLanguage().then((savedLanguage) => {
  i18n.changeLanguage(savedLanguage);
});

// Change language and save preference
export const changeLanguage = async (lang: 'az' | 'en'): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.warn('Failed to change language:', error);
  }
};

export default i18n;

