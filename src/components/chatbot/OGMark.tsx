import { motion } from "framer-motion";

interface OGMarkProps {
  size?: number;
  showDot?: boolean;
  className?: string;
}

/**
 * Typographic OG mark — wordmark + live status dot.
 * Restrained, brand-first, no swirling AI cliché.
 */
export default function OGMark({
  size = 16,
  showDot = true,
  className = "",
}: OGMarkProps) {
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 ${className}`}
      style={{ lineHeight: 1 }}
    >
      <span
        className="font-display font-bold"
        style={{
          fontSize: size,
          letterSpacing: "-0.045em",
          color: "hsl(var(--foreground) / 0.95)",
        }}
      >
        OG
      </span>
      {showDot && <StatusDot size={Math.max(5, Math.round(size * 0.32))} />}
    </span>
  );
}

export function StatusDot({ size = 6 }: { size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: "hsl(var(--primary) / 0.45)" }}
        animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "hsl(var(--primary))",
          boxShadow: "0 0 6px hsl(var(--primary) / 0.6)",
        }}
      />
    </span>
  );
}

/** Compact mark used inside the FAB — letters only, dot anchored externally */
export function OGMonogram({ size = 18 }: { size?: number }) {
  return (
    <span
      className="font-display font-bold"
      style={{
        fontSize: size,
        letterSpacing: "-0.05em",
        color: "hsl(var(--foreground))",
        lineHeight: 1,
      }}
    >
      OG
    </span>
  );
}
