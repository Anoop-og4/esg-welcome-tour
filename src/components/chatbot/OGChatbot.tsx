import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type ChangeEvent,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  X,
  ArrowUp,
  ArrowLeft,
  ChevronRight,
  Plus,
  CornerDownLeft,
  Copy,
  RotateCcw,
} from "lucide-react";
import OGMark, { OGMonogram, StatusDot } from "./OGMark";
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
  role: "user" | "og";
  content: string;
  ts: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const QUICK_PROMPTS = [
  "What's our footprint this FY?",
  "Compare emissions YoY",
  "Top emitting facilities",
];

/* ───────────────────────────── Public root ────────────────────────────── */

export default function OGChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("welcome");
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const surpriseTopic = useMemo<Topic>(
    () => ({ ...SURPRISE_TOPIC, suggestions: getRandomSuggestions(8) }),
    [isOpen, view],
  );

  /* Esc closes */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* Auto-scroll chat */
  useEffect(() => {
    if (view !== "chat") return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, view, isThinking]);

  /* Focus composer once drawer settles */
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 460);
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
        ts: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setView("chat");
      setIsThinking(true);
      window.setTimeout(() => {
        const ogMsg: Message = {
          id: `o-${Date.now()}`,
          role: "og",
          content:
            "I'm being wired up to your data warehouse. Once connected, I'll answer this with live numbers — by scope, facility, and quarter — and stream the chart inline.",
          ts: Date.now(),
        };
        setMessages((m) => [...m, ogMsg]);
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
    <LayoutGroup id="og-shell">
      <AnimatePresence>
        {!isOpen && <FAB key="fab" onClick={() => setIsOpen(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <DrawerShell key="drawer" onClose={() => setIsOpen(false)}>
            <Header
              view={view}
              activeTopic={activeTopic}
              onBack={handleBack}
              onClose={() => setIsOpen(false)}
              onNewChat={startNewChat}
            />

            <div className="relative flex-1 min-h-0">
              <FadeMask side="top" />
              <FadeMask side="bottom" />

              <div
                ref={scrollRef}
                className="og-scroll h-full overflow-y-auto px-5 pb-6 pt-4"
              >
                <AnimatePresence mode="wait">
                  {view === "welcome" && (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="space-y-6"
                    >
                      <Greeting />
                      <TopicList
                        onSelect={openTopic}
                        surpriseTopic={surpriseTopic}
                      />
                    </motion.div>
                  )}

                  {view === "topic" && activeTopic && (
                    <motion.div
                      key={`topic-${activeTopic.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="space-y-4"
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
                      className="flex flex-col gap-5 py-2"
                    >
                      {messages.map((m, i) => (
                        <Message key={m.id} message={m} index={i} />
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
              onQuickPrompt={(p) => sendMessage(p)}
              context={activeTopic?.label}
              showQuickPrompts={view === "welcome" && !input}
            />
          </DrawerShell>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

/* ─────────────────────────────────── FAB ──────────────────────────────── */

function FAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open OG"
      layoutId="og-surface"
      className="group fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-2xl focus:outline-none"
      style={{
        width: 56,
        height: 56,
        background: "hsl(var(--card) / 0.85)",
        border: "1px solid hsl(0 0% 100% / 0.08)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow:
          "0 14px 36px -10px hsl(220 30% 2% / 0.55), 0 1px 0 hsl(0 0% 100% / 0.06) inset",
      }}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.9 }}
      transition={{ duration: 0.42, ease: EASE }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Ambient halo */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{ background: "hsl(var(--primary) / 0.18)" }}
        animate={{ scale: [1, 1.32], opacity: [0.45, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
      />

      <OGMonogram size={20} />

      {/* Status dot — anchored bottom-right, lives on layoutId surface */}
      <span className="absolute bottom-2 right-2">
        <StatusDot size={6} />
      </span>

      {/* Hover tooltip */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[110%] top-1/2 mr-1 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: "hsl(var(--card) / 0.95)",
          color: "hsl(var(--foreground) / 0.85)",
          border: "1px solid hsl(0 0% 100% / 0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        Ask OG
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
      <motion.div
        className="absolute inset-0"
        style={{
          background: "hsl(220 25% 4% / 0.42)",
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        onClick={onClose}
      />

      <motion.aside
        layoutId="og-surface"
        role="dialog"
        aria-label="OG assistant"
        className="absolute flex flex-col overflow-hidden"
        style={{
          top: 12,
          right: 12,
          bottom: 12,
          width: "min(490px, calc(100vw - 24px))",
          background: "hsl(var(--card) / 0.82)",
          backdropFilter: "blur(28px) saturate(170%)",
          WebkitBackdropFilter: "blur(28px) saturate(170%)",
          border: "1px solid hsl(0 0% 100% / 0.07)",
          borderRadius: 22,
          boxShadow:
            "0 40px 80px -16px hsl(220 30% 2% / 0.6), 0 0 0 1px hsl(0 0% 100% / 0.04) inset",
        }}
        initial={{ opacity: 0, x: 24, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 24, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.85 }}
      >
        {/* Top ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.16) 0%, transparent 60%)",
            filter: "blur(24px)",
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
      <div className="flex items-center gap-2.5">
        <AnimatePresence mode="wait" initial={false}>
          {showBack ? (
            <motion.button
              key="back"
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-7 w-7 items-center justify-center rounded-lg"
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
              <ArrowLeft size={14} />
            </motion.button>
          ) : null}
        </AnimatePresence>

        <OGMark size={15} showDot={view === "welcome"} />

        {view === "topic" && activeTopic && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-[13.5px] font-semibold tracking-tight"
            style={{ color: "hsl(var(--foreground) / 0.92)" }}
          >
            {activeTopic.label}
          </motion.span>
        )}

        {view === "chat" && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-[12.5px]"
            style={{ color: "hsl(var(--foreground) / 0.55)" }}
          >
            Conversation
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {view === "chat" && (
          <motion.button
            type="button"
            onClick={onNewChat}
            aria-label="New chat"
            className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{
              background: "hsl(0 0% 100% / 0.04)",
              color: "hsl(var(--foreground) / 0.65)",
              border: "1px solid hsl(0 0% 100% / 0.05)",
            }}
            whileHover={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
          >
            <Plus size={11} strokeWidth={2.4} />
            New
          </motion.button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
          style={{ color: "hsl(var(--foreground) / 0.55)" }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Greeting ──────────────────────────────── */

const GREETING_LINE = "What do you want to know?";

function Greeting() {
  // Letter-by-letter rise — one-time signature, ~600ms total
  const letters = useMemo(() => GREETING_LINE.split(""), []);
  return (
    <div className="pt-2">
      <motion.h2
        className="font-display font-semibold leading-[1.18]"
        style={{
          fontSize: 22,
          letterSpacing: "-0.025em",
          color: "hsl(var(--foreground) / 0.96)",
        }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.018, delayChildren: 0.05 },
          },
        }}
        aria-label={GREETING_LINE}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.h2>

      <motion.p
        className="mt-1.5 text-[12.5px] leading-relaxed"
        style={{ color: "hsl(var(--foreground) / 0.5)" }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4, ease: EASE }}
      >
        Type your question, or pick a topic below.
      </motion.p>
    </div>
  );
}

/* ────────────────────────────── Topic list ───────────────────────────── */

function TopicList({
  onSelect,
  surpriseTopic,
}: {
  onSelect: (topic: Topic) => void;
  surpriseTopic: Topic;
}) {
  return (
    <motion.div
      className="space-y-1"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.03, delayChildren: 0.55 },
        },
      }}
    >
      {TOPICS.map((t) => (
        <TopicRow key={t.id} topic={t} onClick={() => onSelect(t)} />
      ))}
      <TopicRow
        topic={surpriseTopic}
        onClick={() => onSelect(surpriseTopic)}
        variant="special"
      />
    </motion.div>
  );
}

function TopicRow({
  topic,
  onClick,
  variant,
}: {
  topic: Topic;
  onClick: () => void;
  variant?: "special";
}) {
  const Icon = topic.icon;
  const count = topic.suggestions.length;
  const isSurprise = topic.id === SURPRISE_TOPIC_ID;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.32, ease: EASE }}
      whileTap={{ scale: 0.992 }}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.035]"
    >
      {/* Left accent rail — single signature hover */}
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[2px] origin-center scale-y-0 rounded-r-full transition-transform duration-300 ease-out group-hover:scale-y-100"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
        style={{
          background:
            variant === "special"
              ? "hsl(var(--primary) / 0.10)"
              : "hsl(0 0% 100% / 0.035)",
          border: "1px solid hsl(0 0% 100% / 0.05)",
        }}
      >
        <Icon
          size={15}
          strokeWidth={1.85}
          className="transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
          style={{
            color: isSurprise
              ? "hsl(var(--primary))"
              : "hsl(var(--foreground) / 0.6)",
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="font-display text-[13.5px] font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-[3px]"
          style={{ color: "hsl(var(--foreground) / 0.92)" }}
        >
          {topic.label}
        </div>
        <div
          className="truncate text-[11.5px] leading-snug transition-transform duration-300 group-hover:translate-x-[3px]"
          style={{ color: "hsl(var(--foreground) / 0.45)" }}
        >
          {topic.description}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className="tabular-nums text-[10.5px]"
          style={{ color: "hsl(var(--foreground) / 0.38)" }}
        >
          {isSurprise ? "random" : count}
        </span>
        <ChevronRight
          size={13}
          className="opacity-30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70"
          style={{ color: "hsl(var(--foreground))" }}
        />
      </div>
    </motion.button>
  );
}

/* ────────────────────────── Topic intro / list ────────────────────────── */

function TopicIntro({ topic }: { topic: Topic }) {
  const isSurprise = topic.id === SURPRISE_TOPIC_ID;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: EASE }}
      className="space-y-1"
    >
      <h3
        className="font-display font-semibold tracking-tight"
        style={{
          fontSize: 19,
          letterSpacing: "-0.025em",
          color: "hsl(var(--foreground) / 0.95)",
        }}
      >
        {topic.label}
      </h3>
      <p
        className="text-[12px] leading-relaxed"
        style={{ color: "hsl(var(--foreground) / 0.5)" }}
      >
        {topic.description}
        {!isSurprise && (
          <>
            {" — "}
            <span
              className="tabular-nums"
              style={{ color: "hsl(var(--foreground) / 0.7)" }}
            >
              {topic.suggestions.length}
            </span>{" "}
            curated questions
          </>
        )}
      </p>
    </motion.div>
  );
}

type FlatItem =
  | { kind: "label"; key: string; text: string; isFirst: boolean }
  | { kind: "question"; key: string; data: Suggestion };

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

  /* Flatten labels + questions into one ordered list so a single parent
     stagger cascades across the entire body. Without this, each section
     restarts its own stagger and the cascade visually "stutters." */
  const flat = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    sections.forEach((sec, idx) => {
      if (!isSurprise) {
        items.push({
          kind: "label",
          key: `lbl-${sec.group}`,
          text: sec.group,
          isFirst: idx === 0,
        });
      }
      sec.items.forEach((s) =>
        items.push({ kind: "question", key: s.id, data: s }),
      );
    });
    return items;
  }, [sections, isSurprise]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.04, delayChildren: 0.18 },
        },
      }}
    >
      {flat.map((item) => {
        if (item.kind === "label") {
          return (
            <motion.div
              key={item.key}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              transition={{ duration: 0.32, ease: EASE }}
              className={`flex items-center gap-2 px-0.5 mb-2 ${
                item.isFirst ? "" : "mt-5"
              }`}
            >
              <span
                className="text-[9.5px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "hsl(var(--foreground) / 0.4)" }}
              >
                {item.text}
              </span>
              <span
                aria-hidden
                className="h-px flex-1"
                style={{ background: "hsl(0 0% 100% / 0.05)" }}
              />
            </motion.div>
          );
        }
        return (
          <QuestionRow
            key={item.key}
            suggestion={item.data}
            onClick={() => onPick(item.data)}
          />
        );
      })}
    </motion.div>
  );
}

function QuestionRow({
  suggestion,
  onClick,
}: {
  suggestion: Suggestion;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.985, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.46, ease: EASE }}
      whileTap={{ scale: 0.995 }}
      className="group relative flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
    >
      <span
        aria-hidden
        className="absolute left-0 top-2.5 bottom-2.5 w-[2px] origin-center scale-y-0 rounded-r-full transition-transform duration-300 ease-out group-hover:scale-y-100"
        style={{ background: "hsl(var(--primary))" }}
      />
      <span
        className="flex-1 text-[13px] leading-snug transition-transform duration-300 group-hover:translate-x-[3px]"
        style={{ color: "hsl(var(--foreground) / 0.82)" }}
      >
        {suggestion.text}
      </span>
      <ChevronRight
        size={13}
        className="shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60"
        style={{ color: "hsl(var(--primary))" }}
      />
    </motion.button>
  );
}

/* ─────────────────────────── Conversation ─────────────────────────────── */

function Message({ message, index }: { message: Message; index: number }) {
  if (message.role === "user") return <UserMessage content={message.content} index={index} />;
  return <OGMessage content={message.content} ts={message.ts} index={index} />;
}

function UserMessage({ content, index }: { content: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay: Math.min(index * 0.02, 0.08) }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-1.5 px-0.5">
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "hsl(var(--foreground) / 0.42)" }}
        >
          You asked
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: "hsl(0 0% 100% / 0.05)" }}
        />
      </div>
      <p
        className="font-display text-[15px] font-semibold leading-snug tracking-tight px-0.5"
        style={{
          color: "hsl(var(--foreground) / 0.96)",
          letterSpacing: "-0.015em",
        }}
      >
        {content}
      </p>
    </motion.div>
  );
}

function OGMessage({
  content,
  ts,
  index,
}: {
  content: string;
  ts: number;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const time = new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = () => {
    void navigator.clipboard?.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: EASE, delay: Math.min(index * 0.02, 0.1) }}
      className="space-y-2.5 rounded-xl p-3.5"
      style={{
        background: "hsl(0 0% 100% / 0.025)",
        border: "1px solid hsl(0 0% 100% / 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <OGMark size={11} showDot={false} />
          <span
            aria-hidden
            className="h-2 w-px"
            style={{ background: "hsl(0 0% 100% / 0.1)" }}
          />
          <span
            className="text-[10px] tabular-nums"
            style={{ color: "hsl(var(--foreground) / 0.42)" }}
          >
            {time}
          </span>
        </div>
        <span
          className="text-[10px]"
          style={{ color: "hsl(var(--foreground) / 0.4)" }}
        >
          checked{" "}
          <span
            className="tabular-nums"
            style={{ color: "hsl(var(--foreground) / 0.6)" }}
          >
            4
          </span>{" "}
          sources
        </span>
      </div>

      {/* Body */}
      <p
        className="text-[13.5px] leading-relaxed"
        style={{ color: "hsl(var(--foreground) / 0.88)" }}
      >
        {content}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.04)" }}
      >
        <div className="flex flex-wrap items-center gap-1">
          {["Scope 1", "Scope 2", "Facilities"].map((src) => (
            <span
              key={src}
              className="rounded-full px-1.5 py-0.5 text-[10px] tabular-nums"
              style={{
                background: "hsl(var(--primary) / 0.08)",
                color: "hsl(var(--primary))",
                border: "1px solid hsl(var(--primary) / 0.14)",
              }}
            >
              {src}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy"
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
            style={{ color: "hsl(var(--foreground) / 0.5)" }}
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            aria-label="Regenerate"
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
            style={{ color: "hsl(var(--foreground) / 0.5)" }}
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] tabular-nums"
            style={{ color: "hsl(var(--primary))" }}
          >
            Copied
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Thinking() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 px-0.5">
        <OGMark size={11} showDot={false} />
        <span
          className="text-[10.5px]"
          style={{ color: "hsl(var(--foreground) / 0.55)" }}
        >
          thinking…
        </span>
      </div>
      {/* Scanline — the signature thinking effect */}
      <div
        className="relative h-px overflow-hidden rounded-full"
        style={{ background: "hsl(0 0% 100% / 0.05)" }}
      >
        <motion.div
          className="absolute top-0 h-full w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
          }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
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
  onQuickPrompt,
  context,
  showQuickPrompts,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onQuickPrompt: (p: string) => void;
  context?: string;
  showQuickPrompts: boolean;
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
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.style.height = "auto";
      });
    }
  };

  const placeholder = context
    ? `Ask about ${context.toLowerCase()}…`
    : "Ask anything about your ESG data…";

  return (
    <div
      className="relative shrink-0 px-4 pb-3 pt-2"
      style={{ borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}
    >
      <AnimatePresence initial={false}>
        {showQuickPrompts && (
          <motion.div
            key="quick"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mb-2 flex flex-wrap gap-1.5 overflow-hidden"
          >
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onQuickPrompt(p)}
                className="rounded-full px-2.5 py-1 text-[11px] transition-colors hover:bg-white/[0.06]"
                style={{
                  background: "hsl(0 0% 100% / 0.03)",
                  border: "1px solid hsl(0 0% 100% / 0.06)",
                  color: "hsl(var(--foreground) / 0.7)",
                }}
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-colors"
        style={{
          background: "hsl(0 0% 100% / 0.03)",
          border: `1px solid ${
            focused ? "hsl(var(--primary) / 0.35)" : "hsl(0 0% 100% / 0.06)"
          }`,
        }}
      >
        {/* Signature: scanline focus rail */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px overflow-hidden"
        >
          <motion.span
            className="block h-full origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
            }}
            initial={false}
            animate={focused ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </span>

        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="og-scroll flex-1 resize-none bg-transparent px-1 py-1 text-[13.5px] leading-relaxed outline-none placeholder:text-[hsl(var(--foreground)/0.32)]"
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
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  boxShadow: "0 4px 12px -4px hsl(var(--primary) / 0.55)",
                }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
              >
                <ArrowUp size={13} strokeWidth={2.6} />
              </motion.button>
            ) : (
              <motion.div
                key="kbd"
                aria-hidden
                className="flex h-7 items-center gap-0.5 rounded-lg px-1.5 text-[10px] tabular-nums"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  color: "hsl(var(--foreground) / 0.42)",
                  border: "1px solid hsl(0 0% 100% / 0.05)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <CornerDownLeft size={10} strokeWidth={2.2} />
                <span className="pl-0.5 pr-0.5">to send</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        className="mt-2 flex items-center justify-between px-1 text-[10px]"
        style={{ color: "hsl(var(--foreground) / 0.32)" }}
      >
        <span className="flex items-center gap-1">
          <kbd
            className="inline-flex h-4 items-center rounded px-1 text-[9px] font-semibold"
            style={{
              background: "hsl(0 0% 100% / 0.04)",
              border: "1px solid hsl(0 0% 100% / 0.06)",
              color: "hsl(var(--foreground) / 0.55)",
            }}
          >
            /
          </kbd>
          <span>for commands</span>
        </span>
        <span>OG can miss the mark — verify critical numbers.</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Tiny utilities ───────────────────────────── */

function FadeMask({ side }: { side: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-10 ${
        side === "top" ? "top-0 h-5" : "bottom-0 h-7"
      }`}
      style={{
        background:
          side === "top"
            ? "linear-gradient(180deg, hsl(var(--card) / 0.85), transparent)"
            : "linear-gradient(0deg, hsl(var(--card) / 0.9), transparent)",
      }}
    />
  );
}
