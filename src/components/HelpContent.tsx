import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, BookOpen, BarChart3, Leaf, Target, Users, ShoppingBag, Settings, FileText } from "lucide-react";

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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        description: "Direct emissions from owned or controlled sources. Track emissions from company facilities and vehicles.",
        content: { type: "iframe", src: "https://docs.lovable.dev" },
        steps: [
          "Navigate to Environment → Scope 1 from the sidebar.",
          "View entity-level breakdown with Total Emissions (TCO₂e), Production, and Carbon Intensity columns.",
          "Use the Insights, Emission Details, and Activity Data tabs for different data perspectives.",
        ],
      },
      {
        id: "scope-2",
        title: "Scope 2 & 3 Emissions",
        description: "Indirect emissions from purchased energy (Scope 2) and value chain activities (Scope 3).",
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        description: "Set carbon reduction targets aligned with science-based targets and company strategy.",
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
        content: { type: "iframe", src: "https://docs.lovable.dev" },
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
  const [selectedSection, setSelectedSection] = useState<HelpSection | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<SubSection | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubsectionClick = (section: HelpSection, sub: SubSection) => {
    setSelectedSection(section);
    setSelectedSubsection(sub);
    setCurrentStep(0);
  };

  const handleBack = () => {
    if (selectedSubsection) {
      setSelectedSubsection(null);
      setCurrentStep(0);
    }
  };

  const handleNext = () => {
    if (!selectedSubsection) return;
    if (currentStep < selectedSubsection.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Move to next subsection in same section
      if (selectedSection) {
        const idx = selectedSection.subsections.findIndex((s) => s.id === selectedSubsection.id);
        if (idx < selectedSection.subsections.length - 1) {
          setSelectedSubsection(selectedSection.subsections[idx + 1]);
          setCurrentStep(0);
        } else {
          handleBack();
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
        {selectedSubsection && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Help Center
            {selectedSection && selectedSubsection && (
              <span className="font-normal text-muted-foreground">
                {" "}
                / {selectedSection.title} / {selectedSubsection.title}
              </span>
            )}
          </h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedSubsection ? (
          /* ---- Section & Subsection List ---- */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-4xl px-6 py-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                How can we help?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore step-by-step guides for every feature in the platform.
              </p>
            </div>

            <div className="space-y-4">
              {helpSections.map((section) => (
                <div key={section.id} className="esg-card overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-3">
                    <section.icon size={18} className="text-primary" />
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {section.subsections.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubsectionClick(section, sub)}
                        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-muted/40"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {sub.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {sub.description}
                          </p>
                        </div>
                        <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ---- Subsection Detail / Walkthrough ---- */
          <motion.div
            key={selectedSubsection.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-5xl px-6 py-8"
          >
            {/* Title & description */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                {selectedSubsection.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedSubsection.description}
              </p>
            </div>

            {/* Preview area */}
            <div className="esg-card-elevated mb-6 overflow-hidden">
              {selectedSubsection.content.type === "iframe" ? (
                <iframe
                  src={selectedSubsection.content.src}
                  title={selectedSubsection.title}
                  className="h-[400px] w-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <img
                  src={selectedSubsection.content.src}
                  alt={selectedSubsection.title}
                  className="h-[400px] w-full object-cover"
                />
              )}
            </div>

            {/* Step walkthrough */}
            <div className="esg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="esg-badge-success">
                  Step {currentStep + 1} of {selectedSubsection.steps.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm leading-relaxed text-foreground"
                >
                  {selectedSubsection.steps[currentStep]}
                </motion.p>
              </AnimatePresence>

              {/* Step dots */}
              <div className="mt-4 flex items-center gap-1.5">
                {selectedSubsection.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-border hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {currentStep < selectedSubsection.steps.length - 1
                    ? "Next Step"
                    : selectedSection &&
                      selectedSection.subsections.findIndex((s) => s.id === selectedSubsection.id) <
                        selectedSection.subsections.length - 1
                    ? "Next Topic"
                    : "Back to Help"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
