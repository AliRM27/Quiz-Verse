import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import de from "@/locales/de.json";
import ru from "@/locales/ru.json";

const resources = {
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
};

export const languageMap: Record<string, string> = {
  English: "en",
  Deutsch: "de",
  Русский: "ru",
};

export function initI18n(userLanguage?: string) {
  const fallback = { languageTag: "en", isRTL: false };

  // if user has a language preference, map it
  const userLangCode = userLanguage ? languageMap[userLanguage] : undefined;

  i18n.use(initReactI18next).init({
    resources,
    lng: userLangCode,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
