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

export function DashboardView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider } = useThemeCtx();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
      {/* AI Daily Briefing */}
      <div className="rounded-2xl p-px overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(6,182,212,0.2), transparent)" }}>
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden" style={{ background: isLight ? "#eef4ff" : "#0a0f1e" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(37,99,235,0.08) 0%, transparent 60%)" }} />
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(6,182,212,0.15))" }}>
                <Sparkles className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: fg }}>AI Daily Briefing</span>
                  <Badge color="cyan">Today · Jul 26</Badge>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: mutedFg }}>
                  Your team captured <strong style={{ color: fg }}>14 new knowledge pieces</strong> yesterday across 3 active projects.
                  The <strong style={{ color: fg }}>AI Agents & RAG</strong> topic is gaining momentum — 6 teammates contributed.
                  Ahmed and Sara share overlapping expertise in <strong style={{ color: fg }}>n8n automation</strong> — consider pairing them on Project Nexus.
                </p>
              </div>
            </div>
            <button className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 self-start ml-12 sm:ml-0 mt-1 sm:mt-0">
              Full report <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Knowledge pieces", value: "1,842", delta: "+14 today", icon: BookOpen, color: "blue" },
          { label: "Active projects", value: "7", delta: "2 need attention", icon: FolderKanban, color: "cyan" },
          { label: "Collaborations", value: "23", delta: "+5 suggested", icon: Users, color: "purple" },
          { label: "AI queries today", value: "318", delta: "↑ 12% vs yesterday", icon: Zap, color: "green" },
        ].map(stat => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            blue: "text-blue-500 bg-blue-500/10",
            cyan: "text-cyan-500 bg-cyan-500/10",
            purple: "text-violet-500 bg-violet-500/10",
            green: "text-emerald-500 bg-emerald-500/10",
          };
          return (
            <div key={stat.label} className="p-4 rounded-2xl transition-all" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: fg }}>{stat.value}</div>
              <div className="text-xs" style={{ color: mutedFg }}>{stat.label}</div>
              <div className="text-xs mt-1 pt-1" style={{ color: mutedFg, borderTop: `1px solid ${divider}` }}>{stat.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Knowledge */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${divider}` }}>
            <h2 className="text-sm font-semibold" style={{ color: fg }}>Recent Knowledge</h2>
            <button className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div>
            {[
              { title: "RAG Architecture Best Practices", type: "Research", project: "AI Platform", tags: ["AI", "RAG"], time: "2h ago", author: "Ahmed" },
              { title: "n8n Workflow Automation Patterns", type: "Guide", project: "DevOps", tags: ["n8n", "Automation"], time: "4h ago", author: "Sara" },
              { title: "Q3 Sprint Retrospective Notes", type: "Meeting", project: "Product", tags: ["Process"], time: "Yesterday", author: "Khalid" },
              { title: "LLM Fine-tuning Experiments", type: "Research", project: "AI Platform", tags: ["AI", "ML"], time: "Yesterday", author: "Nour" },
            ].map((item, idx, arr) => (
              <div key={item.title}
                className="px-4 sm:px-5 py-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
                style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${divider}` : "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate transition-colors" style={{ color: fg }}>{item.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color="blue">{item.type}</Badge>
                      {item.tags.map(t => <Badge key={t} color="cyan">{t}</Badge>)}
                      <span className="text-xs" style={{ color: mutedFg }}>· {item.project}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:block sm:text-right flex-shrink-0 ml-4 sm:ml-0 mt-1 sm:mt-0">
                  <div className="text-xs" style={{ color: mutedFg }}>{item.time}</div>
                  <div className="text-xs sm:mt-0.5" style={{ color: subFg }}>{item.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${divider}` }}>
              <h2 className="text-sm font-semibold" style={{ color: fg }}>Active Projects</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { name: "AI Platform", progress: 68, members: 5, color: "#2563EB" },
                { name: "DevOps Automation", progress: 42, members: 3, color: "#06B6D4" },
                { name: "Product Roadmap", progress: 85, members: 7, color: "#8B5CF6" },
              ].map(proj => (
                <div key={proj.name} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: mutedFg }}>{proj.name}</span>
                    <span className="text-xs" style={{ color: mutedFg }}>{proj.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: proj.color }} />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: subFg }}>{proj.members} members</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-4 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
              <Brain className="w-3.5 h-3.5 text-violet-500" />
              <h2 className="text-sm font-semibold" style={{ color: fg }}>AI Suggestions</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: GitBranch, text: "Connect RAG research to AI Platform project", iconColor: "text-blue-500" },
                { icon: Users, text: "Ahmed & Sara both work on automation — suggest collaboration", iconColor: "text-cyan-500" },
                { icon: Lightbulb, text: "5 untagged documents need categorization", iconColor: "text-amber-500" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.text} className="flex items-start gap-2.5 cursor-pointer group">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${s.iconColor}`} />
                    <p className="text-xs leading-relaxed" style={{ color: mutedFg }}>{s.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
