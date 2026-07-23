import { Card } from "@/components/ui/card";
import { Newspaper, CheckCircle2, Clock, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}

interface Props {
  total: number;
  assigned: number;
  unassigned: number;
  organizations: number;
}

export default function StatsCards({ total, assigned, unassigned, organizations }: Props) {
  const stats: Stat[] = [
    { label: "Total News", value: total, icon: Newspaper, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Assigned", value: assigned, icon: CheckCircle2, tone: "text-emerald-500 bg-emerald-500/10" },
    { label: "Unassigned", value: unassigned, icon: Clock, tone: "text-amber-500 bg-amber-500/10" },
    { label: "Organizations", value: organizations, icon: Building2, tone: "text-violet-500 bg-violet-500/10" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4 border-border/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.tone}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-foreground leading-tight">{s.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
