import React from "react";
import { Network } from "lucide-react";
import { ComingSoonPage } from "@/components/ComingSoonPage";

// Knowledge Graph (semantic relationships between items) is explicitly
// post-MVP - no KnowledgeRelationship entity, no embeddings/vector search.
export function GraphView() {
  return (
    <ComingSoonPage
      icon={Network}
      iconColor="#06B6D4"
      title="Knowledge Graph"
      description="Semantic relationships between captured ideas aren't computed yet - that needs embeddings and vector search, both explicitly out of MVP scope. Tags and keywords (see Knowledge or AI Insights) are the closest real signal today."
    />
  );
}
