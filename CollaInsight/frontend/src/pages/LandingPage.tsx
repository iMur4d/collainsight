import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
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
import fullTextLogoSrc from "@/imports/pasted_text/logo.svg";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";


import { ThemeId, View, THEMES, ThemeContext, NAV_ITEMS, useTheme, useThemeCtx } from "@/shared";
import { Badge, GradientText, LooperWave, ThemeSwitcher } from "@/shared";

/* Splits a word into individually-animated letter spans */
export function AnimatedWord({ word, delay = 0 }: { word: string; delay?: number }) {
  return (
    <>
      {word.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 48, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.035,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </>
  );
}

function StarNode({ star, smoothX, smoothY }: { star: any, smoothX: any, smoothY: any }) {
  // Translate the mouse movement into a parallax shift based on star depth
  const moveX = useTransform(smoothX, [-0.5, 0.5], [star.depth, -star.depth]);
  const moveY = useTransform(smoothY, [-0.5, 0.5], [star.depth, -star.depth]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        x: moveX,
        y: moveY,
      }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: `${star.size}px`,
          height: `${star.size}px`,
          background: "#AFFBFF",
          boxShadow: "0 0 10px 2px rgba(95, 247, 255, 0.6)",
        }}
        animate={{
          y: [0, -60, 0],
          opacity: [0.1, 0.9, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: star.delay,
        }}
      />
    </motion.div>
  );
}

export function StarWave() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number; size: number; depth: number }[]>([]);

  // Track global mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -0.5 to 0.5 to pivot around the center of the screen
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 100;
      newStars.push({
        id: i,
        x,
        y: Math.random() * 100,
        delay: (x / 100) * -5, 
        size: Math.random() * 2.5 + 1,
        depth: Math.random() * 50 + 10 // Gives each star a random 3D depth multiplier
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" style={{ opacity: 0.6 }}>
      {stars.map((star) => (
        <StarNode key={star.id} star={star} smoothX={smoothX} smoothY={smoothY} />
      ))}
    </div>
  );
}

