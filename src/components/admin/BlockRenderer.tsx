import { HelpBlock } from "@/types/help";
import { AlertTriangle, CheckCircle2, Info, ChevronDown } from "lucide-react";
import { useState } from "react";

/** Read-only renderer for a single HelpBlock – used in preview & public help center */
export default function BlockRenderer({ block }: { block: HelpBlock }) {
  const c = block.content;

  switch (block.type) {
    case "title": {
      const Tag = (c.level ?? "h2") as keyof JSX.IntrinsicElements;
      const sizes = { h1: "text-3xl font-bold", h2: "text-2xl font-semibold", h3: "text-xl font-semibold" };
      return <Tag className={`${sizes[c.level ?? "h2"]} text-foreground font-display`}>{c.text}</Tag>;
    }

    case "paragraph":
      return <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{c.text}</p>;

    case "image":
      return c.src ? (
        <figure className="rounded-lg overflow-hidden border border-border">
          <img src={c.src} alt={c.alt ?? ""} className="w-full object-cover" />
          {c.alt && <figcaption className="text-xs text-muted-foreground p-2 text-center">{c.alt}</figcaption>}
        </figure>
      ) : null;

    case "bullet-list":
      return (
        <ul className="list-disc pl-5 space-y-1 text-foreground/85">
          {(c.items ?? []).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "numbered-list":
      return (
        <ol className="list-decimal pl-5 space-y-1 text-foreground/85">
          {(c.items ?? []).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );

    case "callout": {
      const variants = {
        info: { icon: Info, bg: "bg-[hsl(var(--info-light))]", border: "border-[hsl(var(--info))]", text: "text-[hsl(var(--info))]" },
        warning: { icon: AlertTriangle, bg: "bg-[hsl(var(--warning-light))]", border: "border-[hsl(var(--warning))]", text: "text-[hsl(var(--accent-foreground))]" },
        success: { icon: CheckCircle2, bg: "bg-[hsl(var(--success-light))]", border: "border-[hsl(var(--success))]", text: "text-[hsl(var(--success))]" },
      };
      const v = variants[c.variant ?? "info"];
      const Icon = v.icon;
      return (
        <div className={`${v.bg} ${v.border} border-l-4 rounded-lg p-4 flex items-start gap-3`}>
          <Icon size={18} className={`${v.text} mt-0.5 shrink-0`} />
          <p className="text-sm text-foreground/85">{c.text}</p>
        </div>
      );
    }

    case "divider":
      return <hr className="border-border" />;

    case "video":
      return c.src ? (
        <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted">
          <iframe src={c.src} className="w-full h-full" allowFullScreen title="Embedded video" />
        </div>
      ) : null;

    case "faq":
      return <FaqBlock items={c.faqItems ?? []} />;

    case "code":
      return (
        <pre className="rounded-lg bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] p-4 overflow-x-auto text-sm font-mono">
          {c.language && (
            <span className="text-xs text-muted-foreground block mb-2">{c.language}</span>
          )}
          <code>{c.text}</code>
        </pre>
      );

    default:
      return null;
  }
}

function FaqBlock({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="border border-border rounded-lg divide-y divide-border">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            {item.question}
            <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-3 text-sm text-muted-foreground">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
