import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowUp,
  ArrowLeft,
  ChevronRight,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import AyraOrb from "./AyraOrb";
import {
  TOPICS,
  SURPRISE_TOPIC,
  SURPRISE_TOPIC_ID,
  getRandomSuggestions,
  getSuggestionsGrouped,
  type Topic,
  type Suggestion,
} from "./topics";

type View = "welcome" | "topic" | "chat";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────── Public component ─────────────────────────── */

export default function AyraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("welcome");
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build the surprise topic on demand so its order is fresh per visit
  const surpriseTopic = useMemo<Topic>(
    () => ({ ...SURPRISE_TOPIC, suggestions: getRandomSuggestions(8) }),
    [isOpen, view],
  );

  /* Esc closes drawer */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* Auto-scroll chat to bottom on new messages */
  useEffect(() => {
    if (view !== "chat") return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, view, isThinking]);

  /* Focus composer after drawer settles */
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 420);
    return () => clearTimeout(t);
  }, [isOpen]);

  const openTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setView("topic");
  };

  const sendMessage = useCallback(
    (text?: string) => {
      const content = (text ?? input).trim();
      if (!content) return;
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setView("chat");
      setIsThinking(true);
      // Simulated response — replace with real model call
      window.setTimeout(() => {
        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          role: "ai",
          content:
            "I'm being wired up to your ESG data warehouse. Once connected, I'll answer this with live numbers — by scope, by facility, by quarter — and stream the chart inline.",
        };
        setMessages((m) => [...m, aiMsg]);
        setIsThinking(false);
      }, 1500);
    },
    [input],
  );

  const handleBack = () => {
    if (view === "chat") {
      setMessages([]);
      setActiveTopic(null);
      setView("welcome");
      return;
    }
    if (view === "topic") {
      setActiveTopic(null);
      setView("welcome");
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveTopic(null);
    setView("welcome");
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && <FAB key="fab" onClick={() => setIsOpen(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <DrawerShell key="shell" onClose={() => setIsOpen(false)}>
            <Header
              view={view}
              activeTopic={activeTopic}
              onBack={handleBack}
              onClose={() => setIsOpen(false)}
              onNewChat={startNewChat}
            />

            <div className="relative flex-1 min-h-0">
              {/* Top fade */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--card) / 0.85), transparent)",
                }}
              />
              {/* Bottom fade */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8"
                style={{
                  background:
                    "linear-gradient(0deg, hsl(var(--card) / 0.9), transparent)",
                }}
              />

              <div
                ref={scrollRef}
                className="ayra-scroll h-full overflow-y-auto px-5 pb-6 pt-4"
              >
                <AnimatePresence mode="wait">
                  {view === "welcome" && (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.32, ease: EASE }}
                      className="space-y-7"
                    >
                      <Greeting />
                      <TopicGrid
                        onSelect={openTopic}
                        surpriseTopic={surpriseTopic}
                      />
                    </motion.div>
                  )}

                  {view === "topic" && activeTopic && (
                    <motion.div
                      key={`topic-${activeTopic.id}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.32, ease: EASE }}
                      className="space-y-5"
                    >
                      <TopicIntro topic={activeTopic} />
                      <QuestionList
                        topic={activeTopic}
                        onPick={(s) => sendMessage(s.text)}
                      />
                    </motion.div>
                  )}

                  {view === "chat" && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="flex flex-col gap-4 py-2"
                    >
                      {messages.map((m, i) => (
                        <Bubble key={m.id} message={m} index={i} />
                      ))}
                      {isThinking && <Thinking />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Composer
              inputRef={inputRef}
              value={input}
              onChange={setInput}
              onSend={() => sendMessage()}
              placeholder={
                activeTopic
                  ? `Ask about ${activeTopic.label.toLowerCase()}…`
                  : "Ask Ayra anything about your ESG data…"
              }
            />
          </DrawerShell>
        )}
      </AnimatePresence>
    </>
  );
}

/* ────────────────────────────── FAB ───────────────────────────────────── */

function FAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open Ayra"
      className="group fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full focus:outline-none"
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 12 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
    >
      {/* Ambient pulsing ring */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: "hsl(var(--primary) / 0.22)" }}
        animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: "hsl(var(--primary) / 0.18)" }}
        animate={{ scale: [1, 1.55], opacity: [0.45, 0] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.3,
        }}
      />

      {/* Solid button surface */}
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
          boxShadow:
            "0 10px 30px -8px hsl(var(--primary) / 0.55), inset 0 1px 1px hsl(0 0% 100% / 0.3)",
        }}
      >
        <AyraOrb size={36} />
      </div>

      {/* Subtle label tooltip */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[110%] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: "hsl(var(--card) / 0.92)",
          color: "hsl(var(--foreground) / 0.85)",
          border: "1px solid hsl(0 0% 100% / 0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        Ask Ayra
      </span>
    </motion.button>
  );
}

/* ─────────────────────────── Drawer shell ─────────────────────────────── */

function DrawerShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "hsl(220 25% 4% / 0.45)",
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.aside
        role="dialog"
        aria-label="Ayra assistant"
        className="absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden sm:w-[440px]"
        style={{
          background: "hsl(var(--card) / 0.78)",
          backdropFilter: "blur(28px) saturate(170%)",
          WebkitBackdropFilter: "blur(28px) saturate(170%)",
          borderLeft: "1px solid hsl(0 0% 100% / 0.06)",
          boxShadow:
            "-30px 0 60px -12px hsl(220 30% 2% / 0.55), inset 1px 0 0 hsl(0 0% 100% / 0.04)",
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
      >
        {/* Ambient glow at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.18) 0%, transparent 60%)",
            filter: "blur(20px)",
          }}
        />
        {children}
      </motion.aside>
    </div>
  );
}

/* ─────────────────────────────── Header ───────────────────────────────── */

function Header({
  view,
  activeTopic,
  onBack,
  onClose,
  onNewChat,
}: {
  view: View;
  activeTopic: Topic | null;
  onBack: () => void;
  onClose: () => void;
  onNewChat: () => void;
}) {
  const showBack = view !== "welcome";
  return (
    <div
      className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3.5"
      style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.05)" }}
    >
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {showBack ? (
            <motion.button
              key="back"
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                color: "hsl(var(--foreground) / 0.7)",
              }}
              whileHover={{
                backgroundColor: "hsl(0 0% 100% / 0.08)",
                x: -1,
              }}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={15} />
            </motion.button>
          ) : (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <AyraOrb size={26} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-baseline gap-2">
          <span
            className="font-display text-[15px] font-semibold tracking-tight"
            style={{ color: "hsl(var(--foreground) / 0.92)" }}
          >
            Ayra
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
            style={{
              background: "hsl(var(--primary) / 0.14)",
              color: "hsl(var(--primary))",
              border: "1px solid hsl(var(--primary) / 0.18)",
            }}
          >
            Beta
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {view === "chat" && (
          <motion.button
            type="button"
            onClick={onNewChat}
            aria-label="New chat"
            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold uppercase tracking-wider transition-colors"
            style={{
              background: "hsl(0 0% 100% / 0.04)",
              color: "hsl(var(--foreground) / 0.65)",
              border: "1px solid hsl(0 0% 100% / 0.05)",
            }}
            whileHover={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
          >
            <Plus size={12} />
            New
          </motion.button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]"
          style={{ color: "hsl(var(--foreground) / 0.55)" }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Greeting ─────────────────────────────── */

function Greeting() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 pt-3 text-center"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.85 },
          visible: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <AyraOrb size={56} />
      </motion.div>

      <motion.div
        className="space-y-1"
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h2
          className="font-display text-[19px] font-semibold tracking-tight"
          style={{ color: "hsl(var(--foreground) / 0.95)" }}
        >
          How can I help you today?
        </h2>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "hsl(var(--foreground) / 0.5)" }}
        >
          Pick a topic, or just type your question.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Topic grid ───────────────────────────────── */

function TopicGrid({
  onSelect,
  surpriseTopic,
}: {
  onSelect: (topic: Topic) => void;
  surpriseTopic: Topic;
}) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-2.5"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.035, delayChildren: 0.18 },
        },
      }}
    >
      {TOPICS.map((t) => (
        <TopicCard key={t.id} topic={t} onClick={() => onSelect(t)} />
      ))}
      <TopicCard
        topic={surpriseTopic}
        onClick={() => onSelect(surpriseTopic)}
        special
      />
    </motion.div>
  );
}

function TopicCard({
  topic,
  onClick,
  special,
}: {
  topic: Topic;
  onClick: () => void;
  special?: boolean;
}) {
  const Icon = topic.icon;
  const count = topic.suggestions.length;
  const isSurprise = topic.id === SURPRISE_TOPIC_ID;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.34, ease: EASE }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl px-3.5 py-3.5 text-left transition-colors"
      style={{
        background: special
          ? "linear-gradient(135deg, hsl(var(--primary) / 0.10), hsl(var(--accent) / 0.10))"
          : "hsl(0 0% 100% / 0.025)",
        border: special
          ? "1px solid hsl(var(--primary) / 0.22)"
          : "1px solid hsl(0 0% 100% / 0.06)",
        boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.03)",
      }}
    >
      {/* Hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, hsl(var(--primary) / 0.08), transparent 60%)",
        }}
      />

      <div className="flex w-full items-center justify-between">
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300"
          style={{
            background: isSurprise
              ? "linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--accent) / 0.22))"
              : "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.06)",
          }}
        >
          <Icon
            size={16}
            strokeWidth={1.85}
            className="transition-colors duration-300"
            style={{
              color: isSurprise
                ? "hsl(var(--primary))"
                : "hsl(var(--foreground) / 0.65)",
            }}
          />
          {/* On hover, mono icon picks up brand */}
          {!isSurprise && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "hsl(var(--primary) / 0.10)" }}
            >
              <Icon
                size={16}
                strokeWidth={1.85}
                style={{ color: "hsl(var(--primary))" }}
              />
            </span>
          )}
        </div>

        <ChevronRight
          size={14}
          className="-mr-1 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60"
          style={{ color: "hsl(var(--foreground))" }}
        />
      </div>

      <div className="space-y-0.5">
        <div
          className="font-display text-[13.5px] font-semibold tracking-tight"
          style={{ color: "hsl(var(--foreground) / 0.92)" }}
        >
          {topic.label}
        </div>
        <div
          className="text-[11px] leading-snug"
          style={{ color: "hsl(var(--foreground) / 0.42)" }}
        >
          {isSurprise ? "Random picks" : `${count} questions`}
        </div>
      </div>
    </motion.button>
  );
}

/* ────────────────────────── Topic intro / list ────────────────────────── */

function TopicIntro({ topic }: { topic: Topic }) {
  const Icon = topic.icon;
  const isSurprise = topic.id === SURPRISE_TOPIC_ID;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: isSurprise
            ? "linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--accent) / 0.22))"
            : "hsl(var(--primary) / 0.10)",
          border: "1px solid hsl(var(--primary) / 0.18)",
        }}
      >
        <Icon size={17} strokeWidth={1.9} style={{ color: "hsl(var(--primary))" }} />
      </div>
      <div className="min-w-0">
        <div
          className="font-display text-[15.5px] font-semibold tracking-tight"
          style={{ color: "hsl(var(--foreground) / 0.95)" }}
        >
          {topic.label}
        </div>
        <div
          className="truncate text-[12px]"
          style={{ color: "hsl(var(--foreground) / 0.5)" }}
        >
          {topic.description}
        </div>
      </div>
    </motion.div>
  );
}

function QuestionList({
  topic,
  onPick,
}: {
  topic: Topic;
  onPick: (s: Suggestion) => void;
}) {
  const sections = useMemo(
    () => getSuggestionsGrouped(topic.suggestions),
    [topic],
  );
  const isSurprise = topic.id === SURPRISE_TOPIC_ID;

  return (
    <motion.div
      className="space-y-5"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
      }}
    >
      {sections.map((sec) => (
        <div key={sec.group} className="space-y-1.5">
          {!isSurprise && (
            <div
              className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "hsl(var(--foreground) / 0.38)" }}
            >
              {sec.group}
            </div>
          )}
          <div className="space-y-1.5">
            {sec.items.map((s) => (
              <SuggestionItem key={s.id} suggestion={s} onClick={() => onPick(s)} />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function SuggestionItem({
  suggestion,
  onClick,
}: {
  suggestion: Suggestion;
  onClick: () => void;
}) {
  const Icon: LucideIcon = suggestion.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.32, ease: EASE }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
      style={{
        background: "hsl(0 0% 100% / 0.025)",
        border: "1px solid hsl(0 0% 100% / 0.05)",
      }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 group-hover:bg-[hsl(var(--primary)/0.12)]"
        style={{ background: "hsl(0 0% 100% / 0.04)" }}
      >
        <Icon
          size={13}
          strokeWidth={1.9}
          className="transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
          style={{ color: "hsl(var(--foreground) / 0.55)" }}
        />
      </div>
      <span
        className="flex-1 text-[13px] leading-snug"
        style={{ color: "hsl(var(--foreground) / 0.82)" }}
      >
        {suggestion.text}
      </span>
      <ChevronRight
        size={13}
        className="shrink-0 -mr-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-50"
        style={{ color: "hsl(var(--foreground))" }}
      />
    </motion.button>
  );
}

/* ─────────────────────────── Conversation ─────────────────────────────── */

function Bubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay: Math.min(index * 0.02, 0.1) }}
    >
      {!isUser && (
        <div className="mr-2 mt-0.5 shrink-0">
          <AyraOrb size={22} intensity="soft" showSparkle={false} />
        </div>
      )}
      <div
        className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed"
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.16))",
                border: "1px solid hsl(var(--primary) / 0.22)",
                color: "hsl(var(--foreground) / 0.95)",
                borderBottomRightRadius: 6,
              }
            : {
                background: "hsl(0 0% 100% / 0.035)",
                border: "1px solid hsl(0 0% 100% / 0.06)",
                color: "hsl(var(--foreground) / 0.85)",
                borderBottomLeftRadius: 6,
              }
        }
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function Thinking() {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AyraOrb size={22} intensity="soft" showSparkle={false} />
      <div
        className="flex items-center gap-1 rounded-2xl px-3 py-2.5"
        style={{
          background: "hsl(0 0% 100% / 0.035)",
          border: "1px solid hsl(0 0% 100% / 0.06)",
          borderBottomLeftRadius: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "hsl(var(--foreground) / 0.5)" }}
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────── Composer ─────────────────────────────── */

function Composer({
  inputRef,
  value,
  onChange,
  onSend,
  placeholder,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 132) + "px";
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
      // Reset height after send
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.style.height = "auto";
      });
    }
  };

  return (
    <div
      className="relative shrink-0 px-4 pb-4 pt-2"
      style={{ borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}
    >
      <motion.div
        className="relative flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-colors"
        style={{
          background: "hsl(0 0% 100% / 0.035)",
          border: `1px solid ${
            focused ? "hsl(var(--primary) / 0.35)" : "hsl(0 0% 100% / 0.06)"
          }`,
          boxShadow: focused
            ? "0 0 0 4px hsl(var(--primary) / 0.10)"
            : "none",
        }}
        animate={{
          borderColor: focused
            ? "hsl(var(--primary) / 0.35)"
            : "hsl(0 0% 100% / 0.06)",
        }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="ayra-scroll flex-1 resize-none bg-transparent px-1 py-1.5 text-[13.5px] leading-relaxed outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
          style={{
            color: "hsl(var(--foreground) / 0.92)",
            maxHeight: 132,
          }}
        />

        <div className="flex items-end pb-0.5">
          <AnimatePresence initial={false} mode="wait">
            {hasText ? (
              <motion.button
                key="send"
                type="button"
                onClick={onSend}
                aria-label="Send"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  boxShadow: "0 4px 12px -4px hsl(var(--primary) / 0.55)",
                  color: "hsl(var(--primary-foreground))",
                }}
                initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.22, ease: EASE }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
              >
                <ArrowUp size={15} strokeWidth={2.4} />
              </motion.button>
            ) : (
              <motion.div
                key="hint"
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  color: "hsl(var(--foreground) / 0.35)",
                }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Sparkles size={13} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div
        className="mt-2 px-1 text-center text-[10.5px]"
        style={{ color: "hsl(var(--foreground) / 0.32)" }}
      >
        Ayra can occasionally miss the mark — verify critical numbers.
      </div>
    </div>
  );
}
