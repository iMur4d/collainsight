import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, BookOpen, FolderKanban, Users, Sparkles,
  Network, Search, Settings, Bell, ChevronRight, ArrowRight,
  TrendingUp, Brain, Zap, Star, Clock, Tag, Filter, Plus,
  MessageSquare, Activity, BarChart3, Hash, Eye, Bookmark,
  GitBranch, Lightbulb, Target, Globe, ChevronDown, X, Menu,
  Moon, Sun, SunDim, Monitor
} from "lucide-react";

import colorLogoSrc from "@/imports/CollaInsight__C__logo_-_color.svg";
import fullLogoSrc from "@/imports/pasted_text/logo.svg";
import heroBgSrc from "@/imports/HeroSection_Example.png";
import fullTextLogoSrc from "@/imports/pasted_text/logo.svg";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";


export type ThemeId = "dark" | "dim" | "midnight" | "light";

const THEMES: { id: ThemeId; label: string; icon: React.ElementType; vars: Record<string, string> }[] = [
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    vars: {
      "--background": "#07080d",
      "--foreground": "#e8ecf8",
      "--card": "rgba(13, 16, 24, 0.45)",
      "--card-foreground": "#e8ecf8",
      "--secondary": "rgba(19, 24, 38, 0.5)",
      "--secondary-foreground": "#c0c8e0",
      "--muted": "rgba(19, 24, 38, 0.4)",
      "--muted-foreground": "#6b7599",
      "--border": "rgba(255,255,255,0.08)",
      "--input-background": "rgba(19, 24, 38, 0.5)",
      "--sidebar-bg": "rgba(10, 12, 20, 0.4)",
      "--sidebar-border": "rgba(255,255,255,0.08)",
      "--topbar-bg": "rgba(7, 8, 13, 0.4)",
      "--node-label": "#c0c8e0",
      "--grid-line": "rgba(255,255,255,0.02)",
    },
  },
  {
    id: "dim",
    label: "Dim",
    icon: SunDim,
    vars: {
      "--background": "#161b27",
      "--foreground": "#cdd5f0",
      "--card": "rgba(28, 34, 54, 0.45)",
      "--card-foreground": "#cdd5f0",
      "--secondary": "rgba(30, 38, 64, 0.5)",
      "--secondary-foreground": "#a8b4d8",
      "--muted": "rgba(30, 38, 64, 0.4)",
      "--muted-foreground": "#5a688a",
      "--border": "rgba(255,255,255,0.09)",
      "--input-background": "rgba(30, 38, 64, 0.5)",
      "--sidebar-bg": "rgba(19, 24, 37, 0.4)",
      "--sidebar-border": "rgba(255,255,255,0.08)",
      "--topbar-bg": "rgba(22, 27, 39, 0.4)",
      "--node-label": "#a8b4d8",
      "--grid-line": "rgba(255,255,255,0.03)",
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    icon: Monitor,
    vars: {
      "--background": "#000000",
      "--foreground": "#f0f4ff",
      "--card": "rgba(9, 11, 16, 0.45)",
      "--card-foreground": "#f0f4ff",
      "--secondary": "rgba(13, 16, 23, 0.5)",
      "--secondary-foreground": "#c8d0f0",
      "--muted": "rgba(13, 16, 23, 0.4)",
      "--muted-foreground": "#4a5580",
      "--border": "rgba(37,99,235,0.2)",
      "--input-background": "rgba(13, 16, 23, 0.5)",
      "--sidebar-bg": "rgba(5, 6, 10, 0.4)",
      "--sidebar-border": "rgba(37,99,235,0.15)",
      "--topbar-bg": "rgba(0, 0, 0, 0.4)",
      "--node-label": "#c8d0f0",
      "--grid-line": "rgba(37,99,235,0.06)",
    },
  },
  {
    id: "light",
    label: "Light",
    icon: Sun,
    vars: {
      "--background": "#f5f7ff",
      "--foreground": "#0f1528",
      "--card": "rgba(255, 255, 255, 0.65)",
      "--card-foreground": "#0f1528",
      "--secondary": "rgba(238, 241, 251, 0.6)",
      "--secondary-foreground": "#2d3a5e",
      "--muted": "rgba(238, 241, 251, 0.5)",
      "--muted-foreground": "#7080a8",
      "--border": "rgba(0,0,0,0.06)",
      "--input-background": "rgba(255, 255, 255, 0.7)",
      "--sidebar-bg": "rgba(245, 247, 255, 0.5)",
      "--sidebar-border": "rgba(0,0,0,0.05)",
      "--topbar-bg": "rgba(245, 247, 255, 0.5)",
      "--node-label": "#2d3a5e",
      "--grid-line": "rgba(0,0,0,0.03)",
    },
  },
];

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>("dark");

  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId)!;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [themeId]);

  return { themeId, setThemeId, theme: THEMES.find(t => t.id === themeId)! };
}