function TypewriterParagraph({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let index = 0;
    el.innerHTML = '<span class="text-white/40"></span><span class="text-cyan-400 transition-opacity duration-100">|</span>';
    const textSpan = el.children[0] as HTMLSpanElement;
    const cursor = el.children[1] as HTMLSpanElement;
    
    const cursorInterval = setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 500);

    let typingTimeout: NodeJS.Timeout;
    const typeNextChar = () => {
      if (index < text.length) {
        const char = text.charAt(index);
        textSpan.textContent += char;
        index++;

        // Calculate a dynamic delay to simulate human typing (like Antigravity)
        let delay = Math.random() * 40 + 30; // base speed 30-70ms
        
        // Pause slightly longer at punctuation to feel natural
        if (char === '.' || char === ',' || char === '!') {
          delay += Math.random() * 300 + 200; // +200-500ms
        } else if (char === ' ') {
          delay += Math.random() * 20;
        }

        typingTimeout = setTimeout(typeNextChar, delay);
      }
    };

    // Start typing after a short initial pause
    typingTimeout = setTimeout(typeNextChar, 300);
    
    return () => {
      clearTimeout(typingTimeout);
      clearInterval(cursorInterval);
    };
  }, [text]);

  return (
    <p ref={containerRef} className="text-base max-w-2xl mx-auto mb-10 leading-relaxed min-h-[72px]" />
  );
}

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* shared fade-up variant */
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as number[] },
  });

  return (
    <div className="min-h-screen bg-[#07080d] text-[#e8ecf8] font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#07080d]/90 backdrop-blur-xl border-b border-white/5" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fullLogoSrc} alt="CollaInsight" className="h-6 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7599]">
            {["Features", "Solutions", "Roadmap", "Docs"].map(item => (
              <a key={item} href="#" className="hover:text-[#e8ecf8] transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:block text-sm text-[#6b7599] hover:text-white transition-colors px-4 py-2">Sign in</button>
            <button
              onClick={onEnter}
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
            >
              Get started
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

        {/* ── Glowing horizon background SVG ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1360 805"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter id="hf0" x="-223.8" y="555.2" width="1777.6" height="603.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="67.4" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="hf1" x="-223.8" y="585.2" width="1777.6" height="603.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="67.4" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="hf2" x="-223.8" y="611.2" width="1777.6" height="603.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="67.4" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="hf3" x="-223.8" y="642.2" width="1777.6" height="603.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="67.4" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="hf4" x="-638.7" y="175.3" width="2539.4" height="1336.4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="228.85" result="effect1_foregroundBlur"/>
              </filter>
              <clipPath id="hclip">
                <rect width="1360" height="805" fill="white"/>
              </clipPath>
            </defs>
            <g clipPath="url(#hclip)">
              <rect width="1360" height="805" fill="black"/>
              <g filter="url(#hf4)">
                <ellipse cx="631" cy="843.5" rx="812" ry="210.5" fill="#1885E1"/>
              </g>
              <g filter="url(#hf0)">
                <ellipse cx="665" cy="857" rx="754" ry="167" fill="#5FF7FF"/>
              </g>
              <g filter="url(#hf1)">
                <ellipse cx="665" cy="887" rx="754" ry="167" fill="#AFFBFF"/>
              </g>
              <g filter="url(#hf2)">
                <ellipse cx="665" cy="913" rx="754" ry="167" fill="#E6FCFF"/>
              </g>
              <g filter="url(#hf3)">
                <ellipse cx="665" cy="944" rx="754" ry="167" fill="white"/>
              </g>
            </g>
          </svg>

          {/* top fade so content above horizon stays dark */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent" style={{ background: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.72) 55%, transparent 100%)" }} />
        </motion.div>

        {/* ── Star Wave Animation ── */}
        <StarWave />

        {/* ── Hero content ── */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center" style={{ perspective: "800px" }}>

          {/* Beta pill */}
          <motion.div
            {...fadeUp(0.2)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-[#5FF7FF] mb-12 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Knowledge Platform · Now in Beta
          </motion.div>

          {/* ── FULL LOGO SVG — main hero element ── */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={fullTextLogoSrc}
              alt="CollaInsight"
              className="w-full max-w-3xl h-auto"
              style={{ filter: "drop-shadow(0 0 48px rgba(95,247,255,0.35)) drop-shadow(0 0 24px rgba(24,133,225,0.5))" }}
            />
          </motion.div>

          {/* Animated underline beneath logo */}
          <motion.div
            className="h-px mx-auto mb-10 max-w-md"
            style={{ background: "linear-gradient(90deg, transparent, #5FF7FF, #1885E1, transparent)" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Tagline */}
          <motion.div
            {...fadeUp(1.0)}
            className="text-xl sm:text-2xl font-medium text-white/75 max-w-2xl mx-auto mb-3 leading-snug font-['Montserrat_Alternates',sans-serif]"
          >
            Transform conversations into structured knowledge.
          </motion.div>

          {/* Description */}
          <motion.div {...fadeUp(1.15)}>
            <TypewriterParagraph text="Modern teams lose their best ideas in endless chat streams. CollaInsight connects directly to your communication channels like Telegram, automatically transforming conversations into a structured organizational memory." />
          </motion.div>

          {/* CTAs */}
          <motion.div
            {...fadeUp(1.3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <motion.button
              onClick={onEnter}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[#07080d] shadow-xl"
              style={{ background: "linear-gradient(135deg, #5FF7FF, #1885E1)", boxShadow: "0 0 32px rgba(24,133,225,0.4)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Open App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium backdrop-blur-md transition-colors"
              style={{ color: "#e8ecf8", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
              whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.97 }}
            >
              Watch demo <Eye className="w-4 h-4 opacity-70" />
            </motion.button>
          </motion.div>

          {/* Social Proof Metrics */}
          <motion.div 
            {...fadeUp(1.4)}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto border-t border-white/10 pt-10"
          >
            {[
              { value: "100%", label: "Automated Capture" },
              { value: "Zero", label: "Manual Docs Needed" },
              { value: "24/7", label: "AI Processing" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label} 
                className="flex flex-col items-center justify-center space-y-1.5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.45 + i * 0.1, ease: "easeOut" }}
              >
                <div 
                  className="text-2xl sm:text-3xl font-bold tracking-tight" 
                  style={{ background: "linear-gradient(135deg, #ffffff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#8c9bbd] uppercase tracking-[0.15em] font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── App Preview Section ── */}
      <section className="py-16 px-6 relative z-20">
        <motion.div
          {...fadeUp(0.4)}
          className="mx-auto max-w-5xl relative group cursor-pointer"
        >
          {/* Ambient glow behind window */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          
          {/* The Glass Window */}
          <div className="relative rounded-[20px] bg-[#0d1018]/60 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Window Header (macOS style dots) */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 transition-colors group-hover:bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 transition-colors group-hover:bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 transition-colors group-hover:bg-green-500/50" />
              <div className="ml-3 text-[10px] font-medium text-white/30 tracking-wider">COLLAINSIGHT_EXPLAINER</div>
            </div>

            {/* Window Content — self-contained animated explainer (public/explainer-animation) */}
            <div className="relative aspect-video overflow-hidden bg-black">
              <iframe
                src="/explainer-animation/index.html"
                title="CollaInsight animated explainer"
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                loading="lazy"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge color="cyan">Core capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4 text-white">
            Intelligence built into every workflow
          </h2>
          <p className="text-[#6b7599] max-w-xl mx-auto">
            From Telegram messages to organizational memory, every step is enhanced by an AI pipeline that understands your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Brain, title: "Stop Knowledge Loss", desc: "Our AI extracts ideas, tasks, and questions directly from your team's chats before they get buried in the history.", color: "blue" },
            { icon: Network, title: "Automated Knowledge Graph", desc: "Messages are temporary; knowledge is permanent. Every extracted idea is semantically linked to build a living organizational memory.", color: "cyan" },
            { icon: Users, title: "AI-Powered Collaboration", desc: "Don't duplicate work. The platform automatically identifies teammates with shared expertise and suggests collaborations.", color: "purple" },
            { icon: Zap, title: "Zero Manual Documentation", desc: "Forget updating wikis. CollaInsight's AI pipeline automatically classifies intents, extracts metadata, and tags conversations in the background.", color: "green" },
            { icon: Search, title: "Executive Insights", desc: "CEOs shouldn't read thousands of chat messages. Get high-level AI summaries and a bird's-eye view of organizational intelligence.", color: "amber" },
            { icon: BarChart3, title: "Model-Agnostic Engine", desc: "Future-proof your data. Our modular workflow engine lets you seamlessly swap between AI models without rewriting business logic.", color: "blue" },
          ].map((feat, i) => {
            const Icon = feat.icon;
            const colorMap: Record<string, string> = {
              blue: "from-blue-500/15 border-blue-500/20 text-blue-400",
              cyan: "from-cyan-500/15 border-cyan-500/20 text-cyan-400",
              purple: "from-violet-500/15 border-violet-500/20 text-violet-400",
              green: "from-emerald-500/15 border-emerald-500/20 text-emerald-400",
              amber: "from-amber-500/15 border-amber-500/20 text-amber-400",
            };
            return (
              <motion.div
                key={feat.title}
                className="group p-6 rounded-2xl border border-white/7 bg-[#0d1018] hover:border-white/12 hover:bg-[#101520] transition-all duration-300"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br border ${colorMap[feat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-[#6b7599] leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative p-px"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.5), rgba(6,182,212,0.3), rgba(59,130,246,0.2))" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl bg-[#0a0f1e] p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />
            <img src={colorLogoSrc} alt="CollaInsight" className="h-14 w-auto mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stop losing ideas in chat.<br /><GradientText>Start building knowledge.</GradientText>
            </h2>
            <p className="text-[#6b7599] mb-8 max-w-md mx-auto">
              Join forward-thinking teams who use CollaInsight to capture, connect, and act on organizational knowledge without manual effort.
            </p>
            <motion.button
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Explore the platform <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6 text-center text-sm text-[#6b7599]">
        <p>© 2025 CollaInsight. AI-powered knowledge for teams that think ahead.</p>
      </footer>
    </div>
  );
}
