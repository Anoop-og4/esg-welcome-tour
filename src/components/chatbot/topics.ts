import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Zap,
  Recycle,
  Building2,
  Gauge,
  ListTree,
  Database,
  Sparkles,
  BarChart3,
  TrendingUp,
  ArrowLeftRight,
  Factory,
  Activity,
  ScrollText,
  ShieldCheck,
  CalendarDays,
  Layers,
  Trophy,
  Leaf,
} from "lucide-react";

export interface Suggestion {
  id: string;
  text: string;
  icon: LucideIcon;
  group: string;
}

export interface Topic {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  suggestions: Suggestion[];
}

export const SURPRISE_TOPIC_ID = "surprise";

export const TOPICS: Topic[] = [
  {
    id: "emissions",
    label: "Emissions",
    description: "Carbon footprint across Scope 1, 2, and 3",
    icon: Cloud,
    suggestions: [
      { id: "em-1", text: "What is our total carbon footprint this FY across all scopes?", icon: Activity, group: "Summary" },
      { id: "em-2", text: "Break down our Scope 3 emissions by category for Q2.", icon: Layers, group: "Summary" },
      { id: "em-3", text: "What share of total emissions comes from Scope 3 this FY?", icon: Layers, group: "Summary" },
      { id: "em-4", text: "Show a monthly trend of total emissions for this FY.", icon: TrendingUp, group: "Trends" },
      { id: "em-5", text: "How have Scope 2 emissions changed quarter by quarter?", icon: TrendingUp, group: "Trends" },
      { id: "em-6", text: "Compare our total emissions across the last three FYs.", icon: BarChart3, group: "Year over year" },
      { id: "em-7", text: "How do Scope 1 emissions in FY2024 compare to FY2023?", icon: ArrowLeftRight, group: "Year over year" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    description: "Electricity, fuel, and renewable usage",
    icon: Zap,
    suggestions: [
      { id: "en-1", text: "How much electricity did we consume this FY?", icon: Zap, group: "Summary" },
      { id: "en-2", text: "Show fuel consumption broken down by type for last FY.", icon: Activity, group: "Summary" },
      { id: "en-3", text: "How much renewable energy did we consume this FY?", icon: Leaf, group: "Summary" },
      { id: "en-4", text: "Monthly trend of electricity consumption for this FY.", icon: TrendingUp, group: "Trends" },
      { id: "en-5", text: "How has total energy use trended over two FYs?", icon: TrendingUp, group: "Trends" },
      { id: "en-6", text: "Compare diesel consumption across the last three FYs.", icon: BarChart3, group: "Year over year" },
    ],
  },
  {
    id: "waste",
    label: "Waste",
    description: "Generated, recovered, and hazardous waste",
    icon: Recycle,
    suggestions: [
      { id: "wa-1", text: "Total waste generated this financial year?", icon: Activity, group: "Summary" },
      { id: "wa-2", text: "Split between hazardous and non-hazardous waste this FY.", icon: Layers, group: "Summary" },
      { id: "wa-3", text: "How much waste was recovered through recycling this quarter?", icon: Recycle, group: "Summary" },
      { id: "wa-4", text: "Monthly trend of total waste for this FY.", icon: TrendingUp, group: "Trends" },
      { id: "wa-5", text: "Compare total waste between FY2023 and FY2024.", icon: BarChart3, group: "Year over year" },
      { id: "wa-6", text: "List the 10 most recent waste entries.", icon: ScrollText, group: "Records" },
    ],
  },
  {
    id: "facilities",
    label: "Facilities",
    description: "Performance by site, plant, and asset",
    icon: Building2,
    suggestions: [
      { id: "fa-1", text: "Which facility had the highest Scope 1 emissions this quarter?", icon: Trophy, group: "Top performers" },
      { id: "fa-2", text: "Total emissions for each plant this FY.", icon: Factory, group: "By site" },
      { id: "fa-3", text: "Break down Scope 2 emissions by site for FY2024.", icon: Building2, group: "By site" },
      { id: "fa-4", text: "Which facility consumed the most electricity this FY?", icon: Zap, group: "By site" },
      { id: "fa-5", text: "Plant with the lowest total emissions this FY.", icon: Trophy, group: "Top performers" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    description: "Carbon intensity and operational efficiency",
    icon: Gauge,
    suggestions: [
      { id: "pe-1", text: "Carbon intensity per unit of production this FY.", icon: Gauge, group: "Summary" },
      { id: "pe-2", text: "Carbon intensity by scope for the current quarter.", icon: Layers, group: "Summary" },
      { id: "pe-3", text: "How has total carbon intensity changed quarter by quarter?", icon: TrendingUp, group: "Trends" },
      { id: "pe-4", text: "Compare carbon intensity across FY2023 and FY2024.", icon: ArrowLeftRight, group: "Year over year" },
      { id: "pe-5", text: "Quarter with the lowest carbon intensity this FY.", icon: Trophy, group: "Top performers" },
    ],
  },
  {
    id: "records",
    label: "Records",
    description: "Recent entries and top events",
    icon: ListTree,
    suggestions: [
      { id: "re-1", text: "Top 10 highest emission events recorded this quarter.", icon: Trophy, group: "Top events" },
      { id: "re-2", text: "Most recent emission entries from this FY.", icon: CalendarDays, group: "Recent" },
      { id: "re-3", text: "Largest individual Scope 1 emission records last FY.", icon: Activity, group: "Top events" },
      { id: "re-4", text: "All emission records for electricity activities in Q2.", icon: Zap, group: "Recent" },
      { id: "re-5", text: "10 most recent Scope 3 entries by highest CO₂e.", icon: ScrollText, group: "Recent" },
    ],
  },
  {
    id: "coverage",
    label: "Coverage",
    description: "Data quality and scope completeness",
    icon: Database,
    suggestions: [
      { id: "co-1", text: "What emissions data do we have on record?", icon: Database, group: "Inventory" },
      { id: "co-2", text: "Which scopes have committed data for this FY?", icon: ShieldCheck, group: "Quality" },
      { id: "co-3", text: "Date range of emissions data we currently have.", icon: CalendarDays, group: "Inventory" },
      { id: "co-4", text: "Are there any scopes with no committed data?", icon: ShieldCheck, group: "Quality" },
      { id: "co-5", text: "Activities and emission factors tracked for Scope 1.", icon: Layers, group: "Inventory" },
    ],
  },
];

export const SURPRISE_TOPIC: Topic = {
  id: SURPRISE_TOPIC_ID,
  label: "Surprise me",
  description: "A curated mix from across your data",
  icon: Sparkles,
  suggestions: [],
};

export function getRandomSuggestions(count = 8): Suggestion[] {
  const all = TOPICS.flatMap((t) => t.suggestions);
  const arr = [...all];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function getSuggestionsGrouped(suggestions: Suggestion[]): { group: string; items: Suggestion[] }[] {
  const map = new Map<string, Suggestion[]>();
  for (const s of suggestions) {
    if (!map.has(s.group)) map.set(s.group, []);
    map.get(s.group)!.push(s);
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}
