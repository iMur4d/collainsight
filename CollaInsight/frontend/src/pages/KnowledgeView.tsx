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

export function KnowledgeView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider, inputBg } = useThemeCtx();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Research", "Meeting", "Guide", "Decision", "Report"];

  const items = [
    { title: "RAG Architecture Best Practices", type: "Research", tags: ["AI", "RAG", "LLM"], project: "AI Platform", date: "Jul 26, 2025", status: "Published", summary: "Comprehensive analysis of retrieval-augmented generation patterns, chunking strategies, and embedding optimization techniques for production systems.", starred: true },
    { title: "n8n Workflow Automation Patterns", type: "Guide", tags: ["n8n", "Automation", "DevOps"], project: "DevOps", date: "Jul 25, 2025", status: "Published", summary: "Practical guide to building resilient automation workflows in n8n, covering error handling, webhook patterns, and integration with external APIs.", starred: false },
    { title: "Q3 Sprint Retrospective", type: "Meeting", tags: ["Process", "Sprint", "Team"], project: "Product", date: "Jul 24, 2025", status: "Draft", summary: "Team retrospective covering velocity improvements, blockers, and action items for Q4 planning. Key themes: deployment friction and async communication.", starred: false },
    { title: "LLM Fine-tuning Experiments Log", type: "Research", tags: ["AI", "ML", "Fine-tuning"], project: "AI Platform", date: "Jul 23, 2025", status: "Published", summary: "Documented experiments with LoRA and QLoRA fine-tuning approaches on domain-specific datasets. Includes evaluation benchmarks and cost analysis.", starred: true },
    { title: "API Gateway Migration Decision", type: "Decision", tags: ["Architecture", "Backend"], project: "Infrastructure", date: "Jul 22, 2025", status: "Published", summary: "Decision record for migrating from Kong to AWS API Gateway. Covers trade-off analysis, estimated effort, and rollback strategy.", starred: false },
    { title: "Weekly Team Analytics Report", type: "Report", tags: ["Analytics", "Team"], project: "Operations", date: "Jul 21, 2025", status: "Published", summary: "Weekly summary of team productivity metrics, knowledge contribution rates, and AI query patterns across all active projects.", starred: false },
  ];

  const filtered = activeFilter === "All" ? items : items.filter(i => i.type === activeFilter);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: fg }}>Knowledge Base</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedFg }}>1,842 pieces across 12 projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
          <Plus className="w-4 h-4" />New Knowledge
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: mutedFg }} />
          <input placeholder="Search knowledge..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: fg }} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all" style={{ background: inputBg, border: `1px solid ${border}`, color: mutedFg }}>
          <Filter className="w-4 h-4" />Filters
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeFilter === f ? "rgba(37,99,235,0.12)" : (isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"),
              color: activeFilter === f ? "#2563EB" : mutedFg,
              border: activeFilter === f ? "1px solid rgba(37,99,235,0.3)" : `1px solid transparent`,
            }}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.title} className="group p-5 rounded-2xl transition-all cursor-pointer flex flex-col gap-3"
            style={{ background: cardBg, border: `1px solid ${border}` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = border}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug" style={{ color: fg }}>{item.title}</h3>
              <button className={`flex-shrink-0 p-1 rounded ${item.starred ? "text-amber-500" : ""} transition-colors`} style={{ color: item.starred ? "" : subFg }}>
                <Star className="w-3.5 h-3.5" fill={item.starred ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedFg }}>{item.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge color="blue">{item.type}</Badge>
              {item.tags.slice(0, 2).map(t => <Badge key={t} color="cyan">{t}</Badge>)}
              {item.tags.length > 2 && <span className="text-xs" style={{ color: subFg }}>+{item.tags.length - 2}</span>}
            </div>
            <div className="flex items-center justify-between pt-2 text-xs" style={{ borderTop: `1px solid ${divider}`, color: mutedFg }}>
              <span>{item.project}</span>
              <div className="flex items-center gap-2">
                <Badge color={item.status === "Published" ? "green" : "amber"}>{item.status}</Badge>
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
