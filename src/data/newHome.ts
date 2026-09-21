import type { HomeDashboardData, HomeUser } from "@/types/newHome";

export const demoProfiles: Record<HomeUser["role"], HomeUser> = {
  admin: { id: "u-1", name: "Anoop", organization: "OnlyGood Technologies", role: "admin", permissions: ["environment", "goals", "workflow", "audit", "news", "games", "team-activity"] },
  manager: { id: "u-2", name: "Maya", organization: "OnlyGood Technologies", role: "manager", permissions: ["environment", "goals", "workflow", "audit", "news", "team-activity"] },
  user: { id: "u-3", name: "Jordan", organization: "OnlyGood Technologies", role: "user", permissions: ["environment", "goals", "games"] },
};

export const newHomeSeed: Omit<HomeDashboardData, "user"> = {
  actions: [
    { id: "a1", title: "Supplier ESG Assessment", module: "Supplier Workflow", type: "Approve", assignedBy: "John Smith", due: "2026-09-17", dueLabel: "Due today", priority: "high", status: "today", target: "workflow", permission: "workflow" },
    { id: "a2", title: "Energy Consumption Data", module: "Environment", type: "Complete", assignedBy: "Priya Nair", due: "2026-09-16", dueLabel: "Overdue by 1 day", priority: "high", status: "overdue", target: "env-data", permission: "environment" },
    { id: "a3", title: "FY26 Reduction Target", module: "Goals", type: "Review", assignedBy: "Daniel Ortiz", due: "2026-09-22", dueLabel: "Due Sep 22", priority: "medium", status: "upcoming", target: "goals", permission: "goals" },
    { id: "a4", title: "News relevance review", module: "News Management", type: "Verify", assignedBy: "Insights team", due: "2026-09-24", dueLabel: "Due Sep 24", priority: "low", status: "upcoming", target: "news-incoming", permission: "news" },
  ],
  forms: [
    { id: "f1", title: "Energy Consumption", description: "Monthly environmental data", module: "Environment", due: "2026-09-20", dueLabel: "Due Sep 20", priority: "high", status: "in-progress", progress: 65, target: "env-data", permission: "environment" },
    { id: "f2", title: "Waste Management", description: "Quarterly operations data", module: "Environment", due: "2026-09-15", dueLabel: "Overdue", priority: "high", status: "overdue", progress: 35, target: "env-data", permission: "environment" },
    { id: "f3", title: "Net-zero Milestones", description: "Goal progress evidence", module: "Goals", due: "2026-09-27", dueLabel: "Due Sep 27", priority: "medium", status: "not-started", progress: 0, target: "goals", permission: "goals" },
  ],
  notifications: [
    { id: "n1", title: "Assessment awaiting approval", detail: "Supplier ESG Assessment is ready for review.", time: "12 min", permission: "workflow" },
    { id: "n2", title: "Target progress changed", detail: "Scope 2 reduction improved by 4.8%.", time: "2 hr", permission: "goals" },
    { id: "n3", title: "Data quality alert", detail: "Two facility records need supporting evidence.", time: "Yesterday", permission: "environment" },
  ],
  activity: [
    { id: "ac1", title: "Energy form updated", detail: "65% complete · Environment", time: "09:42", permission: "environment" },
    { id: "ac2", title: "Climate target reviewed", detail: "Comment added to FY26 target", time: "Yesterday", permission: "goals" },
    { id: "ac3", title: "Audit evidence verified", detail: "GRI 302 evidence accepted", time: "Sep 15", permission: "audit" },
  ],
  news: [
    { id: "nw1", title: "EU publishes updated ESRS implementation guidance", detail: "Reporting teams gain clearer materiality and value-chain direction.", time: "Today", permission: "news" },
    { id: "nw2", title: "Global renewable capacity reaches new milestone", detail: "Solar and wind additions continue to outpace forecasts.", time: "Yesterday", permission: "environment" },
  ],
  updates: [
    { id: "u1", title: "Audit heatmap filters", detail: "Compare evidence changes across reporting years.", time: "New" },
    { id: "u2", title: "Faster environmental entry", detail: "Dependent values now calculate as you type.", time: "Improved" },
  ],
  upcoming: [
    { id: "up1", title: "Quarterly data close", detail: "Environment · 4 forms remaining", time: "Sep 20", permission: "environment" },
    { id: "up2", title: "CSRD readiness review", detail: "Governance and audit workspace", time: "Sep 26", permission: "audit" },
    { id: "up3", title: "Team climate challenge", detail: "ESG Play community event", time: "Oct 01", permission: "games" },
  ],
  leaderboard: [
    { name: "Anoop", score: 842, rank: 1, change: 2 },
    { name: "Maya Chen", score: 816, rank: 2, change: 0 },
    { name: "Jordan Lee", score: 774, rank: 3, change: 1 },
  ],
  quote: { text: "Sustainability is the discipline of turning long-term intent into today’s measurable action.", author: "OnlyGood ESG Practice" },
};