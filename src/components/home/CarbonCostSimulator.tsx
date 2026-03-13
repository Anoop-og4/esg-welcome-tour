import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, Flame } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const baseEmissions = 12400; // tons CO2

function generateProjection(price: number) {
  return Array.from({ length: 6 }, (_, i) => ({
    year: `FY${25 + i}`,
    cost: Math.round((baseEmissions * price * (1 - i * 0.06)) / 1000),
  }));
}

function AnimatedCounter({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => `$${(v / 1000000).toFixed(1)}M`);

  useEffect(() => {
    const ctrl = animate(motionVal, value, { duration: 0.6, ease: "easeOut" });
    return ctrl.stop;
  }, [value, motionVal]);

  return <motion.span className="text-2xl font-extrabold neon-text text-foreground font-display">{display}</motion.span>;
}

export default function CarbonCostSimulator() {
  const [carbonPrice, setCarbonPrice] = useState(90);
  const projectedCost = baseEmissions * carbonPrice;
  const projectionData = generateProjection(carbonPrice);

  const costSeverity = projectedCost > 1500000 ? "text-destructive" : projectedCost > 1000000 ? "text-warning" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card glow-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
          <DollarSign size={14} className="text-warning" />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-foreground">Carbon Cost Simulator</h2>
          <p className="text-[10px] text-muted-foreground">Financial risk from carbon pricing</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Projected Cost</p>
          <AnimatedCounter value={projectedCost} />
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Emissions</p>
          <p className="text-sm font-bold text-foreground flex items-center gap-1">
            <Flame size={12} className={costSeverity} />
            {baseEmissions.toLocaleString()} <span className="text-muted-foreground text-[10px] font-normal">tCO₂</span>
          </p>
        </div>
      </div>

      {/* Carbon price slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">Carbon Price</span>
          <span className="text-xs font-bold text-foreground">${carbonPrice}/ton</span>
        </div>
        <Slider
          value={[carbonPrice]}
          onValueChange={(v) => setCarbonPrice(v[0])}
          min={20}
          max={200}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>$20</span>
          <span>$200</span>
        </div>
      </div>

      {/* Projection chart */}
      <div className="h-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: "hsl(215 14% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(220 22% 11%)", border: "1px solid hsl(220 18% 18%)", borderRadius: 8, fontSize: 11, color: "hsl(210 20% 92%)" }}
              formatter={(value: number) => [`$${value}K`, "Cost"]}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="hsl(45 90% 55%)"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(45 90% 55%)", stroke: "hsl(220 25% 6%)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
