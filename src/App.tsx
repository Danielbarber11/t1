import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GlassFilter } from "./components/ui/liquid-glass";
import { Header } from "./components/Header";
import { LanguageSelectorModal } from "./components/LanguageSelectorModal";
import { TranslationView } from "./components/TranslationView";
import { ConversationView } from "./components/ConversationView";
import { CameraView } from "./components/CameraView";
import { PhrasebookView } from "./components/PhrasebookView";
import { SettingsView } from "./components/SettingsView";
import { TabBar } from "./components/TabBar";
import { Language, TabType, SavedTranslation, AppSettings } from "./types";
import { LANGUAGES } from "./data/languages";
import { applySystemAccentCss } from "./utils/theme";

const DEFAULT_SETTINGS: AppSettings = {
  appearance: "system",
  accentColor: "blue",
  speechRate: 1.0,
  autoPlayAudio: false,
  showTransliteration: true,
  offlineOnly: false,
  autoDetectInput: true,
};

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>(
    LANGUAGES.find((l) => l.code === "he") || LANGUAGES[0]
  );
  const [targetLang, setTargetLang] = useState<Language>(
    LANGUAGES.find((l) => l.code === "en") || LANGUAGES[1]
  );

  const [activeTab, setActiveTab] = useState<TabType>("translate");
  const [formality, setFormality] = useState<string>("natural");

  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);

  // App Settings with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem("apple_translate_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Saved Translations with localStorage persistence
  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>(() => {
    try {
      const stored = localStorage.getItem("apple_translate_saved");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Camera action triggers & analysis state for morphing bottom dock
  const [cameraTriggers, setCameraTriggers] = useState<{
    capture: () => void;
    gallery: () => void;
    toggleSettings: () => void;
  } | null>(null);
  const [isCameraAnalyzing, setIsCameraAnalyzing] = useState(false);

  // Apply Accent Color CSS variables
  useEffect(() => {
    applySystemAccentCss(settings.accentColor);
    try {
      localStorage.setItem("apple_translate_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

  // Handle Appearance (Light / Dark / System)
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      if (settings.appearance === "dark") {
        root.classList.add("dark");
      } else if (settings.appearance === "light") {
        root.classList.remove("dark");
      } else {
        // System default
        if (mediaQuery.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [settings.appearance]);

  // Persist Saved Translations
  useEffect(() => {
    try {
      localStorage.setItem("apple_translate_saved", JSON.stringify(savedTranslations));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [savedTranslations]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSwapLanguages = () => {
    if (sourceLang.code === "auto") return; // Auto can't be target
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleSaveTranslation = (item: Omit<SavedTranslation, "id" | "timestamp">) => {
    const newEntry: SavedTranslation = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setSavedTranslations((prev) => [newEntry, ...prev]);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedTranslations((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased flex justify-center selection:bg-black/10 dark:selection:bg-white/20">
      <GlassFilter />
      {/* Mobile-First Frame Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#F2F2F7] dark:bg-[#000000] relative shadow-xl sm:border-x sm:border-[#D1D1D6]/60 dark:sm:border-white/10">
        {/* Top iOS Header (Languages selector, formality, offline) - Only shown on Conversation and Phrases tabs */}
        {(activeTab === "conversation" || activeTab === "phrases") && (
          <Header
            sourceLang={sourceLang}
            targetLang={targetLang}
            onOpenSourceModal={() => setIsSourceModalOpen(true)}
            onOpenTargetModal={() => setIsTargetModalOpen(true)}
            onSwapLanguages={handleSwapLanguages}
            isOfflineMode={settings.offlineOnly}
            onToggleOfflineMode={() =>
              handleUpdateSettings({ offlineOnly: !settings.offlineOnly })
            }
            formality={formality}
            onChangeFormality={setFormality}
            accentColor={settings.accentColor}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 px-4 ${activeTab === "settings" ? "pt-4" : activeTab === "camera" || activeTab === "translate" ? "pt-3.5" : "pt-2"}`}>
          {activeTab === "translate" && (
            <TranslationView
              sourceLang={sourceLang}
              targetLang={targetLang}
              onOpenSourceModal={() => setIsSourceModalOpen(true)}
              onOpenTargetModal={() => setIsTargetModalOpen(true)}
              onSwapLanguages={handleSwapLanguages}
              formality={formality}
              onChangeFormality={setFormality}
              isOfflineMode={settings.offlineOnly}
              onToggleOfflineMode={() =>
                handleUpdateSettings({ offlineOnly: !settings.offlineOnly })
              }
              onSaveTranslation={handleSaveTranslation}
              savedTranslations={savedTranslations}
              accentColor={settings.accentColor}
              settings={settings}
            />
          )}

          {activeTab === "conversation" && (
            <ConversationView
              sourceLang={sourceLang}
              targetLang={targetLang}
              accentColor={settings.accentColor}
              settings={settings}
            />
          )}

          {activeTab === "camera" && (
            <CameraView
              sourceLang={sourceLang}
              targetLang={targetLang}
              onOpenSourceModal={() => setIsSourceModalOpen(true)}
              onOpenTargetModal={() => setIsTargetModalOpen(true)}
              onSwapLanguages={handleSwapLanguages}
              onBack={() => setActiveTab("translate")}
              accentColor={settings.accentColor}
              settings={settings}
            />
          )}

          {activeTab === "phrases" && (
            <PhrasebookView
              savedTranslations={savedTranslations}
              onRemoveSaved={handleRemoveSaved}
              targetLang={targetLang}
              accentColor={settings.accentColor}
              settings={settings}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>

        {/* Apple iOS Floating Bottom Tab Bar - Hidden when in Full-Screen Camera Mode */}
        {activeTab !== "camera" && (
          <TabBar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            accentColor={settings.accentColor}
          />
        )}

        {/* Source Language Picker Sheet Modal */}
        <LanguageSelectorModal
          isOpen={isSourceModalOpen}
          onClose={() => setIsSourceModalOpen(false)}
          selectedLanguage={sourceLang}
          onSelectLanguage={setSourceLang}
          title="בחר שפת מקור"
          allowAutoDetect={true}
          accentColor={settings.accentColor}
        />

        {/* Target Language Picker Sheet Modal */}
        <LanguageSelectorModal
          isOpen={isTargetModalOpen}
          onClose={() => setIsTargetModalOpen(false)}
          selectedLanguage={targetLang}
          onSelectLanguage={setTargetLang}
          title="בחר שפת יעד"
          allowAutoDetect={false}
          accentColor={settings.accentColor}
        />
      </div>
    </div>
  );
}
