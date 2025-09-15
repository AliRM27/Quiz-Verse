// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "./locales/en.json";
import de from "./locales/de.json";

const resources = { en: { translation: en }, de: { translation: de } };

const fallback = { languageTag: "en", isRTL: false };
const { languageTag } =
  RNLocalize.findBestAvailableLanguage(Object.keys(resources)) || fallback;

i18n.use(initReactI18next).init({
  resources,
  lng: languageTag,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
