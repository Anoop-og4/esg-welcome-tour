import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const data = [
  { subject: "Emissions", score: 72, fullMark: 100 },
  { subject: "Water", score: 85, fullMark: 100 },
  { subject: "Waste", score: 60, fullMark: 100 },
  { subject: "Supply Chain", score: 55, fullMark: 100 },
  { subject: "Social", score: 68, fullMark: 100 },
  { subject: "Governance", score: 82, fullMark: 100 },
];

export default function ESGRadarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card glow-border p-6"
    >
      <h2 className="font-display text-lg font-bold text-foreground mb-1">ESG Health Radar</h2>
      <p className="text-xs text-muted-foreground mb-4">Cross-dimensional performance snapshot</p>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(220 18% 20%)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(215 14% 55%)", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="ESG"
              dataKey="score"
              stroke="hsl(180 80% 55%)"
              fill="hsl(180 80% 55%)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
