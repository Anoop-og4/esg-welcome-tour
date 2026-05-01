import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { Scenario, scopeColors, feasibilityColors } from "./dummyData";

interface Props {
  scenarios: Scenario[];
  onRemove: (id: string) => void;
  onView: (s: Scenario) => void;
}

export default function ScenarioTable({ scenarios, onRemove, onView }: Props) {
  const totalSaved = scenarios.reduce((s, x) => s + x.tco2eSaved, 0);
  const netCost = scenarios.reduce((s, x) => s + x.costDelta, 0);
  const blendedPayback = (scenarios.reduce((s, x) => {
    const p = parseFloat(x.payback);
    return s + (isNaN(p) ? 0 : p);
  }, 0) / Math.max(1, scenarios.length)).toFixed(1);

  const s1 = scenarios.filter(s => s.scope === "Scope 1").reduce((a, b) => a + b.targetCovered, 0);
  const s2 = scenarios.filter(s => s.scope === "Scope 2").reduce((a, b) => a + b.targetCovered, 0);
  const s3 = scenarios.filter(s => s.scope === "Scope 3").reduce((a, b) => a + b.targetCovered, 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <div>
          <h3 className="text-base font-semibold">Scenario comparison</h3>
          <p className="text-xs text-muted-foreground">Stack and compare emission reduction actions</p>
        </div>
        <Badge variant="secondary" className="rounded-full">{scenarios.length} scenarios</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/50">
              <th className="text-left px-5 py-3 font-medium">Action</th>
              <th className="text-left px-3 py-3 font-medium">Scope</th>
              <th className="text-right px-3 py-3 font-medium">tCO₂e/yr</th>
              <th className="text-right px-3 py-3 font-medium">Cost delta</th>
              <th className="text-left px-3 py-3 font-medium">Payback</th>
              <th className="text-left px-3 py-3 font-medium w-44">Target covered</th>
              <th className="text-left px-3 py-3 font-medium">Feasibility</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {scenarios.map((s) => {
                const isCostSaving = s.costDelta < 0;
                return (
                  <motion.tr
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium">{s.action}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${scopeColors[s.scope]}`}>
                        {s.scope}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-green-400 font-mono">−{s.tco2eSaved} t</td>
                    <td className={`px-3 py-4 text-right font-mono ${isCostSaving ? "text-green-400" : "text-red-400"}`}>
                      {s.costDeltaLabel}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{s.payback}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={s.targetCovered} className="h-1.5 flex-1" />
                        <span className="text-[11px] text-muted-foreground font-mono w-10 text-right">{s.targetCovered}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${feasibilityColors[s.feasibility]}`}>
                        {s.feasibility}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onView(s)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => onRemove(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {scenarios.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                  No scenarios yet. Build one on the left to start modelling.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {scenarios.length > 0 && (
        <div className="px-5 py-3 bg-muted/30 border-t border-border/50 text-xs text-muted-foreground">
          Stacking all {scenarios.length} scenarios covers{" "}
          <span className="text-foreground font-medium">{s1}% S1</span> ·{" "}
          <span className="text-foreground font-medium">{s2}% S2</span> ·{" "}
          <span className="text-foreground font-medium">{s3}% S3</span> of annual targets at net{" "}
          <span className={netCost < 0 ? "text-green-400 font-medium" : "text-foreground font-medium"}>
            {netCost < 0 ? "saving" : "cost"} ₹{Math.abs(netCost).toFixed(1)}L/yr
          </span>{" "}
          with blended payback of <span className="text-foreground font-medium">{blendedPayback} years</span>.
          Total impact: <span className="text-green-400 font-medium">−{totalSaved} tCO₂e/yr</span>.
        </div>
      )}
    </Card>
  );
}
