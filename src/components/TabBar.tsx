import React, { useState } from "react";
import {
  Globe,
  MessageSquare,
  Camera,
  BookMarked,
  Sliders,
  ImageIcon,
  X,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TabType, SystemAccentColor } from "../types";
import { SYSTEM_COLORS } from "../utils/theme";

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  accentColor: SystemAccentColor;
  onCameraCapture?: () => void;
  onCameraGallery?: () => void;
  onToggleCameraSettings?: () => void;
  isCameraAnalyzing?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  accentColor,
  onCameraCapture,
  onCameraGallery,
  onToggleCameraSettings,
  isCameraAnalyzing = false,
}) => {
  const activeColor = SYSTEM_COLORS[accentColor] || SYSTEM_COLORS.blue;
  const [previousTab, setPreviousTab] = useState<TabType>("translate");
  const [isShutterPressed, setIsShutterPressed] = useState(false);

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }[] = [
    { id: "translate", label: "תרגום", icon: Globe },
    { id: "conversation", label: "שיחה", icon: MessageSquare },
    { id: "camera", label: "מצלמה", icon: Camera },
    { id: "phrases", label: "שיחון", icon: BookMarked },
    { id: "settings", label: "הגדרות", icon: Sliders },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab !== "camera") {
      setPreviousTab(activeTab);
    }
    onChangeTab(tabId);
  };

  const handleExitCamera = () => {
    onChangeTab(previousTab === "camera" ? "translate" : previousTab);
  };

  const handleCaptureClick = () => {
    setIsShutterPressed(true);
    setTimeout(() => setIsShutterPressed(false), 250);
    if (onCameraCapture) {
      onCameraCapture();
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex flex-col items-center justify-center pointer-events-none px-4">
      {/* Morphing Floating Ellipse Dock */}
      <motion.nav
        layout
        initial={false}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        aria-label="Bottom Navigation"
        className={`pointer-events-auto apple-liquid-pill flex items-center justify-center ${
          activeTab === "camera"
            ? "rounded-full px-5 py-2 min-w-[280px] max-w-[320px] gap-6"
            : "rounded-full px-3 py-1.5 w-full max-w-[390px]"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "camera" ? (
            /* Camera Mode: Morphed Circular Shutter & Controls Dock */
            <motion.div
              key="camera-dock"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between w-full"
            >
              {/* Left Button: Add from Gallery */}
              <button
                onClick={onCameraGallery}
                className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                title="הוסף מהגלריה"
                aria-label="הוסף מהגלריה"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8E8ED] dark:bg-zinc-800 flex items-center justify-center border border-[#D1D1D6]/60 dark:border-white/10 group-hover:bg-[#D1D1D6] transition-colors shadow-xs">
                  <ImageIcon className="w-4 h-4" style={{ color: activeColor.hex }} />
                </div>
                <span className="text-[9px] font-semibold text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white">
                  גלריה
                </span>
              </button>

              {/* Center Morphing Circular Shutter Button (אפקט התכווצות לעיגול מושלם) */}
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={handleCaptureClick}
                  whileTap={{ scale: 0.86 }}
                  className="relative flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label="צלם ותרגם"
                >
                  {/* Outer Pulsing Ring */}
                  <div
                    className={`w-15 h-15 rounded-full border-[3px] p-0.5 transition-all duration-200 flex items-center justify-center ${
                      isShutterPressed || isCameraAnalyzing
                        ? "border-red-500 shadow-lg scale-95"
                        : "border-zinc-400 dark:border-zinc-500 shadow-md hover:border-zinc-600 hover:scale-105"
                    }`}
                    style={{
                      borderColor:
                        isShutterPressed || isCameraAnalyzing ? activeColor.hex : undefined,
                    }}
                  >
                    {/* Inner Colored Core Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
                        isShutterPressed ? "scale-90" : "scale-100"
                      }`}
                      style={{ backgroundColor: activeColor.hex }}
                    >
                      {isCameraAnalyzing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </motion.button>
                <span className="text-[9px] font-bold text-[#86868B] mt-0.5">
                  {isCameraAnalyzing ? "מעבד..." : "צלם"}
                </span>
              </div>

              {/* Right Button: Camera Settings */}
              <button
                onClick={onToggleCameraSettings}
                className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                title="הגדרות צילום"
                aria-label="הגדרות צילום"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8E8ED] dark:bg-zinc-800 flex items-center justify-center border border-[#D1D1D6]/60 dark:border-white/10 group-hover:bg-[#D1D1D6] transition-colors shadow-xs">
                  <SlidersHorizontal className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white" />
                </div>
                <span className="text-[9px] font-semibold text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white">
                  הגדרות
                </span>
              </button>

              {/* Close/Back Button to Expand back to full Navigation Ellipse */}
              <button
                onClick={handleExitCamera}
                className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
                title="חזרה לניווט"
                aria-label="חזרה לניווט"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            /* Regular Mode: Full 5-Tab Floating Ellipse */
            <motion.div
              key="tabs-dock"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-5 items-center justify-between w-full"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isCameraTab = tab.id === "camera";

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className="flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 group focus:outline-none relative"
                  >
                    {/* Camera Tab Highlight Pulse */}
                    {isCameraTab && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-105"
                        style={{
                          backgroundColor: activeColor.softBg,
                        }}
                      >
                        <Icon
                          className="w-5 h-5 transition-transform duration-200"
                          style={{
                            color: activeColor.hex,
                          }}
                        />
                      </div>
                    )}

                    {!isCameraTab && (
                      <div className="relative flex items-center justify-center h-8">
                        <Icon
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                          }`}
                          style={{
                            color: isActive ? activeColor.hex : undefined,
                          }}
                        />
                      </div>
                    )}

                    <span
                      className={`text-[10px] mt-0.5 tracking-tight font-medium transition-colors ${
                        isActive
                          ? "font-bold"
                          : "text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white"
                      }`}
                      style={{
                        color: isActive ? activeColor.hex : undefined,
                      }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

