import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, BarChart3, Leaf, Target, Users,
  ShoppingBag, ChevronDown, Play, MessageCircleQuestion, Plus, Minus,
  Search, X, Bookmark, BookmarkCheck, CheckCircle2, Lightbulb,
  Keyboard, Star, Zap, TrendingUp, Shield, FileText, Info, AlertTriangle
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
interface ContentBlock {
  id: string;
  tag: "h3" | "p" | "img" | "callout" | "ul";
  text?: string;
  items?: string[];
  variant?: "info" | "warning" | "success";
  src?: string;
  alt?: string;
}

interface SubSection {
  id: string;
  title: string;
  description: string;
  content: {
    type: "image" | "iframe" | "video";
    src: string;
    poster?: string;
  };
  blocks: ContentBlock[];
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections: SubSection[];
}

interface FaqItem {
  question: string;
  answer: string;
  tags: string[];
}

interface QuickTip {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "productivity" | "data" | "reporting" | "goals";
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

// ─── Data ───────────────────────────────────────────────────
const helpSections: HelpSection[] = [
  {
    id: "dashboard",
    title: "Environment Dashboard",
    icon: BarChart3,
    subsections: [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        description: "Get a bird's eye view of your environmental metrics including total emissions, carbon intensity, and green energy consumption.",
        content: { type: "image", src: "/help/overview-1.png" },
        blocks: [
          { id: "do-1", tag: "h3", text: "Key Metrics Cards" },
          { id: "do-2", tag: "p", text: "The dashboard displays five key stat cards at the top: Total Emission, Carbon Intensity, Green Energy, Goals On Track, and YoY Growth. Each card updates in real-time as new data is ingested into the platform." },
          { id: "do-3", tag: "callout", text: "Make sure you have the latest data imported before reviewing metrics. Outdated data may lead to inaccurate reporting.", variant: "info" },
          { id: "do-4", tag: "h3", text: "Interactive Charts" },
          { id: "do-5", tag: "p", text: "Below the stats, interactive charts show Emission by Scope and Scope Breakdown for detailed analysis. Hover over data points to see exact values and click to drill down into specific categories." },
          { id: "do-6", tag: "img", src: "/help/overview-2.png", alt: "Dashboard charts showing emission breakdown by scope" },
          { id: "do-7", tag: "h3", text: "Financial Year Selector" },
          { id: "do-8", tag: "p", text: "Use the Financial Year selector and Filters to narrow down the data by date range or category. Compare year-over-year performance to identify trends and measure progress against your targets." },
          { id: "do-9", tag: "ul", items: ["Select a financial year from the dropdown to view historical data", "Apply scope filters to focus on Scope 1, 2, or 3", "Export filtered views as PDF or CSV for stakeholder reports"] },
          { id: "do-10", tag: "h3", text: "Dashboard Customization" },
          { id: "do-11", tag: "p", text: "You can rearrange dashboard widgets and pin your most-used metrics to the top. Changes are saved per user account and persist across sessions." },
        ],
      },
      {
        id: "dashboard-filters",
        title: "Using Filters",
        description: "Learn how to filter dashboard data by date range, scope, facility, and emission type.",
        content: { type: "image", src: "/help/overview-2.png" },
        blocks: [
          { id: "df-1", tag: "h3", text: "Opening the Filter Panel" },
          { id: "df-2", tag: "p", text: "Click the 'Filters' button in the page header to open the filter panel. The panel slides in from the right and provides controls for all available filter dimensions." },
          { id: "df-3", tag: "h3", text: "Available Filter Options" },
          { id: "df-4", tag: "ul", items: ["Scope: Filter by Scope 1, 2, or 3 emissions", "Facility: Select specific facilities or view all", "Emission Category: Focus on fuel combustion, electricity, transport, etc.", "Date Range: Choose custom date ranges or predefined periods"] },
          { id: "df-5", tag: "h3", text: "Applying & Saving Filters" },
          { id: "df-6", tag: "p", text: "Click 'Apply' to refresh the dashboard with filtered data. You can save frequently used filter combinations as presets for quick access later." },
          { id: "df-7", tag: "callout", text: "Filters apply across all dashboard widgets simultaneously. Reset filters to return to the default view.", variant: "info" },
        ],
      },
      {
        id: "dashboard-video",
        title: "Video: Quick Tour",
        description: "Watch a guided video walkthrough of the Environment Dashboard and its key features.",
        content: { type: "video", src: "/videos/welcome-overview.mp4", poster: "/help/overview-1.png" },
        blocks: [
          { id: "dv-1", tag: "h3", text: "What You'll Learn" },
          { id: "dv-2", tag: "p", text: "This video introduces the main dashboard layout including stat cards, charts, and navigation. Follow along to get up to speed quickly." },
          { id: "dv-3", tag: "h3", text: "Key Takeaways" },
          { id: "dv-4", tag: "ul", items: ["Navigate the main dashboard and understand each widget", "Interpret Scope 1, 2, and 3 emission data at a glance", "Apply filters and switch between financial year views"] },
          { id: "dv-5", tag: "h3", text: "Next Steps" },
          { id: "dv-6", tag: "p", text: "After watching, explore the dashboard hands-on. Try applying different filters and comparing financial years to build confidence with the platform." },
        ],
      },
    ],
  },
  {
    id: "scope",
    title: "Scope Management",
    icon: Leaf,
    subsections: [
      {
        id: "scope-1",
        title: "Scope 1 Emissions",
        description: "Direct emissions from owned or controlled sources.",
        content: { type: "image", src: "/help/overview-3.png" },
        blocks: [
          { id: "s1-1", tag: "h3", text: "Understanding Scope 1" },
          { id: "s1-2", tag: "p", text: "Scope 1 covers direct greenhouse gas emissions from sources owned or controlled by your organization. This includes on-site fuel combustion, company vehicles, and fugitive emissions from refrigerants." },
          { id: "s1-3", tag: "h3", text: "Data Entry & Sources" },
          { id: "s1-4", tag: "p", text: "Navigate to Environment → Scope 1 from the sidebar. View entity-level breakdown with Total Emissions (TCO₂e), Production, and Carbon Intensity columns." },
          { id: "s1-5", tag: "callout", text: "Ensure emission factors are up to date with the latest IPCC guidelines for accurate Scope 1 reporting.", variant: "warning" },
          { id: "s1-6", tag: "h3", text: "Analysis Tabs" },
          { id: "s1-7", tag: "ul", items: ["Insights: High-level trends and anomaly detection", "Emission Details: Granular breakdown by source category", "Activity Data: Raw input data for audit trails"] },
        ],
      },
      {
        id: "scope-2",
        title: "Scope 2 & 3 Emissions",
        description: "Indirect emissions from purchased energy and value chain activities.",
        content: { type: "image", src: "/help/overview-4.png" },
        blocks: [
          { id: "s2-1", tag: "h3", text: "Scope 2: Purchased Energy" },
          { id: "s2-2", tag: "p", text: "Scope 2 covers indirect emissions from purchased electricity, steam, heating, and cooling. These are calculated using location-based and market-based methods." },
          { id: "s2-3", tag: "h3", text: "Scope 3: Value Chain" },
          { id: "s2-4", tag: "p", text: "Scope 3 includes all other indirect emissions across the value chain — from purchased goods and services to employee commuting and end-of-life product treatment." },
          { id: "s2-5", tag: "callout", text: "Scope 3 often represents the largest portion of an organization's total emissions. Start with the most material categories.", variant: "warning" },
          { id: "s2-6", tag: "h3", text: "Consistent Layout" },
          { id: "s2-7", tag: "p", text: "Both Scope 2 and 3 sections follow the same layout as Scope 1 for consistency. Use the same Insights, Emission Details, and Activity Data tabs." },
        ],
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    icon: ShoppingBag,
    subsections: [
      {
        id: "operations-processes",
        title: "Managing Processes",
        description: "Define and manage production processes including fuel and electricity requirements.",
        content: { type: "image", src: "/help/overview-5.png" },
        blocks: [
          { id: "op-1", tag: "h3", text: "Process Overview" },
          { id: "op-2", tag: "p", text: "Go to Operations → Processes to see all defined processes. View summary cards showing Total Process Maps, Processes, Raw Materials, Products, and unmapped products." },
          { id: "op-3", tag: "h3", text: "Adding New Processes" },
          { id: "op-4", tag: "p", text: "Click '+ Add New Process' to define a new process with fuels and electricity required. Map each process to its input materials and output products for complete tracking." },
          { id: "op-5", tag: "h3", text: "Process Mapping" },
          { id: "op-6", tag: "ul", items: ["Link fuel types to each process stage", "Specify electricity consumption per unit of production", "Map raw materials to intermediate and final products"] },
          { id: "op-7", tag: "callout", text: "Unmapped processes will show warnings in your emission reports. Ensure all active processes are fully configured.", variant: "warning" },
        ],
      },
      {
        id: "operations-materials",
        title: "Raw Materials & Products",
        description: "Track raw materials and their relationship to products and production processes.",
        content: { type: "image", src: "/help/overview-6.png" },
        blocks: [
          { id: "om-1", tag: "h3", text: "Material Inventory" },
          { id: "om-2", tag: "p", text: "Navigate to Operations → Raw Materials to view all input materials. Each material is linked to specific processes for accurate emission tracking." },
          { id: "om-3", tag: "h3", text: "Product Tracking" },
          { id: "om-4", tag: "p", text: "Monitor Products without Process Maps to identify gaps in your tracking. Link every product to at least one process to ensure comprehensive reporting." },
          { id: "om-5", tag: "h3", text: "Lifecycle Analysis" },
          { id: "om-6", tag: "p", text: "Use the material-to-product flow to understand your carbon footprint at each stage of production and identify optimization opportunities." },
        ],
      },
    ],
  },
  {
    id: "goals",
    title: "Goal Settings",
    icon: Target,
    subsections: [
      {
        id: "goals-create",
        title: "Creating Goals",
        description: "Set carbon reduction targets aligned with science-based targets.",
        content: { type: "image", src: "/help/overview-7.png" },
        blocks: [
          { id: "gc-1", tag: "h3", text: "Goal Types" },
          { id: "gc-2", tag: "p", text: "Navigate to Goal Settings from the sidebar. You can create two types of goals: absolute reduction targets (total TCO₂e) and intensity-based targets (TCO₂e per unit of production or revenue)." },
          { id: "gc-3", tag: "h3", text: "Setting Parameters" },
          { id: "gc-4", tag: "ul", items: ["Choose a baseline year as your reference point", "Set a target year for achieving the reduction", "Define the reduction percentage (e.g., 42% by 2030)", "Optionally align with SBTi or Paris Agreement pathways"] },
          { id: "gc-5", tag: "h3", text: "Best Practices" },
          { id: "gc-6", tag: "callout", text: "Start with near-term goals (5-10 years) before setting long-term net-zero targets. This builds momentum and demonstrates progress.", variant: "success" },
          { id: "gc-7", tag: "p", text: "Review your goals quarterly and adjust strategies if progress falls behind. The platform will flag goals that need attention." },
        ],
      },
      {
        id: "goals-track",
        title: "Tracking Progress",
        description: "Monitor goal progress and receive alerts when targets need attention.",
        content: { type: "image", src: "/help/overview-1.png" },
        blocks: [
          { id: "gt-1", tag: "h3", text: "Dashboard Overview" },
          { id: "gt-2", tag: "p", text: "The Goals On Track card on the dashboard gives a quick status overview. Green indicates on track, yellow means needs attention, and red signals falling behind." },
          { id: "gt-3", tag: "h3", text: "Detailed Progress Charts" },
          { id: "gt-4", tag: "p", text: "Visit Goal Settings for detailed progress charts and milestone tracking. See your actual emission trajectory compared to the required reduction pathway." },
          { id: "gt-5", tag: "h3", text: "Alerts & Notifications" },
          { id: "gt-6", tag: "p", text: "Goals flagged as 'Needs Review' require updated reduction strategies. The system sends email alerts when goals fall significantly behind schedule." },
        ],
      },
      {
        id: "goals-video",
        title: "Video: Goal Setup Guide",
        description: "A step-by-step video tutorial on creating and managing carbon reduction goals.",
        content: { type: "video", src: "/videos/welcome-overview.mp4", poster: "/help/overview-7.png" },
        blocks: [
          { id: "gv-1", tag: "h3", text: "Tutorial Overview" },
          { id: "gv-2", tag: "p", text: "Learn how to create your first carbon reduction goal with a baseline and target year. This video walks through the complete setup process." },
          { id: "gv-3", tag: "h3", text: "Key Concepts" },
          { id: "gv-4", tag: "ul", items: ["Absolute vs intensity-based targets and when to use each", "Selecting appropriate baseline years", "Aligning goals with industry frameworks like SBTi"] },
          { id: "gv-5", tag: "h3", text: "After Watching" },
          { id: "gv-6", tag: "p", text: "See how progress tracking and alerts help you stay on course. Try creating a test goal to familiarize yourself with the workflow." },
        ],
      },
    ],
  },
  {
    id: "social-gov",
    title: "Social & Governance",
    icon: Users,
    subsections: [
      {
        id: "social-overview",
        title: "Social Metrics",
        description: "Track diversity, equity, inclusion, and community impact metrics.",
        content: { type: "image", src: "/help/overview-2.png" },
        blocks: [
          { id: "so-1", tag: "h3", text: "Workforce Metrics" },
          { id: "so-2", tag: "p", text: "Navigate to Social from the sidebar to access social impact tracking. View workforce diversity metrics, employee wellbeing data, and community initiatives." },
          { id: "so-3", tag: "h3", text: "Community Impact" },
          { id: "so-4", tag: "p", text: "Track community investment, volunteer hours, and social impact programs. These metrics are essential for comprehensive ESG disclosures." },
          { id: "so-5", tag: "h3", text: "Reporting" },
          { id: "so-6", tag: "p", text: "Generate reports for stakeholder communication and ESG disclosures. Data can be exported in formats compatible with GRI and SASB frameworks." },
        ],
      },
      {
        id: "governance-overview",
        title: "Governance Framework",
        description: "Manage board composition, ethics policies, and compliance tracking.",
        content: { type: "image", src: "/help/overview-3.png" },
        blocks: [
          { id: "go-1", tag: "h3", text: "Board Composition" },
          { id: "go-2", tag: "p", text: "Go to Governance to view your organization's governance structure. Track board diversity, committee composition, and policy compliance." },
          { id: "go-3", tag: "h3", text: "Ethics & Compliance" },
          { id: "go-4", tag: "p", text: "Monitor anti-corruption measures and ethical business practice metrics. Set up compliance checklists and track completion rates across departments." },
          { id: "go-5", tag: "h3", text: "Audit Trail" },
          { id: "go-6", tag: "p", text: "All governance-related changes are logged with timestamps and user attribution. Access the audit trail for regulatory compliance and internal reviews." },
        ],
      },
    ],
  },
];
const faqItems: FaqItem[] = [
  {
    question: "How are Scope 1, 2, and 3 emissions calculated?",
    answer: "Scope 1 covers direct emissions from owned sources (e.g., company vehicles, on-site fuel). Scope 2 includes indirect emissions from purchased electricity and energy. Scope 3 encompasses all other value chain emissions. Each is calculated using activity data multiplied by relevant emission factors from recognized databases.",
    tags: ["emissions", "scope", "calculation"],
  },
  {
    question: "Can I export my ESG data as a report?",
    answer: "Yes. Navigate to the Docs Hub section from the sidebar where you can generate comprehensive PDF or Excel reports. Reports can be customized by date range, scope, facility, and specific metrics. These are formatted for regulatory submissions and stakeholder presentations.",
    tags: ["export", "report", "docs"],
  },
  {
    question: "What is Carbon Intensity and how is it measured?",
    answer: "Carbon Intensity measures emissions relative to a business metric — typically TCO₂e per unit of production or revenue. Lower intensity indicates more efficient operations. You can track it on the Environment Dashboard and set intensity-based reduction goals.",
    tags: ["carbon", "intensity", "metrics"],
  },
  {
    question: "How do I set up a new carbon reduction goal?",
    answer: "Go to Goal Settings → Create New Goal. Choose between absolute reduction (total emissions) or intensity-based (per unit). Set your baseline year, target year, and desired reduction percentage. The system will automatically track progress and alert you if a goal needs attention.",
    tags: ["goal", "reduction", "target"],
  },
  {
    question: "Who can access and modify data in the platform?",
    answer: "Access is controlled through the Admin section. Administrators can assign roles with granular permissions — from view-only access for stakeholders to full edit rights for data managers. All changes are logged in an audit trail for governance compliance.",
    tags: ["access", "permissions", "admin"],
  },
  {
    question: "How often is dashboard data updated?",
    answer: "Dashboard data refreshes based on your data ingestion schedule. Most organizations configure daily or weekly automatic imports. Manual data entry updates are reflected immediately. The 'Last Updated' timestamp on each card shows the most recent data point.",
    tags: ["dashboard", "data", "refresh"],
  },
];

const quickTips: QuickTip[] = [
  {
    id: "tip-1",
    title: "Use comparison mode for insights",
    description: "Compare emissions across different time periods by selecting two financial years side-by-side. This reveals trends and helps identify seasonal patterns in your data.",
    icon: TrendingUp,
    category: "productivity",
  },
  {
    id: "tip-2",
    title: "Set up automated data imports",
    description: "Configure automatic data ingestion from your ERP or energy management system to keep dashboards updated without manual entry. Contact your admin to set up API connections.",
    icon: Zap,
    category: "data",
  },
  {
    id: "tip-3",
    title: "Bookmark key metrics for quick access",
    description: "Star your most-used dashboards and reports to build a personalized quick-access panel. Bookmarked items appear in the sidebar for one-click navigation.",
    icon: Star,
    category: "productivity",
  },
  {
    id: "tip-4",
    title: "Use intensity metrics for fair comparison",
    description: "When comparing facilities of different sizes, use carbon intensity (TCO₂e per unit) rather than absolute emissions. This normalizes the data for a fair benchmark.",
    icon: BarChart3,
    category: "data",
  },
  {
    id: "tip-5",
    title: "Schedule recurring reports",
    description: "Set up automated monthly or quarterly ESG reports that are generated and emailed to stakeholders automatically. Never miss a reporting deadline again.",
    icon: FileText,
    category: "reporting",
  },
  {
    id: "tip-6",
    title: "Align goals with SBTi framework",
    description: "When creating reduction goals, use the Science Based Targets initiative (SBTi) guidelines to ensure your targets are credible and aligned with the Paris Agreement.",
    icon: Shield,
    category: "goals",
  },
];

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open command palette / search" },
      { keys: ["Ctrl", "H"], description: "Open Help Center" },
      { keys: ["Ctrl", "1"], description: "Go to Dashboard" },
      { keys: ["Ctrl", "2"], description: "Go to Scope Management" },
      { keys: ["Ctrl", "3"], description: "Go to Operations" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["Ctrl", "N"], description: "Create new entry" },
      { keys: ["Ctrl", "E"], description: "Export current view" },
      { keys: ["Ctrl", "F"], description: "Open filters panel" },
      { keys: ["Ctrl", "S"], description: "Save changes" },
    ],
  },
  {
    title: "Help Center",
    shortcuts: [
      { keys: ["↑", "↓"], description: "Navigate between guides" },
      { keys: ["←", "→"], description: "Previous / Next step" },
      { keys: ["Esc"], description: "Close search or panel" },
      { keys: ["Ctrl", "B"], description: "Bookmark current guide" },
    ],
  },
];

