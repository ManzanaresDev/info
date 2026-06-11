export type TYPE_LANGUAGE = "es" | "en" | "fr";

export type TranslationKey = "key";

type TranslationContent = Record<TranslationKey, string>;

type TranslationTable = Record<
  TYPE_LANGUAGE,
  {
    label: string;
    flag: string;
    messages: TranslationContent;
  }
>;

export const DEFAULT_LANGUAGE: TYPE_LANGUAGE = "es";
export const FALLBACK_LANGUAGE: TYPE_LANGUAGE = "es";

export const translations: TranslationTable = {
  es: {
    label: "Español",
    flag: "ES",
    messages: {
      key: "valeur",
    },
  },

  en: {
    label: "English",
    flag: "EN",
    messages: {
      key: "valeur",
    },
  },

  fr: {
    label: "Français",
    flag: "FR",
    messages: {
      key: "valeur",
    },
  },
};

export function getTranslations(lang: string) {
  const safeLang: TYPE_LANGUAGE =
    lang in translations ? (lang as TYPE_LANGUAGE) : DEFAULT_LANGUAGE;
  return translations[safeLang].messages;
}
