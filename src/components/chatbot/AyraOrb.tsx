import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AyraOrbProps {
  size?: number;
  showSparkle?: boolean;
  intensity?: "soft" | "bright";
}

export default function AyraOrb({
  size = 40,
  showSparkle = true,
  intensity = "bright",
}: AyraOrbProps) {
  const sparkleSize = Math.round(size * 0.46);
  const haloOpacity = intensity === "bright" ? 0.85 : 0.5;
  const haloBlur = Math.max(4, Math.round(size * 0.12));

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Rotating conic halo (the soul of the orb) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 33%, hsl(var(--primary)) 66%, hsl(var(--accent)) 100%)",
          opacity: haloOpacity,
          filter: `blur(${haloBlur}px)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* Counter-rotating inner conic for depth */}
      <motion.div
        className="absolute inset-[8%] rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg, hsl(var(--accent)), hsl(var(--primary)), hsl(var(--accent)))",
          opacity: 0.4,
          filter: "blur(2px)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* Solid breathing disc */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.95), hsl(var(--primary)) 70%)",
          boxShadow:
            "inset 0 1px 1px hsl(0 0% 100% / 0.35), 0 6px 18px -6px hsl(var(--primary) / 0.55)",
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glossy highlight */}
        <div
          className="pointer-events-none absolute -top-[20%] left-[18%] h-[55%] w-[55%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0) 70%)",
            filter: "blur(2px)",
          }}
        />
        {showSparkle && (
          <Sparkles
            size={sparkleSize}
            strokeWidth={2.2}
            className="relative text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          />
        )}
      </motion.div>
    </div>
  );
}
