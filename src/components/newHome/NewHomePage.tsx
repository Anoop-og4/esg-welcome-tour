import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Bell, CalendarDays, CheckCircle2, ChevronUp, ClipboardCheck, FileClock, Leaf, ListChecks, Newspaper, ShieldCheck, Sparkles, Target, Trophy, UserCheck, Zap } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNewHomeDashboard } from "@/lib/newHomeService";
import type { HomeDashboardData, HomePriority } from "@/types/newHome";

interface NewHomePageProps { onNavigate: (view: string) => void }

const priorityClass: Record<HomePriority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-info/10 text-info border-info/20",
};

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-card shadow-card ${className}`}><div className="flex items-start justify-between border-b border-border/70 px-5 py-4"><div><h2 className="font-display text-base font-semibold text-foreground">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}</div></div>{children}</section>;
}

function Empty({ label }: { label: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center px-5 py-8 text-center"><CheckCircle2 className="mb-2 text-success" size={24}/><p className="text-sm font-medium text-foreground">All clear</p><p className="text-xs text-muted-foreground">{label}</p></div>;
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
  if (!data) return <div className="flex-1 overflow-auto bg-background p-4 md:p-6"><div className="mx-auto max-w-[1500px] space-y-4"><Skeleton className="h-28 w-full"/><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28"/>)}</div><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-96"/><Skeleton className="h-96"/></div></div></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const unread = data.notifications.length;
  const kpis = [
    { label: "Pending actions", value: data.actions.length, detail: `${data.actions.filter(a => a.type === "Approve").length} approvals · ${data.actions.filter(a => a.type === "Verify").length} verifications`, icon: ListChecks, target: "workflow" },
    { label: "Forms pending", value: data.forms.length, detail: `${data.forms.filter(f => f.status === "overdue").length} overdue`, icon: FileClock, target: "env-data" },
    { label: "Assigned to me", value: data.actions.length + data.forms.length, detail: "Across authorized modules", icon: UserCheck, target: "audit" },
    { label: "Notifications", value: unread, detail: "Unread workspace updates", icon: Bell, target: "home" },
  ];

  return <div className="flex-1 overflow-auto bg-background">
    <header className="hidden md:flex items-center justify-between border-b border-border bg-card/90 px-6 py-3 sticky top-0 z-20 backdrop-blur-md"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Leaf size={16} className="text-primary"/><span>Workspace</span><span>/</span><span className="font-medium text-foreground">New Home</span></div><div className="flex items-center gap-2"><GlobalSearch onNavigate={onNavigate}/><ThemeToggle/><NotificationPanel/><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{data.user.name.slice(0,2).toUpperCase()}</div></div></header>
    <main className="mx-auto max-w-[1500px] space-y-4 p-4 md:p-6">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 flex items-center gap-2"><Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary"><ShieldCheck size={12} className="mr-1"/>{data.user.role}</Badge><span className="text-xs text-muted-foreground">{data.user.organization}</span></div><h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{greeting}, {data.user.name} <span aria-hidden>👋</span></h1><p className="mt-1 text-sm text-muted-foreground">Here’s a quick overview of your ESG workspace today.</p></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays size={15}/>{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</div></motion.section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{kpis.map(({label,value,detail,icon:Icon,target}, i) => <motion.button key={label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.04}} onClick={() => onNavigate(target)} className="rounded-lg border border-border bg-card p-4 text-left shadow-card transition hover:border-primary/30 hover:shadow-elevated"><div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon size={18}/></div><ArrowRight size={15} className="text-muted-foreground"/></div><p className="mt-4 font-display text-2xl font-bold text-foreground">{value}</p><p className="text-sm font-medium text-foreground">{label}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p></motion.button>)}</section>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Action required" subtitle="Prioritized work that needs your attention" className="xl:col-span-8"><div className="divide-y divide-border/70">{data.actions.length ? data.actions.map(action => <div key={action.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${action.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}><AlertCircle size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{action.title}</p><Badge variant="outline" className={priorityClass[action.priority]}>{action.priority}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{action.module} · Assigned by {action.assignedBy} · <span className={action.status === "overdue" ? "text-destructive" : ""}>{action.dueLabel}</span></p></div><Button size="sm" onClick={() => onNavigate(action.target)}>{action.type}<ArrowRight size={14} className="ml-1"/></Button></div>) : <Empty label="No actions need your attention."/>}</div></Panel>

        <Panel title="My ESG progress" subtitle="Contribution score and team standing" className="xl:col-span-4"><div className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Current score</p><div className="mt-1 flex items-baseline gap-2"><span className="font-display text-4xl font-bold text-foreground">842</span><span className="text-xs text-success"><ChevronUp size={13} className="inline"/> 8.4%</span></div></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning"><Trophy size={23}/></div></div><div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Level progress</span><span className="font-medium text-foreground">84%</span></div><Progress value={84} className="h-2"/></div><div className="mt-5 space-y-2">{data.leaderboard.map(person => <div key={person.name} className={`flex items-center gap-3 rounded-md px-3 py-2 ${person.name === data.user.name ? "bg-primary/10" : "bg-muted/40"}`}><span className="w-5 text-xs font-semibold text-muted-foreground">#{person.rank}</span><span className="flex-1 text-sm font-medium text-foreground">{person.name}</span><span className="text-xs font-semibold text-foreground">{person.score}</span></div>)}</div><Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onNavigate("play-leaderboard")}>View leaderboard</Button></div></Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Pending data entry" subtitle="Continue your open ESG forms" className="xl:col-span-7"><div className="flex flex-wrap gap-2 border-b border-border/70 p-3"><Select value={priority} onValueChange={setPriority}><SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="high">High priority</SelectItem><SelectItem value="medium">Medium priority</SelectItem><SelectItem value="low">Low priority</SelectItem></SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="due">Sort by due date</SelectItem><SelectItem value="progress">Sort by progress</SelectItem></SelectContent></Select></div><div className="divide-y divide-border/70">{forms.length ? forms.map(form => <div key={form.id} className="p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info/10 text-info"><ClipboardCheck size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{form.title}</p><Badge variant="outline" className={priorityClass[form.priority]}>{form.priority}</Badge></div><p className="text-xs text-muted-foreground">{form.description} · {form.dueLabel}</p><div className="mt-3 flex items-center gap-3"><Progress value={form.progress} className="h-1.5 flex-1"/><span className="w-10 text-right text-xs font-medium text-foreground">{form.progress}%</span></div></div><Button variant="outline" size="sm" onClick={() => onNavigate(form.target)}>{form.progress ? "Continue" : "Start"}</Button></div></div>) : <Empty label="No forms match this filter."/>}</div></Panel>

        <Panel title="Workspace notifications" subtitle={`${unread} unread updates`} className="xl:col-span-5"><div className="divide-y divide-border/70">{data.notifications.map(item => <div key={item.id} className="flex gap-3 p-4"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"/><div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p></div><span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span></div>)}</div></Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={data.user.permissions.includes("team-activity") ? "Team activity" : "My activity"} subtitle="Latest workspace changes"><div className="divide-y divide-border/70">{data.activity.map(item => <div key={item.id} className="p-4"><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><p className="mt-2 text-[10px] text-muted-foreground">{item.time}</p></div>)}</div></Panel>
        <Panel title="ESG news & insights" subtitle="Relevant updates for your modules"><div className="divide-y divide-border/70">{data.news.map(item => <button key={item.id} onClick={() => onNavigate("news-dashboard")} className="block w-full p-4 text-left transition hover:bg-muted/40"><div className="mb-2 flex items-center gap-2 text-primary"><Newspaper size={14}/><span className="text-[10px] font-semibold uppercase">{item.time}</span></div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p></button>)}</div></Panel>
        <Panel title="What’s new" subtitle="Recent workspace improvements"><div className="divide-y divide-border/70">{data.updates.map(item => <div key={item.id} className="flex gap-3 p-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Sparkles size={15}/></div><div><div className="flex items-center gap-2"><p className="text-sm font-medium text-foreground">{item.title}</p><Badge variant="secondary" className="text-[10px]">{item.time}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div></div>)}</div></Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Upcoming" subtitle="Deadlines, events and launches" className="lg:col-span-2"><div className="grid divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">{data.upcoming.map(item => <div key={item.id} className="p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary"><CalendarDays size={14}/>{item.time}</div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div>)}</div></Panel>
        <section className="flex min-h-48 flex-col justify-between rounded-lg border border-primary/20 bg-primary/5 p-5"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Zap size={18}/></div><blockquote className="mt-5 font-display text-lg font-semibold leading-relaxed text-foreground">“{data.quote.text}”</blockquote><p className="mt-3 text-xs text-muted-foreground">— {data.quote.author}</p></section>
      </div>
    </main>
  </div>;
}