import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SidebarTheme = "dark-intelligence" | "light-green" | "light-blue" | "purple";
export type SidebarLayout = "default" | "collapsible" | "icon-based" | "compact";

interface SidebarThemeContextType {
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
  sidebarLayout: SidebarLayout;
  setSidebarLayout: (layout: SidebarLayout) => void;
}

const SidebarThemeContext = createContext<SidebarThemeContextType>({
  sidebarTheme: "dark-intelligence",
  setSidebarTheme: () => {},
  sidebarLayout: "default",
  setSidebarLayout: () => {},
});

export const useSidebarTheme = () => useContext(SidebarThemeContext);

const STORAGE_KEY = "sidebar_preference";
const LAYOUT_STORAGE_KEY = "sidebar_layout_preference";

export const sidebarLayouts: Record<SidebarLayout, { label: string; description: string; icon: string }> = {
  default: {
    label: "Default List",
    description: "Vertical list with clean spacing and optional subsections",
    icon: "☰",
  },
  collapsible: {
    label: "Collapsible",
    description: "Expandable sections with arrow indicators and smooth animation",
    icon: "⊞",
  },
  "icon-based": {
    label: "Icon-Based",
    description: "Icons with labels, subsections lighter with better visual grouping",
    icon: "⊡",
  },
  compact: {
    label: "Compact / Mini",
    description: "Icons only, tooltip on hover, expand on interaction",
    icon: "◻",
  },
};

export const sidebarThemes: Record<SidebarTheme, {
  label: string;
  description: string;
  bg: string;
  activeBg: string;
  activeText: string;
  text: string;
  hoverBg: string;
  borderColor: string;
  accentColor: string;
  gradient: string;
  logoAccent: string;
  liveDot: string;
}> = {
  "dark-intelligence": {
    label: "Dark Intelligence",
    description: "Deep charcoal with neon green accents — Bloomberg-inspired",
    bg: "linear-gradient(180deg, hsl(220 28% 8%), hsl(220 30% 5%))",
    activeBg: "hsl(220 22% 14%)",
    activeText: "hsl(142 70% 45%)",
    text: "hsl(210 15% 75%)",
    hoverBg: "hsl(220 22% 12%)",
    borderColor: "hsl(220 20% 14%)",
    accentColor: "hsl(142 70% 45%)",
    gradient: "linear-gradient(180deg, hsl(220 28% 8%), hsl(220 30% 5%))",
    logoAccent: "hsl(142 70% 45%)",
    liveDot: "hsl(142 70% 45%)",
  },
  "light-green": {
    label: "Light Green",
    description: "Clean white sidebar with green highlights — eco-focused",
    bg: "linear-gradient(180deg, hsl(0 0% 100%), hsl(140 20% 97%))",
    activeBg: "hsl(142 50% 92%)",
    activeText: "hsl(142 60% 30%)",
    text: "hsl(220 15% 40%)",
    hoverBg: "hsl(140 20% 95%)",
    borderColor: "hsl(140 15% 88%)",
    accentColor: "hsl(142 60% 38%)",
    gradient: "linear-gradient(180deg, hsl(0 0% 100%), hsl(140 20% 97%))",
    logoAccent: "hsl(142 60% 38%)",
    liveDot: "hsl(142 60% 38%)",
  },
  "light-blue": {
    label: "Light Blue",
    description: "Soft blue-tinted sidebar — professional analytics",
    bg: "linear-gradient(180deg, hsl(210 25% 98%), hsl(210 20% 95%))",
    activeBg: "hsl(210 50% 92%)",
    activeText: "hsl(210 70% 40%)",
    text: "hsl(220 15% 40%)",
    hoverBg: "hsl(210 20% 94%)",
    borderColor: "hsl(210 15% 88%)",
    accentColor: "hsl(210 70% 50%)",
    gradient: "linear-gradient(180deg, hsl(210 25% 98%), hsl(210 20% 95%))",
    logoAccent: "hsl(210 70% 50%)",
    liveDot: "hsl(210 70% 50%)",
  },
  "purple": {
    label: "Purple",
    description: "Vibrant purple sidebar with orange accents — bold & modern",
    bg: "linear-gradient(180deg, hsl(270 30% 25%), hsl(270 35% 18%))",
    activeBg: "hsl(25 90% 55%)",
    activeText: "hsl(0 0% 100%)",
    text: "hsl(270 20% 80%)",
    hoverBg: "hsl(270 25% 30%)",
    borderColor: "hsl(270 25% 30%)",
    accentColor: "hsl(25 90% 55%)",
    gradient: "linear-gradient(180deg, hsl(270 30% 25%), hsl(270 35% 18%))",
    logoAccent: "hsl(25 90% 55%)",
    liveDot: "hsl(25 90% 55%)",
  },
};

export function SidebarThemeProvider({ children }: { children: ReactNode }) {
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in sidebarThemes) return saved as SidebarTheme;
    return "dark-intelligence";
  });

  const setSidebarTheme = (theme: SidebarTheme) => {
    setSidebarThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in sidebarThemes) {
      setSidebarThemeState(saved as SidebarTheme);
    }
  }, []);

  return (
    <SidebarThemeContext.Provider value={{ sidebarTheme, setSidebarTheme }}>
      {children}
    </SidebarThemeContext.Provider>
  );
}
