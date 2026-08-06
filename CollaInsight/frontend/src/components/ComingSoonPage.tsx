import React from "react";
import { useThemeCtx } from "@/shared";

// Shared "honest placeholder" for MVP-excluded modules (see NAV_ITEMS' `mvp`
// flag in shared.tsx). No fake data, no invented metrics - just what's
// missing and where the real capability lives today, if anywhere.
export function ComingSoonPage({ icon: Icon, title, description, iconColor = "#2563EB" }: {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  iconColor?: string;
}) {
  const { fg, mutedFg, cardBg, border } = useThemeCtx();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="rounded-2xl p-10 sm:p-14 flex flex-col items-center text-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}1a` }}>
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: fg }}>{title} — Coming Soon</h2>
        <p className="text-sm max-w-md leading-relaxed" style={{ color: mutedFg }}>{description}</p>
      </div>
    </div>
  );
}
