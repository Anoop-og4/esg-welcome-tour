import { motion } from "framer-motion";
import { Newspaper, ArrowRight, ArrowUpRight, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
}

const featured: NewsItem = {
  id: "f1",
  category: "Regulation",
  title: "CSRD Phase-In Requirements Tighten for FY2026",
  summary:
    "The European Commission confirms expanded CSRD scope: all listed SMEs must begin sustainability reporting under the ESRS standards by January 2026, accelerating disclosure timelines across the EU.",
  date: "May 24, 2026",
  readTime: "5 min read",
};

const headlines: NewsItem[] = [
  {
    id: "1",
    category: "Carbon",
    title: "Scope 3 Emissions Now Mandatory in SEC Climate Rules",
    summary:
      "New SEC guidance requires large filers to disclose material Scope 3 emissions, shifting pressure upstream to suppliers.",
    date: "May 22, 2026",
    readTime: "4 min",
  },
  {
    id: "2",
    category: "Energy",
    title: "Global Renewable Capacity Hits 5,000 GW Milestone",
    summary:
      "IRENA reports renewables now account for 46% of global installed power capacity, driven by surging solar deployments.",
    date: "May 20, 2026",
    readTime: "3 min",
  },
  {
    id: "3",
    category: "Risk",
    title: "Supply Chain Water Stress Map Launched by WRI",
    summary:
      "Aqueduct 4.0 identifies 25 countries facing critical water scarcity risk by 2030, urging ESG teams to reassess geographies.",
    date: "May 18, 2026",
    readTime: "6 min",
  },
];

export default function NewsInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card glow-border overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-end justify-between gap-3 px-5 pt-5 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Newspaper size={12} className="text-primary" />
            <span>News &amp; Insights</span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mt-1">Latest ESG News</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated on sustainability, compliance, and climate trends
          </p>
        </div>
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">
          View All
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Featured lead story */}
        <motion.article
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 group relative flex flex-col justify-end p-5 min-h-[260px] cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-border/60"
        >
          {/* Decorative gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/5 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--primary)) 0.5px, transparent 0.5px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={16} />
          </div>

          <div className="relative space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Featured · {featured.category}
              </span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
              {featured.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-xl">
              {featured.summary}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
              <span>{featured.date}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {featured.readTime}
              </span>
            </div>
          </div>
        </motion.article>

        {/* Headline list */}
        <div className="lg:col-span-2 divide-y divide-border/60">
          {headlines.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="group flex flex-col gap-1.5 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  {item.readTime}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.summary}
              </p>
              <span className="text-[10px] text-muted-foreground mt-0.5">{item.date}</span>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
