import { useState } from "react";
import {
  HelpBlock,
  BlockType,
  TitleLevel,
  CalloutVariant,
  createBlock,
} from "@/types/help";
import {
  GripVertical,
  Trash2,
  Plus,
  Type,
  AlignLeft,
  Image,
  List,
  ListOrdered,
  AlertCircle,
  Minus,
  Video,
  HelpCircle,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const BLOCK_OPTIONS: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "title", icon: Type, label: "Title" },
  { type: "paragraph", icon: AlignLeft, label: "Paragraph" },
  { type: "image", icon: Image, label: "Image" },
  { type: "bullet-list", icon: List, label: "Bullet List" },
  { type: "numbered-list", icon: ListOrdered, label: "Numbered List" },
  { type: "callout", icon: AlertCircle, label: "Callout" },
  { type: "divider", icon: Minus, label: "Divider" },
  { type: "video", icon: Video, label: "Video" },
  { type: "faq", icon: HelpCircle, label: "FAQ" },
  { type: "code", icon: Code, label: "Code Block" },
];

interface BlockEditorProps {
  blocks: HelpBlock[];
  onChange: (blocks: HelpBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const updateBlock = (id: string, content: HelpBlock["content"]) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((b, i) => ({ ...b, order: i })));
  };

  const addBlock = (type: BlockType) => {
    const newBlock = createBlock(type, blocks.length);
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-3">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => (
          <div
            key={block.id}
            className="group relative flex gap-2 rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors"
          >
            {/* Side controls */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <GripVertical size={14} className="text-muted-foreground cursor-grab" />
              <button
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Block content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {block.type.replace("-", " ")}
                </span>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <BlockContent block={block} onUpdate={(c) => updateBlock(block.id, c)} />
            </div>
          </div>
        ))}

      {/* Add block button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full border-dashed gap-2"
        >
          <Plus size={14} />
          Add Block
        </Button>

        {showAddMenu && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-2 grid grid-cols-2 gap-1">
            {BLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => addBlock(opt.type)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <opt.icon size={14} className="text-muted-foreground" />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Individual block editors */
function BlockContent({
  block,
  onUpdate,
}: {
  block: HelpBlock;
  onUpdate: (c: Partial<HelpBlock["content"]>) => void;
}) {
  const c = block.content;

  switch (block.type) {
    case "title":
      return (
        <div className="space-y-2">
          <select
            value={c.level ?? "h2"}
            onChange={(e) => onUpdate({ level: e.target.value as TitleLevel })}
            className="text-xs rounded border border-input bg-background px-2 py-1"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
          </select>
          <Input
            value={c.text ?? ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter heading text…"
            className="font-display font-semibold"
          />
        </div>
      );

    case "paragraph":
      return (
        <Textarea
          value={c.text ?? ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Write your paragraph…"
          rows={3}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <Input
            value={c.src ?? ""}
            onChange={(e) => onUpdate({ src: e.target.value })}
            placeholder="Image URL (e.g. /help/overview-1.png)"
          />
          <Input
            value={c.alt ?? ""}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Alt text"
          />
          {c.src && (
            <img src={c.src} alt={c.alt ?? ""} className="h-32 object-cover rounded border border-border" />
          )}
        </div>
      );

    case "bullet-list":
    case "numbered-list":
      return <ListEditor items={c.items ?? [""]} onChange={(items) => onUpdate({ items })} />;

    case "callout":
      return (
        <div className="space-y-2">
          <select
            value={c.variant ?? "info"}
            onChange={(e) => onUpdate({ variant: e.target.value as CalloutVariant })}
            className="text-xs rounded border border-input bg-background px-2 py-1"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
          <Textarea
            value={c.text ?? ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Callout message…"
            rows={2}
          />
        </div>
      );

    case "divider":
      return <hr className="border-border" />;

    case "video":
      return (
        <Input
          value={c.src ?? ""}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="Video embed URL…"
        />
      );

    case "faq":
      return <FaqEditor items={c.faqItems ?? []} onChange={(faqItems) => onUpdate({ faqItems })} />;

    case "code":
      return (
        <div className="space-y-2">
          <Input
            value={c.language ?? "javascript"}
            onChange={(e) => onUpdate({ language: e.target.value })}
            placeholder="Language (e.g. javascript)"
            className="max-w-[200px] text-xs"
          />
          <Textarea
            value={c.text ?? ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Code…"
            rows={5}
            className="font-mono text-sm"
          />
        </div>
      );

    default:
      return null;
  }
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (i: string[]) => void }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={`Item ${i + 1}`}
            className="text-sm"
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...items, ""])} className="text-xs gap-1">
        <Plus size={12} /> Add Item
      </Button>
    </div>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: { question: string; answer: string }[];
  onChange: (i: { question: string; answer: string }[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-1 p-2 rounded border border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">FAQ #{i + 1}</span>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <Input
            value={item.question}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], question: e.target.value };
              onChange(next);
            }}
            placeholder="Question"
            className="text-sm"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], answer: e.target.value };
              onChange(next);
            }}
            placeholder="Answer"
            rows={2}
            className="text-sm"
          />
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
        className="text-xs gap-1"
      >
        <Plus size={12} /> Add FAQ
      </Button>
    </div>
  );
}
