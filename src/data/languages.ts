import { Language } from "../types";

export const LANGUAGES: Language[] = [
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", dir: "rtl", isDownloaded: true },
  { code: "en", name: "English (US)", nativeName: "English (US)", flag: "🇺🇸", dir: "ltr", isDownloaded: true },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr", isDownloaded: true },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr", isDownloaded: true },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr", isDownloaded: true },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", dir: "ltr", isDownloaded: true },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", dir: "ltr", isDownloaded: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl", isDownloaded: true },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", dir: "ltr", isDownloaded: false },
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文 (简体)", flag: "🇨🇳", dir: "ltr", isDownloaded: false },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", dir: "ltr", isDownloaded: false },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", dir: "ltr", isDownloaded: false },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", dir: "ltr", isDownloaded: false },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr", isDownloaded: false },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr", isDownloaded: false },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", dir: "ltr", isDownloaded: false },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", dir: "ltr", isDownloaded: false },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", dir: "ltr", isDownloaded: false },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", dir: "ltr", isDownloaded: false },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", dir: "ltr", isDownloaded: false },
];

export const AUTO_DETECT_LANGUAGE: Language = {
  code: "auto",
  name: "Auto-Detect",
  nativeName: "זיהוי אוטומטי",
  flag: "🌐",
  dir: "ltr",
  isDownloaded: true,
};
