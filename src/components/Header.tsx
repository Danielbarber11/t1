import React from "react";
import { Download, ArrowLeftRight, WifiOff, Volume2 } from "lucide-react";
import { Language, SystemAccentColor } from "../types";
import { SYSTEM_COLORS } from "../utils/theme";

interface HeaderProps {
  sourceLang: Language;
  targetLang: Language;
  onOpenSourceModal: () => void;
  onOpenTargetModal: () => void;
  onSwapLanguages: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  formality: string;
  onChangeFormality: (val: string) => void;
  accentColor: SystemAccentColor;
}

export const Header: React.FC<HeaderProps> = ({
  sourceLang,
  targetLang,
  onOpenSourceModal,
  onOpenTargetModal,
  onSwapLanguages,
  isOfflineMode,
  onToggleOfflineMode,
  formality,
  onChangeFormality,
  accentColor,
}) => {
  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;

  return (
    <header className="sticky top-0 z-40 w-full px-3.5 pt-1.5 pb-2.5 bg-[#F5F5F7]/90 dark:bg-[#000000]/90 backdrop-blur-xl border-b border-[#D1D1D6]/60 dark:border-white/10 transition-colors">
      <div className="w-full max-w-md mx-auto space-y-2">
        {/* iOS Native Language Selector Cards (Apple Translate Style) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* From Language Card */}
          <button
            onClick={onOpenSourceModal}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xs border border-[#D1D1D6] dark:border-white/10 p-2.5 sm:p-3 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-center group active:scale-[0.98]"
          >
            <span className="text-[#86868B] text-[10px] font-bold uppercase tracking-widest mb-0.5">
              מ- / FROM
            </span>
            <span
              className="text-sm sm:text-base font-semibold flex items-center gap-1.5 truncate max-w-full"
              style={{ color: activeColor.hex }}
            >
              <span className="text-base">{sourceLang.flag}</span>
              <span className="truncate">{sourceLang.name}</span>
              {sourceLang.isDownloaded && (
                <Download className="w-3 h-3 text-emerald-500 shrink-0" />
              )}
            </span>
          </button>

          {/* Apple Swap Languages Pill Button */}
          <button
            onClick={onSwapLanguages}
            className="p-2.5 rounded-full bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all active:scale-90 shrink-0 shadow-xs border border-[#D1D1D6] dark:border-white/10 flex items-center justify-center"
            style={{
              color: activeColor.hex,
            }}
            title="החלף שפות"
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* To Language Card */}
          <button
            onClick={onOpenTargetModal}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xs border border-[#D1D1D6] dark:border-white/10 p-2.5 sm:p-3 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-center group active:scale-[0.98]"
          >
            <span className="text-[#86868B] text-[10px] font-bold uppercase tracking-widest mb-0.5">
              ל- / TO
            </span>
            <span
              className="text-sm sm:text-base font-semibold flex items-center gap-1.5 truncate max-w-full"
              style={{ color: activeColor.hex }}
            >
              <span className="text-base">{targetLang.flag}</span>
              <span className="truncate">{targetLang.name}</span>
              {targetLang.isDownloaded && (
                <Download className="w-3 h-3 text-emerald-500 shrink-0" />
              )}
            </span>
          </button>
        </div>

        {/* Tone/Formality Selector + Offline status */}
        <div className="flex items-center justify-between px-1 text-xs text-[#86868B]">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleOfflineMode}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                isOfflineMode
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              }`}
              title={isOfflineMode ? "מצב לא מקוון פעיל" : "הפעל מצב לא מקוון"}
            >
              <WifiOff className="w-3 h-3" />
              <span>{isOfflineMode ? "אופליין" : "אונליין"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-[#86868B]">סגנון:</span>
            <div className="flex bg-[#E8E8ED] dark:bg-zinc-800 p-0.5 rounded-lg">
              {[
                { id: "natural", label: "טבעי" },
                { id: "formal", label: "רשמי" },
                { id: "informal", label: "יומיומי" },
              ].map((item) => {
                const isSelected = formality === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeFormality(item.id)}
                    className={`px-2 py-0.5 rounded-md text-[11px] transition-all font-medium ${
                      isSelected
                        ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                    }`}
                    style={{
                      color: isSelected ? activeColor.hex : undefined,
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
