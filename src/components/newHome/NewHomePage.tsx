import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronUp,
  ClipboardCheck,
  FileClock,
  Leaf,
  ListChecks,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Zap,
} from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getNewHomeDashboard } from "@/lib/newHomeService";
import type { HomeDashboardData, HomePriority } from "@/types/newHome";

interface NewHomePageProps { onNavigate: (view: string) => void }

const priorityClass: Record<HomePriority, string> = {
  high: "border-destructive/20 bg-destructive/10 text-destructive",
  medium: "border-warning/20 bg-warning/10 text-warning",
  low: "border-info/20 bg-info/10 text-info",
};

const accentClass = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

function Panel({ title, subtitle, children, className = "", action }: { title: string; subtitle?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-card", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center px-5 py-8 text-center"><CheckCircle2 className="mb-2 text-success" size={24}/><p className="text-sm font-medium text-foreground">All clear</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

type MetricTone = keyof typeof accentClass;

function MetricCard({ label, value, detail, progress, progressLabel, trend, icon: Icon, target, tone, onNavigate }: {
  label: string;
  value: number;
  detail: string;
  progress: number;
  progressLabel: string;
  trend: string;
  icon: typeof ListChecks;
  target: string;
  tone: MetricTone;
  onNavigate: (target: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentClass[tone])}><Icon size={19}/></div>
        <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", accentClass[tone])}>{trend}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <span className="font-display text-3xl font-bold text-foreground">{value}</span>
        <span className="mb-1 text-right text-[11px] text-muted-foreground">{detail}</span>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px]"><span className="text-muted-foreground">{progressLabel}</span><span className="font-semibold text-foreground">{progress}%</span></div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <Button variant="ghost" size="sm" onClick={() => onNavigate(target)} className="mt-3 h-7 w-full justify-between px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-primary">
        Open workspace <ArrowRight size={13}/>
      </Button>
    </motion.div>
  );
}

