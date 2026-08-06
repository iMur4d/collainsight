import React from "react";
import { FolderKanban } from "lucide-react";
import { ComingSoonPage } from "@/components/ComingSoonPage";

// Projects (grouping knowledge under a workspace) isn't implemented in the
// backend yet - there's no Project entity, only flat KnowledgeItems. See
// docs/engineering/07_DATABASE_SCHEMA.md for the eventual Project entity.
export function ProjectsView() {
  return (
    <ComingSoonPage
      icon={FolderKanban}
      iconColor="#2563EB"
      title="Projects"
      description={<>Grouping captured knowledge into project workspaces isn't built yet. Every idea currently lives flat in the Knowledge Base — see the <strong>Knowledge</strong> tab.</>}
    />
  );
}
