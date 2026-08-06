import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function GrowthChip({ deltaPct }: { deltaPct: number | null }) {
  if (deltaPct === null) return null;
  const flat = deltaPct === 0;
  const up = deltaPct > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const color = flat ? "#6b7599" : up ? "#10B981" : "#EF4444";
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold" style={{ color }}>
      <Icon className="w-3 h-3" />{up && !flat ? "+" : ""}{deltaPct}%
    </span>
  );
}
