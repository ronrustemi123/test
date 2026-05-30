import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import mk from "./locales/mk";
import sq from "./locales/sq";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mk: { translation: mk },
    sq: { translation: sq },
  },
  lng: localStorage.getItem("civiclink_lang") ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
