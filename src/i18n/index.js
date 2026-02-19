import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import kr from "./locales/kr.json";

export const baseTranslations = { en, ja, kr };

/**
 * Deep-merge two objects (second wins on conflict).
 */
function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key]) &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

/**
 * Initialize i18n with app-specific translations merged over the engine base.
 *
 * @param {{ en?: object, ja?: object, kr?: object }} appTranslations
 *   App-specific keys that override/extend the engine base.
 *   e.g. { en: { app: { name: "DOJO" }, checkin: { ... } }, ja: { ... } }
 */
export function initI18n(appTranslations = {}) {
  const resources = {};
  for (const lang of ["en", "ja", "kr"]) {
    const base = baseTranslations[lang] || {};
    const app = appTranslations[lang] || {};
    resources[lang] = { translation: deepMerge(base, app) };
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      initImmediate: false,
    });

  return i18n;
}
