import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh-CN", "fr", "es"];

export const localeNames: any = {
  en: "English",
  'zh-CN': "简体中文",
  fr: "Français",
  es: "Español",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

export const pathnames = {
  en: {
    "privacy-policy": "/privacy-policy",
    "terms-of-service": "/terms-of-service",
  },
  fr: {
    "privacy-policy": "/politique-de-confidentialite",
    "terms-of-service": "/conditions-d-utilisation",
  },
  es: {
    "privacy-policy": "/politica-de-privacidad",
    "terms-of-service": "/terminos-de-servicio",
  },
} satisfies Pathnames<typeof locales>;