export default function NewHomePage({ onNavigate }: NewHomePageProps) {
  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("due");

  useEffect(() => { void getNewHomeDashboard().then(setData); }, []);

  const forms = useMemo(() => {
    if (!data) return [];
    const filtered = priority === "all" ? data.forms : data.forms.filter((form) => form.priority === priority);
    return [...filtered].sort((a, b) => sort === "progress" ? b.progress - a.progress : a.due.localeCompare(b.due));
  }, [data, priority, sort]);

  if (!data) return <div className="light flex-1 overflow-auto bg-background p-4 text-foreground md:p-6"><div className="mx-auto max-w-[1500px] space-y-4"><Skeleton className="h-28 w-full"/><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-56"/>)}</div><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-96"/><Skeleton className="h-96"/></div></div></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const unread = data.notifications.length;
  const overdue = data.actions.filter(action => action.status === "overdue").length;
  const averageFormProgress = data.forms.length ? Math.round(data.forms.reduce((sum, form) => sum + form.progress, 0) / data.forms.length) : 0;
  const featuredNotification = data.notifications.find(item => item.title.toLowerCase().includes("alert")) ?? data.notifications[0];
  const lastUpdated = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date());
  const kpis = [
    { label: "Pending actions", value: data.actions.length, detail: `${data.actions.filter(a => a.type === "Approve").length} approval · ${overdue} overdue`, progress: Math.max(24, 100 - data.actions.length * 8), progressLabel: "Weekly completion", trend: "3 due soon", icon: ListChecks, target: "workflow", tone: "primary" as const },
    { label: "Forms pending", value: data.forms.length, detail: `${data.forms.filter(f => f.status === "overdue").length} overdue`, progress: averageFormProgress, progressLabel: "Average completion", trend: `${averageFormProgress}% complete`, icon: FileClock, target: "env-data", tone: "warning" as const },
    { label: "Assigned to me", value: data.actions.length + data.forms.length, detail: "Across active modules", progress: 74, progressLabel: "Reviewed this month", trend: "+4 this week", icon: UserCheck, target: "audit", tone: "info" as const },
    { label: "Notifications", value: unread, detail: "Workspace updates", progress: Math.max(12, 100 - unread * 14), progressLabel: "Inbox cleared", trend: `${unread} unread`, icon: Bell, target: "new-home", tone: unread > 2 ? "destructive" as const : "primary" as const },
  ];

  return <div className="light flex-1 overflow-auto bg-background text-foreground">
    <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-border bg-card/90 px-6 py-3 backdrop-blur-md md:flex"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Leaf size={16} className="text-primary"/><span>Workspace</span><span>/</span><span className="font-medium text-foreground">New Home</span></div><div className="flex items-center gap-2"><GlobalSearch onNavigate={onNavigate}/><ThemeToggle/><NotificationPanel/><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{data.user.name.slice(0,2).toUpperCase()}</div></div></header>

    <main className="mx-auto max-w-[1500px] space-y-5 p-4 pb-24 md:p-6 lg:p-8">
      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary"><ShieldCheck size={12} className="mr-1"/>{data.user.role}</Badge><span className="text-xs text-muted-foreground">{data.user.organization}</span></div>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{greeting}, {data.user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here’s your ESG workspace overview and the work that needs attention today.</p>
        </div>
        <div className="text-left md:text-right"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Last updated</p><p className="mt-1 text-sm font-medium text-foreground">{lastUpdated}</p></div>
      </motion.section>

      {featuredNotification && <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="flex flex-col gap-4 overflow-hidden rounded-lg border border-info/20 bg-info/10 p-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info text-background"><AlertCircle size={19}/></div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-foreground">Priority update</p><Badge variant="outline" className="border-info/30 bg-card/50 text-info">New</Badge></div><p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">{featuredNotification.title}.</span> {featuredNotification.detail}</p></div>
        <Button size="sm" onClick={() => onNavigate(featuredNotification.permission === "goals" ? "goals" : featuredNotification.permission === "environment" ? "env-data" : "workflow")}>Review now<ArrowRight size={14}/></Button>
      </motion.section>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map((metric, index) => <motion.div key={metric.label} transition={{ delay: index * .04 }}><MetricCard {...metric} onNavigate={onNavigate}/></motion.div>)}</section>

      <div className="grid gap-5 xl:grid-cols-12">
        <Panel title="Action required" subtitle="Prioritized work that needs your attention" className="xl:col-span-8" action={<Badge variant="secondary">{data.actions.length} open</Badge>}><div className="divide-y divide-border/70">{data.actions.length ? data.actions.map(action => <div key={action.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center"><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", action.status === "overdue" ? accentClass.destructive : accentClass.primary)}><AlertCircle size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{action.title}</p><Badge variant="outline" className={priorityClass[action.priority]}>{action.priority}</Badge>{action.status === "overdue" && <Badge variant="destructive">Overdue</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{action.module} · Assigned by {action.assignedBy} · <span className={action.status === "overdue" ? "font-medium text-destructive" : ""}>{action.dueLabel}</span></p></div><Button size="sm" onClick={() => onNavigate(action.target)}>{action.type}<ArrowRight size={14}/></Button></div>) : <Empty label="No actions need your attention."/>}</div></Panel>

        <Panel title="My ESG progress" subtitle="Contribution score and team standing" className="xl:col-span-4"><div className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Current score</p><div className="mt-1 flex items-baseline gap-2"><span className="font-display text-4xl font-bold text-foreground">842</span><span className="text-xs font-medium text-success"><ChevronUp size={13} className="inline"/> 8.4%</span></div></div><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning"><Trophy size={23}/></div></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Level progress</span><span className="font-medium text-foreground">84%</span></div><Progress value={84} className="h-2"/></div><div className="mt-5 space-y-2">{data.leaderboard.map(person => <div key={person.name} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5", person.name === data.user.name ? "border-primary/20 bg-primary/10" : "border-transparent bg-muted/40")}><span className="w-5 text-xs font-semibold text-muted-foreground">#{person.rank}</span><span className="flex-1 text-sm font-medium text-foreground">{person.name}</span><span className="text-xs font-semibold text-foreground">{person.score}</span></div>)}</div><Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onNavigate("play-leaderboard")}>View leaderboard</Button></div></Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <Panel title="Pending data entry" subtitle="Continue your open ESG forms" className="xl:col-span-7"><div className="flex flex-wrap gap-2 border-b border-border/70 bg-muted/20 p-3"><Select value={priority} onValueChange={setPriority}><SelectTrigger className="h-8 w-[140px] bg-card text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="high">High priority</SelectItem><SelectItem value="medium">Medium priority</SelectItem><SelectItem value="low">Low priority</SelectItem></SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger className="h-8 w-[150px] bg-card text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="due">Sort by due date</SelectItem><SelectItem value="progress">Sort by progress</SelectItem></SelectContent></Select></div><div className="divide-y divide-border/70">{forms.length ? forms.map(form => <div key={form.id} className="p-4 transition-colors hover:bg-muted/30"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><ClipboardCheck size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{form.title}</p><Badge variant="outline" className={priorityClass[form.priority]}>{form.priority}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{form.description} · {form.dueLabel}</p><div className="mt-3 flex items-center gap-3"><Progress value={form.progress} className="h-1.5 flex-1"/><span className="w-10 text-right text-xs font-medium text-foreground">{form.progress}%</span></div></div><Button variant="outline" size="sm" onClick={() => onNavigate(form.target)}>{form.progress ? "Continue" : "Start"}</Button></div></div>) : <Empty label="No forms match this filter."/>}</div></Panel>

        <Panel title="Workspace notifications" subtitle={`${unread} unread updates`} className="xl:col-span-5" action={<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><Bell size={16}/></div>}><div className="divide-y divide-border/70">{data.notifications.map((item, index) => <div key={item.id} className={cn("flex gap-3 p-4 transition-colors", index === 0 ? "bg-primary/5" : "hover:bg-muted/30")}><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", index === 0 ? "bg-primary" : "bg-muted-foreground/40")}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.title}</p><span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>{index === 0 && <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={() => onNavigate(item.permission === "goals" ? "goals" : item.permission === "environment" ? "env-data" : "workflow")}>View details<ArrowRight size={12}/></Button>}</div></div>)}</div></Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title={data.user.permissions.includes("team-activity") ? "Team activity" : "My activity"} subtitle="Latest workspace changes"><div className="divide-y divide-border/70">{data.activity.map(item => <div key={item.id} className="p-4"><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><p className="mt-2 text-[10px] font-medium text-muted-foreground">{item.time}</p></div>)}</div></Panel>
        <Panel title="ESG news & insights" subtitle="Relevant updates for your modules"><div className="divide-y divide-border/70">{data.news.map(item => <Button key={item.id} variant="ghost" onClick={() => onNavigate("news-dashboard")} className="h-auto w-full justify-start rounded-none p-4 text-left whitespace-normal"><div><div className="mb-2 flex items-center gap-2 text-primary"><Newspaper size={14}/><span className="text-[10px] font-semibold uppercase">{item.time}</span></div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p></div></Button>)}</div></Panel>
        <Panel title="What’s new" subtitle="Recent workspace improvements"><div className="divide-y divide-border/70">{data.updates.map(item => <div key={item.id} className="flex gap-3 p-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Sparkles size={15}/></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-foreground">{item.title}</p><Badge variant="secondary" className="text-[10px]">{item.time}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div></div>)}</div></Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Upcoming" subtitle="Deadlines, events and launches" className="lg:col-span-2"><div className="grid divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">{data.upcoming.map(item => <div key={item.id} className="p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary"><CalendarDays size={14}/>{item.time}</div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div>)}</div></Panel>
        <section className="flex min-h-48 flex-col justify-between rounded-lg border border-primary/20 bg-primary/5 p-5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap size={18}/></div><blockquote className="mt-5 font-display text-lg font-semibold leading-relaxed text-foreground">“{data.quote.text}”</blockquote><p className="mt-3 text-xs text-muted-foreground">— {data.quote.author}</p></section>
      </div>
    </main>
  </div>;
}