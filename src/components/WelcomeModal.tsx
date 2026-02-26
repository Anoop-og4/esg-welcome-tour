import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowRight, X, BarChart3, Target, Sparkles, Leaf } from "lucide-react";
import welcomeBg from "@/assets/welcome-bg.jpg";

const welcomeSteps = [
  {
    id: 1,
    category: "overview",
    video: "/videos/welcome-overview.mp4",
    icon: BarChart3,
    title: "Welcome to Your\nESG Command Center",
    description:
      "Track carbon emissions, energy consumption, and sustainability metrics across Scope 1, 2, and 3 — all in one unified dashboard.",
    highlight: "3 active goals · 1 on track",
    cta: "Explore Dashboard",
  },
  {
    id: 2,
    category: "goals",
    video: "/videos/welcome-overview.mp4",
    icon: Target,
    title: "Your Carbon Goals\nNeed Attention",
    description:
      "Review progress and adjust reduction targets based on latest performance data. Stay ahead of compliance deadlines.",
    highlight: "1 goal requires review",
    cta: "Review Goals",
  },
  {
    id: 3,
    category: "insights",
    video: "/videos/welcome-overview.mp4",
    icon: Sparkles,
    title: "Unlock Smart\nInsights with AI",
    description:
      "Use AI-powered analytics to optimize emissions, improve carbon intensity, and discover actionable recommendations.",
    highlight: "New insights · Scope 1",
    cta: "View Insights",
  },
];

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [direction, setDirection] = useState(1);

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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backdropFilter: "blur(16px) saturate(180%)", background: "hsl(220 20% 6% / 0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 flex w-full flex-col overflow-hidden rounded-3xl md:flex-row"
        style={{
          maxWidth: "1100px",
          minHeight: "600px",
          maxHeight: "85vh",
          boxShadow: "0 40px 80px -20px hsl(220 30% 5% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.06)",
        }}
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Full background gradient */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${welcomeBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, hsl(200 25% 8% / 0.85) 0%, hsl(160 20% 10% / 0.7) 50%, hsl(220 25% 8% / 0.85) 100%)",
          }}
        />
        {/* Radial glow behind text area */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block"
          style={{
            width: "70%",
            height: "120%",
            background: "radial-gradient(ellipse at 60% 50%, hsl(160 40% 15% / 0.4) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-30 rounded-full p-2 transition-all hover:scale-110"
          style={{ color: "hsl(0 0% 100% / 0.5)", background: "hsl(0 0% 100% / 0.06)" }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* LEFT — Video (floating container, overlapping into right) */}
        <div className="relative z-10 flex items-center justify-center p-8 md:w-[42%] md:p-10">
          {/* Floating particles */}
          {[
            { x: 15, y: 20, size: 3, delay: 0, dur: 7 },
            { x: 60, y: 70, size: 5, delay: 1.5, dur: 8 },
            { x: 80, y: 30, size: 4, delay: 3, dur: 6 },
            { x: 30, y: 85, size: 3, delay: 2, dur: 9 },
            { x: 75, y: 55, size: 6, delay: 0.5, dur: 7 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: "hsl(142 60% 55% / 0.35)",
              }}
              animate={{
                y: [-10, -30, -10],
                x: [0, 15, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: p.dur,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "3/4",
                maxHeight: "420px",
                boxShadow: "0 20px 50px -10px hsl(160 50% 10% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.08)",
              }}
              initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotate: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <video
                src={current.video}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              {/* Video overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 50%, hsl(160 30% 8% / 0.6) 100%)",
                }}
              />
              {/* Category badge on video */}
              <div className="absolute bottom-4 left-4 z-10">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    background: "hsl(0 0% 100% / 0.12)",
                    backdropFilter: "blur(12px)",
                    color: "hsl(142 60% 70%)",
                    border: "1px solid hsl(0 0% 100% / 0.08)",
                  }}
                >
                  <current.icon size={11} />
                  {current.category}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT — Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-8 md:py-12 md:pr-12 md:pl-4">
          {/* Brand + step */}
          <div className="mb-6 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Leaf size={16} style={{ color: "hsl(142 60% 55%)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "hsl(0 0% 100% / 0.4)" }}
              >
                onlygood
              </span>
            </motion.div>
            <div className="flex items-center gap-2">
              {welcomeSteps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full"
                  animate={{
                    width: i === step ? 28 : 8,
                    background: i === step
                      ? "hsl(142 60% 55%)"
                      : i < step
                      ? "hsl(142 60% 55% / 0.35)"
                      : "hsl(0 0% 100% / 0.12)",
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              ))}
            </div>
          </div>

          {/* Main content with staggered animations */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                className="flex h-full flex-col justify-center"
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={direction}
              >
                {/* Step counter */}
                <motion.span
                  className="mb-4 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "hsl(142 60% 55%)" }}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -8 },
                  }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  Step {step + 1} of {welcomeSteps.length}
                </motion.span>

                {/* Title */}
                <motion.h2
                  className="mb-5 font-display text-3xl font-extrabold leading-[1.15] tracking-tight md:text-[2.5rem]"
                  style={{ color: "hsl(0 0% 100%)" }}
                  variants={{
                    hidden: (d: number) => ({ opacity: 0, x: d * 30, filter: "blur(6px)" }),
                    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
                    exit: (d: number) => ({ opacity: 0, x: d * -20, filter: "blur(4px)" }),
                  }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current.title.split("\n").map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </motion.h2>

                {/* Description */}
                <motion.p
                  className="mb-6 max-w-md text-base leading-relaxed md:text-lg"
                  style={{ color: "hsl(0 0% 100% / 0.55)" }}
                  variants={{
                    hidden: (d: number) => ({ opacity: 0, x: d * 20 }),
                    visible: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: d * -15 }),
                  }}
                  transition={{ duration: 0.35, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current.description}
                </motion.p>

                {/* Highlight badge */}
                <motion.div
                  className="mb-2 self-start"
                  variants={{
                    hidden: { opacity: 0, y: 10, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: -8, scale: 0.95 },
                  }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      background: "hsl(142 50% 30% / 0.25)",
                      color: "hsl(142 60% 70%)",
                      border: "1px solid hsl(142 50% 40% / 0.2)",
                    }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: "hsl(142 60% 55%)" }}
                    />
                    {current.highlight}
                  </span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-4">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                  style={{
                    color: "hsl(0 0% 100% / 0.6)",
                    background: "hsl(0 0% 100% / 0.06)",
                    border: "1px solid hsl(0 0% 100% / 0.08)",
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={goNext}
                className="group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold transition-all hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, hsl(142 64% 38%), hsl(160 55% 42%))",
                  color: "hsl(0 0% 100%)",
                  boxShadow: "0 4px 20px -4px hsl(142 60% 30% / 0.5)",
                }}
              >
                {isLast ? current.cta : "Continue"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              {!isLast && (
                <button
                  onClick={onClose}
                  className="text-sm font-medium transition-colors"
                  style={{ color: "hsl(0 0% 100% / 0.3)" }}
                >
                  Skip tour
                </button>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 select-none" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
              <div
                onClick={() => setDontShow(!dontShow)}
                className="flex h-4 w-4 items-center justify-center rounded transition-all"
                style={{
                  border: `1.5px solid ${dontShow ? "hsl(142 60% 55%)" : "hsl(0 0% 100% / 0.2)"}`,
                  background: dontShow ? "hsl(142 60% 55%)" : "transparent",
                }}
              >
                {dontShow && <Check size={10} style={{ color: "hsl(0 0% 100%)" }} />}
              </div>
              <span className="text-xs">Don't show this again</span>
            </label>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
