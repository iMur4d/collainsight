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

import { LandingPage } from "@/pages/LandingPage";
import { DashboardView } from "@/pages/DashboardView";
import { KnowledgeView } from "@/pages/KnowledgeView";
import { ProjectsView } from "@/pages/ProjectsView";
import { CollaborationView } from "@/pages/CollaborationView";
import { InsightsView } from "@/pages/InsightsView";
import { GraphView } from "@/pages/GraphView";
import { AppShell } from "@/components/AppShell";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const { themeId, setThemeId } = useTheme();

  const viewMap: Record<Exclude<View, "landing">, React.ReactNode> = {
    dashboard: <DashboardView />,
    knowledge: <KnowledgeView />,
    projects: <ProjectsView />,
    collaboration: <CollaborationView />,
    insights: <InsightsView />,
    graph: <GraphView />,
  };

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <LandingPage onEnter={() => setView("dashboard")} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          className="h-screen"
          initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <AppShell view={view} setView={setView} themeId={themeId} setThemeId={setThemeId}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {viewMap[view as Exclude<View, "landing">]}
              </motion.div>
            </AnimatePresence>
          </AppShell>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
