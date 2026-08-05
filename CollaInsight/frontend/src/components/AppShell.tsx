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


import { ThemeId, View, THEMES, ThemeContext, NAV_ITEMS, useTheme, useThemeCtx } from "@/shared";
import { Badge, GradientText, LooperWave, ThemeSwitcher } from "@/shared";

export function AppShell({ view, setView, children, themeId, setThemeId }: {
  view: View;
  setView: (v: View) => void;
  children: React.ReactNode;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) setSidebarOpen(false);
      else if (!mobile && !sidebarOpen) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isLight = themeId === "light";

  const fg = isLight ? "#0f1528" : "var(--foreground)";
  const mutedFg = isLight ? "#7080a8" : "#6b7599";
  const borderColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
  const hoverBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";

  return (
    <div
      className="h-screen font-['Plus_Jakarta_Sans',sans-serif] flex overflow-hidden transition-colors duration-300 relative"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
          style={{ background: "#2563EB", top: "-10%", left: "-10%" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: "#06B6D4", bottom: "-10%", right: "-5%" }}
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sidebar - z-10 ensures it's above the ambient orbs on desktop, z-50 for mobile */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r transition-all duration-300 ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "relative z-10"} ${isMobile ? (sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64") : (sidebarOpen ? "w-56 translate-x-0" : "w-14 translate-x-0")}`}
        style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 h-14 border-b ${!sidebarOpen ? "justify-center" : ""}`}
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          {!sidebarOpen && (
            <img src={colorLogoSrc} alt="CollaInsight" className="h-7 w-auto flex-shrink-0" />
          )}
          {sidebarOpen && (
            <img
              src={fullLogoSrc}
              alt="CollaInsight"
              className="h-6 w-auto transition-all"
              style={{ filter: isLight ? "invert(1) brightness(0.2)" : "none", opacity: 0.9 }}
            />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter(item => item.mvp).map(item => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active ? "rgba(37,99,235,0.12)" : "transparent",
                  color: active ? "#2563EB" : mutedFg,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = fg; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = mutedFg; } }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate font-medium">{item.label}</span>}
                {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </button>
            );
          })}

          {sidebarOpen && NAV_ITEMS.some(item => !item.mvp) && (
            <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: isLight ? "#bbc5e0" : "#3a4260" }}>Coming Soon</div>
          )}

          {NAV_ITEMS.filter(item => !item.mvp).map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                title={`${item.label} — coming soon`}
                aria-disabled="true"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm opacity-50 cursor-not-allowed select-none"
                style={{ color: mutedFg }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate font-medium flex-1">{item.label}</span>}
                {sidebarOpen && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", color: isLight ? "#bbc5e0" : "#3a4260" }}
                  >
                    Soon
                  </span>
                )}
              </div>
            );
          })}

          {sidebarOpen && (
            <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: isLight ? "#bbc5e0" : "#3a4260" }}>Workspace</div>
          )}

          {[{ id: "search", icon: Search, label: "Search" }, { id: "settings", icon: Settings, label: "Settings" }].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id}
                onClick={() => item.id === "search" && setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{ color: mutedFg }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = fg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = mutedFg; }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div
          className={`border-t p-3 flex items-center gap-3 ${!sidebarOpen ? "justify-center" : ""}`}
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>A</div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: fg }}>Ahmed Al-Rashid</div>
              <div className="text-[10px]" style={{ color: mutedFg }}>Pro workspace</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Topbar */}
        <header
          className="flex-shrink-0 h-14 border-b flex items-center justify-between px-5 gap-4 transition-colors relative z-20"
          style={{ background: "var(--topbar-bg)", borderColor }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: mutedFg }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = fg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = mutedFg; }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold hidden sm:block" style={{ color: fg }}>
              {NAV_ITEMS.find(n => n.id === view)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all w-40 sm:w-56"
              style={{ background: "var(--input-background)", border: `1px solid ${borderColor}`, color: mutedFg }}
            >
              <Search className="w-3 h-3" />
              <span>Search knowledge...</span>
              <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: hoverBg, color: mutedFg }}>⌘K</kbd>
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher themeId={themeId} setThemeId={setThemeId} />

            <button
              className="relative p-2 rounded-lg transition-all"
              style={{ color: mutedFg }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = fg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = mutedFg; }}
            >
              <Bell className="w-4 h-4" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto [scrollbar-width:thin]" style={{ scrollbarColor: `${borderColor} transparent` }}>
          <ThemeContext.Provider value={{ themeId, isLight }}>
            {children}
          </ThemeContext.Provider>
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border"
            style={{ background: "var(--card)", borderColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor }}>
              <Search className="w-4 h-4" style={{ color: mutedFg }} />
              <input autoFocus placeholder="Search knowledge, projects, people..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: fg }} />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4" style={{ color: mutedFg }} />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {["RAG Pipeline Architecture", "n8n Automation Workflow", "Team Sprint Retrospective", "AI Agent Design Patterns"].map(item => (
                <button key={item}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                  style={{ color: fg }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <BookOpen className="w-3.5 h-3.5" style={{ color: mutedFg }} />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
