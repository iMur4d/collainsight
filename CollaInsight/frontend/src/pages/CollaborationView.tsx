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

export function CollaborationView() {
  const { fg, mutedFg, cardBg, border, divider } = useThemeCtx();

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: fg }}>Collaboration Hub</h2>
        <p className="text-sm mt-0.5" style={{ color: mutedFg }}>AI-powered teammate discovery based on shared knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { a: { name: "Ahmed Al-Rashid", role: "AI Engineer", avatar: "A" }, b: { name: "Sara Hassan", role: "ML Researcher", avatar: "S" }, topics: ["AI Agents", "RAG", "n8n"], strength: 94, reason: "Both contributed to RAG architecture research and have overlapping expertise in AI automation pipelines." },
          { a: { name: "Khalid Mansour", role: "Backend Lead", avatar: "K" }, b: { name: "Nour Ibrahim", role: "DevOps Engineer", avatar: "N" }, topics: ["API Design", "Kubernetes", "CI/CD"], strength: 87, reason: "Complementary skills in API gateway design and container orchestration across 3 shared projects." },
          { a: { name: "Layla Al-Farsi", role: "Product Manager", avatar: "L" }, b: { name: "Omar Zayed", role: "UX Designer", avatar: "O" }, topics: ["User Research", "Sprint Planning"], strength: 79, reason: "Shared interest in user-centric design and aligned sprint retrospective contributions." },
          { a: { name: "Fatima Al-Zahra", role: "Data Analyst", avatar: "F" }, b: { name: "Yusuf Karim", role: "Data Engineer", avatar: "Y" }, topics: ["Analytics", "Data Pipelines", "SQL"], strength: 82, reason: "Both actively building data infrastructure components with significant knowledge overlap in pipeline design." },
        ].map(pair => (
          <div key={pair.a.name} className="p-5 rounded-2xl transition-all" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>{pair.a.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: fg }}>{pair.a.name}</div>
                <div className="text-xs" style={{ color: mutedFg }}>{pair.a.role}</div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.2)" }}>
                {pair.strength}% match
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-sm font-medium" style={{ color: fg }}>{pair.b.name}</div>
                <div className="text-xs" style={{ color: mutedFg }}>{pair.b.role}</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}>{pair.b.avatar}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pair.topics.map(t => <Badge key={t} color="purple"><Hash className="w-2.5 h-2.5" />{t}</Badge>)}
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: mutedFg }}>{pair.reason}</p>
            <button className="w-full py-2 rounded-xl text-xs font-medium text-blue-500 transition-all hover:opacity-80"
              style={{ border: "1px solid rgba(37,99,235,0.25)", background: "rgba(37,99,235,0.06)" }}>
              Introduce teammates
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
