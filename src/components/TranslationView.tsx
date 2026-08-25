import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  BookOpen,
  ChevronDown,
  Lightbulb,
  ArrowLeftRight,
  Share2,
  X,
} from "lucide-react";
import { Language, TranslationResult, SavedTranslation, SystemAccentColor, AppSettings } from "../types";
import { speakText, stopSpeech } from "../utils/audio";
import { SYSTEM_COLORS } from "../utils/theme";

interface TranslationViewProps {
  sourceLang: Language;
  targetLang: Language;
  onOpenSourceModal: () => void;
  onOpenTargetModal: () => void;
  onSwapLanguages: () => void;
  formality: string;
  onChangeFormality: (val: string) => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  onSaveTranslation: (item: Omit<SavedTranslation, "id" | "timestamp">) => void;
  savedTranslations: SavedTranslation[];
  accentColor: SystemAccentColor;
  settings: AppSettings;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  sourceLang,
  targetLang,
  onOpenSourceModal,
  onOpenTargetModal,
  onSwapLanguages,
  formality,
  onSaveTranslation,
  savedTranslations,
  accentColor,
  settings,
}) => {
  const [inputText, setInputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [isSwapAnimating, setIsSwapAnimating] = useState(false);

  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;
  // Translation is strictly manual (triggered by "תרגם" button or Enter key)
  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate !== undefined ? textToTranslate : inputText;
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang: sourceLang.name,
          sourceLangCode: sourceLang.code,
          targetLang: targetLang.name,
          targetLangCode: targetLang.code,
          text: text,
          formality,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setTranslationResult(data.data);
        if (settings.autoPlayAudio && data.data.translation) {
          speakText(data.data.translation, targetLang.code, undefined, settings.speechRate);
        }
      }
    } catch (err) {
      console.error("Translation request error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Speech Recognition (Mic Input & Dictation)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("זיהוי קולי אינו נתמך בדפדפן זה. אנא השתמש במקלדת.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      sourceLang.code === "he" ? "he-IL" : sourceLang.code === "es" ? "es-ES" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInputText(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handlePlayAudio = (text: string, langCode: string) => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakText(
      text,
      langCode,
      () => setIsPlayingAudio(false),
      settings.speechRate
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSwapWithAnimation = () => {
    setIsSwapAnimating(true);
    onSwapLanguages();
    setTimeout(() => setIsSwapAnimating(false), 300);
  };

  const isSaved = savedTranslations.some(
    (item) =>
      item.sourceText.trim() === inputText.trim() &&
      item.targetLang.code === targetLang.code
  );

  const handleSaveToggle = () => {
    if (!translationResult || !inputText) return;
    onSaveTranslation({
      sourceLang,
      targetLang,
      sourceText: inputText,
      translatedText: translationResult.translation,
      transliteration: translationResult.transliteration,
      isFavorite: true,
    });
  };

  const handleShare = async (textToShare: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Apple Translate",
          text: textToShare,
        });
      } catch (err) {
        // Ignored
      }
    } else {
      handleCopy(textToShare);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3.5 pb-32 animate-in fade-in duration-200">
      
      {/* 1. TOP APPLE LIQUID GLASS CARD: INPUT */}
      <div className="apple-liquid-card rounded-3xl p-5 relative flex flex-col justify-between min-h-[170px] transition-all">
        
        {/* Clear X Button if text is present (Top-Left corner) */}
        {inputText && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => {
                setInputText("");
                setTranslationResult(null);
              }}
              className="apple-liquid-btn p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all cursor-pointer shadow-xs"
              title="נקה טקסט"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clean Textarea with RTL/LTR directional awareness & "הזן טקסט כאן" */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTranslate();
            }
          }}
          placeholder="הזן טקסט כאן"
          dir={sourceLang.dir}
          rows={3}
          className={`w-full bg-transparent text-xl sm:text-2xl font-light text-[#1D1D1F] dark:text-white placeholder-[#86868B]/70 focus:outline-none resize-none leading-relaxed transition-all ${
            inputText ? "pt-5" : "pt-1"
          } ${
            sourceLang.dir === "rtl" ? "text-right" : "text-left"
          }`}
        />

        {/* Bottom Row inside Input Card:
            - Left: Action Button ("תרגם" when text is typed, or Circular Mic when empty)
            - Right: Language indicator (בשפה שבכרטיסיה העליונה בפינה התחתונה בצד ימין) */}
        <div className="flex items-center justify-between pt-2 w-full border-t border-black/5 dark:border-white/5 mt-1">
          {/* Action Button on the Left */}
          <div>
            {inputText.trim().length > 0 ? (
              /* Apple Liquid Glass "תרגם" Button */
              <button
                onClick={() => handleTranslate()}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow-lg shadow-black/5 hover:shadow-xl active:scale-95 transition-all duration-200 cursor-pointer relative overflow-hidden"
                style={{
                  backgroundColor: activeColor.hex,
                  boxShadow: `0 8px 24px -4px ${activeColor.hex}55, inset 0 1.5px 2px rgba(255,255,255,0.45)`,
                }}
                title="תרגם עכשיו"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>תרגם</span>
              </button>
            ) : (
              /* Apple Liquid Glass Circular Mic Button */
              <button
                onClick={toggleListening}
                aria-label="הקלט וכתוב"
                className={`apple-liquid-btn w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 ring-4 ring-red-500/20"
                    : "hover:scale-105"
                }`}
                style={{
                  color: !isListening ? activeColor.hex : undefined,
                }}
                title={isListening ? "עצור הקלטה" : "לחץ להקלטה והכתבה"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
            )}
          </div>

          {/* Language to write - Displayed in the bottom-right corner */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#86868B] dark:text-zinc-400 select-none">
            <span className="text-sm">{sourceLang.flag}</span>
            <span>{sourceLang.nativeName || sourceLang.name}</span>
          </div>
        </div>
      </div>

      {/* 2. FLOATING APPLE LIQUID GLASS CAPSULE PILL (אליפסה שקופה צפה במרכז עם שמות שפות בלבן) */}
      <div className="flex items-center justify-center py-0.5">
        <div className="apple-liquid-pill inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all">
          
          {/* Source Language Button - White text */}
          <button
            onClick={onOpenSourceModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="בחר שפת מקור"
          >
            <span className="text-sm">{sourceLang.flag}</span>
            <span className="truncate max-w-[95px] text-white">{sourceLang.nativeName || sourceLang.name}</span>
          </button>

          {/* Apple Swap Languages Pill Button */}
          <button
            onClick={handleSwapWithAnimation}
            className={`p-1.5 rounded-full hover:bg-white/15 transition-all active:scale-90 text-white/80 hover:text-white cursor-pointer ${
              isSwapAnimating ? "rotate-180 transition-transform duration-300" : ""
            }`}
            title="החלף שפות"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Target Language Button - White text */}
          <button
            onClick={onOpenTargetModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="בחר שפת יעד"
          >
            <span className="text-sm">{targetLang.flag}</span>
            <span className="truncate max-w-[95px] text-white">{targetLang.nativeName || targetLang.name}</span>
          </button>

        </div>
      </div>

      {/* 3. BOTTOM APPLE LIQUID GLASS CARD: OUTPUT */}
      <div className="apple-liquid-card rounded-3xl p-5 min-h-[160px] transition-all relative flex flex-col justify-between">
        
        {/* Loading Spinner */}
        {isTranslating && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${activeColor.hex} transparent ${activeColor.hex} ${activeColor.hex}` }}
            />
            <span className="text-xs font-medium text-[#86868B]">
              מתרגם...
            </span>
          </div>
        )}

        {/* Translation Output when ready */}
        {translationResult && !isTranslating && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Action Bar (Audio Speech, Copy, Bookmark, Share) */}
            <div className="flex items-center justify-end gap-2">
              {/* Audio Playback / Read translated text */}
              <button
                onClick={() =>
                  handlePlayAudio(translationResult.translation, targetLang.code)
                }
                className={`apple-liquid-btn p-2 rounded-full transition-all active:scale-90 ${
                  isPlayingAudio
                    ? "text-white shadow-md animate-bounce"
                    : "text-[#1D1D1F] dark:text-slate-200"
                }`}
                style={{
                  backgroundColor: isPlayingAudio ? activeColor.hex : undefined,
                }}
                title="השמע תרגום"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy(translationResult.translation)}
                className="apple-liquid-btn p-2 rounded-full text-[#1D1D1F] dark:text-slate-200 transition-all active:scale-90"
                title="העתק תרגום"
              >
                {copiedText === translationResult.translation ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleSaveToggle}
                className={`apple-liquid-btn p-2 rounded-full transition-all active:scale-90 ${
                  isSaved
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-[#1D1D1F] dark:text-slate-200"
                }`}
                title="שמור במועדפים"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(translationResult.translation)}
                className="apple-liquid-btn p-2 rounded-full text-[#1D1D1F] dark:text-slate-200 transition-all active:scale-90"
                title="שתף תרגום"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Translated Output Text */}
            <div
              dir={targetLang.dir}
              className={`text-2xl sm:text-3xl font-light leading-snug select-text ${
                targetLang.dir === "rtl" ? "text-right" : "text-left"
              }`}
              style={{ color: activeColor.hex }}
            >
              {translationResult.translation}
            </div>

            {/* Transliteration / Phonetic Reading */}
            {settings.showTransliteration && translationResult.transliteration && (
              <div className="apple-liquid-btn p-2.5 rounded-2xl text-xs text-[#1D1D1F] dark:text-zinc-300 font-mono">
                <span className="text-[10px] text-[#86868B] block mb-0.5">
                  הגייה פונטית / תעתיק:
                </span>
                {translationResult.transliteration}
              </div>
            )}

            {/* Alternative Translations */}
            {translationResult.alternatives && translationResult.alternatives.length > 0 && (
              <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5">
                <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span>תרגומים חלופיים</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {translationResult.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(alt.text)}
                      className="apple-liquid-btn p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                        {alt.text}
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: activeColor.hex }}
                      >
                        {alt.context}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apple Intelligence Grammar & Culture Insight */}
            {translationResult.grammarInsight && (
              <div className="apple-liquid-btn p-3 rounded-2xl text-xs text-[#1D1D1F] dark:text-zinc-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" /> ניתוח דקדוקי והקשר תרבותי
                  </span>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="p-0.5 hover:bg-purple-500/10 rounded-full"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showInsights ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {showInsights && (
                  <div className="space-y-1 text-[#86868B] dark:text-zinc-300 leading-normal pt-1 text-[11px]">
                    {translationResult.grammarInsight.formalityNote && (
                      <div>
                        • <strong className="text-[#1D1D1F] dark:text-white">משלב לשוני:</strong>{" "}
                        {translationResult.grammarInsight.formalityNote}
                      </div>
                    )}
                    {translationResult.grammarInsight.culturalNuance && (
                      <div>
                        • <strong className="text-[#1D1D1F] dark:text-white">הקשר תרבותי:</strong>{" "}
                        {translationResult.grammarInsight.culturalNuance}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Word Dictionary Chips */}
            {translationResult.definitions && translationResult.definitions.length > 0 && (
              <div className="pt-1">
                <button
                  onClick={() => setShowDictionary(!showDictionary)}
                  className="flex items-center justify-between w-full text-[10px] font-bold text-[#86868B] uppercase tracking-widest mb-1.5"
                >
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" style={{ color: activeColor.hex }} />
                    <span>מילון מילים</span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showDictionary ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDictionary && (
                  <div className="space-y-1.5">
                    {translationResult.definitions.map((def, i) => (
                      <div
                        key={i}
                        className="apple-liquid-btn p-2.5 rounded-2xl text-xs flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#1D1D1F] dark:text-white">
                          <span>{def.word}</span>
                          {def.partOfSpeech && (
                            <span
                              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold"
                              style={{
                                backgroundColor: activeColor.softBg,
                                color: activeColor.hex,
                              }}
                            >
                              {def.partOfSpeech}
                            </span>
                          )}
                        </div>
                        <div className="text-[#86868B] dark:text-zinc-300 text-[11px]">
                          {def.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty / Idle State: Pure "יוצג כאן התרגום" */}
        {!translationResult && !isTranslating && (
          <div className="flex-1 flex items-center justify-start py-6" dir="rtl">
            <div className="text-xl sm:text-2xl font-light text-[#86868B]/60 select-none text-right">
              יוצג כאן התרגום
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
