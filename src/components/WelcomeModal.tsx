import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, X, BarChart3, Target, Sparkles } from "lucide-react";

const welcomeSteps = [
  {
    id: 1,
    category: "overview",
    video: "/videos/welcome-overview.mp4",
    icon: BarChart3,
    title: "Welcome to Your ESG Command Center",
    description:
      "Track carbon emissions, energy consumption, and sustainability metrics across Scope 1, 2, and 3 — all in one unified dashboard.",
    highlight: "You have 3 active goals. 1 is on track.",
    cta: "View Dashboard",
  },
  {
    id: 2,
    category: "goals",
    video: "/videos/welcome-overview.mp4",
    icon: Target,
    title: "Your Carbon Goals Need Attention",
    description:
      "Review progress and adjust reduction targets based on latest performance data. Stay ahead of compliance deadlines.",
    highlight: "1 goal requires review.",
    cta: "Review Goals",
  },
  {
    id: 3,
    category: "insights",
    video: "/videos/welcome-overview.mp4",
    icon: Sparkles,
    title: "Unlock Smart Insights",
    description:
      "Use AI-powered analytics to optimize emissions, improve carbon intensity, and discover actionable recommendations.",
    highlight: "New insights available for Scope 1.",
    cta: "View Insights",
  },
];

const Particle = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <div
    className="absolute rounded-full opacity-0"
    style={{
      left: `${x}%`,
      bottom: "10%",
      width: size,
      height: size,
      background: "hsl(142 64% 60% / 0.3)",
      animation: `particle-drift 6s ease-in-out ${delay}s infinite`,
    }}
  />
);

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [direction, setDirection] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const current = welcomeSteps[step];
  const isLast = step === welcomeSteps.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onClose();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, onClose]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goBack, onClose]);

  const contentVariants = {
    enter: (dir: number) => ({
      x: dir * 40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir * -40,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="relative flex w-full overflow-hidden rounded-2xl bg-card shadow-modal"
        style={{ maxWidth: "960px", maxHeight: "580px" }}
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* LEFT — Video Panel */}
        <div className="relative hidden w-[40%] overflow-hidden md:block" style={{ background: "var(--gradient-video-bg)" }}>
          {/* Particles */}
          <Particle delay={0} x={20} size={4} />
          <Particle delay={1.2} x={50} size={6} />
          <Particle delay={2.5} x={75} size={3} />
          <Particle delay={3.8} x={35} size={5} />
          <Particle delay={0.8} x={60} size={4} />
          <Particle delay={2} x={85} size={3} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <video
                ref={(el) => { videoRefs.current[step] = el; }}
                src={current.video}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Step category badge */}
          <div className="absolute bottom-6 left-6 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              <current.icon size={12} />
              {current.category.charAt(0).toUpperCase() + current.category.slice(1)}
            </span>
          </div>
        </div>

        {/* RIGHT — Content Panel */}
        <div className="flex flex-1 flex-col justify-between p-8 md:p-10">
          {/* Step indicator */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {welcomeSteps.length}
            </span>
            <div className="flex gap-1.5">
              {welcomeSteps.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i === step ? "hsl(var(--primary))" : i < step ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Animated content */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-full flex-col justify-center"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary md:hidden">
                  <current.icon size={20} />
                </div>
                <h2 className="mb-3 font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                  {current.title}
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {current.description}
                </p>
                <div className="esg-badge-success mb-6 self-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                  {current.highlight}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                style={{ background: "var(--gradient-esg)" }}
              >
                {isLast ? current.cta : "Next"}
                <ChevronRight size={16} />
              </button>
              {!isLast && (
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Skip
                </button>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
              <div
                onClick={() => setDontShow(!dontShow)}
                className="flex h-4 w-4 items-center justify-center rounded border border-border transition-colors"
                style={dontShow ? { background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" } : {}}
              >
                {dontShow && <Check size={10} className="text-primary-foreground" />}
              </div>
              Don't show this again
            </label>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
