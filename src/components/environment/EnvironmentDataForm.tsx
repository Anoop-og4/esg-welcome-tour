import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, FolderPlus, RotateCcw, CheckCircle2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/**
 * Table-view data entry form (POC).
 * - Rows and Section (group) rows, styled like the reference image.
 * - Interdependent columns: Total tCO₂e = Activity Value × Emission Factor (auto, read-only).
 * - Persists to localStorage; "Save" commits the sheet.
 */

type RowKind = "data" | "section";

interface DataRow {
  id: string;
  kind: RowKind;
  category: string;
  activity: string;      // Activity Value (input)
  factor: string;        // Emission Factor (input)
  // total is derived: activity * factor
}

const STORAGE_KEY = "esg-env-data-sheet-v1";

const uid = () => Math.random().toString(36).slice(2, 9);

const seedRows: DataRow[] = [
  { id: uid(), kind: "data", category: "Diesel (stationary)", activity: "1200", factor: "2.68" },
  { id: uid(), kind: "section", category: "Scope 2 — Purchased energy", activity: "", factor: "" },
  { id: uid(), kind: "data", category: "Grid electricity", activity: "45000", factor: "0.71" },
  { id: uid(), kind: "data", category: "Purchased steam", activity: "800", factor: "0.19" },
  { id: uid(), kind: "data", category: "District cooling", activity: "300", factor: "0.12" },
  { id: uid(), kind: "section", category: "Scope 3 — Value chain", activity: "", factor: "" },
];

function loadRows(): DataRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataRow[];
  } catch { /* ignore */ }
  return [
    { id: uid(), kind: "section", category: "Scope 1 — Direct emissions", activity: "", factor: "" },
    ...seedRows,
  ];
}

const computeTotal = (activity: string, factor: string) => {
  const a = parseFloat(activity);
  const f = parseFloat(factor);
  if (isNaN(a) || isNaN(f)) return null;
  return a * f;
};

export default function EnvironmentDataForm() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DataRow[]>(loadRows);
  const [savedFlash, setSavedFlash] = useState(false);

  const grandTotal = useMemo(
    () =>
      rows.reduce((sum, r) => {
        if (r.kind !== "data") return sum;
        const t = computeTotal(r.activity, r.factor);
        return sum + (t ?? 0);
      }, 0),
    [rows],
  );

  const dataCount = rows.filter((r) => r.kind === "data").length;

  const update = (id: string, patch: Partial<DataRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const addRow = () =>
    setRows((prev) => [...prev, { id: uid(), kind: "data", category: "", activity: "", factor: "" }]);

  const addSection = () =>
    setRows((prev) => [...prev, { id: uid(), kind: "section", category: "New Section", activity: "", factor: "" }]);

  const resetSheet = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRows(loadRows());
    toast({ title: "Sheet reset", description: "Restored the default template." });
  };

  const save = () => {
    // simple validation
    const invalid = rows.some((r) => r.kind === "data" && !r.category.trim());
    if (invalid) {
      toast({ title: "Missing category", description: "Every data row needs a category name.", variant: "destructive" });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
    toast({ title: "Saved", description: `${dataCount} rows · ${grandTotal.toFixed(1)} tCO₂e committed.` });
  };

  useEffect(() => {
    // keep a live draft so refresh doesn't lose edits
    const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)), 600);
    return () => clearTimeout(t);
  }, [rows]);

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Leaf className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-semibold tracking-tight">Add Environment Data</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter emission sources in a spreadsheet-style table. <span className="text-foreground/80">Total tCO₂e</span> is
              auto-calculated from Activity × Emission Factor.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={addSection}>
              <FolderPlus className="mr-1.5 h-4 w-4" /> Section
            </Button>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1.5 h-4 w-4" /> Row
            </Button>
            <Button variant="ghost" size="sm" onClick={resetSheet}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Table card */}
        <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <div>
              <h3 className="text-sm font-semibold">Emission Inventory</h3>
              <p className="text-xs text-muted-foreground">Structured data entry</p>
            </div>
            <Badge variant="secondary" className="rounded-full">{dataCount} rows</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-primary/90 text-primary-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Activity Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Emission Factor</th>
                  <th className="px-4 py-3 text-right font-semibold">Total tCO₂e</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((r) => {
                    if (r.kind === "section") {
                      return (
                        <motion.tr
                          key={r.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-amber-500/10"
                        >
                          <td colSpan={4} className="px-4 py-2.5">
                            <input
                              value={r.category}
                              onChange={(e) => update(r.id, { category: e.target.value })}
                              className="w-full bg-transparent text-sm font-semibold text-amber-600 outline-none placeholder:text-amber-600/50 dark:text-amber-400"
                              placeholder="Section title"
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeRow(r.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    }

                    const total = computeTotal(r.activity, r.factor);
                    return (
                      <motion.tr
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-border/40 hover:bg-muted/30"
                      >
                        <td className="px-3 py-1.5">
                          <Input
                            value={r.category}
                            onChange={(e) => update(r.id, { category: e.target.value })}
                            placeholder="Emission source"
                            className="h-9 border-transparent bg-transparent hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={r.activity}
                            onChange={(e) => update(r.id, { activity: e.target.value })}
                            placeholder="0"
                            className="h-9 border-transparent bg-transparent font-mono hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={r.factor}
                            onChange={(e) => update(r.id, { factor: e.target.value })}
                            placeholder="0.00"
                            className="h-9 border-transparent bg-transparent font-mono hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-4 py-1.5 text-right">
                          <motion.span
                            key={total ?? "empty"}
                            initial={{ scale: 0.9, opacity: 0.6 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`font-mono font-medium ${total === null ? "text-muted-foreground/50" : "text-primary"}`}
                          >
                            {total === null ? "—" : total.toFixed(2)}
                          </motion.span>
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeRow(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
              <tfoot>
                <tr className="border-t border-border/60 bg-muted/40">
                  <td className="px-4 py-3 text-sm font-semibold" colSpan={3}>
                    Grand total
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-bold text-primary">
                    {grandTotal.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Changes autosave as a draft. Click <span className="text-foreground">Save</span> to commit the sheet.
          </p>
          <Button onClick={save} className="min-w-[130px]">
            <AnimatePresence mode="wait" initial={false}>
              {savedFlash ? (
                <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Saved
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <Save className="mr-1.5 h-4 w-4" /> Save data
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
