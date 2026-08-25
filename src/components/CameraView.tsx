import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  ImageIcon,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  ArrowLeftRight,
  ArrowRight,
  ChevronRight,
  ScanLine,
  X,
  FlipHorizontal,
  Lightbulb,
} from "lucide-react";
import { Language, CameraBlock, SystemAccentColor, AppSettings } from "../types";
import { speakText } from "../utils/audio";
import { SYSTEM_COLORS } from "../utils/theme";

interface CameraViewProps {
  sourceLang?: Language;
  targetLang: Language;
  onOpenSourceModal?: () => void;
  onOpenTargetModal?: () => void;
  onSwapLanguages?: () => void;
  onBack: () => void;
  accentColor: SystemAccentColor;
  settings: AppSettings;
}

// Preset travel sample images for instant demo testing
const SAMPLE_IMAGES = [
  {
    id: "s1",
    title: "תפריט מסעדה",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s2",
    title: "שלט רחוב",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s3",
    title: "לוח טיסות",
    url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80",
  },
];

export const CameraView: React.FC<CameraViewProps> = ({
  sourceLang,
  targetLang,
  onOpenSourceModal,
  onOpenTargetModal,
  onSwapLanguages,
  onBack,
  accentColor,
  settings,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [detectedText, setDetectedText] = useState<string>("");
  const [overallTranslation, setOverallTranslation] = useState<string>("");
  const [blocks, setBlocks] = useState<CameraBlock[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isShutterPressed, setIsShutterPressed] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;

  // Start live webcam / camera stream
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        // Fallback to sample if getUserMedia not supported
        setIsCameraActive(false);
      }
    } catch (err) {
      console.warn("Camera access not available or permission denied, using photo/sample mode:", err);
      setIsCameraActive(false);
      // Default to first sample if camera is unavailable
      if (!capturedImage && !selectedSampleId) {
        setCapturedImage(SAMPLE_IMAGES[0].url);
        setSelectedSampleId(SAMPLE_IMAGES[0].id);
      }
    }
  }, [cameraFacing, capturedImage, selectedSampleId]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture frame from video or file
  const handleCapture = () => {
    setIsShutterPressed(true);
    setTimeout(() => setIsShutterPressed(false), 200);

    if (isCameraActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        analyzeImage(dataUrl);
      }
    } else if (capturedImage) {
      analyzeImage(capturedImage);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setSelectedSampleId(null);
        analyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_IMAGES)[0]) => {
    setSelectedSampleId(sample.id);
    setCapturedImage(sample.url);
    analyzeImage(sample.url);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedSampleId(null);
    setBlocks([]);
    setDetectedText("");
    setOverallTranslation("");
    startCamera();
  };

  const analyzeImage = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setBlocks([]);
    setDetectedText("");
    setOverallTranslation("");

    try {
      const response = await fetch("/api/translate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageSrc,
          targetLang: targetLang.name,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setDetectedText(data.data.detectedFullText || "");
        setOverallTranslation(data.data.overallTranslation || "");
        setBlocks(data.data.blocks || []);
      }
    } catch (err) {
      console.error("Camera analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* Hidden Gallery File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* =========================================================================
          1. FULL SCREEN CAMERA VIEWFINDER (כל המסך הוא המצלמה / התמונה)
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            capturedImage ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />

        {/* Captured or Sample Photo Preview */}
        {capturedImage && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={capturedImage}
              alt="צילום מצלמה"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />

            {/* Live AR Text Bounding Boxes on the Image */}
            {!isAnalyzing &&
              blocks.map((block, i) => (
                <div
                  key={i}
                  style={{
                    top: `${block.box.top}%`,
                    left: `${block.box.left}%`,
                    width: `${block.box.width}%`,
                    height: `${block.box.height}%`,
                    backgroundColor: `${activeColor.hex}E6`,
                  }}
                  className="absolute backdrop-blur-md text-white text-xs font-semibold p-1.5 rounded-xl border border-white/40 shadow-lg flex items-center justify-center text-center transition-transform hover:scale-105 hover:z-20 cursor-pointer animate-in zoom-in-95 duration-200"
                  title={`מקור: ${block.originalText}`}
                  onClick={() =>
                    speakText(
                      block.translatedText,
                      targetLang.code,
                      undefined,
                      settings.speechRate
                    )
                  }
                >
                  <span className="line-clamp-2">{block.translatedText}</span>
                </div>
              ))}
          </div>
        )}

        {/* Apple Camera Viewfinder Corner Grid Framing */}
        <div className="absolute inset-8 sm:inset-16 pointer-events-none border border-white/15 rounded-3xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-white/80 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-white/80 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-white/80 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-white/80 rounded-br-xl" />
        </div>

        {/* Scanning & Translating Pulse Line Animation */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 z-30 animate-in fade-in duration-200">
            <div
              className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: `${activeColor.hex} transparent ${activeColor.hex} ${activeColor.hex}`,
              }}
            />
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> סורק ומתרגם טקסט...
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. TOP HEADER: BACK BUTTON IN THE CORNER (בפינה העליונה לחצן חזור)
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Back Button (לחצן חזור בפינה העליונה) */}
        <button
          onClick={onBack}
          className="apple-liquid-btn px-4 py-2 rounded-full text-white font-medium text-sm flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          title="חזור למסך תרגום"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          <span>חזור</span>
        </button>

        {/* Right Corner: Flip Camera or Retake if captured */}
        <div className="flex items-center gap-2">
          {capturedImage ? (
            <button
              onClick={handleRetake}
              className="apple-liquid-btn px-3.5 py-2 rounded-full text-white font-medium text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
              title="צלם שוב"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>צלם שוב</span>
            </button>
          ) : (
            <button
              onClick={toggleCameraFacing}
              className="apple-liquid-btn p-2.5 rounded-full text-white shadow-lg active:scale-90 transition-all cursor-pointer"
              title="החלף מצלמה (קדמית / אחורית)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. SAMPLES STRIP (אם המשתמש רוצה לנסות דוגמאות מוכנות)
         ========================================================================= */}
      {!overallTranslation && (
        <div className="relative z-30 px-4 flex items-center justify-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-[10px] font-bold text-white/70 pr-1 pl-0.5 whitespace-nowrap">
              דוגמאות:
            </span>
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedSampleId === sample.id
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM CONTROLS: FLOATING LANGUAGE ELLIPSE + SHUTTER BUTTON (אליפסת שפה + לחצן צלם)
         ========================================================================= */}
      <div className="relative z-30 flex flex-col items-center pb-8 pt-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent gap-4">
        
        {/* Floating Language Capsule Pill (מעל הלחצן אליפסה של השפה שצריך לתרגם עם שמות בלבן) */}
        <div className="apple-liquid-pill inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all shadow-xl">
          {/* Source Language Button */}
          <button
            onClick={onOpenSourceModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="בחר שפת מקור"
          >
            <span className="text-sm">{sourceLang?.flag || "🌐"}</span>
            <span className="truncate max-w-[95px] text-white">
              {sourceLang?.nativeName || sourceLang?.name || "זהה שפה"}
            </span>
          </button>

          {/* Swap Button */}
          {onSwapLanguages && (
            <button
              onClick={onSwapLanguages}
              className="p-1.5 rounded-full hover:bg-white/15 transition-all active:scale-90 text-white/80 hover:text-white cursor-pointer"
              title="החלף שפות"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          )}

          {/* Target Language Button */}
          <button
            onClick={onOpenTargetModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            title="בחר שפת יעד"
          >
            <span className="text-sm">{targetLang.flag}</span>
            <span className="truncate max-w-[95px] text-white">
              {targetLang.nativeName || targetLang.name}
            </span>
          </button>
        </div>

        {/* Bottom Shutter Action Bar (לחצן צלם + גלריה) */}
        <div className="flex items-center justify-center gap-8 w-full px-8">
          {/* Left: Gallery Picker Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full apple-liquid-btn flex flex-col items-center justify-center text-white/90 hover:text-white shadow-lg active:scale-90 transition-all cursor-pointer"
            title="בחר תמונה מהגלריה"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Center: Apple Camera Shutter Button (לחצן צלם עגול יוקרתי) */}
          <button
            onClick={handleCapture}
            disabled={isAnalyzing}
            className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 shadow-2xl transition-all cursor-pointer ${
              isShutterPressed ? "scale-90" : "hover:scale-105 active:scale-95"
            }`}
            title="צלם ותרגם"
          >
            <div
              className={`w-full h-full rounded-full transition-all duration-200 ${
                isAnalyzing
                  ? "bg-amber-400 animate-pulse"
                  : "bg-white hover:bg-zinc-100"
              }`}
            />
          </button>

          {/* Right: Retake / Refresh icon */}
          <button
            onClick={capturedImage ? handleRetake : () => startCamera()}
            className="w-12 h-12 rounded-full apple-liquid-btn flex flex-col items-center justify-center text-white/90 hover:text-white shadow-lg active:scale-90 transition-all cursor-pointer"
            title={capturedImage ? "אפס תמונה" : "רענן מצלמה"}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. TRANSLATION RESULTS SHEET (אם תורגם טקסט, כרטיסיית תוצאות זכוכית נוזלית)
         ========================================================================= */}
      {overallTranslation && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 animate-in slide-in-from-bottom duration-300">
          <div className="apple-liquid-card rounded-3xl p-5 border border-white/20 shadow-2xl space-y-3 max-h-[45vh] overflow-y-auto">
            {/* Header with Title & Action Buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>תרגום טקסט מהתמונה</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Audio Speech */}
                <button
                  onClick={() =>
                    speakText(
                      overallTranslation,
                      targetLang.code,
                      undefined,
                      settings.speechRate
                    )
                  }
                  className="apple-liquid-btn p-2 rounded-full text-white active:scale-90 transition-all cursor-pointer"
                  title="השמע תרגום"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Copy Text */}
                <button
                  onClick={() => handleCopy(overallTranslation)}
                  className="apple-liquid-btn p-2 rounded-full text-white active:scale-90 transition-all cursor-pointer"
                  title="העתק תרגום"
                >
                  {copiedText === overallTranslation ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Close Result Sheet */}
                <button
                  onClick={() => setOverallTranslation("")}
                  className="apple-liquid-btn p-2 rounded-full text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
                  title="סגור תוצאה"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Translated Output Text */}
            <div
              dir={targetLang.dir}
              className="text-lg sm:text-xl font-light text-white leading-relaxed select-text"
              style={{ color: activeColor.hex }}
            >
              {overallTranslation}
            </div>

            {/* Detected Source Text Preview */}
            {detectedText && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/70">
                <span className="text-[10px] text-white/50 block mb-0.5">
                  טקסט מקור שזוהה:
                </span>
                {detectedText}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
