import { motion } from "framer-motion";
import { AlertCircle, FileWarning, Clock, Database } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AttentionItem {
  label: string;
  detail: string;
  icon: LucideIcon;
  priority: "urgent" | "important" | "moderate";
}

const items: AttentionItem[] = [
  { label: "Missing Scope 3 Data", detail: "4 suppliers have not submitted emission data", icon: Database, priority: "urgent" },
  { label: "Overdue: Water Report", detail: "APAC regional water report overdue by 5 days", icon: FileWarning, priority: "urgent" },
  { label: "CSRD Compliance", detail: "Deadline in 14 days — 3 sections incomplete", icon: Clock, priority: "important" },
  { label: "Incomplete Social Module", detail: "Diversity metrics require Q4 data entry", icon: AlertCircle, priority: "moderate" },
];

const priorityStyles = {
  urgent: { bg: "bg-destructive/8", border: "border-destructive/20", dot: "bg-destructive" },
  important: { bg: "bg-warning/8", border: "border-warning/20", dot: "bg-warning" },
  moderate: { bg: "bg-info/8", border: "border-info/20", dot: "bg-info" },
};

export default function AttentionPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="esg-card-elevated p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10">
          <AlertCircle size={15} className="text-destructive" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Needs Attention</h2>
          <p className="text-xs text-muted-foreground">Priority items requiring action</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const style = priorityStyles[item.priority];
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + idx * 0.07 }}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm ${style.bg} ${style.border}`}
            >
              <item.icon size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
