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

export function ProjectsView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider } = useThemeCtx();
  const trackBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: fg }}>Projects</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedFg }}>Collaborative workspaces organizing related knowledge</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
          <Plus className="w-4 h-4" />New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { name: "AI Platform", desc: "Building the core AI inference and knowledge extraction pipeline.", members: ["A", "S", "K", "N", "L"], knowledge: 342, progress: 68, status: "Active", tags: ["AI", "ML"] },
          { name: "DevOps Automation", desc: "Automating deployment pipelines and infrastructure provisioning with n8n and Terraform.", members: ["K", "N", "O"], knowledge: 156, progress: 42, status: "Active", tags: ["DevOps", "n8n"] },
          { name: "Product Roadmap Q4", desc: "Collaborative roadmap definition, user research synthesis, and feature prioritization.", members: ["L", "O", "F", "Y", "A", "S", "K"], knowledge: 89, progress: 85, status: "Active", tags: ["Product"] },
          { name: "Data Infrastructure", desc: "Modernizing data pipelines, warehouse schema, and analytics reporting layer.", members: ["F", "Y"], knowledge: 74, progress: 31, status: "Active", tags: ["Data", "Analytics"] },
          { name: "Customer Onboarding", desc: "Redesigning onboarding documentation, tutorials, and in-product guidance flows.", members: ["L", "O"], knowledge: 48, progress: 60, status: "Paused", tags: ["UX", "Docs"] },
          { name: "Security Audit 2025", desc: "Annual security review covering API exposure, access controls, and compliance.", members: ["K", "N", "A"], knowledge: 33, progress: 15, status: "Starting", tags: ["Security"] },
        ].map(proj => (
          <div key={proj.name} className="p-5 rounded-2xl transition-all cursor-pointer flex flex-col gap-3"
            style={{ background: cardBg, border: `1px solid ${border}` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = border}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold" style={{ color: fg }}>{proj.name}</h3>
              <Badge color={proj.status === "Active" ? "green" : proj.status === "Paused" ? "amber" : "blue"}>{proj.status}</Badge>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: mutedFg }}>{proj.desc}</p>
            <div className="flex flex-wrap gap-1">
              {proj.tags.map(t => <Badge key={t} color="cyan">{t}</Badge>)}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: mutedFg }}>
                <span>Progress</span><span>{proj.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: trackBg }}>
                <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${divider}` }}>
              <div className="flex -space-x-1.5">
                {proj.members.slice(0, 5).map((m, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ border: `2px solid ${cardBg}`, background: i % 2 === 0 ? "linear-gradient(135deg, #2563EB, #06B6D4)" : "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}>
                    {m}
                  </div>
                ))}
                {proj.members.length > 5 && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{ border: `2px solid ${cardBg}`, background: trackBg, color: mutedFg }}>
                    +{proj.members.length - 5}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: mutedFg }}>
                <BookOpen className="w-3 h-3" />{proj.knowledge} pieces
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
