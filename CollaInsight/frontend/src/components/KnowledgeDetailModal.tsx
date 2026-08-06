import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, MessageSquare, Clock } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useThemeCtx } from "@/shared";
import { KnowledgeItem } from "@/lib/api";
import { relativeTime } from "@/lib/useIdeas";

function listSection(heading: string, items: string[]): string {
  const body = items.length ? items.map(i => `- ${i}`).join("\n") : "_None identified._";
  return `## ${heading}\n\n${body}`;
}

function toMarkdown(item: KnowledgeItem): string {
  return [
    item.summary,
    `## Original Telegram Message\n\n> ${item.idea_text.replace(/\n/g, "\n> ")}`,
    listSection("Keywords", item.keywords),
    listSection("Tags", item.tags),
    listSection("Concepts", item.concepts),
    listSection("Assumptions", item.assumptions),
    listSection("Open Questions", item.open_questions),
  ].join("\n\n");
}

export function KnowledgeDetailModal({ item, onClose }: { item: KnowledgeItem | null; onClose: () => void }) {
  const { isLight, fg, mutedFg, subFg, cardBg, border, divider, inputBg } = useThemeCtx();

  if (!item) return null;

  const createdAt = new Date(item.created_at);

  return (
    <Dialog open={!!item} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-0 gap-0 [scrollbar-width:thin]"
        style={{ background: isLight ? "#ffffff" : "#0a0c14", borderColor: border, color: fg }}
      >
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${divider}` }}>
          <DialogTitle className="text-lg font-bold leading-snug" style={{ color: fg }}>
            {item.title}
          </DialogTitle>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs" style={{ color: mutedFg }}>
            {item.telegram_display_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3 h-3" /> {item.telegram_display_name}
              </span>
            )}
            {item.telegram_chat_title && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> {item.telegram_chat_title}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              {" · "}{relativeTime(item.created_at)}
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          <MarkdownBody markdown={toMarkdown(item)} isLight={isLight} fg={fg} mutedFg={mutedFg} subFg={subFg} border={border} inputBg={inputBg} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MarkdownBody({ markdown, isLight, fg, mutedFg, subFg, border, inputBg }: {
  markdown: string; isLight: boolean; fg: string; mutedFg: string; subFg: string; border: string; inputBg: string;
}) {
  return (
    <div className="text-sm leading-relaxed" style={{ color: fg }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: p => <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0" style={{ color: fg }} {...p} />,
          h2: p => (
            <h2
              className="text-sm font-semibold uppercase tracking-wide mt-6 mb-2 pb-1.5 first:mt-0"
              style={{ color: mutedFg, borderBottom: `1px solid ${border}` }}
              {...p}
            />
          ),
          h3: p => <h3 className="text-sm font-semibold mt-4 mb-1.5" style={{ color: fg }} {...p} />,
          p: p => <p className="mb-3 last:mb-0" style={{ color: fg }} {...p} />,
          ul: p => <ul className="list-disc pl-5 mb-3 space-y-1" {...p} />,
          ol: p => <ol className="list-decimal pl-5 mb-3 space-y-1" {...p} />,
          li: p => <li style={{ color: fg }} {...p} />,
          strong: p => <strong className="font-semibold" style={{ color: fg }} {...p} />,
          em: p => <em style={{ color: mutedFg }} {...p} />,
          a: p => <a className="underline hover:opacity-80" style={{ color: "#2563EB" }} target="_blank" rel="noreferrer" {...p} />,
          hr: () => <hr className="my-5" style={{ borderColor: border }} />,
          blockquote: p => (
            <blockquote
              className="pl-4 py-1 my-3 italic rounded-r"
              style={{ borderLeft: "3px solid #2563EB", color: mutedFg, background: inputBg }}
              {...p}
            />
          ),
          code: ({ className, children, ...rest }: any) => {
            const isBlock = /language-/.test(className || "");
            if (!isBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-[13px] font-mono"
                  style={{ background: inputBg, color: "#06B6D4" }}
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={`font-mono text-[13px] ${className || ""}`} {...rest}>
                {children}
              </code>
            );
          },
          pre: p => (
            <pre
              className="rounded-xl p-4 mb-3 overflow-x-auto text-[13px]"
              style={{ background: isLight ? "#0f1528" : "#05060a", border: `1px solid ${border}`, color: "#e8ecf8" }}
              {...p}
            />
          ),
          table: p => (
            <div className="mb-3 overflow-x-auto rounded-lg" style={{ border: `1px solid ${border}` }}>
              <table className="w-full text-xs" {...p} />
            </div>
          ),
          thead: p => <thead style={{ background: inputBg }} {...p} />,
          th: p => <th className="text-left px-3 py-2 font-semibold" style={{ color: fg, borderBottom: `1px solid ${border}` }} {...p} />,
          td: p => <td className="px-3 py-2" style={{ color: fg, borderBottom: `1px solid ${border}` }} {...p} />,
          input: (p: any) =>
            p.type === "checkbox" ? <input {...p} disabled className="mr-2 accent-blue-500" /> : <input {...p} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
