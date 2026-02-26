import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, BarChart3, Leaf, Target, Users, ShoppingBag, ChevronDown } from "lucide-react";

interface SubSection {
  id: string;
  title: string;
  description: string;
  content: {
    type: "image" | "iframe";
    src: string;
  };
  steps: string[];
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections: SubSection[];
}

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
        steps: [
          "The dashboard displays five key stat cards at the top: Total Emission, Carbon Intensity, Green Energy, Goals On Track, and YoY Growth.",
          "Below the stats, interactive charts show Emission by Scope and Scope Breakdown for detailed analysis.",
          "Use the Financial Year selector and Filters to narrow down the data by date range or category.",
        ],
      },
      {
        id: "dashboard-filters",
        title: "Using Filters",
        description: "Learn how to filter dashboard data by date range, scope, facility, and emission type.",
        content: { type: "image", src: "/help/overview-2.png" },
        steps: [
          "Click the 'Filters' button in the page header to open the filter panel.",
          "Select the scope (1, 2, or 3), facility, and emission category you want to view.",
          "Click 'Apply' to refresh the dashboard with filtered data.",
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
        steps: [
          "Navigate to Environment → Scope 1 from the sidebar.",
          "View entity-level breakdown with Total Emissions (TCO₂e), Production, and Carbon Intensity columns.",
          "Use the Insights, Emission Details, and Activity Data tabs for different data perspectives.",
        ],
      },
      {
        id: "scope-2",
        title: "Scope 2 & 3 Emissions",
        description: "Indirect emissions from purchased energy and value chain activities.",
        content: { type: "image", src: "/help/overview-4.png" },
        steps: [
          "Scope 2 covers indirect emissions from purchased electricity, steam, heating, and cooling.",
          "Scope 3 includes all other indirect emissions across the value chain.",
          "Both sections follow the same layout as Scope 1 for consistency.",
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
        steps: [
          "Go to Operations → Processes to see all defined processes.",
          "View summary cards showing Total Process Maps, Processes, Raw Materials, Products, and unmapped products.",
          "Click '+ Add New Process' to define a new process with fuels and electricity required.",
        ],
      },
      {
        id: "operations-materials",
        title: "Raw Materials & Products",
        description: "Track raw materials and their relationship to products and production processes.",
        content: { type: "image", src: "/help/overview-6.png" },
        steps: [
          "Navigate to Operations → Raw Materials to view all input materials.",
          "Link materials to specific processes for accurate emission tracking.",
          "Monitor Products without Process Maps to identify gaps in your tracking.",
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
        steps: [
          "Navigate to Goal Settings from the sidebar.",
          "Click 'Create New Goal' and select target type (absolute or intensity-based).",
          "Define the baseline year, target year, and reduction percentage.",
        ],
      },
      {
        id: "goals-track",
        title: "Tracking Progress",
        description: "Monitor goal progress and receive alerts when targets need attention.",
        content: { type: "image", src: "/help/overview-1.png" },
        steps: [
          "The Goals On Track card on the dashboard gives a quick status overview.",
          "Visit Goal Settings for detailed progress charts and milestone tracking.",
          "Goals flagged as 'Needs Review' require updated reduction strategies.",
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
        steps: [
          "Navigate to Social from the sidebar to access social impact tracking.",
          "View workforce diversity metrics, employee wellbeing data, and community initiatives.",
          "Generate reports for stakeholder communication and ESG disclosures.",
        ],
      },
      {
        id: "governance-overview",
        title: "Governance Framework",
        description: "Manage board composition, ethics policies, and compliance tracking.",
        content: { type: "image", src: "/help/overview-3.png" },
        steps: [
          "Go to Governance to view your organization's governance structure.",
          "Track board diversity, committee composition, and policy compliance.",
          "Monitor anti-corruption measures and ethical business practice metrics.",
        ],
      },
    ],
  },
];

export default function HelpContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>([helpSections[0].id]);
  const [selectedSub, setSelectedSub] = useState<{ section: HelpSection; sub: SubSection } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-select first subsection on mount
  useEffect(() => {
    if (!selectedSub) {
      setSelectedSub({ section: helpSections[0], sub: helpSections[0].subsections[0] });
    }
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectSubsection = (section: HelpSection, sub: SubSection) => {
    setSelectedSub({ section, sub });
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (!selectedSub) return;
    if (currentStep < selectedSub.sub.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      const idx = selectedSub.section.subsections.findIndex((s) => s.id === selectedSub.sub.id);
      if (idx < selectedSub.section.subsections.length - 1) {
        selectSubsection(selectedSub.section, selectedSub.section.subsections[idx + 1]);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(var(--background)), hsl(210 20% 94%), hsl(142 30% 95%))" }}>
      {/* Left sidebar nav */}
      <aside className="w-72 shrink-0 border-r border-border bg-card/80 backdrop-blur-sm overflow-y-auto">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-foreground">Help Center</h2>
              <p className="text-[11px] text-muted-foreground">Feature guides & walkthroughs</p>
            </div>
          </div>
        </div>

        <nav className="py-3">
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
                        return (
                          <button
                            key={sub.id}
                            onClick={() => selectSubsection(section, sub)}
                            className={`relative flex w-full items-center pl-12 pr-4 py-2 text-left text-[13px] transition-all ${
                              isActive
                                ? "text-primary font-medium bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            }`}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <motion.div
                                layoutId="help-active"
                                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            {sub.title}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Right content area */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedSub && (
            <motion.div
              key={selectedSub.sub.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="p-8 max-w-4xl"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <span>Help</span>
                <span>/</span>
                <span>{selectedSub.section.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{selectedSub.sub.title}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl font-bold text-foreground mb-1.5">
                {selectedSub.sub.title}
              </h1>
              <p className="text-sm text-muted-foreground mb-6 max-w-xl">
                {selectedSub.sub.description}
              </p>

              {/* Preview box with themed border */}
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 mb-6" style={{ boxShadow: "0 8px 32px -8px hsl(142 64% 36% / 0.12)" }}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                {selectedSub.sub.content.type === "iframe" ? (
                  <iframe
                    src={selectedSub.sub.content.src}
                    title={selectedSub.sub.title}
                    className="h-[380px] w-full border-0 bg-card"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <img
                    src={selectedSub.sub.content.src}
                    alt={selectedSub.sub.title}
                    className="h-[380px] w-full object-cover"
                  />
                )}
              </div>

              {/* Steps card */}
              <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
                    Step {currentStep + 1} of {selectedSub.sub.steps.length}
                  </span>
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {selectedSub.sub.steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === currentStep
                            ? "h-2 w-6 bg-primary"
                            : i < currentStep
                            ? "h-2 w-2 bg-primary/40"
                            : "h-2 w-2 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm leading-relaxed text-foreground min-h-[48px]"
                  >
                    {selectedSub.sub.steps[currentStep]}
                  </motion.p>
                </AnimatePresence>

                {/* Nav buttons */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-border">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      currentStep === selectedSub.sub.steps.length - 1 &&
                      selectedSub.section.subsections.findIndex((s) => s.id === selectedSub.sub.id) >=
                        selectedSub.section.subsections.length - 1
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
                  >
                    {currentStep < selectedSub.sub.steps.length - 1 ? "Next Step" : "Next Topic"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
