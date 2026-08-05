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

export function InsightsView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider } = useThemeCtx();
  const trackBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: fg }}>AI Insights</h2>
        <p className="text-sm mt-0.5" style={{ color: mutedFg }}>Organizational intelligence — patterns, trends, and emerging ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold" style={{ color: fg }}>Trending Topics</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { topic: "AI Agents", count: 34, delta: "+12" },
              { topic: "RAG Pipelines", count: 28, delta: "+8" },
              { topic: "n8n Automation", count: 21, delta: "+5" },
              { topic: "Vector Databases", count: 17, delta: "+7" },
              { topic: "LLM Fine-tuning", count: 14, delta: "+3" },
            ].map((item, i) => (
              <div key={item.topic} className="flex items-center gap-3">
                <span className="text-[10px] w-4 text-right" style={{ color: subFg }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: mutedFg }}>{item.topic}</span>
                    <span className="text-xs text-emerald-500">{item.delta}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: trackBg }}>
                    <div className="h-full rounded-full" style={{ width: `${(item.count / 34) * 100}%`, background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
                  </div>
                </div>
                <span className="text-[10px] w-6" style={{ color: mutedFg }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
            <Target className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold" style={{ color: fg }}>Recurring Challenges</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { issue: "Deployment environment inconsistencies", count: 8, teams: ["DevOps", "Backend"] },
              { issue: "Onboarding documentation gaps", count: 6, teams: ["HR", "Product"] },
              { issue: "API rate limiting in production", count: 5, teams: ["Backend", "AI Platform"] },
              { issue: "Knowledge silos between teams", count: 4, teams: ["All teams"] },
            ].map(item => (
              <div key={item.issue} className="p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: trackBg, border: `1px solid ${divider}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = border}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = divider}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs leading-snug" style={{ color: mutedFg }}>{item.issue}</p>
                  <Badge color="amber">{item.count}x</Badge>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {item.teams.map(t => <span key={t} className="text-[10px]" style={{ color: subFg }}>#{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
            <Lightbulb className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold" style={{ color: fg }}>Emerging Ideas</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { idea: "Unify AI model evaluation framework across teams", strength: "Strong signal", color: "green" as const },
              { idea: "Cross-team knowledge review sessions (async)", strength: "Growing", color: "blue" as const },
              { idea: "Automated documentation from code comments using AI", strength: "Early signal", color: "purple" as const },
              { idea: "Shared prompt library for internal LLM tools", strength: "Emerging", color: "cyan" as const },
            ].map(item => (
              <div key={item.idea} className="flex items-start gap-2.5 cursor-pointer group">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-violet-500" />
                <div>
                  <p className="text-xs leading-snug mb-1" style={{ color: mutedFg }}>{item.idea}</p>
                  <Badge color={item.color}>{item.strength}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold" style={{ color: fg }}>Weekly Knowledge Activity</h3>
          <Badge color="cyan">Jul 20–26</Badge>
        </div>
        <div className="grid grid-cols-7 gap-2 h-24 items-end">
          {[
            { day: "Mon", value: 8 },
            { day: "Tue", value: 14 },
            { day: "Wed", value: 11 },
            { day: "Thu", value: 18 },
            { day: "Fri", value: 22 },
            { day: "Sat", value: 6 },
            { day: "Sun", value: 4 },
          ].map(({ day, value }) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg transition-all hover:opacity-90" style={{ height: `${(value / 22) * 80}px`, background: "linear-gradient(180deg, #2563EB, #06B6D4)" }} />
              <span className="text-[10px]" style={{ color: mutedFg }}>{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
