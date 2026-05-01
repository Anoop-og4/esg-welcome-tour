import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Wand2 } from "lucide-react";
import { actionTypes, actionToScope, ScopeType, Scenario, Feasibility } from "./dummyData";

interface Props {
  onAdd: (s: Scenario) => void;
}

export default function ActionBuilder({ onAdd }: Props) {
  const [action, setAction] = useState(actionTypes[0]);
  const [scope, setScope] = useState<ScopeType>(actionToScope[actionTypes[0]]);
  const [scale, setScale] = useState(40);
  const [timeline, setTimeline] = useState(6);
  const [capex, setCapex] = useState(24);
  const [coBenefits, setCoBenefits] = useState(true);

  const handleActionChange = (v: string) => {
    setAction(v);
    setScope(actionToScope[v] || "Scope 1");
  };

  const handleCalculate = () => {
    const variance = Math.round((Math.random() - 0.5) * 30);
    const tco2e = Math.max(10, Math.round(scale * 10 + variance));
    const annualised = +(capex * 0.08).toFixed(1);
    const payback = capex > 0 && tco2e > 0 ? +(capex / (tco2e * 0.5)).toFixed(1) : 0;
    const targetCovered = Math.round(10 + Math.random() * 70);

    let feasibility: Feasibility = "Achievable";
    if (payback < 2 && payback > 0) feasibility = "Quick win";
    else if (tco2e > 100) feasibility = "High impact";

    const newScenario: Scenario = {
      id: `s-${Date.now()}`,
      action: `${action} (${scale}%)`,
      scope,
      tco2eSaved: tco2e,
      costDelta: annualised,
      costDeltaLabel: `+₹${annualised}L/yr`,
      payback: payback > 0 ? `${payback} yrs` : "Immediate",
      targetCovered,
      feasibility,
      reasoning: `Custom scenario built in planner. Implementation scale ${scale}% over ${timeline} months with capital outlay of ₹${capex}L. Co-benefits ${coBenefits ? "included" : "excluded"} in valuation.`,
    };

    onAdd(newScenario);
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="flex items-center gap-2 mb-1">
        <Wand2 className="h-4 w-4 text-teal-400" />
        <h3 className="text-base font-semibold">Build your scenario</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Configure an action and project its impact</p>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Action type</Label>
          <Select value={action} onValueChange={handleActionChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {actionTypes.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Scope affected</Label>
          <Select value={scope} onValueChange={(v) => setScope(v as ScopeType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Scope 1">Scope 1</SelectItem>
              <SelectItem value="Scope 2">Scope 2</SelectItem>
              <SelectItem value="Scope 3">Scope 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Implementation scale</Label>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-mono">{scale}%</span>
          </div>
          <Slider value={[scale]} min={10} max={100} step={5} onValueChange={(v) => setScale(v[0])} />
          <p className="text-[11px] text-muted-foreground">What % of the activity will this action cover?</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Implementation timeline</Label>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-mono">{timeline} mo</span>
          </div>
          <Slider value={[timeline]} min={1} max={24} step={1} onValueChange={(v) => setTimeline(v[0])} />
          <p className="text-[11px] text-muted-foreground">How many months to full rollout?</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Estimated capital cost (₹ Lakhs)</Label>
          <Input type="number" value={capex} onChange={(e) => setCapex(+e.target.value || 0)} />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium">Include co-benefits</p>
            <p className="text-[10px] text-muted-foreground">Energy savings, productivity, regulatory</p>
          </div>
          <Switch checked={coBenefits} onCheckedChange={setCoBenefits} />
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white"
        >
          Calculate impact <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-[10px] text-center text-muted-foreground">Scenario will be added to comparison table</p>
      </div>
    </Card>
  );
}
