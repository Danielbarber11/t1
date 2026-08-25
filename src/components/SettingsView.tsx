import React, { useState } from "react";
import {
  Palette,
  Sun,
  Moon,
  Volume2,
  Download,
  Trash2,
  RotateCcw,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  HardDrive
} from "lucide-react";
import { AppSettings, SystemAccentColor, Language } from "../types";
import { SYSTEM_COLORS } from "../utils/theme";
import { LANGUAGES } from "../data/languages";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  languages: Language[];
  onToggleLanguageDownload: (langCode: string) => void;
  onClearHistory: () => void;
  onResetDefaults: () => void;
  historyCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  languages,
  onToggleLanguageDownload,
  onClearHistory,
  onResetDefaults,
  historyCount,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const activeColor = SYSTEM_COLORS[settings.accentColor] || SYSTEM_COLORS.blue;

  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const downloadedCount = languages.filter((l) => l.isDownloaded).length;
  const estimatedStorageMb = (downloadedCount * 42.5).toFixed(1);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-32 animate-in fade-in duration-200">
      {/* iOS Large Navigation Title */}
      <div className="px-1 pt-1 pb-1">
        <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white font-sans">
          הגדרות
        </h2>
        <p className="text-xs text-[#86868B] mt-0.5">
          התאם אישית את מראה האפליקציה, צבעי המערכת והשפות
        </p>
      </div>

      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1D1D1F]/90 dark:bg-white/95 backdrop-blur-md text-white dark:text-[#1D1D1F] px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* SECTION 1: SYSTEM ACCENT COLOR (צבע מערכת) */}
      <div className="space-y-2">
        <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
          צבע הדגשת מערכת (System Accent Color)
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-[#D1D1D6] dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D1D1D6]/40 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center text-white text-[10px]"
                style={{ backgroundColor: activeColor.hex }}
              >
                ✓
              </div>
              <span className="text-sm font-semibold text-[#1D1D1F] dark:text-white">
                {activeColor.hebrewName}
              </span>
            </div>
            <span className="text-xs text-[#86868B] font-mono uppercase">
              {activeColor.hex}
            </span>
          </div>

          {/* Color Swatches Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
            {(Object.keys(SYSTEM_COLORS) as SystemAccentColor[]).map((colorKey) => {
              const item = SYSTEM_COLORS[colorKey];
              const isSelected = settings.accentColor === colorKey;
              return (
                <button
                  key={colorKey}
                  onClick={() => {
                    onUpdateSettings({ accentColor: colorKey });
                    showToast(`צבע המערכת עודכן ל-${item.hebrewName}`);
                  }}
                  className="flex flex-col items-center gap-1 group focus:outline-none"
                  title={item.hebrewName}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1C1C1E] scale-110 shadow-md"
                        : "hover:scale-105 active:scale-95"
                    }`}
                    style={{
                      backgroundColor: item.hex,
                      outlineColor: item.hex,
                      // @ts-ignore
                      "--tw-ring-color": item.hex,
                    }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-sm stroke-[3]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-[48px] ${
                      isSelected
                        ? "font-bold text-[#1D1D1F] dark:text-white"
                        : "text-[#86868B]"
                    }`}
                  >
                    {item.hebrewName.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: APPEARANCE (מראה) */}
      <div className="space-y-2">
        <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
          מראה (Appearance)
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 border border-[#D1D1D6] dark:border-white/10 shadow-xs">
          <div className="grid grid-cols-3 gap-2 bg-[#E8E8ED] dark:bg-zinc-800/80 p-1 rounded-xl">
            {[
              { id: "light", label: "בהיר", icon: Sun },
              { id: "dark", label: "כהה", icon: Moon },
              { id: "system", label: "אוטומטי", icon: Palette },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = settings.appearance === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() =>
                    onUpdateSettings({
                      appearance: theme.id as "system" | "light" | "dark",
                    })
                  }
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: isSelected ? activeColor.hex : undefined }}
                  />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: AUDIO & SPEECH (שמע ודיבור) */}
      <div className="space-y-2">
        <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
          שמע והקראה קולית (Speech & Audio)
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl divide-y divide-[#D1D1D6]/40 dark:divide-white/5 border border-[#D1D1D6] dark:border-white/10 shadow-xs overflow-hidden">
          {/* Speech Rate */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: activeColor.hex }}
              >
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                  מהירות הקראה (Speech Rate)
                </div>
                <div className="text-xs text-[#86868B]">מהירות פלט הדיבור הקולי</div>
              </div>
            </div>
            <div className="flex bg-[#E8E8ED] dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
              {[
                { val: 0.8, label: "איטי" },
                { val: 1.0, label: "רגיל" },
                { val: 1.25, label: "מהיר" },
              ].map((rate) => (
                <button
                  key={rate.val}
                  onClick={() => onUpdateSettings({ speechRate: rate.val })}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    settings.speechRate === rate.val
                      ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                  style={{
                    color: settings.speechRate === rate.val ? activeColor.hex : undefined,
                  }}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Play Audio */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                  הקראה קולית אוטומטית
                </div>
                <div className="text-xs text-[#86868B]">השמע תרגום מיד עם סיומו</div>
              </div>
            </div>
            {/* iOS Switch */}
            <button
              onClick={() => onUpdateSettings({ autoPlayAudio: !settings.autoPlayAudio })}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                settings.autoPlayAudio
                  ? "bg-emerald-500"
                  : "bg-[#E8E8ED] dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.autoPlayAudio ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Transliteration & Phonetics */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                  הצג תעתיק פונטי וניקוד
                </div>
                <div className="text-xs text-[#86868B]">עוזר בהגייה נכונה של מילים</div>
              </div>
            </div>
            {/* iOS Switch */}
            <button
              onClick={() =>
                onUpdateSettings({ showTransliteration: !settings.showTransliteration })
              }
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                settings.showTransliteration
                  ? "bg-emerald-500"
                  : "bg-[#E8E8ED] dark:bg-zinc-700"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.showTransliteration ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: OFFLINE LANGUAGE PACKS (ערכות שפה לשימוש ללא אינטרנט) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
          <span>ערכות שפה לאופליין ({downloadedCount} מותקנות)</span>
          <span className="flex items-center gap-1 font-mono">
            <HardDrive className="w-3 h-3" /> {estimatedStorageMb} MB
          </span>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl divide-y divide-[#D1D1D6]/40 dark:divide-white/5 border border-[#D1D1D6] dark:border-white/10 shadow-xs overflow-hidden">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                    {lang.name}
                  </div>
                  <div className="text-xs text-[#86868B]">{lang.nativeName} • ~42 MB</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onToggleLanguageDownload(lang.code);
                  showToast(
                    lang.isDownloaded
                      ? `ערכת שפה ${lang.name} הוסרה מהאחסון`
                      : `ערכת שפה ${lang.name} הורדה לשימוש אופליין`
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  lang.isDownloaded
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-[#E8E8ED] dark:bg-zinc-800 text-[#1D1D1F] dark:text-slate-200 hover:bg-[#D1D1D6]"
                }`}
              >
                {lang.isDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>מותקן</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>הורד</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: DATA & RESET (היסטוריה ואיפוס) */}
      <div className="space-y-2">
        <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
          נתונים ואיפוס
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl divide-y divide-[#D1D1D6]/40 dark:divide-white/5 border border-[#D1D1D6] dark:border-white/10 shadow-xs overflow-hidden">
          {/* Clear History */}
          <button
            onClick={() => {
              if (historyCount === 0) {
                showToast("אין תרגומים שמורים למחיקה");
                return;
              }
              if (confirm("האם למחוק את כל התרגומים השמורים וההיסטוריה?")) {
                onClearHistory();
                showToast("היסטוריית התרגומים נמחקה");
              }
            }}
            className="w-full p-3.5 flex items-center justify-between text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600 text-xs">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                מחק היסטוריית תרגומים ({historyCount})
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#86868B]" />
          </button>

          {/* Reset to Defaults */}
          <button
            onClick={() => {
              if (confirm("האם לאפס את כל ההגדרות לברירת מחדל של Apple?")) {
                onResetDefaults();
                showToast("כל ההגדרות אופסו לברירת המחדל");
              }
            }}
            className="w-full p-3.5 flex items-center justify-between text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#E8E8ED] dark:bg-zinc-800 flex items-center justify-center text-[#86868B] text-xs">
                <RotateCcw className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">איפוס הגדרות יצרן (Default)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#86868B]" />
          </button>
        </div>
      </div>

      {/* iOS App Info Footer */}
      <div className="text-center pt-2 pb-4 space-y-1 text-xs text-[#86868B]">
        <div className="font-semibold text-[#1D1D1F] dark:text-zinc-300">
          Apple Translate iOS Edition
        </div>
        <div>גרסה 18.4 (Build 24B83) • מנוע תרגום מקומי ומקוון</div>
      </div>
    </div>
  );
};
