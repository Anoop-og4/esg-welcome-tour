import { useState } from "react";
import {
  HelpArticle,
  HelpBlock,
  HELP_CATEGORIES,
  SEED_ARTICLES,
  ArticleStatus,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "./BlockRenderer";

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

  /* ─── Editor View ─────────────────────────────────────── */
  if (view === "editor" && editingArticle) {
    return (
      <div className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3 sticky top-0 z-10">
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
            <h1 className="font-display text-lg font-bold text-foreground">
              {articles.find((a) => a.id === editingArticle.id) ? "Edit Article" : "New Article"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("preview")}
              className="gap-2"
            >
              <Eye size={14} /> Preview
            </Button>
            <Button
              variant={editingArticle.status === "published" ? "secondary" : "outline"}
              size="sm"
              onClick={togglePublish}
              className="gap-2"
            >
              {editingArticle.status === "published" ? (
                <>
                  <FileText size={14} /> Unpublish
                </>
              ) : (
                <>
                  <Globe size={14} /> Publish
                </>
              )}
            </Button>
            <Button size="sm" onClick={saveArticle} className="gap-2">
              <Save size={14} /> Save
            </Button>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {/* Meta fields */}
          <div className="esg-card p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Article Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input
                  value={editingArticle.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingArticle({
                      ...editingArticle,
                      title,
                      slug: editingArticle.slug || autoSlug(title),
                    });
                  }}
                  placeholder="Article title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <Input
                  value={editingArticle.slug}
                  onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                  placeholder="url-slug"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {HELP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2 h-10">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 ${
                      editingArticle.status === "published"
                        ? "bg-[hsl(var(--success-light))] text-[hsl(var(--success))]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {editingArticle.status === "published" ? <Globe size={10} /> : <FileText size={10} />}
                    {editingArticle.status}
                  </span>
                </div>
              </div>
            </div>

            {/* SEO */}
            <details className="group">
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                SEO Fields ▸
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Meta Title</label>
                  <Input
                    value={editingArticle.metaTitle}
                    onChange={(e) => setEditingArticle({ ...editingArticle, metaTitle: e.target.value })}
                    placeholder="SEO title (max 60 chars)"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
                  <Input
                    value={editingArticle.metaDescription}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, metaDescription: e.target.value })
                    }
                    placeholder="SEO description (max 160 chars)"
                    maxLength={160}
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Block editor */}
          <div className="esg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Content Blocks</h2>
            <BlockEditor
              blocks={editingArticle.blocks}
              onChange={(blocks) => setEditingArticle({ ...editingArticle, blocks })}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
