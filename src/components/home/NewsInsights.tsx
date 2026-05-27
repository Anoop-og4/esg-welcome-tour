import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Calendar, Tag } from "lucide-react";

interface NewsItem {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  summary: string;
  date: string;
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    category: "Regulation",
    categoryColor: "bg-warning/10 text-warning",
    title: "CSRD Phase-In Requirements Tighten for FY2026",
    summary:
      "The European Commission confirms expanded CSRD scope: all listed SMEs must begin sustainability reporting under the ESRS standards by January 2026.",
    date: "May 24, 2026",
  },
  {
    id: "2",
    category: "Carbon",
    categoryColor: "bg-info/10 text-info",
    title: "Scope 3 Emissions Now Mandatory in SEC Climate Rules",
    summary:
      "New SEC guidance requires large filers to disclose material Scope 3 emissions, shifting pressure upstream to suppliers and logistics partners.",
    date: "May 22, 2026",
  },
  {
    id: "3",
    category: "Energy",
    categoryColor: "bg-success/10 text-success",
    title: "Global Renewable Capacity Hits 5,000 GW Milestone",
    summary:
      "IRENA reports renewables now account for 46% of global installed power capacity, driven by surging solar deployments across Asia and Africa.",
    date: "May 20, 2026",
  },
  {
    id: "4",
    category: "Risk",
    categoryColor: "bg-destructive/10 text-destructive",
    title: "Supply Chain Water Stress Map Launched by WRI",
    summary:
      "Aqueduct 4.0 identifies 25 countries facing critical water scarcity risk by 2030, urging ESG teams to reassess supplier geographies.",
    date: "May 18, 2026",
  },
];

export default function NewsInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Newspaper size={12} className="text-primary" />
            <span>News & Insights</span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mt-1">
            Latest ESG News
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated on sustainability, compliance, and climate trends
          </p>
        </div>
        <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">
          View All News
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {newsItems.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card glow-border p-4 flex flex-col gap-3 group cursor-default"
          >
            {/* Category badge */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.categoryColor}`}
              >
                <Tag size={10} />
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar size={10} />
                {item.date}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>

            {/* Summary */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {item.summary}
            </p>

            {/* Read more */}
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-auto pt-1">
              Read more
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </motion.article>
        ))}
      </div>

      {/* Mobile View All */}
      <button className="sm:hidden w-full flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">
        View All News
        <ArrowRight size={12} />
      </button>
    </motion.section>
  );
}
