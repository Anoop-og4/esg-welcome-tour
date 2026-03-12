import { motion } from "framer-motion";
import { MapPin, Factory, Truck, AlertTriangle } from "lucide-react";

const markers = [
  { label: "Munich HQ", type: "facility", x: 52, y: 32, status: "ok" },
  { label: "Shanghai Plant", type: "facility", x: 78, y: 38, status: "alert" },
  { label: "São Paulo Ops", type: "facility", x: 35, y: 62, status: "ok" },
  { label: "Lagos Supplier", type: "supplier", x: 50, y: 52, status: "warning" },
  { label: "Chicago DC", type: "facility", x: 22, y: 34, status: "ok" },
  { label: "Delhi Supplier", type: "supplier", x: 70, y: 40, status: "alert" },
  { label: "Sydney Office", type: "facility", x: 85, y: 70, status: "ok" },
];

const statusColors: Record<string, string> = {
  ok: "hsl(var(--esg-risk-low))",
  warning: "hsl(var(--esg-risk-medium))",
  alert: "hsl(var(--esg-risk-high))",
};

const typeIcons: Record<string, typeof MapPin> = {
  facility: Factory,
  supplier: Truck,
};

export default function GlobalImpactMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="esg-card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Global Impact</h2>
          <p className="text-xs text-muted-foreground">Facilities, suppliers & emission hotspots</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-esg-risk-low" /> OK</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-esg-risk-medium" /> Warning</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-esg-risk-high" /> Alert</span>
        </div>
      </div>

      {/* Simplified world map using dots pattern */}
      <div className="relative h-[240px] w-full rounded-xl bg-muted/30 border border-border overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }} />

        {/* Continent shapes using soft blobs */}
        <div className="absolute top-[22%] left-[15%] w-[18%] h-[28%] rounded-[40%] bg-esg-primary/8 border border-esg-primary/10" /> {/* N.America */}
        <div className="absolute top-[48%] left-[28%] w-[10%] h-[28%] rounded-[40%] bg-esg-primary/8 border border-esg-primary/10" /> {/* S.America */}
        <div className="absolute top-[20%] left-[42%] w-[16%] h-[30%] rounded-[35%] bg-esg-primary/8 border border-esg-primary/10" /> {/* Europe/Africa */}
        <div className="absolute top-[44%] left-[44%] w-[12%] h-[26%] rounded-[40%] bg-esg-primary/8 border border-esg-primary/10" /> {/* Africa */}
        <div className="absolute top-[18%] left-[60%] w-[22%] h-[34%] rounded-[35%] bg-esg-primary/8 border border-esg-primary/10" /> {/* Asia */}
        <div className="absolute top-[58%] left-[78%] w-[12%] h-[18%] rounded-[40%] bg-esg-primary/8 border border-esg-primary/10" /> {/* Australia */}

        {/* Markers */}
        {markers.map((m, i) => {
          const Icon = typeIcons[m.type] || MapPin;
          return (
            <motion.div
              key={m.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 300 }}
              className="absolute group"
              style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {m.status === "alert" && (
                <span className="absolute -inset-2 animate-ping rounded-full opacity-30" style={{ background: statusColors[m.status] }} />
              )}
              <div
                className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-card shadow-md cursor-pointer"
                style={{ background: statusColors[m.status] }}
              >
                <Icon size={11} className="text-card" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                <div className="rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background whitespace-nowrap shadow-lg">
                  {m.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>{markers.filter(m => m.type === "facility").length} facilities</span>
        <span>{markers.filter(m => m.type === "supplier").length} suppliers</span>
        <span className="flex items-center gap-1 text-destructive font-medium">
          <AlertTriangle size={12} />
          {markers.filter(m => m.status === "alert").length} hotspots
        </span>
      </div>
    </motion.div>
  );
}
