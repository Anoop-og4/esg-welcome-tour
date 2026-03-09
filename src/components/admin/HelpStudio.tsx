import { useState } from "react";
import {
  HelpArticle,
  HelpBlock,
  BlockType,
  HELP_CATEGORIES,
  SEED_ARTICLES,
  ArticleStatus,
  createBlock,
} from "@/types/help";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  Globe,
  FileText,
  Filter,
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
  Bold,
  Italic,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "./BlockRenderer";

const BLOCK_TOOLS: { type: BlockType; icon: React.ElementType; label: string }[] = [
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

type View = "list" | "editor" | "preview";

export default function HelpStudio() {
  const [articles, setArticles] = useState<HelpArticle[]>(SEED_ARTICLES);
  const [view, setView] = useState<View>("list");
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  /* Helpers */
  const filteredArticles = articles.filter((a) => {
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || a.category === filterCategory;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const openEditor = (article?: HelpArticle) => {
    if (article) {
      setEditingArticle({ ...article, blocks: article.blocks.map((b) => ({ ...b })) });
    } else {
      setEditingArticle({
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        category: HELP_CATEGORIES[0],
        status: "draft",
        blocks: [],
        metaTitle: "",
        metaDescription: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setView("editor");
  };

  const saveArticle = () => {
    if (!editingArticle) return;
    const updated = { ...editingArticle, updatedAt: new Date().toISOString() };
    setArticles((prev) => {
      const exists = prev.find((a) => a.id === updated.id);
      return exists ? prev.map((a) => (a.id === updated.id ? updated : a)) : [...prev, updated];
    });
    setView("list");
    setEditingArticle(null);
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const togglePublish = () => {
    if (!editingArticle) return;
    setEditingArticle({
      ...editingArticle,
      status: editingArticle.status === "published" ? "draft" : "published",
    });
  };

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  /* ─── List View ───────────────────────────────────────── */
  if (view === "list") {
    return (
      <div className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Help Studio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create & manage help articles · {articles.length} article{articles.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => openEditor()} className="gap-2">
            <Plus size={16} /> New Article
          </Button>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles…"
              className="pl-9"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {HELP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Article table */}
        <div className="px-6 pb-6">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{article.title || "Untitled"}</p>
                          <p className="text-xs text-muted-foreground">/{article.slug || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs rounded-full bg-muted px-2.5 py-1">{article.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
                            article.status === "published"
                              ? "bg-[hsl(var(--success-light))] text-[hsl(var(--success))]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {article.status === "published" ? (
                            <Globe size={10} />
                          ) : (
                            <FileText size={10} />
                          )}
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingArticle(article);
                              setView("preview");
                            }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditor(article)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Preview View ────────────────────────────────────── */
  if (view === "preview" && editingArticle) {
    return (
      <div className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setView("list");
                setEditingArticle(null);
              }}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Preview</h1>
              <p className="text-xs text-muted-foreground">{editingArticle.title}</p>
            </div>
          </div>
          <Button onClick={() => openEditor(editingArticle)} variant="outline" size="sm" className="gap-2">
            <Edit3 size={14} /> Edit
          </Button>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {editingArticle.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          {editingArticle.blocks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No content blocks yet.</p>
          )}
        </div>
      </div>
    );
  }

  /* ─── Editor View (3-column: Block Tools | Editor | Live Preview) ── */
  if (view === "editor" && editingArticle) {
    const addBlockFromTool = (type: BlockType) => {
      const newBlock = createBlock(type, editingArticle.blocks.length);
      setEditingArticle({ ...editingArticle, blocks: [...editingArticle.blocks, newBlock] });
    };

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setView("list");
                setEditingArticle(null);
              }}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-foreground">Help Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={editingArticle.status === "published" ? "secondary" : "outline"}
              size="sm"
              onClick={togglePublish}
              className="gap-1.5 text-xs"
            >
              {editingArticle.status === "published" ? (
                <><FileText size={12} /> Unpublish</>
              ) : (
                <><Globe size={12} /> Publish</>
              )}
            </Button>
            <Button size="sm" onClick={saveArticle} className="gap-1.5 text-xs">
              <Save size={12} /> Save
            </Button>
          </div>
        </header>

        {/* 3-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Block Tools */}
          <aside className="w-[160px] shrink-0 border-r border-border bg-card overflow-y-auto p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus size={10} className="text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Block Tools</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Click to add</p>
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_TOOLS.map((tool) => (
                <button
                  key={tool.type}
                  onClick={() => addBlockFromTool(tool.type)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <tool.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground leading-tight text-center">{tool.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* CENTER: Editor */}
          <main className="flex-1 overflow-y-auto">
            {/* Editor toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-xs font-medium text-foreground">Editor</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border-r border-border pr-3">
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Bold size={14} /></button>
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Italic size={14} /></button>
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Link size={14} /></button>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {editingArticle.blocks.length} block{editingArticle.blocks.length !== 1 ? "s" : ""} · Auto-saved
                </span>
              </div>
            </div>

            <div className="px-6 py-6 max-w-2xl">
              {/* Title & description inline */}
              <input
                value={editingArticle.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditingArticle({
                    ...editingArticle,
                    title,
                    slug: editingArticle.slug || autoSlug(title),
                  });
                }}
                placeholder="Article title…"
                className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground/50 outline-none font-display mb-1"
              />
              <input
                value={editingArticle.metaDescription}
                onChange={(e) => setEditingArticle({ ...editingArticle, metaDescription: e.target.value })}
                placeholder="Add a short description..."
                className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 outline-none mb-3"
              />

              {/* Status & category badges */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                    editingArticle.status === "published"
                      ? "bg-[hsl(var(--success))] text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {editingArticle.status}
                </span>
                <select
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="text-[10px] rounded border border-input bg-background px-2 py-0.5 text-muted-foreground"
                >
                  {HELP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Blocks */}
              <BlockEditor
                blocks={editingArticle.blocks}
                onChange={(blocks) => setEditingArticle({ ...editingArticle, blocks })}
              />
            </div>
          </main>

          {/* RIGHT: Live Preview */}
          <aside className="w-[380px] shrink-0 border-l border-border bg-muted/30 overflow-y-auto flex flex-col">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 backdrop-blur px-4 py-2">
              <Eye size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">Live Preview</span>
            </div>

            {/* Browser chrome mockup */}
            <div className="p-4">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--warning))]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]/60" />
                  </div>
                  <div className="flex-1 bg-background rounded px-2 py-0.5 text-[9px] text-muted-foreground truncate">
                    help.yourapp.com/guides/{editingArticle.slug || "untitled"}
                  </div>
                </div>

                {/* Preview content */}
                <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Breadcrumb */}
                  <div className="text-[10px] text-muted-foreground">
                    Help / {editingArticle.category} / <span className="text-foreground font-medium">{editingArticle.title ? `${editingArticle.title.slice(0, 20)}…` : "Untitled"}</span>
                  </div>

                  {/* Article header */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-display">
                      {editingArticle.title || "Untitled Article"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {editingArticle.metaDescription || "Add a short description..."}
                    </p>
                  </div>

                  <hr className="border-primary border-t-2 w-12" />

                  {/* Rendered blocks */}
                  <div className="space-y-3 text-xs [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_p]:text-[11px] [&_li]:text-[11px] [&_pre]:text-[9px] [&_img]:rounded-md">
                    {editingArticle.blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => (
                        <BlockRenderer key={block.id} block={block} />
                      ))}
                    {editingArticle.blocks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8 text-[11px]">
                        Add blocks to see preview
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return null;
}
