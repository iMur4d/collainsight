# CollaInsight UI/UX & Platform Identity Specification

This document provides the definitive system-wide UI/UX specifications, design tokens, and branding assets for **CollaInsight**. Use this specification to ensure any generated interfaces, views, and components match the official brand identity, layout shell, and styling language.

---

## 1. Brand Identity & Product Vision

**CollaInsight** is an AI-first Knowledge Collaboration Platform designed to transform raw, unstructured conversations (e.g., captured from Telegram streams) into searchable, connected, and structured organizational intelligence.

### Design Personality
*   **Premium & State-of-the-Art:** Modern, dark-mode first aesthetic featuring high-fidelity glassmorphism, depth layers, dynamic ambient orbs, and fluid micro-animations.
*   **Clean & Technical:** Curated modern typography, rounded borders, clear information hierarchies, and functional, context-driven layouts.
*   **Intuitive & Immediate:** Fast feedback systems, optimistic UI elements, and highly engaging onboarding layouts.

---

## 2. Typography & Fonts

Typography is configured to use Google Fonts for maximum visual distinction. Headings use Montserrat Alternates for an editorial feel, body elements use Plus Jakarta Sans, and telemetry or code uses JetBrains Mono.

```css
font-family:
  headings: 'Montserrat Alternates', sans-serif;
  body/ui: 'Plus Jakarta Sans', sans-serif;
  monospaced/data: 'JetBrains Mono', monospace;
```

### Hierarchy & Default Sizes
*   `h1`: `text-2xl` (font weight 500, line height 1.5)
*   `h2`: `text-xl` (font weight 500, line height 1.5)
*   `h3`: `text-lg` (font weight 500, line height 1.5)
*   `h4`: `text-base` (font weight 500, line height 1.5)
*   `label` & `button`: `text-base` (font weight 500, line height 1.5)
*   `input` & `body`: `text-base` (font weight 400, line height 1.5)

---

## 3. Theme Systems & Color Tokens

CollaInsight supports four screen themes. Developers should consume variables using CSS variables rather than hardcoding colors.

### Theme CSS Variables Reference
The following custom properties configure the active theme:

| Property | Dark (Default) | Dim (Alternative) | Midnight | Light |
| :--- | :--- | :--- | :--- | :--- |
| `--background` | `#07080d` | `#161b27` | `#000000` | `#f5f7ff` |
| `--foreground` | `#e8ecf8` | `#cdd5f0` | `#f0f4ff` | `#0f1528` |
| `--card` | `rgba(13,16,24, 0.45)` | `rgba(28,34,54, 0.45)` | `rgba(9,11,16, 0.45)` | `rgba(255,255,255, 0.65)` |
| `--card-foreground` | `#e8ecf8` | `#cdd5f0` | `#f0f4ff` | `#0f1528` |
| `--secondary` | `rgba(19,24,38, 0.5)` | `rgba(30,38,64, 0.5)` | `rgba(13,16,23, 0.5)` | `rgba(238,241,251, 0.6)` |
| `--secondary-fg` | `#c0c8e0` | `#a8b4d8` | `#c8d0f0` | `#2d3a5e` |
| `--muted` | `rgba(19,24,38, 0.4)` | `rgba(30,38,64, 0.4)` | `rgba(13,16,23, 0.4)` | `rgba(238,241,251, 0.5)` |
| `--muted-foreground`| `#6b7599` | `#5a688a` | `#4a5580` | `#7080a8` |
| `--border` | `rgba(255,255,255,0.08)`| `rgba(255,255,255,0.09)`| `rgba(37,99,235,0.2)` | `rgba(0,0,0,0.06)` |
| `--input-background`| `rgba(19,24,38, 0.5)` | `rgba(30,38,64, 0.5)` | `rgba(13,16,23, 0.5)` | `rgba(255,255,255, 0.7)` |
| `--sidebar-bg` | `rgba(10,12,20, 0.4)` | `rgba(19,24,37, 0.4)` | `rgba(5,6,10, 0.4)` | `rgba(245,247,255, 0.5)` |
| `--sidebar-border` | `rgba(255,255,255,0.08)`| `rgba(255,255,255,0.08)`| `rgba(37,99,235,0.15)` | `rgba(0,0,0,0.05)` |
| `--topbar-bg` | `rgba(7,8,13, 0.4)` | `rgba(22,27,39, 0.4)` | `rgba(0,0,0,0.4)` | `rgba(245,247,255, 0.5)` |
| `--node-label` | `#c0c8e0` | `#a8b4d8` | `#c8d0f0` | `#2d3a5e` |
| `--grid-line` | `rgba(255,255,255,0.02)`| `rgba(255,255,255,0.03)`| `rgba(37,99,235,0.06)` | `rgba(0,0,0,0.03)` |

