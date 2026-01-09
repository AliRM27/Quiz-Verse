import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "@/locales/en.json";
import de from "@/locales/de.json";
import ru from "@/locales/ru.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

const resources = {
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
  es: { translation: es },
  fr: { translation: fr },
};

export const languageMap: Record<string, string> = {
  English: "en",
  Deutsch: "de",
  Русский: "ru",
  Español: "es",
  Français: "fr",
};

export const codeToLanguageName: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  es: "Español",
  fr: "Français",
};

const supportedLanguages = Object.keys(resources);

export function detectDeviceLanguageCode() {
  const locales = RNLocalize.getLocales();
  if (locales && locales.length > 0) {
    const { languageCode } = locales[0];
    if (supportedLanguages.includes(languageCode)) {
      return languageCode;
    }
  }
  return "en";
}

export function initI18n(userLanguage?: string) {
  const userLangCode = userLanguage ? languageMap[userLanguage] : undefined;
  const resolvedLang = userLangCode || detectDeviceLanguageCode();

  i18n.use(initReactI18next).init({
    resources,
    lng: resolvedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
