export interface ChatbotSuggestion {
  text: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface ChatbotSuggestionCategory {
  id: string;
  label: string;
  icon: string;
  routeKeywords: string[];
  suggestions: ChatbotSuggestion[];
}

export const SURPRISE_ME_CATEGORY_ID = 'surprise';

export const CHATBOT_SUGGESTION_CATEGORIES: ChatbotSuggestionCategory[] = [
  {
    id: 'emissions',
    label: 'Emissions',
    icon: 'fa-solid fa-cloud',
    routeKeywords: ['scope-1', 'scope-2', 'scope-3', 'emission', 'environment'],
    suggestions: [
      // Summary
      {
        text: 'What is our total carbon footprint across all scopes this FY?',
        icon: 'fa-solid fa-cloud',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
      },
      {
        text: 'Break down our Scope 3 emissions by category for Q2 FY2024.',
        icon: 'fa-solid fa-layer-group',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        text: 'What were total Scope 1 emissions from stationary combustion last FY?',
        icon: 'fa-solid fa-fire',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
      },
      {
        text: 'What are our emissions for this quarter, split by scope?',
        icon: 'fa-solid fa-chart-pie',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
      },
      {
        text: 'What were our combined Scope 1 and 2 emissions last financial year?',
        icon: 'fa-solid fa-circle-plus',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-700',
      },
      {
        text: 'How much CO₂e did we emit in Q3 this FY across all scopes?',
        icon: 'fa-solid fa-chart-pie',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-700',
      },
      {
        text: 'What share of our total emissions comes from Scope 3 this FY?',
        icon: 'fa-solid fa-percent',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
      },
      {
        text: 'Show total emissions grouped by category for the current quarter.',
        icon: 'fa-solid fa-tags',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-700',
      },
      // Trends
      {
        text: 'Show me a monthly trend of total emissions for this FY.',
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        text: 'How have our Scope 2 emissions changed quarter by quarter over the last year?',
        icon: 'fa-solid fa-arrow-trend-up',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        text: 'Plot Scope 1 emissions month by month for FY2024.',
        icon: 'fa-solid fa-calendar-days',
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
      },
      {
        text: 'Chart Scope 3 emissions month by month for the last two quarters.',
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-700',
      },
      {
        text: 'How has our total carbon footprint trended quarter by quarter over the last two FYs?',
        icon: 'fa-solid fa-arrow-trend-down',
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-700',
      },
      {
        text: 'Show me a yearly rollup of total emissions for the last three financial years.',
        icon: 'fa-solid fa-calendar-check',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
      {
        text: 'Chart our emissions broken down by category month by month for this FY.',
        icon: 'fa-solid fa-chart-mixed',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
      },
      {
        text: 'Show a monthly trend of Scope 3 emissions split by category for the last two quarters.',
        icon: 'fa-solid fa-layer-group',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
      },
      // Year-on-Year
      {
        text: 'Compare our total emissions across the last three financial years.',
        icon: 'fa-solid fa-chart-bar',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
      },
      {
        text: 'How do our Scope 1 emissions in FY2024 compare to FY2023?',
        icon: 'fa-solid fa-scale-balanced',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
      {
        text: 'Show a side-by-side breakdown of Scope 1, 2, and 3 across FY2023 and FY2024.',
        icon: 'fa-solid fa-table-columns',
        iconBg: 'bg-fuchsia-50',
        iconColor: 'text-fuchsia-600',
      },
      {
        text: 'Did our Scope 2 emissions go up or down from FY2023 to FY2024?',
        icon: 'fa-solid fa-right-left',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-700',
      },
      {
        text: 'What is the percentage change in our Scope 3 emissions from FY2023 to FY2024?',
        icon: 'fa-solid fa-up-right-and-down-left-from-center',
        iconBg: 'bg-fuchsia-50',
        iconColor: 'text-fuchsia-700',
      },
      {
        text: 'Compare our total carbon footprint for FY2022, FY2023, and FY2024.',
        icon: 'fa-solid fa-chart-bar',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
    ],
  },
  {
    id: 'waste',
    label: 'Waste',
    icon: 'fa-solid fa-recycle',
    routeKeywords: ['waste', 'disposal', 'recycl', 'hazardous'],
    suggestions: [
      // Summary
      {
        text: 'What was our total waste generated this financial year?',
        icon: 'fa-solid fa-trash-can',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
      {
        text: 'Break down our waste by generated, disposed, and recovered for this FY.',
        icon: 'fa-solid fa-chart-pie',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        text: 'What is the split between hazardous and non-hazardous waste this FY?',
        icon: 'fa-solid fa-triangle-exclamation',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        text: 'How much of our waste was sent to landfill versus incinerated this FY?',
        icon: 'fa-solid fa-scale-balanced',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
      },
      {
        text: 'Break down our waste by disposal mode for this financial year.',
        icon: 'fa-solid fa-dumpster',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-600',
      },
      {
        text: 'How much waste was recovered through recycling or composting this quarter?',
        icon: 'fa-solid fa-recycle',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        text: 'What was our total hazardous waste generated last financial year?',
        icon: 'fa-solid fa-biohazard',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        text: 'Show me waste broken down by recovery mode for this FY.',
        icon: 'fa-solid fa-layer-group',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-700',
      },
      // Trends
      {
        text: 'Show me a monthly trend of total waste generated for this FY.',
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        text: 'Chart waste generated, disposed, and recovered month by month for this FY.',
        icon: 'fa-solid fa-chart-mixed',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
      },
      {
        text: 'How has our hazardous waste trended quarter by quarter over the last two FYs?',
        icon: 'fa-solid fa-arrow-trend-up',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-700',
      },
      {
        text: 'Show me a quarterly trend of waste recovery for this financial year.',
        icon: 'fa-solid fa-calendar-days',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      // Year-on-Year
      {
        text: 'Compare our total waste generated across FY2023 and FY2024.',
        icon: 'fa-solid fa-chart-bar',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
      {
        text: 'How did our waste disposal compare between FY2023 and FY2024?',
        icon: 'fa-solid fa-right-left',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-700',
      },
      {
        text: 'What is the percentage change in waste recovery from FY2023 to FY2024?',
        icon: 'fa-solid fa-up-right-and-down-left-from-center',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-700',
      },
      {
        text: 'Compare hazardous waste generated across the last three financial years.',
        icon: 'fa-solid fa-scale-balanced',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      // Records
      {
        text: 'List the 10 most recent waste entries for this financial year.',
        icon: 'fa-solid fa-list',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-700',
      },
      {
        text: 'Show me the top 10 highest waste disposal records this quarter.',
        icon: 'fa-solid fa-table-list',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-600',
      },
      // Facility
      {
        text: 'Which facility generated the most waste this financial year?',
        icon: 'fa-solid fa-building',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        text: 'Break down waste generated, disposed, and recovered by facility for this FY.',
        icon: 'fa-solid fa-industry',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
    ],
  },
  {
    id: 'consumption',
    label: 'Consumption',
    icon: 'fa-solid fa-bolt',
    routeKeywords: ['consumption', 'energy', 'water', 'fuel'],
    suggestions: [
      // Summary
      {
        text: 'How much electricity did we consume this financial year?',
        icon: 'fa-solid fa-bolt',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
      },
      {
        text: 'What was our total diesel consumption in Q1 this FY?',
        icon: 'fa-solid fa-gas-pump',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        text: 'Show me fuel consumption broken down by type for last FY.',
        icon: 'fa-solid fa-droplet',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        text: 'What was our total natural gas consumption last financial year?',
        icon: 'fa-solid fa-fire-flame-curved',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-700',
      },
      {
        text: 'How much renewable energy did we consume this FY?',
        icon: 'fa-solid fa-solar-panel',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-700',
      },
      {
        text: 'Show me energy consumption broken down by type for this quarter.',
        icon: 'fa-solid fa-plug',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-700',
      },
      // Trends
      {
        text: 'Show me a monthly trend of electricity consumption for this FY.',
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-600',
      },
      {
        text: 'How has our diesel consumption changed quarter by quarter over the last year?',
        icon: 'fa-solid fa-arrow-trend-up',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-700',
      },
      {
        text: 'Chart natural gas consumption month by month for FY2024.',
        icon: 'fa-solid fa-calendar-days',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        text: 'How has our total energy consumption trended over the last two financial years?',
        icon: 'fa-solid fa-arrow-trend-down',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
      {
        text: 'Show renewable energy consumption trends quarter by quarter for this FY.',
        icon: 'fa-solid fa-leaf',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-700',
      },
      // Year-on-Year
      {
        text: 'How did our electricity consumption in FY2024 compare to FY2023?',
        icon: 'fa-solid fa-scale-balanced',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-700',
      },
      {
        text: 'Compare our total fuel consumption across the last three financial years.',
        icon: 'fa-solid fa-chart-bar',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        text: 'Did our natural gas consumption go up or down from FY2023 to FY2024?',
        icon: 'fa-solid fa-right-left',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-700',
      },
      {
        text: 'What is the percentage change in our diesel consumption from FY2023 to FY2024?',
        icon: 'fa-solid fa-up-right-and-down-left-from-center',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-700',
      },
      {
        text: 'Show a side-by-side breakdown of energy types consumed in FY2023 vs FY2024.',
        icon: 'fa-solid fa-table-columns',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
    ],
  },
  {
    id: 'facility',
    label: 'By Facility',
    icon: 'fa-solid fa-building',
    routeKeywords: ['facility', 'asset', 'plant', 'site'],
    suggestions: [
      {
        text: 'Which facility had the highest Scope 1 emissions this quarter?',
        icon: 'fa-solid fa-building',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
      {
        text: 'Show me total emissions for each of our plants for this FY.',
        icon: 'fa-solid fa-industry',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        text: 'Break down Scope 2 emissions by site for FY2024.',
        icon: 'fa-solid fa-location-dot',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        text: 'Which three facilities contributed the most emissions last quarter?',
        icon: 'fa-solid fa-trophy',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-700',
      },
      {
        text: 'Compare Scope 1 emissions across all our sites for FY2024.',
        icon: 'fa-solid fa-map',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-700',
      },
      {
        text: 'Which plant had the lowest total emissions this financial year?',
        icon: 'fa-solid fa-leaf',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        text: 'Which facility consumed the most electricity this financial year?',
        icon: 'fa-solid fa-building',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-700',
      },
      {
        text: 'Break down energy consumption by site for this quarter.',
        icon: 'fa-solid fa-location-dot',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-700',
      },
      {
        text: 'Show me diesel consumption for each of our plants for this FY.',
        icon: 'fa-solid fa-industry',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        text: 'Which site had the lowest total energy consumption last financial year?',
        icon: 'fa-solid fa-leaf',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-700',
      },
      {
        text: 'Compare natural gas consumption across all our facilities for FY2024.',
        icon: 'fa-solid fa-map',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    icon: 'fa-solid fa-boxes-stacked',
    routeKeywords: ['production', 'operations', 'product'],
    suggestions: [
      {
        text: 'What was our total production output this financial year?',
        icon: 'fa-solid fa-boxes-stacked',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        text: 'How has our production volume changed month by month over the last year?',
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
      },
      {
        text: 'Show me production output broken down by facility for this quarter.',
        icon: 'fa-solid fa-industry',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-700',
      },
      {
        text: 'Compare our total production output across FY2023 and FY2024.',
        icon: 'fa-solid fa-scale-balanced',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-700',
      },
      {
        text: 'Which facility contributed the most to total production last financial year?',
        icon: 'fa-solid fa-trophy',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        text: 'Show me a quarterly trend of production volume for the last two financial years.',
        icon: 'fa-solid fa-calendar-days',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
      },
    ],
  },
  {
    id: 'intensity',
    label: 'Intensity',
    icon: 'fa-solid fa-gauge',
    routeKeywords: ['intensity'],
    suggestions: [
      {
        text: 'What is our carbon intensity per unit of production this FY?',
        icon: 'fa-solid fa-gauge',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
      {
        text: 'How has our total carbon intensity changed quarter by quarter this financial year?',
        icon: 'fa-solid fa-arrows-up-down',
        iconBg: 'bg-fuchsia-50',
        iconColor: 'text-fuchsia-600',
      },
      {
        text: 'What is our Scope 1 and Scope 2 carbon intensity per unit of output this FY?',
        icon: 'fa-solid fa-circle-dot',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-700',
      },
      {
        text: 'Show me carbon intensity broken down by scope for the current quarter.',
        icon: 'fa-solid fa-chart-pie',
        iconBg: 'bg-fuchsia-50',
        iconColor: 'text-fuchsia-700',
      },
      {
        text: 'How does our carbon intensity compare across FY2023 and FY2024?',
        icon: 'fa-solid fa-right-left',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
      {
        text: 'Which quarter had the lowest carbon intensity this financial year?',
        icon: 'fa-solid fa-leaf',
        iconBg: 'bg-fuchsia-50',
        iconColor: 'text-fuchsia-600',
      },
    ],
  },
  {
    id: 'records',
    label: 'Records',
    icon: 'fa-solid fa-list',
    routeKeywords: ['record', 'log', 'history'],
    suggestions: [
      {
        text: 'Show me the top 10 highest emission events recorded this quarter.',
        icon: 'fa-solid fa-list',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-700',
      },
      {
        text: 'List the most recent emission entries from this financial year, sorted by date.',
        icon: 'fa-solid fa-clock-rotate-left',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        text: 'What are the largest individual Scope 1 emission records from last FY?',
        icon: 'fa-solid fa-fire',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-700',
      },
      {
        text: 'Show me all emission records for our electricity activities in Q2.',
        icon: 'fa-solid fa-bolt',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
      },
      {
        text: 'List the 10 most recent Scope 3 entries, sorted by highest CO₂e.',
        icon: 'fa-solid fa-table-list',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-600',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data Coverage',
    icon: 'fa-solid fa-database',
    routeKeywords: ['admin', 'setting', 'mapping', 'coverage'],
    suggestions: [
      {
        text: 'What emissions data do we have on record?',
        icon: 'fa-solid fa-database',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-600',
      },
      {
        text: 'Which scopes and categories have committed data for this financial year?',
        icon: 'fa-solid fa-circle-check',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-600',
      },
      {
        text: 'What is the date range of emissions data we currently have on record?',
        icon: 'fa-solid fa-clock-rotate-left',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-700',
      },
      {
        text: 'Are there any scopes with no committed data for this financial year?',
        icon: 'fa-solid fa-triangle-exclamation',
        iconBg: 'bg-stone-100',
        iconColor: 'text-stone-600',
      },
      {
        text: 'What assets do we currently have data for in the system?',
        icon: 'fa-solid fa-building',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        text: 'Which emission activities or labels have the most data recorded this financial year?',
        icon: 'fa-solid fa-tags',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
      },
      {
        text: 'What activities and emission factors are we tracking for Scope 1?',
        icon: 'fa-solid fa-list-check',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-700',
      },
      {
        text: 'What units and emission factors apply to our electricity consumption?',
        icon: 'fa-solid fa-calculator',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-700',
      },
      {
        text: 'What emission factor is applied to our diesel consumption?',
        icon: 'fa-solid fa-flask',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
      },
      {
        text: 'List all Scope 3 upstream activities we are currently tracking.',
        icon: 'fa-solid fa-list',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
      },
    ],
  },
];

const DISPLAY_COUNT = 14;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function getRandomSuggestions(): ChatbotSuggestion[] {
  const all = CHATBOT_SUGGESTION_CATEGORIES.flatMap((c) => c.suggestions);
  return shuffle(all).slice(0, DISPLAY_COUNT);
}

export function getSuggestionsForCategory(
  categoryId: string
): ChatbotSuggestion[] {
  if (categoryId === SURPRISE_ME_CATEGORY_ID) return getRandomSuggestions();
  const cat = CHATBOT_SUGGESTION_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return getRandomSuggestions();
  return shuffle(cat.suggestions).slice(0, DISPLAY_COUNT);
}

// Matches the current route against each category's keywords and returns the best fit,
// or "surprise" when no category claims the route. Most-specific categories are listed
// first in CHATBOT_SUGGESTION_CATEGORIES so that, e.g., "intensity" beats "environment".
export function getDefaultCategoryIdForRoute(url: string): string {
  const lower = (url ?? '').toLowerCase();
  const priorityOrder = [
    'intensity',
    'facility',
    'records',
    'production',
    'waste',
    'consumption',
    'data',
    'emissions',
  ];
  for (const id of priorityOrder) {
    const cat = CHATBOT_SUGGESTION_CATEGORIES.find((c) => c.id === id);
    if (cat && cat.routeKeywords.some((kw) => lower.includes(kw))) {
      return cat.id;
    }
  }
  return SURPRISE_ME_CATEGORY_ID;
}
