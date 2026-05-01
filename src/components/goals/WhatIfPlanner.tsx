import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowDown, ArrowUp, Trophy, FileDown, Save, Lock as LockIcon } from "lucide-react";
import ActionBuilder from "./ActionBuilder";
import ScenarioTable from "./ScenarioTable";
import TrajectoryChart from "./TrajectoryChart";
import ScenarioDrawer from "./ScenarioDrawer";
import { baselineCards, lockedTargets, initialScenarios, rankings, Scenario } from "./dummyData";

export default function WhatIfPlanner() {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [viewing, setViewing] = useState<Scenario | null>(null);

  const totalSaved = scenarios.reduce((s, x) => s + x.tco2eSaved, 0);
  const netCost = scenarios.reduce((s, x) => s + x.costDelta, 0);

  const handleAdd = (s: Scenario) => {
    setScenarios(prev => [...prev, s]);
    toast.success("Scenario added", { description: `${s.action} → −${s.tco2eSaved} tCO₂e/yr` });
  };
  const handleRemove = (id: string) => setScenarios(prev => prev.filter(s => s.id !== id));

  const handleLock = () => {
    toast.success("Locked into Goal Settings", {
      description: "Scenario set locked into Goal Settings for FY2026",
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">What-if Scenario Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">Model emission reduction actions before committing resources</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lockedTargets.map(t => (
            <div key={t.scope} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs">
              <Lock className="h-3 w-3 text-teal-400" />
              <span className="text-muted-foreground">{t.scope}:</span>
              <span className="text-teal-400 font-medium">{t.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Baseline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {baselineCards.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 border-border/50 bg-card/50 backdrop-blur hover:border-teal-500/40 transition-colors">
              <p className="text-xs text-muted-foreground">{c.title}</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-semibold tracking-tight">{c.value}</span>
                <span className="text-xs text-muted-foreground">{c.unit}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-muted-foreground">{c.subtitle}</p>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${c.trend < 0 ? "text-green-400" : "text-red-400"}`}>
                  {c.trend < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                  {Math.abs(c.trend)}%
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Builder + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ActionBuilder onAdd={handleAdd} />
        </div>
        <div className="lg:col-span-3">
          <ScenarioTable scenarios={scenarios} onRemove={handleRemove} onView={setViewing} />
        </div>
      </div>

      {/* Trajectory chart */}
      <TrajectoryChart scenarioCount={scenarios.length} totalSaved={totalSaved} />

      {/* Rankings */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold">Ranked by impact efficiency</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">tCO₂e saved per ₹ lakh invested</p>
        <div className="space-y-3">
          {rankings.map((r) => (
            <div key={r.rank} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground/80 shrink-0">
                {r.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{r.name}</span>
                    {r.chip && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] border border-amber-500/30">{r.chip}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{r.efficiency} tCO₂e/₹L</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.width}%` }}
                    transition={{ duration: 0.8, delay: r.rank * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,260px)] z-30 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Total impact if all scenarios executed:{" "}
            <span className="text-green-400 font-medium">−{totalSaved} tCO₂e/yr</span>
            <span className="mx-2 text-border">|</span>
            Net cost:{" "}
            <span className={netCost < 0 ? "text-green-400 font-medium" : "text-foreground font-medium"}>
              {netCost < 0 ? "−" : "+"}₹{Math.abs(netCost).toFixed(1)}L/yr
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast("Export queued", { description: "PDF report will be generated." })}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Scenario set saved")}>
              <Save className="h-4 w-4" /> Save scenario set
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white" onClick={handleLock}>
              <LockIcon className="h-4 w-4" /> Lock into Goal Settings
            </Button>
          </div>
        </div>
      </div>

      <ScenarioDrawer scenario={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
