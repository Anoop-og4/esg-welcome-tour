import type { News } from "@/types/newsAssignment";

const mk = (n: Omit<News, "status" | "createdAt" | "category"> & { category?: string; status?: News["status"] }): News => ({
  status: n.status ?? "pending",
  category: n.category,
  createdAt: n.published,
  ...n,
});

export const newsSeed: News[] = [
  mk({ id: 1, title: "EU tightens CSRD reporting scope for mid-cap firms", source: "Reuters", published: "2026-07-20", pillar: "Policy & Regulation", relevance: 5, summary: "European Commission finalizes stricter double-materiality guidance affecting 12,000 additional companies from FY27.", assignedTo: null, category: "Regulation" }),
  mk({ id: 2, title: "Tesla unveils closed-loop battery recycling program", source: "Bloomberg Green", published: "2026-07-19", pillar: "Electric Mobility", relevance: 5, summary: "New Nevada facility to recover 92% of lithium and cobalt from end-of-life packs, cutting Scope 3 by an estimated 18%.", assignedTo: null, category: "Circular Economy" }),
  mk({ id: 3, title: "BlackRock launches $5B transition finance fund", source: "Financial Times", published: "2026-07-18", pillar: "Green Finance & Markets", relevance: 4, summary: "Fund targets heavy-emitting sectors with credible net-zero pathways; first allocations to steel and cement.", assignedTo: null, category: "Finance" }),
  mk({ id: 4, title: "Shell accelerates hydrogen hub in Rotterdam", source: "S&P Global", published: "2026-07-17", pillar: "Green Energy", relevance: 4, summary: "200 MW electrolyzer expansion to supply refinery and mobility off-takers by Q4 2027.", assignedTo: null, category: "Hydrogen" }),
  mk({ id: 5, title: "Microsoft signs 1.2 GW solar PPA in Texas", source: "Canary Media", published: "2026-07-16", pillar: "Green Energy", relevance: 5, summary: "One of the largest corporate solar deals of the year, covering AI datacenter load growth through 2030.", assignedTo: null, category: "Renewables" }),
  mk({ id: 6, title: "Unilever misses interim plastic reduction target", source: "The Guardian", published: "2026-07-15", pillar: "ESG", relevance: 4, summary: "Company reports 12% virgin plastic reduction vs 25% pledge; refill infrastructure cited as bottleneck.", assignedTo: null, category: "Reporting" }),
  mk({ id: 7, title: "SEC finalizes climate disclosure enforcement guidance", source: "WSJ", published: "2026-07-14", pillar: "Policy & Regulation", relevance: 5, summary: "New guidance clarifies Scope 3 materiality triggers and safe-harbor thresholds for forward-looking statements.", assignedTo: null, category: "Regulation" }),
  mk({ id: 8, title: "AI-driven grid optimization cuts utility emissions 9%", source: "MIT Tech Review", published: "2026-07-13", pillar: "Green Tech", relevance: 3, summary: "Pilot across three US ISOs shows ML dispatch reducing curtailment and fossil peaker runtime.", assignedTo: null, category: "Innovation" }),
  mk({ id: 9, title: "China's EV export share hits 38% of global market", source: "Nikkei Asia", published: "2026-07-12", pillar: "Electric Mobility", relevance: 4, summary: "BYD and Geely lead surge; EU probes state subsidies, considers additional tariffs.", assignedTo: null, category: "Market" }),
  mk({ id: 10, title: "Green bond issuance rebounds to record $780B YTD", source: "Climate Bonds Initiative", published: "2026-07-10", pillar: "Green Finance & Markets", relevance: 3, summary: "Sovereign issuance from India, Brazil, and Indonesia drives 22% YoY growth.", assignedTo: null, category: "Finance" }),
  mk({ id: 11, title: "New direct-air-capture plant online in Iceland", source: "Carbon Brief", published: "2026-07-09", pillar: "Green Tech", relevance: 3, summary: "36,000 t/yr capacity backed by Microsoft and JPMorgan offtake agreements.", assignedTo: null, category: "Innovation" }),
  mk({ id: 12, title: "India mandates BRSR Core for top 1,000 listed firms", source: "Economic Times", published: "2026-07-08", pillar: "Policy & Regulation", relevance: 4, summary: "Assurance requirements phased in through FY28, aligning with ISSB baseline.", assignedTo: null, category: "Regulation" }),
  mk({ id: 13, title: "Oil majors face shareholder revolt on climate lobbying", source: "Reuters", published: "2026-07-07", pillar: "ESG", relevance: 4, summary: "Say-on-climate resolutions gain majority support at three supermajors.", assignedTo: null, category: "Governance" }),
  mk({ id: 14, title: "Perovskite solar cells hit 33% commercial efficiency", source: "Nature Energy", published: "2026-07-05", pillar: "Green Tech", relevance: 3, summary: "Tandem architecture reaches durability milestone; pilot production begins in Germany.", assignedTo: null, category: "Innovation" }),
  mk({ id: 15, title: "Sustainable aviation fuel prices drop 18% YoY", source: "Argus Media", published: "2026-07-03", pillar: "Green Energy", relevance: 3, summary: "New HEFA capacity in US Gulf Coast eases supply constraints for airline mandates.", assignedTo: null, category: "Fuels" }),
];
