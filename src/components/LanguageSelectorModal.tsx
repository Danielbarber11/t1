import React, { useState } from "react";
import { Search, Check, Download, X, Globe } from "lucide-react";
import { Language, SystemAccentColor } from "../types";
import { LANGUAGES, AUTO_DETECT_LANGUAGE } from "../data/languages";
import { SYSTEM_COLORS } from "../utils/theme";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  title: string;
  allowAutoDetect?: boolean;
  accentColor?: SystemAccentColor;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  title,
  allowAutoDetect = false,
  accentColor = "blue",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;
  const availableLangs = allowAutoDetect ? [AUTO_DETECT_LANGUAGE, ...LANGUAGES] : LANGUAGES;

  const filteredLangs = availableLangs.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
      <div className="w-full max-w-md bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#D1D1D6] dark:border-white/10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* iOS Handle & Header */}
        <div className="px-4 pt-3 pb-3 border-b border-[#D1D1D6] dark:border-white/10 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl flex flex-col gap-2.5">
          <div className="w-9 h-1 bg-[#D1D1D6] dark:bg-zinc-600 rounded-full mx-auto" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4" style={{ color: activeColor.hex }} /> {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-[#E8E8ED] dark:bg-zinc-700 text-[#1D1D1F] dark:text-zinc-200 hover:bg-[#D1D1D6]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש שפה או מדינה..."
              className="w-full py-2 pl-9 pr-3.5 bg-[#E8E8ED] dark:bg-zinc-800 rounded-xl text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none"
            />
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#E8E8ED] dark:divide-white/5">
          {filteredLangs.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "font-semibold"
                    : "hover:bg-white dark:hover:bg-zinc-800/60 text-[#1D1D1F] dark:text-slate-100"
                }`}
                style={{
                  backgroundColor: isSelected ? activeColor.softBg : undefined,
                  color: isSelected ? activeColor.hex : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-semibold leading-none mb-0.5">{lang.name}</div>
                    <div className="text-[11px] text-[#86868B] font-normal">
                      {lang.nativeName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lang.isDownloaded ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Download className="w-2.5 h-2.5" /> הורד
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#86868B]">אונליין</span>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4" style={{ color: activeColor.hex }} />
                  )}
                </div>
              </button>
            );
          })}

          {filteredLangs.length === 0 && (
            <div className="text-center py-6 text-xs text-[#86868B]">
              לא נמצאו שפות תואמות
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
