import React, { useState } from "react";
import { Mic, RotateCw, Volume2, Sparkles, MessageSquare } from "lucide-react";
import { Language, ConversationMessage, SystemAccentColor, AppSettings } from "../types";
import { speakText } from "../utils/audio";
import { SYSTEM_COLORS } from "../utils/theme";

interface ConversationViewProps {
  sourceLang: Language;
  targetLang: Language;
  accentColor: SystemAccentColor;
  settings: AppSettings;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  sourceLang,
  targetLang,
  accentColor,
  settings,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<"A" | "B" | null>(null);
  const [isFaceToFace, setIsFaceToFace] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;

  const handleSpeakerTurn = async (speaker: "A" | "B", text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/conversation-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker,
          text,
          userALang: sourceLang.name,
          userBLang: targetLang.name,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const newMsg: ConversationMessage = {
          id: Date.now().toString(),
          speaker,
          speakerName: speaker === "A" ? sourceLang.name : targetLang.name,
          sourceLang: speaker === "A" ? sourceLang.name : targetLang.name,
          targetLang: speaker === "A" ? targetLang.name : sourceLang.name,
          originalText: text,
          translatedText: data.data.translatedText,
          phonetic: data.data.phonetic,
          timestamp: Date.now(),
        };

        setMessages((prev) => [newMsg, ...prev]);

        // Auto-play TTS in translated language
        const targetCode = speaker === "A" ? targetLang.code : sourceLang.code;
        speakText(data.data.translatedText, targetCode, undefined, settings.speechRate);
      }
    } catch (err) {
      console.error("Conversation error:", err);
    } finally {
      setIsProcessing(false);
      setActiveSpeaker(null);
    }
  };

  const startVoiceInput = (speaker: "A" | "B") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const manualText = prompt(
        `הזן טקסט עבור דובר ${speaker === "A" ? sourceLang.name : targetLang.name}:`
      );
      if (manualText) handleSpeakerTurn(speaker, manualText);
      return;
    }

    if (activeSpeaker === speaker) {
      setActiveSpeaker(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      speaker === "A"
        ? sourceLang.code === "he" ? "he-IL" : "en-US"
        : targetLang.code === "he" ? "he-IL" : "es-ES";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setActiveSpeaker(speaker);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) handleSpeakerTurn(speaker, transcript);
    };
    recognition.onerror = () => setActiveSpeaker(null);
    recognition.onend = () => setActiveSpeaker(null);

    recognition.start();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Top Mode Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#1D1D1F] dark:text-white">
          <MessageSquare className="w-4 h-4" style={{ color: activeColor.hex }} />
          <span>שיחה פנים אל פנים (Face to Face)</span>
        </div>

        <button
          onClick={() => setIsFaceToFace(!isFaceToFace)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8E8ED] dark:bg-zinc-800 text-[11px] font-semibold text-[#1D1D1F] dark:text-zinc-200 hover:bg-[#D1D1D6] transition-all"
        >
          <RotateCw className="w-3 h-3" />
          <span>{isFaceToFace ? "תצוגה רגילה" : "סובב מסך (180°)"}</span>
        </button>
      </div>

      {/* Main Conversation Split Screen */}
      <div className="grid grid-cols-1 gap-3">
        {/* Speaker B Panel (Partner - Rotated 180° if FaceToFace) */}
        <div
          className={`bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-[#D1D1D6] dark:border-white/10 shadow-xs transition-transform duration-500 flex flex-col justify-between min-h-[175px] ${
            isFaceToFace ? "rotate-180" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: activeColor.hex }}
            >
              <span>{targetLang.flag}</span>
              <span>דובר B: {targetLang.name}</span>
            </span>
            <span className="text-[10px] bg-[#E8E8ED] dark:bg-zinc-800 text-[#86868B] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              אדם ממול
            </span>
          </div>

          <div className="my-2.5 text-center">
            {activeSpeaker === "B" ? (
              <div className="flex items-center justify-center gap-1 my-2">
                <span
                  className="w-1.5 h-5 rounded-full animate-pulse"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <span
                  className="w-1.5 h-8 rounded-full animate-bounce delay-100"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <span
                  className="w-1.5 h-6 rounded-full animate-pulse delay-200"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <span
                  className="w-1.5 h-9 rounded-full animate-bounce delay-300"
                  style={{ backgroundColor: activeColor.hex }}
                />
              </div>
            ) : (
              <p className="text-xs text-[#86868B]">
                לחץ על המיקרופון כדי לדבר ב-{targetLang.name}
              </p>
            )}
          </div>

          {/* Speaker B Mic Button */}
          <button
            onClick={() => startVoiceInput("B")}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              activeSpeaker === "B"
                ? "bg-red-500 text-white animate-pulse"
                : "text-white shadow-xs"
            }`}
            style={{
              backgroundColor: activeSpeaker === "B" ? undefined : activeColor.hex,
            }}
          >
            <Mic className="w-4 h-4" />
            <span>{activeSpeaker === "B" ? "מקליט..." : `דבר ב-${targetLang.name}`}</span>
          </button>
        </div>

        {/* Divider Visualizer */}
        <div className="flex items-center justify-center my-0.5">
          <div className="h-px bg-[#D1D1D6]/60 dark:bg-zinc-800 flex-1" />
          <div className="px-2 text-[10px] font-bold text-[#86868B] flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" /> תרגום סימולטני
          </div>
          <div className="h-px bg-[#D1D1D6]/60 dark:bg-zinc-800 flex-1" />
        </div>

        {/* Speaker A Panel (You) */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-[#D1D1D6] dark:border-white/10 shadow-xs flex flex-col justify-between min-h-[175px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>{sourceLang.flag}</span>
              <span>דובר A: {sourceLang.name} (אתה)</span>
            </span>
          </div>

          <div className="my-2.5 text-center">
            {activeSpeaker === "A" ? (
              <div className="flex items-center justify-center gap-1 my-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-8 bg-emerald-500 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse delay-200" />
                <span className="w-1.5 h-9 bg-emerald-500 rounded-full animate-bounce delay-300" />
              </div>
            ) : (
              <p className="text-xs text-[#86868B]">
                לחץ על המיקרופון כדי לדבר ב-{sourceLang.name}
              </p>
            )}
          </div>

          {/* Speaker A Mic Button */}
          <button
            onClick={() => startVoiceInput("A")}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              activeSpeaker === "A"
                ? "bg-red-500 text-white animate-pulse"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{activeSpeaker === "A" ? "מקליט..." : `דבר ב-${sourceLang.name}`}</span>
          </button>
        </div>
      </div>

      {/* Transcript Log */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4 border border-[#D1D1D6] dark:border-white/10 space-y-2.5 shadow-xs">
        <h3 className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
          היסטוריית השיחה
        </h3>

        {messages.length === 0 ? (
          <div className="text-center py-5 text-xs text-[#86868B]">
            טרם התקבלו משפטי שיחה. לחץ על המיקרופון והתחל לדבר.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto p-0.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl space-y-1 transition-all ${
                  msg.speaker === "A"
                    ? "bg-emerald-500/10 border border-emerald-500/20 mr-3"
                    : "bg-[#F5F5F7] dark:bg-zinc-800/80 border border-[#D1D1D6]/40 dark:border-white/5 ml-3"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span
                    className={
                      msg.speaker === "A"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : ""
                    }
                    style={{
                      color: msg.speaker === "B" ? activeColor.hex : undefined,
                    }}
                  >
                    {msg.speakerName}
                  </span>
                  <button
                    onClick={() =>
                      speakText(
                        msg.translatedText,
                        msg.targetLang === sourceLang.name
                          ? sourceLang.code
                          : targetLang.code,
                        undefined,
                        settings.speechRate
                      )
                    }
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-[#1D1D1F] dark:text-slate-200">
                  "{msg.originalText}"
                </div>

                <div className="text-sm font-semibold text-[#1D1D1F] dark:text-white pt-1 border-t border-[#D1D1D6]/30 dark:border-white/5">
                  {msg.translatedText}
                </div>

                {settings.showTransliteration && msg.phonetic && (
                  <div className="text-[10px] text-[#86868B] font-mono">
                    {msg.phonetic}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
