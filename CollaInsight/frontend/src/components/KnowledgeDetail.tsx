import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, MessageSquare, Clock, HelpCircle, ChevronDown } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useThemeCtx } from "@/shared";
import { KnowledgeFeedItem } from "@/lib/api";
import { relativeTime } from "@/lib/useKnowledge";

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.2)" }}>
      {label}
    </span>
  );
}

function KeywordChip({ label, mutedFg, border }: { label: string; mutedFg: string; border: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs" style={{ color: mutedFg, border: `1px solid ${border}` }}>
      {label}
    </span>
  );
}

function OpenQuestionsCallout({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="rounded-xl p-4 flex gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
      <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#F59E0B" }}>
          Needs Follow-Up · {questions.length} open question{questions.length === 1 ? "" : "s"}
        </div>
        <ul className="space-y-1 list-disc pl-4">
          {questions.map((q, i) => <li key={i} className="text-sm leading-relaxed" style={{ color: "#c99a3f" }}>{q}</li>)}
        </ul>
      </div>
    </div>
  );
}

function OriginalMessage({ text }: { text: string }) {
  const { mutedFg, border, inputBg, fg } = useThemeCtx();
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 py-1.5" style={{ color: mutedFg }}>
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <MessageSquare className="w-3 h-3" /> Original Telegram Message
        </span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <blockquote
          className="pl-4 py-2.5 mt-1.5 rounded-r text-sm italic"
          style={{ borderLeft: "3px solid #2563EB", background: inputBg, color: mutedFg, whiteSpace: "pre-wrap" }}
        >
          {text}
        </blockquote>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Concepts/Assumptions are Idea-specific attributes (see attributes shape
 * per type in backend/api/main.py's KNOWLEDGE_TYPE_CONFIG) - other types
 * simply won't have them, in which case this renders nothing. */
function stringArrayAttr(item: KnowledgeFeedItem, key: string): string[] {
  const value = item.attributes?.[key];
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Narrative-only markdown - Tags/Keywords/Open Questions/source text are
 * custom UI now, not markdown sections (see the design discussion this
 * replaced the old all-markdown layout with). Only Concepts/Assumptions
 * remain here, since those are free-form enough to benefit from GFM
 * (lists, and whatever formatting future knowledge items might carry). */
function toMarkdown(item: KnowledgeFeedItem): string {
  const concepts = stringArrayAttr(item, "concepts");
  const assumptions = stringArrayAttr(item, "assumptions");
  const sections: string[] = [];
  if (concepts.length) sections.push(`## Concepts\n\n${concepts.map(c => `- ${c}`).join("\n")}`);
  if (assumptions.length) sections.push(`## Assumptions\n\n${assumptions.map(a => `- ${a}`).join("\n")}`);
  return sections.join("\n\n");
}

export function MarkdownBody({ markdown }: { markdown: string }) {
  const { isLight, fg, mutedFg, border, inputBg } = useThemeCtx();
  if (!markdown) return null;
  return (
    <div className="text-sm leading-relaxed" style={{ color: mutedFg }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: p => (
            <h2 className="text-xs font-semibold uppercase tracking-wide mt-5 mb-2 pb-1.5 first:mt-0" style={{ color: mutedFg, borderBottom: `1px solid ${border}` }} {...p} />
          ),
          h3: p => <h3 className="text-sm font-semibold mt-4 mb-1.5" style={{ color: fg }} {...p} />,
          p: p => <p className="mb-3 last:mb-0" {...p} />,
          ul: p => <ul className="list-disc pl-5 mb-3 space-y-1" {...p} />,
          ol: p => <ol className="list-decimal pl-5 mb-3 space-y-1" {...p} />,
          li: p => <li {...p} />,
          strong: p => <strong className="font-semibold" style={{ color: fg }} {...p} />,
          em: p => <em {...p} />,
          a: p => <a className="underline hover:opacity-80" style={{ color: "#2563EB" }} target="_blank" rel="noreferrer" {...p} />,
          hr: () => <hr className="my-4" style={{ borderColor: border }} />,
          blockquote: p => (
            <blockquote className="pl-4 py-1 my-3 italic rounded-r" style={{ borderLeft: "3px solid #2563EB", background: inputBg }} {...p} />
          ),
          code: ({ className, children, ...rest }: any) => {
            const isBlock = /language-/.test(className || "");
            if (!isBlock) {
              return <code className="px-1.5 py-0.5 rounded text-[13px] font-mono" style={{ background: inputBg, color: "#06B6D4" }} {...rest}>{children}</code>;
            }
            return <code className={`font-mono text-[13px] ${className || ""}`} {...rest}>{children}</code>;
          },
          pre: p => (
            <pre className="rounded-xl p-4 mb-3 overflow-x-auto text-[13px]" style={{ background: isLight ? "#0f1528" : "#05060a", border: `1px solid ${border}`, color: "#e8ecf8" }} {...p} />
          ),
          table: p => (
            <div className="mb-3 overflow-x-auto rounded-lg" style={{ border: `1px solid ${border}` }}>
              <table className="w-full text-xs" {...p} />
            </div>
          ),
          thead: p => <thead style={{ background: inputBg }} {...p} />,
          th: p => <th className="text-left px-3 py-2 font-semibold" style={{ color: fg, borderBottom: `1px solid ${border}` }} {...p} />,
          td: p => <td className="px-3 py-2" style={{ borderBottom: `1px solid ${border}` }} {...p} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

/**
 * The reading experience for one knowledge item. Deliberately independent
 * of how it's presented (Sheet today) - render this directly inside a
 * future dedicated knowledge page/route without rewriting it.
 */
export function KnowledgeDetailContent({ item }: { item: KnowledgeFeedItem }) {
  const { fg, mutedFg, border, divider } = useThemeCtx();
  const createdAt = new Date(item.created_at);
  const hasChips = item.tags.length > 0 || item.keywords.length > 0;
  const markdown = toMarkdown(item);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold leading-snug" style={{ color: fg }}>{item.title}</h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs" style={{ color: mutedFg }}>
          {item.telegram_display_name && (
            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {item.telegram_display_name}</span>
          )}
          {item.telegram_chat_title && (
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> {item.telegram_chat_title}</span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {relativeTime(item.created_at)}
          </span>
        </div>

        {hasChips && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.map(t => <TagChip key={`tag-${t}`} label={t} />)}
            {item.keywords.map(k => <KeywordChip key={`kw-${k}`} label={k} mutedFg={mutedFg} border={border} />)}
          </div>
        )}
      </div>

      <p className="text-[15px] leading-relaxed font-medium" style={{ color: fg }}>{item.summary}</p>

      <OpenQuestionsCallout questions={stringArrayAttr(item, "open_questions")} />

      <OriginalMessage text={item.raw_text} />

      {markdown && (
        <div style={{ borderTop: `1px solid ${divider}`, paddingTop: "0.5rem" }}>
          <MarkdownBody markdown={markdown} />
        </div>
      )}
    </div>
  );
}

export function KnowledgeDetailPanel({ item, onClose }: { item: KnowledgeFeedItem | null; onClose: () => void }) {
  const { isLight, mutedFg, border } = useThemeCtx();
  const surface = isLight ? "#ffffff" : "#0a0c14";

  return (
    <Sheet open={!!item} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 gap-0 flex flex-col [scrollbar-width:thin]"
        style={{ background: surface, borderColor: border }}
      >
        {item && (
          <>
            <SheetTitle className="sr-only">{item.title}</SheetTitle>
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <KnowledgeDetailContent item={item} />
            </div>
            <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: `1px solid ${border}` }}>
              <button
                disabled
                title="Manager review workflow - coming soon"
                className="w-full py-2 rounded-xl text-xs font-medium cursor-not-allowed opacity-50"
                style={{ border: `1px solid ${border}`, color: mutedFg }}
              >
                Mark as Reviewed · Coming Soon
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
