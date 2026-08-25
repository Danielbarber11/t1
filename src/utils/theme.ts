import { SystemAccentColor } from "../types";

export interface ColorDefinition {
  id: SystemAccentColor;
  name: string;
  hebrewName: string;
  hex: string;
  hoverHex: string;
  softBg: string;
  softBgDark: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  ringClass: string;
}

export const SYSTEM_COLORS: Record<SystemAccentColor, ColorDefinition> = {
  blue: {
    id: "blue",
    name: "Classic Blue",
    hebrewName: "כחול אפל קלאסי",
    hex: "#007AFF",
    hoverHex: "#0066d6",
    softBg: "rgba(0, 122, 255, 0.12)",
    softBgDark: "rgba(0, 122, 255, 0.22)",
    textClass: "text-[#007AFF] dark:text-[#0A84FF]",
    bgClass: "bg-[#007AFF] text-white",
    borderClass: "border-[#007AFF]",
    ringClass: "focus:ring-[#007AFF]",
  },
  purple: {
    id: "purple",
    name: "Deep Purple",
    hebrewName: "סגול עמוק",
    hex: "#AF52DE",
    hoverHex: "#983cc4",
    softBg: "rgba(175, 82, 222, 0.12)",
    softBgDark: "rgba(175, 82, 222, 0.22)",
    textClass: "text-[#AF52DE] dark:text-[#BF5AF2]",
    bgClass: "bg-[#AF52DE] text-white",
    borderClass: "border-[#AF52DE]",
    ringClass: "focus:ring-[#AF52DE]",
  },
  orange: {
    id: "orange",
    name: "Sunset Orange",
    hebrewName: "כתום שקיעה",
    hex: "#FF9500",
    hoverHex: "#e08300",
    softBg: "rgba(255, 149, 0, 0.12)",
    softBgDark: "rgba(255, 149, 0, 0.22)",
    textClass: "text-[#FF9500] dark:text-[#FF9F0A]",
    bgClass: "bg-[#FF9500] text-white",
    borderClass: "border-[#FF9500]",
    ringClass: "focus:ring-[#FF9500]",
  },
  green: {
    id: "green",
    name: "Mint Green",
    hebrewName: "ירוק מנטה",
    hex: "#34C759",
    hoverHex: "#2bb14c",
    softBg: "rgba(52, 199, 89, 0.12)",
    softBgDark: "rgba(52, 199, 89, 0.22)",
    textClass: "text-[#34C759] dark:text-[#30D158]",
    bgClass: "bg-[#34C759] text-white",
    borderClass: "border-[#34C759]",
    ringClass: "focus:ring-[#34C759]",
  },
  pink: {
    id: "pink",
    name: "Fuchsia Pink",
    hebrewName: "ורוד פוקסיה",
    hex: "#FF2D55",
    hoverHex: "#e02246",
    softBg: "rgba(255, 45, 85, 0.12)",
    softBgDark: "rgba(255, 45, 85, 0.22)",
    textClass: "text-[#FF2D55] dark:text-[#FF375F]",
    bgClass: "bg-[#FF2D55] text-white",
    borderClass: "border-[#FF2D55]",
    ringClass: "focus:ring-[#FF2D55]",
  },
  teal: {
    id: "teal",
    name: "Glacier Teal",
    hebrewName: "טורקיז קרח",
    hex: "#30B0C7",
    hoverHex: "#2397ac",
    softBg: "rgba(48, 176, 199, 0.12)",
    softBgDark: "rgba(48, 176, 199, 0.22)",
    textClass: "text-[#30B0C7] dark:text-[#64D2FF]",
    bgClass: "bg-[#30B0C7] text-white",
    borderClass: "border-[#30B0C7]",
    ringClass: "focus:ring-[#30B0C7]",
  },
  indigo: {
    id: "indigo",
    name: "Electric Indigo",
    hebrewName: "אינדיגו חשמלי",
    hex: "#5856D6",
    hoverHex: "#4644c0",
    softBg: "rgba(88, 86, 214, 0.12)",
    softBgDark: "rgba(88, 86, 214, 0.22)",
    textClass: "text-[#5856D6] dark:text-[#5E5CE6]",
    bgClass: "bg-[#5856D6] text-white",
    borderClass: "border-[#5856D6]",
    ringClass: "focus:ring-[#5856D6]",
  },
  graphite: {
    id: "graphite",
    name: "Space Graphite",
    hebrewName: "גרפיט אפל",
    hex: "#1D1D1F",
    hoverHex: "#000000",
    softBg: "rgba(29, 29, 31, 0.12)",
    softBgDark: "rgba(255, 255, 255, 0.15)",
    textClass: "text-[#1D1D1F] dark:text-[#E5E5EA]",
    bgClass: "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]",
    borderClass: "border-[#1D1D1F] dark:border-white/20",
    ringClass: "focus:ring-[#1D1D1F]",
  },
};

export const applySystemAccentCss = (accent: SystemAccentColor) => {
  const color = SYSTEM_COLORS[accent] || SYSTEM_COLORS.blue;
  document.documentElement.style.setProperty("--system-accent", color.hex);
  document.documentElement.style.setProperty("--system-accent-hover", color.hoverHex);
  document.documentElement.style.setProperty("--system-accent-soft", color.softBg);
  document.documentElement.style.setProperty("--system-accent-soft-dark", color.softBgDark);
};
