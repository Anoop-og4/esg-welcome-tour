import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Scenario, scopeColors, feasibilityColors } from "./dummyData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  scenario: Scenario | null;
  onClose: () => void;
}

export default function ScenarioDrawer({ scenario, onClose }: Props) {
  if (!scenario) return null;
  const data = [
    { name: "Covered", value: scenario.targetCovered, color: "hsl(174 72% 47%)" },
    { name: "Remaining", value: 100 - scenario.targetCovered, color: "hsl(var(--muted))" },
  ];

  return (
    <Sheet open={!!scenario} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${scopeColors[scenario.scope]}`}>
              {scenario.scope}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${feasibilityColors[scenario.feasibility]}`}>
              {scenario.feasibility}
            </span>
          </div>
          <SheetTitle className="text-xl">{scenario.action}</SheetTitle>
          <SheetDescription>Detailed scenario impact analysis</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Annual savings</p>
              <p className="text-xl font-semibold text-green-400">−{scenario.tco2eSaved} t</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Cost delta</p>
              <p className={`text-xl font-semibold ${scenario.costDelta < 0 ? "text-green-400" : "text-red-400"}`}>{scenario.costDeltaLabel}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Payback</p>
              <p className="text-xl font-semibold">{scenario.payback}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Target covered</p>
              <p className="text-xl font-semibold text-teal-400">{scenario.targetCovered}%</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-medium mb-3">% of {scenario.scope} target covered</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-medium mb-2">Reasoning</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{scenario.reasoning}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