// Shared context so any component can read current vars
export const ThemeContext = React.createContext<{ themeId: ThemeId; isLight: boolean }>({ themeId: "dark", isLight: false });

export type View = "landing" | "dashboard" | "knowledge" | "projects" | "collaboration" | "insights" | "graph";

// `mvp: false` items stay fully implemented (see App.tsx's viewMap) but are
// rendered as disabled "Coming Soon" entries in the sidebar — see AppShell.
// Flip to `true` to re-enable a module without any routing changes.
export const NAV_ITEMS = [
  { id: "dashboard" as View, icon: LayoutDashboard, label: "Dashboard", mvp: true },
  { id: "knowledge" as View, icon: BookOpen, label: "Knowledge", mvp: true },
  { id: "projects" as View, icon: FolderKanban, label: "Projects", mvp: true },
  { id: "collaboration" as View, icon: Users, label: "Collaboration", mvp: false },
  { id: "insights" as View, icon: Sparkles, label: "AI Insights", mvp: false },
  { id: "graph" as View, icon: Network, label: "Knowledge Graph", mvp: false },
];

export function LooperWave({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1440" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#06B6D4" stopOpacity="0.5" />
          <stop offset="1" stopColor="#3B82F6" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="wave-grad2" x1="1440" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {[...Array(12)].map((_, i) => (
        <ellipse
          key={i}
          cx={720}
          cy={400 + i * 30}
          rx={360 + i * 55}
          ry={200 + i * 18}
          stroke="url(#wave-grad)"
          strokeWidth="1.5"
          fill="none"
          opacity={1 - i * 0.07}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <ellipse
          key={`b${i}`}
          cx={500}
          cy={380 + i * 25}
          rx={280 + i * 45}
          ry={160 + i * 14}
          stroke="url(#wave-grad2)"
          strokeWidth="1"
          fill="none"
          opacity={0.6 - i * 0.06}
        />
      ))}
    </svg>
  );
}

export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{ backgroundImage: "linear-gradient(97deg, #2563EB 0%, #06B6D4 55%, #3B82F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
    >
      {children}
    </span>
  );
}

export function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "cyan" | "purple" | "green" | "amber" }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ─── THEME SWITCHER ───────────────────────────────────────────────────────────

export function ThemeSwitcher({ themeId, setThemeId }: { themeId: ThemeId; setThemeId: (id: ThemeId) => void }) {
  const [open, setOpen] = useState(false);
  const current = THEMES.find(t => t.id === themeId)!;
  const Icon = current.icon;
  const isLight = themeId === "light";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105"
        style={{
          background: isLight ? "#eef1fb" : "rgba(255,255,255,0.06)",
          borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
          color: isLight ? "#2d3a5e" : "#c0c8e0",
        }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:block">{current.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden"
            style={{
              background: isLight ? "#ffffff" : "#0d1018",
              borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: isLight ? "#7080a8" : "#3a4260" }}>Screen Mode</p>
            </div>
            {THEMES.map(t => {
              const TIcon = t.icon;
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  onClick={() => { setThemeId(t.id); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
                  style={{
                    background: active ? (isLight ? "rgba(37,99,235,0.08)" : "rgba(37,99,235,0.12)") : "transparent",
                    color: active ? "#2563EB" : (isLight ? "#2d3a5e" : "#c0c8e0"),
                  }}
                >
                  <TIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{t.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
              );
            })}
            {/* Preview swatches */}
            <div className="p-3 border-t flex gap-2" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)" }}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => { setThemeId(t.id); setOpen(false); }}
                  className="flex-1 h-5 rounded-md border-2 transition-all"
                  style={{
                    background: t.vars["--background"],
                    borderColor: t.id === themeId ? "#2563EB" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SHARED THEME HOOK ────────────────────────────────────────────────────────

export function useThemeCtx() {
  const { themeId, isLight } = React.useContext(ThemeContext);
  const fg = isLight ? "#0f1528" : "var(--foreground)";
  const mutedFg = isLight ? "#7080a8" : "#6b7599";
  const subFg = isLight ? "#bbc5e0" : "#3a4260";
  const cardBg = "var(--card)";
  const border = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
  const hoverBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const divider = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
  const inputBg = "var(--input-background)";
  return { themeId, isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider, inputBg };
}
