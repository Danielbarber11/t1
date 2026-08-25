export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  isDownloaded?: boolean;
}

export interface TranslationAlternative {
  text: string;
  context: string;
}

export interface DefinitionItem {
  word: string;
  partOfSpeech?: string;
  meaning: string;
  example?: string;
}

export interface GrammarInsight {
  formalityNote?: string;
  culturalNuance?: string;
  literalMeaning?: string;
}

export interface TranslationResult {
  translation: string;
  transliteration?: string;
  detectedLanguage?: string;
  detectedLanguageCode?: string;
  alternatives?: TranslationAlternative[];
  definitions?: DefinitionItem[];
  grammarInsight?: GrammarInsight;
  timestamp?: number;
}

export interface SavedTranslation {
  id: string;
  sourceLang: Language;
  targetLang: Language;
  sourceText: string;
  translatedText: string;
  transliteration?: string;
  timestamp: number;
  isFavorite: boolean;
}

export interface ConversationMessage {
  id: string;
  speaker: "A" | "B";
  speakerName: string;
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translatedText: string;
  phonetic?: string;
  timestamp: number;
}

export interface CameraBlock {
  originalText: string;
  translatedText: string;
  box: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface PhraseCategory {
  id: string;
  title: string;
  iconName: string;
  phrases: {
    id: string;
    english: string;
    hebrew: string;
    spanish: string;
    french: string;
    japanese: string;
    arabic: string;
    phoneticHebrew?: string;
  }[];
}

export type TabType = "translate" | "conversation" | "camera" | "phrases" | "settings";

export type SystemAccentColor = 
  | "blue" 
  | "purple" 
  | "orange" 
  | "green" 
  | "pink" 
  | "teal" 
  | "indigo" 
  | "graphite";

export interface AppSettings {
  accentColor: SystemAccentColor;
  appearance: "system" | "light" | "dark";
  speechRate: number; // 0.75, 1.0, 1.25
  autoPlayAudio: boolean;
  showTransliteration: boolean;
  offlineOnly: boolean;
  autoDetectInput: boolean;
}

