import { Bell, Filter } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";

interface DashboardContentProps {
  onNavigate: (view: string) => void;
}

const stats = [
  { label: "Total Emission", value: "271,874.7", unit: "TCO₂e" },
  { label: "Carbon Intensity", value: "521.34", unit: "TCO₂e / in2" },
  { label: "Green Energy", value: "20,399.6", unit: "MWh" },
  { label: "Goals On Track", value: "1", unit: "of 3" },
  { label: "YoY Growth", value: "6%", unit: "prediction" },
];

export default function DashboardContent({ onNavigate }: DashboardContentProps) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🏠</span>
          <span>/</span>
          <span>Environment</span>
          <span>/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch onNavigate={onNavigate} />
          <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              DO
            </div>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-foreground">Environment Dashboard</h1>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              📅 Current Financial Year
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <Filter size={12} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 px-6 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="esg-card p-4">
            <p className="esg-stat-label mb-1">{s.label}</p>
            <p className="esg-stat-value">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
        <div className="esg-card flex h-64 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              📊
            </div>
            <p className="text-sm font-medium">Emission by Scope</p>
            <p className="text-xs">Interactive chart</p>
          </div>
        </div>
        <div className="esg-card flex h-64 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-info/10 text-info">
              📈
            </div>
            <p className="text-sm font-medium">Scope Breakdown</p>
            <p className="text-xs">Detailed analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
