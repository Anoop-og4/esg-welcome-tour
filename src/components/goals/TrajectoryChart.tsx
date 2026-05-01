import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid, ReferenceLine, Area, ComposedChart
} from "recharts";
import { trajectoryData } from "./dummyData";
import { motion } from "framer-motion";

interface Props {
  scenarioCount: number;
  totalSaved: number;
}

export default function TrajectoryChart({ scenarioCount, totalSaved }: Props) {
  // Shift scenarios line down based on number of additional scenarios beyond baseline 4
  const shift = Math.max(0, (scenarioCount - 4)) * 250 + (totalSaved - 800) * 0.6;

  const data = trajectoryData.map((d, i) => {
    const adj = i === 0 ? 0 : (i / 5) * shift;
    const scenarios = Math.max(d.target, d.scenarios - adj);
    return {
      ...d,
      scenarios: Math.round(scenarios),
      gap: Math.max(0, scenarios - d.target),
      gapBase: d.target,
    };
  });

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold">Emission trajectory with scenarios stacked</h3>
          <p className="text-xs text-muted-foreground">Projected vs target vs business-as-usual</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">FY25 → FY30</span>
        </div>
      </div>

      <motion.div
        key={shift}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45 90% 55%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(45 90% 55%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 15000]} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x="FY28" stroke="hsl(45 90% 55%)" strokeDasharray="4 4" label={{ value: "Net-zero milestone check", fill: "hsl(45 90% 55%)", fontSize: 10, position: "insideTopRight" }} />
            <Area type="monotone" dataKey="gap" stackId="gap" stroke="none" fill="url(#gapGradient)" name="Gap to target" />
            <Line type="monotone" dataKey="bau" stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeWidth={2} dot={false} name="Business as usual" />
            <Line type="monotone" dataKey="scenarios" stroke="hsl(174 72% 47%)" strokeWidth={2.5} dot={{ r: 3 }} name="With scenarios" />
            <Line type="monotone" dataKey="target" stroke="hsl(142 70% 45%)" strokeDasharray="6 4" strokeWidth={2} dot={false} name="Target pathway" />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
