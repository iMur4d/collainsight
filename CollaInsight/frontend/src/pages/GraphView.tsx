import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { useThemeCtx, Badge } from "@/shared";
import ForceGraph2D from "react-force-graph-2d";

export function GraphView() {
  const { isLight, fg, mutedFg, cardBg, border, divider } = useThemeCtx();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rawNodes = [
    { id: "RAG", size: 8, color: "#2563EB", val: 5 },
    { id: "AI Agents", size: 7, color: "#06B6D4", val: 4 },
    { id: "LLM", size: 9, color: "#8B5CF6", val: 6 },
    { id: "n8n", size: 6, color: "#10B981", val: 3 },
    { id: "DevOps", size: 6, color: "#F59E0B", val: 3 },
    { id: "Vector DB", size: 7, color: "#3B82F6", val: 4 },
    { id: "Fine-tuning", size: 5, color: "#EC4899", val: 2 },
    { id: "Embeddings", size: 6, color: "#06B6D4", val: 3 },
    { id: "Automation", size: 5, color: "#10B981", val: 2 },
    { id: "API Design", size: 5, color: "#F59E0B", val: 2 },
  ];

  const rawLinks = [
    { source: "RAG", target: "LLM" }, { source: "RAG", target: "Vector DB" }, { source: "RAG", target: "Embeddings" },
    { source: "AI Agents", target: "LLM" }, { source: "AI Agents", target: "n8n" }, { source: "AI Agents", target: "RAG" },
    { source: "n8n", target: "Automation" }, { source: "n8n", target: "DevOps" },
    { source: "LLM", target: "Fine-tuning" }, { source: "LLM", target: "Embeddings" },
    { source: "DevOps", target: "API Design" }, { source: "Vector DB", target: "Embeddings" },
  ];

  // useMemo to prevent recreating graphData on every render, which resets the simulation
  const graphData = useMemo(() => {
    return {
      nodes: rawNodes.map(n => ({ ...n })),
      links: rawLinks.map(l => ({ ...l })),
    };
  }, []);

  const nodeMap = useMemo(() => {
    return Object.fromEntries(rawNodes.map(n => [n.id, n]));
  }, []);

  const connectedTo = useMemo(() => {
    if (!selected) return [];
    return rawLinks.flatMap((l) => {
      if (l.source === selected) return [l.target];
      if (l.target === selected) return [l.source];
      return [];
    });
  }, [selected]);

  const handleNodeClick = useCallback((node: any) => {
    setSelected(prev => (prev === node.id ? null : node.id));
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(1.5, 1000);
    }
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selected === node.id;
    const isHover = hoverNode === node.id;
    const isConnected = selected ? connectedTo.includes(node.id) : false;
    const isDimmed = selected && !isSelected && !isConnected;

    const label = node.id;
    const fontSize = 12 / globalScale;
    ctx.font = `${isSelected ? "600" : "500"} ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    
    // Draw Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size / globalScale, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.globalAlpha = isDimmed ? 0.25 : (isSelected ? 1 : 0.85);
    ctx.fill();

    // Highlight ring if selected or hovered
    if (isSelected || isHover) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, (node.size + 4) / globalScale, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
    }

    // Draw text label
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isLight ? "#2d3a5e" : "#c0c8e0";
    ctx.globalAlpha = isDimmed ? 0.25 : 1;
    ctx.fillText(label, node.x, node.y + (node.size / globalScale) + fontSize + 2);
  }, [selected, hoverNode, connectedTo, isLight]);

  const linkColor = useCallback((link: any) => {
    const isHighlighted = (selected && (link.source.id === selected || link.target.id === selected)) || 
                          (hoverNode && (link.source.id === hoverNode || link.target.id === hoverNode));
    const edgeDefault = isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)";
    return isHighlighted ? "#06B6D4" : edgeDefault;
  }, [selected, hoverNode, isLight]);

  const linkWidth = useCallback((link: any) => {
    const isHighlighted = (selected && (link.source.id === selected || link.target.id === selected)) || 
                          (hoverNode && (link.source.id === hoverNode || link.target.id === hoverNode));
    return isHighlighted ? 2 : 1;
  }, [selected, hoverNode]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-['Montserrat_Alternates',sans-serif]" style={{ color: fg }}>Knowledge Graph</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedFg }}>Interactive Obsidian-like visualization of knowledge relationships</p>
        </div>
        {selected && (
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all z-10"
            style={{ color: mutedFg, background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)", border: `1px solid ${border}` }}>
            <X className="w-3 h-3" />Clear selection
          </button>
        )}
      </div>

      <div 
        ref={containerRef}
        className="rounded-2xl overflow-hidden relative" 
        style={{ background: cardBg, border: `1px solid ${border}`, height: '600px' }}
      >
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.04) 0%, transparent 70%)" }} />
        
        {/* Dynamic Force Graph */}
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeClick={handleNodeClick}
          onNodeHover={(node) => setHoverNode(node ? (node as any).id : null)}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={20}
        />
      </div>

      {selected && (
        <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ background: nodeMap[selected]?.color }} />
            <h3 className="text-sm font-semibold" style={{ color: fg }}>{selected}</h3>
            <Badge color="cyan">{connectedTo.length} connections</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedTo.map(id => (
              <button key={id} onClick={() => setSelected(id)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
                style={{ color: mutedFg, border: `1px solid ${border}`, background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.color = mutedFg; }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: nodeMap[id]?.color }} />
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
