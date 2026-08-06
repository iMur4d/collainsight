import React from "react";
import { Users } from "lucide-react";
import { ComingSoonPage } from "@/components/ComingSoonPage";

// AI-driven collaboration/teammate matching is explicitly post-MVP - no
// suggestion engine exists, and there's nothing yet to compute it from
// (no PlatformUser/account model, just flat Telegram attribution).
export function CollaborationView() {
  return (
    <ComingSoonPage
      icon={Users}
      iconColor="#8B5CF6"
      title="Collaboration"
      description="AI-powered teammate matching based on shared knowledge isn't built yet. It needs a real account model behind it, which is a post-MVP addition — see the Top Contributors chart on AI Insights for what's real today."
    />
  );
}
