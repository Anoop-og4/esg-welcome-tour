import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, RotateCcw, CheckCircle2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * Table-view data entry form (POC).
 * - Only data rows (no sections).
 * - Dropdown cells: Scope and Unit are selectable.
 * - Interdependent columns: Total tCO₂e = Activity Value × Emission Factor (auto, read-only).
 * - Persists to localStorage; "Save" commits the sheet.
 */

interface DataRow {
  id: string;
  category: string;
  scope: string;    // dropdown
  activity: string; // Activity Value (input)
  unit: string;     // dropdown
  factor: string;   // Emission Factor (input)
  // total is derived: activity * factor
}

const STORAGE_KEY = "esg-env-data-sheet-v2";

const SCOPE_OPTIONS = ["Scope 1", "Scope 2", "Scope 3"];
const UNIT_OPTIONS = ["kg", "L", "kWh", "m³", "tonnes", "km"];

const uid = () => Math.random().toString(36).slice(2, 9);

const seedRows: DataRow[] = [
  { id: uid(), category: "Diesel (stationary)", scope: "Scope 1", activity: "1200", unit: "L", factor: "2.68" },
  { id: uid(), category: "Grid electricity", scope: "Scope 2", activity: "45000", unit: "kWh", factor: "0.71" },
  { id: uid(), category: "Purchased steam", scope: "Scope 2", activity: "800", unit: "kWh", factor: "0.19" },
  { id: uid(), category: "Business travel", scope: "Scope 3", activity: "300", unit: "km", factor: "0.12" },
];

function loadRows(): DataRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataRow[];
  } catch { /* ignore */ }
  return seedRows;
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
        const t = computeTotal(r.activity, r.factor);
        return sum + (t ?? 0);
      }, 0),
    [rows],
  );

  const dataCount = rows.length;

  const update = (id: string, patch: Partial<DataRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: uid(), category: "", scope: "Scope 1", activity: "", unit: "kg", factor: "" },
    ]);

  const resetSheet = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRows(loadRows());
    toast({ title: "Sheet reset", description: "Restored the default template." });
  };

  const save = () => {
    const invalid = rows.some((r) => !r.category.trim());
    if (invalid) {
      toast({ title: "Missing category", description: "Every row needs a category name.", variant: "destructive" });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
    toast({ title: "Saved", description: `${dataCount} rows · ${grandTotal.toFixed(1)} tCO₂e committed.` });
  };

  useEffect(() => {
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
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-primary/90 text-primary-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Scope</th>
                  <th className="px-4 py-3 text-left font-semibold">Activity Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Unit</th>
                  <th className="px-4 py-3 text-left font-semibold">Emission Factor</th>
                  <th className="px-4 py-3 text-right font-semibold">Total tCO₂e</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((r) => {
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
                          <Select value={r.scope} onValueChange={(v) => update(r.id, { scope: v })}>
                            <SelectTrigger className="h-9 border-transparent bg-transparent hover:border-border focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SCOPE_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select value={r.unit} onValueChange={(v) => update(r.id, { unit: v })}>
                            <SelectTrigger className="h-9 border-transparent bg-transparent hover:border-border focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                  <td className="px-4 py-3 text-sm font-semibold" colSpan={5}>
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
