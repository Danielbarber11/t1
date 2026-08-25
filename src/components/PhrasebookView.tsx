import React, { useState } from "react";
import { Search, Volume2, Bookmark, Trash2, Sparkles, Utensils, MapPin, ShieldAlert, Heart } from "lucide-react";
import { PhraseCategory, SavedTranslation, Language, SystemAccentColor, AppSettings } from "../types";
import { PHRASEBOOK } from "../data/phrasebook";
import { speakText } from "../utils/audio";
import { SYSTEM_COLORS } from "../utils/theme";

interface PhrasebookViewProps {
  savedTranslations: SavedTranslation[];
  onRemoveSaved: (id: string) => void;
  targetLang: Language;
  accentColor: SystemAccentColor;
  settings: AppSettings;
}

export const PhrasebookView: React.FC<PhrasebookViewProps> = ({
  savedTranslations,
  onRemoveSaved,
  targetLang,
  accentColor,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<"phrasebook" | "favorites">("phrasebook");
  const [selectedCategory, setSelectedCategory] = useState<string>("essential");
  const [searchQuery, setSearchQuery] = useState("");

  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;
  const activeCategoryObj = PHRASEBOOK.find((c) => c.id === selectedCategory) || PHRASEBOOK[0];

  const filteredPhrases = activeCategoryObj.phrases.filter(
    (p) =>
      p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hebrew.includes(searchQuery) ||
      p.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.french.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTargetTranslation = (p: typeof activeCategoryObj.phrases[0]) => {
    switch (targetLang.code) {
      case "he":
        return p.hebrew;
      case "es":
        return p.spanish;
      case "fr":
        return p.french;
      case "ja":
        return p.japanese;
      case "ar":
        return p.arabic;
      default:
        return p.english;
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Utensils":
        return <Utensils className="w-3.5 h-3.5" />;
      case "MapPin":
        return <MapPin className="w-3.5 h-3.5" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Top Segment Control (Phrasebook vs Favorites) */}
      <div className="bg-[#E8E8ED] dark:bg-zinc-800 p-1 rounded-xl flex items-center gap-1 border border-[#D1D1D6]/60 dark:border-white/10">
        <button
          onClick={() => setActiveTab("phrasebook")}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "phrasebook"
              ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs"
              : "text-[#86868B] hover:text-[#1D1D1F]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: activeColor.hex }} />
          <span>שיחון נסיעות</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "favorites"
              ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs"
              : "text-[#86868B] hover:text-[#1D1D1F]"
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>מועדפים ({savedTranslations.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-3 text-[#86868B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חפש ביטויים או מילים..."
          className="w-full py-2 pl-9 pr-3.5 bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#D1D1D6] dark:border-white/10 text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2"
          style={{
            // @ts-ignore
            "--tw-ring-color": activeColor.hex,
          }}
        />
      </div>

      {activeTab === "phrasebook" ? (
        <div className="space-y-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PHRASEBOOK.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? "text-white shadow-xs"
                      : "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-zinc-200 border border-[#D1D1D6] dark:border-white/10 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: isSelected ? activeColor.hex : undefined,
                  }}
                >
                  {getCategoryIcon(cat.iconName)}
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Phrases Grid */}
          <div className="space-y-2">
            {filteredPhrases.map((phrase) => {
              const targetText = getTargetTranslation(phrase);
              return (
                <div
                  key={phrase.id}
                  className="bg-white dark:bg-[#1C1C1E] p-3.5 rounded-2xl border border-[#D1D1D6] dark:border-white/10 shadow-xs flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                      {phrase.hebrew}
                    </div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: activeColor.hex }}
                    >
                      {targetText}
                    </div>
                    {settings.showTransliteration && phrase.phoneticHebrew && (
                      <div className="text-[10px] text-[#86868B] font-mono">
                        {phrase.phoneticHebrew}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      speakText(
                        targetText,
                        targetLang.code,
                        undefined,
                        settings.speechRate
                      )
                    }
                    className="p-2.5 rounded-xl bg-[#E8E8ED] dark:bg-zinc-800 hover:bg-[#D1D1D6] text-[#1D1D1F] dark:text-white transition-all shrink-0"
                    title="השמע"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {filteredPhrases.length === 0 && (
              <div className="text-center py-6 text-xs text-[#86868B]">
                לא נמצאו ביטויים בקטגוריה זו.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Favorites Tab */
        <div className="space-y-2">
          {savedTranslations.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-[#D1D1D6] dark:border-white/10 space-y-1.5 p-4">
              <Bookmark className="w-6 h-6 text-[#86868B] mx-auto" />
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-zinc-300">
                אין עדיין תרגומים שמורים
              </p>
              <p className="text-[11px] text-[#86868B]">
                לחץ על סמל הסימנייה במסך התרגום כדי לשמור
              </p>
            </div>
          ) : (
            savedTranslations.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1C1C1E] p-3.5 rounded-2xl border border-[#D1D1D6] dark:border-white/10 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-[#86868B]">
                    <span>
                      {item.sourceLang.flag} {item.sourceLang.name}
                    </span>
                    <span>←</span>
                    <span>
                      {item.targetLang.flag} {item.targetLang.name}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#1D1D1F] dark:text-zinc-200">
                    "{item.sourceText}"
                  </div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: activeColor.hex }}
                  >
                    {item.translatedText}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      speakText(
                        item.translatedText,
                        item.targetLang.code,
                        undefined,
                        settings.speechRate
                      )
                    }
                    className="p-2 rounded-full bg-[#E8E8ED] dark:bg-zinc-800 hover:bg-[#D1D1D6] text-[#1D1D1F] dark:text-white"
                    title="השמע"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveSaved(item.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    title="מחק"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