### Accent Colors
*   **Primary Accent:** `#2563eb` (Blue - representational of structure, reliability, and nodes)
*   **Secondary Accent:** `#06b6d4` (Cyan - representing AI insights and intelligence nodes)
*   **Destructive/Error:** `#ef4444` (Red)
*   **Success:** `#10b981` (Green)
*   **Warning:** `#f59e0b` (Amber)

---

## 4. Visual Styles & Key CSS Components

### Glassmorphism
All panel surfaces in the App Shell apply high-quality glassmorphism effects via global styling of CSS variables.
```css
[style*="--card"],
[style*="--sidebar-bg"],
[style*="--topbar-bg"] {
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
}
```

### Ambient Blur Orbs
Add dynamic glowing background elements to screen backgrounds for a premium feel.
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
  <div className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20" style={{ background: "#2563EB", top: "-10%", left: "-10%" }} />
  <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ background: "#06B6D4", bottom: "-10%", right: "-5%" }} />
</div>
```

### Gradient Text
Apply the official brand gradient to display headings and highlights:
```tsx
export function GradientText({ children, className = "" }) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: "linear-gradient(97deg, #2563EB 0%, #06B6D4 55%, #3B82F6 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}
    >
      {children}
    </span>
  );
}
```

### Categorization Badges
Badges are used to identify knowledge types and tag associations.
*   **Blue:** `bg-blue-500/10 text-blue-400 border-blue-500/20` (Research & Structured Data)
*   **Cyan:** `bg-cyan-500/10 text-cyan-400 border-cyan-500/20` (AI Insights, Guides, Automations)
*   **Purple:** `bg-violet-500/10 text-violet-400 border-violet-500/20` (Collaborations & Team suggestions)
*   **Green:** `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` (Metrics & Success actions)
*   **Amber:** `bg-amber-500/10 text-amber-400 border-amber-500/20` (Alerts, Warnings & Pending elements)

---

## 5. Layout & App Shell Blueprint

The frontend utilizes a modular layout responsive-first design shell.

### Layout Hierarchy
1.  **Main Page Wrapper:** Flex container, full height (`h-screen`), overflow hidden. Uses `var(--background)` and `var(--foreground)`.
2.  **Left Sidebar:** Adjustable width. `w-56` (expanded), `w-14` (collapsed), overlays as overlay drawer (`w-64`) on mobile. Configured with `--sidebar-bg` and `--sidebar-border`.
3.  **Main Content Panel:** Full width, column direction.
    *   **Topbar (`h-14`):** Fixed height. Includes navigation state label, command search bar, theme switcher selector, notification bell, user profile badge. Uses `--topbar-bg` and active border styling.
    *   **Main View Area:** Overflow vertical auto scrolling (`scrollbar-width: thin`), displaying active route components.

---

## 6. View Specific UX Guidelines

### Dashboard & AI Daily Briefing Card
*   Must use a glowing gradient outer border: `linear-gradient(135deg, rgba(37,99,235,0.4), rgba(6,182,212,0.2), transparent)`.
*   Card body should use lighter tinting backgrounds: `isLight ? "#eef4ff" : "#0a0f1e"`.
*   Includes highlight terms colored with custom `fg` color.

### Knowledge Graph
*   Interactive network model visualizing node links.
*   Nodes are colored according to:
    *   `--chart-1` (Primary - Blue) for core nodes
    *   `--chart-2` (Cyan) for AI suggestions / insight links
    *   `--chart-3` (Indigo) for members
    *   `--chart-4` (Purple) for projects
*   Must support clean node selections, hovering scale, labels using `--node-label`, and subtle grid lines matching `--grid-line`.

---

## 7. Instructions for Claude / LLM Implementations

When writing frontend React or Tailwind code for CollaInsight, adhere to the following rules:

1.  **Use Theme Context:** Import `useThemeCtx` from `@/shared` to resolve current theme characteristics.
    ```tsx
    const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider, inputBg } = useThemeCtx();
    ```
2.  **Apply Inline Styles for Colors:** Since tailwind utility colors are not dynamically linked to variables out-of-the-box in the custom styles setup, always resolve card backgrounds, inputs, and borders using inline style properties combined with contextual values:
    ```tsx
    <div style={{ background: cardBg, border: `1px solid ${border}` }} className="p-5 rounded-2xl">
      <h3 style={{ color: fg }}>Title</h3>
      <p style={{ color: mutedFg }}>Description</p>
    </div>
    ```
3.  **Headings Custom Font:** Apply heading style classifications using the `Montserrat Alternates` font when building dashboard features, marketing headers, or widget titles:
    ```tsx
    <h2 className="font-['Montserrat_Alternates',sans-serif]">Executive Summary</h2>
    ```
4.  **No Placeholders:** Ensure images or dynamic mock contents are fully styled using the official color properties rather than plain gray placeholders.
5.  **Hover State Controls:** Implement hover triggers programmatically or with CSS variables, matching standard transition timing (`transition-all duration-300`).