// ─── localStorage helpers ───────────────────────────────────
const STORAGE_KEY_READ = "help-read-guides";
const STORAGE_KEY_BOOKMARKS = "help-bookmarks";

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}
function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

// ─── Category badge colors ──────────────────────────────────
const tipCategoryColors: Record<string, string> = {
  productivity: "bg-primary/10 text-primary",
  data: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  reporting: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--accent-foreground))]",
  goals: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
};

// ─── Component ──────────────────────────────────────────────
type TabKey = "guides" | "faq" | "tips" | "shortcuts";

export default function HelpContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>([helpSections[0].id]);
  const [selectedSub, setSelectedSub] = useState<{ section: HelpSection; sub: SubSection } | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("guides");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // New features state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [readGuides, setReadGuides] = useState<Set<string>>(() => loadSet(STORAGE_KEY_READ));
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => loadSet(STORAGE_KEY_BOOKMARKS));

  useEffect(() => {
    if (!selectedSub) {
      setSelectedSub({ section: helpSections[0], sub: helpSections[0].subsections[0] });
    }
  }, []);

  // Track active heading via scroll + mark as read when scrolled to bottom
  useEffect(() => {
    const container = mainRef.current;
    if (!container || !selectedSub) return;
    const headingBlocks = selectedSub.sub.blocks.filter(b => b.tag === "h3");
    const handleScroll = () => {
      // Track active heading
      if (headingBlocks.length > 0) {
        let active = headingBlocks[0]?.id ?? null;
        for (const h of headingBlocks) {
          const el = document.getElementById(h.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 200) active = h.id;
          }
        }
        setActiveHeadingId(active);
      }
      // Mark as read when near bottom
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
        setReadGuides(prev => {
          const next = new Set(prev);
          next.add(selectedSub.sub.id);
          saveSet(STORAGE_KEY_READ, next);
          return next;
        });
      }
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedSub]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (activeTab === "guides" && selectedSub) {
        if (e.key === "ArrowRight") navigateArticle(1);
        if (e.key === "ArrowLeft") navigateArticle(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, selectedSub]);

  // Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const guides = helpSections.flatMap((s) =>
      s.subsections
        .filter((sub) =>
          sub.title.toLowerCase().includes(q) ||
          sub.description.toLowerCase().includes(q) ||
          sub.blocks.some((b) => (b.text ?? "").toLowerCase().includes(q))
        )
        .map((sub) => ({ type: "guide" as const, section: s, sub }))
    );
    const faqs = faqItems
      .map((f, i) => ({ ...f, index: i }))
      .filter((f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some((t) => t.includes(q))
      )
      .map((f) => ({ type: "faq" as const, faq: f }));
    const tips = quickTips.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    ).map((t) => ({ type: "tip" as const, tip: t }));
    return [...guides, ...faqs, ...tips];
  }, [searchQuery]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(STORAGE_KEY_BOOKMARKS, next);
      return next;
    });
  }, []);

  const totalGuides = helpSections.reduce((a, s) => a + s.subsections.length, 0);
  const completedGuides = readGuides.size;
  const progressPercent = totalGuides > 0 ? Math.round((completedGuides / totalGuides) * 100) : 0;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectSubsection = (section: HelpSection, sub: SubSection) => {
    setSelectedSub({ section, sub });
    setActiveHeadingId(null);
    setActiveTab("guides");
    setSearchOpen(false);
    setSearchQuery("");
    setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  // Flat list for prev/next navigation
  const allSubs = useMemo(() =>
    helpSections.flatMap(s => s.subsections.map(sub => ({ section: s, sub }))),
    []
  );

  const currentArticleIndex = selectedSub
    ? allSubs.findIndex(a => a.sub.id === selectedSub.sub.id)
    : -1;

  const navigateArticle = (dir: 1 | -1) => {
    const nextIdx = currentArticleIndex + dir;
    if (nextIdx >= 0 && nextIdx < allSubs.length) {
      selectSubsection(allSubs[nextIdx].section, allSubs[nextIdx].sub);
    }
  };

  const isVideo = selectedSub?.sub.content.type === "video";
  const articleHeadings = useMemo(() =>
    selectedSub?.sub.blocks.filter(b => b.tag === "h3") ?? [],
    [selectedSub]
  );

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "guides", label: "Guides", icon: BookOpen },
    { key: "faq", label: "FAQ", icon: MessageCircleQuestion },
    { key: "tips", label: "Tips", icon: Lightbulb },
    { key: "shortcuts", label: "Keys", icon: Keyboard },
  ];

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(var(--background)), hsl(210 20% 94%), hsl(142 30% 95%))" }}>
      {/* Left sidebar nav */}
      <aside className="w-72 shrink-0 border-r border-border bg-card/80 backdrop-blur-sm overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-foreground">Help Center</h2>
              <p className="text-[11px] text-muted-foreground">Guides, tips & shortcuts</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search help… (Ctrl+K)"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-8 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-muted-foreground">Progress</span>
              <span className="text-[10px] font-bold text-primary">{completedGuides}/{totalGuides} guides</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Search results overlay */}
        <AnimatePresence>
          {searchOpen && searchQuery.trim() && searchResults && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-30 left-0 top-[160px] w-72 max-h-80 overflow-y-auto bg-card border-r border-b border-border shadow-lg"
            >
              {searchResults.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Search size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-[12px] text-muted-foreground">No results for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-2">
                  <p className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{searchResults.length} result{searchResults.length > 1 ? "s" : ""}</p>
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (r.type === "guide") selectSubsection(r.section, r.sub);
                        else if (r.type === "faq") { setActiveTab("faq"); setExpandedFaq(r.faq.index); setSearchOpen(false); setSearchQuery(""); }
                        else if (r.type === "tip") { setActiveTab("tips"); setSearchOpen(false); setSearchQuery(""); }
                      }}
                      className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        r.type === "guide" ? "bg-primary/10 text-primary" : r.type === "faq" ? "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--accent-foreground))]"
                      }`}>
                        {r.type}
                      </span>
                      <span className="text-[12px] text-foreground leading-snug">
                        {r.type === "guide" ? r.sub.title : r.type === "faq" ? r.faq.question : r.tip.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content: Guides */}
        {activeTab === "guides" && (
          <nav className="py-3 flex-1 overflow-y-auto">
            {helpSections.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              return (
                <div key={section.id} className="mb-0.5">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center gap-2.5 px-5 py-2.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <section.icon size={15} className="text-primary shrink-0" />
                    <span className="text-[13px] font-semibold text-foreground flex-1">{section.title}</span>
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {section.subsections.map((sub) => {
                          const isActive = selectedSub?.sub.id === sub.id;
                          const isVid = sub.content.type === "video";
                          const isRead = readGuides.has(sub.id);
                          const isBookmarked = bookmarks.has(sub.id);
                          return (
                            <div key={sub.id} className="relative flex items-center">
                              <button
                                onClick={() => selectSubsection(section, sub)}
                                className={`relative flex flex-1 items-center gap-2 pl-12 pr-2 py-2 text-left text-[13px] transition-all ${
                                  isActive
                                    ? "text-primary font-medium bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="help-active"
                                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                  />
                                )}
                                {isRead && !isVid && <CheckCircle2 size={12} className="shrink-0 text-primary/60" />}
                                {isVid && <Play size={12} className="shrink-0 text-primary/70" />}
                                <span className="truncate flex-1">{sub.title}</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(sub.id); }}
                                className="shrink-0 mr-3 text-muted-foreground/50 hover:text-primary transition-colors"
                                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                              >
                                {isBookmarked
                                  ? <BookmarkCheck size={13} className="text-primary" />
                                  : <Bookmark size={13} />
                                }
                              </button>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Bookmarked guides */}
            {bookmarks.size > 0 && (
              <div className="mt-3 pt-3 border-t border-border px-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  <BookmarkCheck size={11} className="inline mr-1" />Bookmarked
                </p>
                {helpSections.flatMap((s) =>
                  s.subsections
                    .filter((sub) => bookmarks.has(sub.id))
                    .map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => selectSubsection(s, sub)}
                        className="w-full text-left text-[12px] text-muted-foreground hover:text-foreground py-1.5 pl-2 transition-colors truncate"
                      >
                        {sub.title}
                      </button>
                    ))
                )}
              </div>
            )}
          </nav>
        )}

        {/* Tab content: FAQ */}
        {activeTab === "faq" && (
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <p className="text-[11px] text-muted-foreground mb-3 px-1">Common questions answered</p>
            {faqItems.map((item, i) => (
              <button
                key={i}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full text-left mb-1"
              >
                <div className={`rounded-lg px-3 py-2.5 transition-colors ${expandedFaq === i ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {expandedFaq === i ? <Minus size={12} className="text-primary" /> : <Plus size={12} className="text-muted-foreground" />}
                    </div>
                    <span className={`text-[12px] leading-snug ${expandedFaq === i ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                      {item.question}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab content: Tips */}
        {activeTab === "tips" && (
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <p className="text-[11px] text-muted-foreground mb-3 px-1">Pro tips & best practices</p>
            {quickTips.map((tip) => (
              <button
                key={tip.id}
                onClick={() => {}}
                className="w-full text-left mb-1.5"
              >
                <div className="rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start gap-2">
                    <tip.icon size={13} className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-[12px] font-medium text-foreground leading-snug">{tip.title}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab content: Shortcuts */}
        {activeTab === "shortcuts" && (
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <p className="text-[11px] text-muted-foreground mb-3 px-1">Keyboard shortcuts reference</p>
            {shortcutGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">{group.title}</p>
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/30 transition-colors">
                    <span className="text-[11px] text-muted-foreground">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="inline-flex h-5 min-w-[22px] items-center justify-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono font-medium text-muted-foreground">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right content area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "guides" && selectedSub && (
            <motion.div
              key={selectedSub.sub.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <span>Help</span>
                <span>/</span>
                <span>{selectedSub.section.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{selectedSub.sub.title}</span>
              </div>

              {/* Title row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  {isVideo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <Play size={10} /> Video
                    </span>
                  )}
                  {readGuides.has(selectedSub.sub.id) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success-light))] px-2.5 py-0.5 text-[11px] font-semibold text-[hsl(var(--success))]">
                      <CheckCircle2 size={10} /> Completed
                    </span>
                  )}
                  <h1 className="font-display text-2xl font-bold text-foreground">{selectedSub.sub.title}</h1>
                </div>
                <button
                  onClick={() => toggleBookmark(selectedSub.sub.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-muted"
                >
                  {bookmarks.has(selectedSub.sub.id)
                    ? <><BookmarkCheck size={14} className="text-primary" /> Bookmarked</>
                    : <><Bookmark size={14} className="text-muted-foreground" /> Bookmark</>
                  }
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xl">{selectedSub.sub.description}</p>

              {/* Two columns: Article + Progress sidebar */}
              <div className="flex gap-8 items-start">
                {/* Left: Article content */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Hero image/video */}
                  <div className="relative rounded-xl overflow-hidden border-2 border-primary/20" style={{ boxShadow: "0 8px 32px -8px hsl(142 64% 36% / 0.12)" }}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent z-10" />
                    {selectedSub.sub.content.type === "video" ? (
                      <video key={selectedSub.sub.content.src} src={selectedSub.sub.content.src} poster={selectedSub.sub.content.poster} controls className="w-full object-cover bg-foreground/5" preload="metadata" />
                    ) : selectedSub.sub.content.type === "iframe" ? (
                      <iframe src={selectedSub.sub.content.src} title={selectedSub.sub.title} className="w-full border-0 bg-card min-h-[320px]" sandbox="allow-scripts allow-same-origin" />
                    ) : (
                      <img src={selectedSub.sub.content.src} alt={selectedSub.sub.title} className="w-full object-cover" />
                    )}
                  </div>

                  {/* Article blocks */}
                  {selectedSub.sub.blocks.map((block) => {
                    switch (block.tag) {
                      case "h3":
                        return (
                          <h3 key={block.id} id={block.id} className="text-lg font-semibold text-foreground font-display scroll-mt-24 pt-2">
                            {block.text}
                          </h3>
                        );
                      case "p":
                        return (
                          <p key={block.id} className="text-sm text-muted-foreground leading-relaxed">
                            {block.text}
                          </p>
                        );
                      case "img":
                        return (
                          <figure key={block.id} className="rounded-lg overflow-hidden border border-border">
                            <img src={block.src} alt={block.alt ?? ""} className="w-full object-cover" />
                            {block.alt && <figcaption className="text-xs text-muted-foreground p-2 text-center">{block.alt}</figcaption>}
                          </figure>
                        );
                      case "callout": {
                        const calloutStyles = {
                          info: { bg: "bg-[hsl(var(--info-light))]", border: "border-[hsl(var(--info))]", Icon: Info },
                          warning: { bg: "bg-[hsl(var(--warning-light))]", border: "border-[hsl(var(--warning))]", Icon: AlertTriangle },
                          success: { bg: "bg-[hsl(var(--success-light))]", border: "border-[hsl(var(--success))]", Icon: CheckCircle2 },
                        };
                        const style = calloutStyles[block.variant ?? "info"];
                        return (
                          <div key={block.id} className={`${style.bg} ${style.border} border-l-4 rounded-lg p-4 flex items-start gap-3`}>
                            <style.Icon size={16} className="mt-0.5 shrink-0 text-foreground/60" />
                            <p className="text-sm text-foreground/85">{block.text}</p>
                          </div>
                        );
                      }
                      case "ul":
                        return (
                          <ul key={block.id} className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                            {(block.items ?? []).map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        );
                      default:
                        return null;
                    }
                  })}

                  {/* Prev / Next article navigation */}
                  <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
                    {currentArticleIndex > 0 ? (
                      <button
                        onClick={() => navigateArticle(-1)}
                        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 max-w-[45%]"
                      >
                        <ArrowLeft size={14} className="shrink-0 text-muted-foreground" />
                        <div>
                          <span className="text-[10px] uppercase tracking-wider block text-muted-foreground font-semibold">Previous</span>
                          <span className="text-sm font-medium text-foreground truncate block">{allSubs[currentArticleIndex - 1].sub.title}</span>
                        </div>
                      </button>
                    ) : <div />}
                    {currentArticleIndex < allSubs.length - 1 ? (
                      <button
                        onClick={() => navigateArticle(1)}
                        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-right transition-colors hover:bg-muted/50 max-w-[45%] ml-auto"
                      >
                        <div>
                          <span className="text-[10px] uppercase tracking-wider block text-muted-foreground font-semibold">Next</span>
                          <span className="text-sm font-medium text-foreground truncate block">{allSubs[currentArticleIndex + 1].sub.title}</span>
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
                      </button>
                    ) : <div />}
                  </div>
                </div>

                {/* Right: Table of contents with scroll progress */}
                <div className="w-[220px] shrink-0 sticky top-8">
                  <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">On this page</p>
                    <div className="relative pl-[14px]">
                      {/* Background line */}
                      <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-border rounded-full" />
                      {/* Animated progress fill */}
                      {(() => {
                        const activeIdx = articleHeadings.findIndex(h => h.id === activeHeadingId);
                        const progress = articleHeadings.length > 1
                          ? ((Math.max(0, activeIdx) + 0.5) / articleHeadings.length) * 100
                          : activeIdx >= 0 ? 100 : 0;
                        return (
                          <motion.div
                            className="absolute left-[5px] top-0 w-[2px] bg-primary rounded-full"
                            initial={false}
                            animate={{ height: `${progress}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                        );
                      })()}
                      {/* Heading items */}
                      {articleHeadings.map((h) => {
                        const isActive = h.id === activeHeadingId;
                        return (
                          <button
                            key={h.id}
                            onClick={() => {
                              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className="relative flex items-center gap-3 py-2 w-full text-left group"
                          >
                            <motion.div
                              className="absolute -left-[14px] z-10 shrink-0 rounded-full border-2"
                              initial={false}
                              animate={{
                                width: isActive ? 12 : 10,
                                height: isActive ? 12 : 10,
                                borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                                backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                              }}
                              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                            />
                            <span className={`text-[12px] leading-snug transition-colors ${
                              isActive ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground"
                            }`}>
                              {h.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Article progress */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Article</span>
                        <span className="font-bold text-primary">{currentArticleIndex + 1}/{allSubs.length}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentArticleIndex + 1) / allSubs.length) * 100}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "faq" && (
            <motion.div
              key="faq-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-8 max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <MessageCircleQuestion size={18} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Quick answers to common questions about the ESG platform.</p>

              <div className="space-y-3">
                {faqItems.map((item, i) => {
                  const isOpen = expandedFaq === i;
                  return (
                    <motion.div
                      key={i}
                      className={`rounded-xl border transition-colors ${isOpen ? "border-primary/30 bg-card" : "border-border bg-card/60"}`}
                      style={isOpen ? { boxShadow: "0 4px 20px -4px hsl(142 64% 36% / 0.08)" } : {}}
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : i)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                      >
                        <span className={`text-sm font-medium pr-4 ${isOpen ? "text-foreground" : "text-foreground/80"}`}>
                          {item.question}
                        </span>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-primary/10" : "bg-muted"}`}>
                          {isOpen
                            ? <Minus size={13} className="text-primary" />
                            : <Plus size={13} className="text-muted-foreground" />
                          }
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-0">
                              <div className="h-px bg-border mb-3" />
                              <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                              <div className="flex gap-1.5 mt-3">
                                {item.tags.map((t) => (
                                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{t}</span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "tips" && (
            <motion.div
              key="tips-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-8 max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--warning))]/15">
                  <Lightbulb size={18} className="text-[hsl(var(--warning))]" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Quick Tips & Best Practices</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Pro tips to help you get the most out of the platform.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTips.map((tip) => (
                  <motion.div
                    key={tip.id}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <tip.icon size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{tip.title}</h3>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tipCategoryColors[tip.category] || "bg-muted text-muted-foreground"}`}>
                          {tip.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{tip.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "shortcuts" && (
            <motion.div
              key="shortcuts-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-8 max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Keyboard size={18} className="text-foreground" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Keyboard Shortcuts</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Master the platform with keyboard shortcuts for faster navigation.</p>

              <div className="space-y-6">
                {shortcutGroups.map((group) => (
                  <div key={group.title} className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="px-5 py-3 border-b border-border bg-muted/30">
                      <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {group.shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm text-muted-foreground">{s.description}</span>
                          <div className="flex items-center gap-1.5">
                            {s.keys.map((k, ki) => (
                              <span key={ki}>
                                <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-border bg-muted px-2 text-[11px] font-mono font-semibold text-foreground shadow-sm">
                                  {k}
                                </kbd>
                                {ki < s.keys.length - 1 && <span className="mx-0.5 text-muted-foreground text-[11px]">+</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
